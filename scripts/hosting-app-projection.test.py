import importlib.util
import json
from pathlib import Path
import unittest
import sys
import os
import tempfile
from unittest.mock import patch

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("hosting_projection", Path(__file__).with_name("hosting-app-projection.py"))
projection = importlib.util.module_from_spec(spec)
spec.loader.exec_module(projection)


def response(data, module="PassengerApps", function="list_applications", status=1):
    return {"apiversion": 3, "module": module, "func": function, "result": {"status": status, "data": data}}


def fixture_api_path(candidate):
    value = candidate.resolve().as_posix()
    return value.split(":", 1)[1] if os.name == "nt" else value


class HostingProjectionTests(unittest.TestCase):
    def test_only_target_domains_and_allowlisted_metadata_leave_host(self):
        apps = projection.project_applications(response({
            "TAKATAK": {"domain": "takatak.ca", "name": "TAKATAK", "path": "/home/owner/takatak", "enabled": 1, "envvars": {"TOKEN": "fixture-secret", "DATABASE_URL": {"value": "private-db-value"}}, "deps": {"npm": "never execute this"}, "password": "private-password"},
            "AHMV": {"domain": "www.ahmverdun.ca", "name": "AHMV", "path": "/home/owner/ahmv", "enabled": 0, "envvars": {"NODE_ENV": "production"}},
            "Other": {"domain": "other-account.example", "name": "Other private app", "path": "/home/owner/other", "envvars": {"OTHER_PRIVATE_NAME": "other-private-value"}},
        }))
        self.assertEqual([app["domain"] for app in apps["applications"]], ["ahmverdun.ca", "takatak.ca"])
        self.assertEqual(apps["applications"][1]["environmentVariableNames"], ["DATABASE_URL", "TOKEN"])
        exported = json.dumps(apps)
        for secret in ("fixture-secret", "private-db-value", "private-password", "other-private-value", "Other private app", "OTHER_PRIVATE_NAME", "never execute this"):
            self.assertNotIn(secret, exported)
        self.assertEqual(set(apps["applications"][0]), {"domain", "appName", "appRoot", "startupFile", "environmentVariableNames", "status"})

    def test_environment_values_of_every_type_are_ignored(self):
        values = {"STRING": "secret-a", "ARRAY": ["secret-b"], "OBJECT": {"nested": "secret-c"}, "NUMBER": 999, "BOOL": True, "NULL": None}
        self.assertEqual(projection.environment_names(values), sorted(values))
        for unsupported in (None, "SECRET_VALUE", 42, False, ["SECRET_VALUE"], [{"value": "SECRET_VALUE"}]):
            self.assertEqual(projection.environment_names(unsupported), [])
        self.assertEqual(projection.environment_names([{"name": "TOKEN", "value": "secret-a"}]), ["TOKEN"])

    def test_error_messages_and_unsupported_shapes_fail_closed(self):
        for payload in (None, [], {"result": {"status": 1, "data": {}}}, response([], status=1), response({}, status=0)):
            result = projection.project_applications(payload)
            self.assertEqual(result["applications"], [])
            self.assertIn(result["status"], ("schema_unavailable", "api_unavailable"))
        failed = response({}, status=0)
        failed["result"]["errors"] = ["secret-value-in-error"]
        self.assertNotIn("secret-value", json.dumps(projection.project_applications(failed)))

    def test_domain_hints_and_subdomains_do_not_bypass_allowlist(self):
        for name in ("api.takatak.ca", "takatak.ca.evil.example", "https://takatak.ca", "takatak.ca/", "ahmverdun.ca@evil.example"):
            self.assertIsNone(projection.domain_name(name))
        self.assertEqual(projection.domain_name("TAKATAK.CA"), "takatak.ca")

    def test_startup_and_paths_are_not_inferred_or_executable(self):
        app = projection.project_applications(response({"app": {"domain": "takatak.ca", "path": "/home/owner/../other", "startup_file": "server.js; echo secret", "envvars": {}, "enabled": {"private": "value"}}}))["applications"][0]
        self.assertIsNone(app["appRoot"])
        self.assertIsNone(app["startupFile"])
        self.assertEqual(app["status"], "unknown")
        self.assertIsNone(projection.project_applications(response({"app": {"domain": "takatak.ca", "path": "/home/owner/app"}}))["applications"][0]["startupFile"])
        self.assertIsNone(projection.safe_startup("."))
        self.assertIsNone(projection.safe_startup(".."))

    def test_domain_configuration_excludes_ssl_userdata_and_secrets(self):
        data = {"domain": "takatak.ca", "documentroot": "/home/owner/public_html/takatak", "user": "private-user", "sslcertificate": "private-cert", "password": "fixture-secret"}
        result = projection.project_domain(response(data, "DomainInfo", "single_domain_data"))
        self.assertEqual(result["domain"], {"domain": "takatak.ca", "documentRoot": "/home/owner/public_html/takatak"})
        self.assertNotIn("private-", json.dumps(result))
        data["domain"] = "other.example"
        self.assertIsNone(projection.project_domain(response(data, "DomainInfo", "single_domain_data"))["domain"])

    def test_only_scoped_htaccess_passenger_directives_and_stat_flags_are_exported(self):
        with tempfile.TemporaryDirectory(prefix="ahmv-inventory-fixture-") as fixture:
            home = Path(fixture).resolve()
            docroot = home / "public_html"
            app_root = home / "takatak"
            docroot.mkdir()
            app_root.mkdir()
            (app_root / ".env").write_text("PRIVATE_ENV_CONTENT_MUST_NOT_BE_READ", encoding="utf8")
            (app_root / "server.js").write_text("fixture startup", encoding="utf8")
            htaccess = docroot / ".htaccess"
            htaccess.write_text('SetEnv TOKEN private-setenv-value\nPassengerAppRoot "' + fixture_api_path(app_root) + '"\nPassengerStartupFile server.js\nPassengerNodejs /opt/alt/alt-nodejs22/root/usr/bin/node\nPassengerAppType node\nPassengerEnabled on\nRewriteRule unsafe private-rewrite-value\n', encoding="utf8")
            domain = {"status": "ready", "domain": {"domain": "takatak.ca", "documentRoot": fixture_api_path(docroot)}}
            with patch.object(projection, "read_htaccess_bytes", wraps=projection.read_htaccess_bytes) as reader:
                result = projection.project_domain_directives(domain, home)
                self.assertEqual(reader.call_count, 1)
                self.assertEqual(reader.call_args.args[0], htaccess)
            self.assertEqual(result["PassengerAppRoot"], fixture_api_path(app_root))
            self.assertEqual(result["PassengerStartupFile"], "server.js")
            self.assertTrue(result["envFileExists"])
            self.assertTrue(result["startupFileExists"])
            self.assertFalse(result["currentIsSymlink"])
            self.assertFalse(result["appRootIsSymlink"])
            for private in ("PRIVATE_ENV_CONTENT", "private-setenv-value", "private-rewrite-value", "SetEnv", "RewriteRule"):
                self.assertNotIn(private, json.dumps(result))

    def test_outside_home_or_symlink_configuration_is_not_read(self):
        with tempfile.TemporaryDirectory(prefix="ahmv-inventory-fixture-") as fixture:
            home = Path(fixture) / "home"
            outside = Path(fixture) / "home-other"
            home.mkdir()
            outside.mkdir()
            domain = {"status": "ready", "domain": {"domain": "takatak.ca", "documentRoot": fixture_api_path(outside)}}
            with patch.object(projection, "read_htaccess_bytes", side_effect=AssertionError("No outside read")) as reader:
                self.assertEqual(projection.project_domain_directives(domain, home.resolve())["status"], "scope_unavailable")
                self.assertEqual(reader.call_count, 0)
            docroot = home / "public"
            docroot.mkdir()
            (docroot / ".htaccess").write_text("fixture", encoding="utf8")
            domain["domain"]["documentRoot"] = fixture_api_path(docroot)
            with patch.object(Path, "is_symlink", return_value=True), patch.object(projection, "read_htaccess_bytes", side_effect=AssertionError("No symlink read")) as reader:
                self.assertEqual(projection.project_domain_directives(domain, home.resolve())["status"], "scope_unavailable")
                self.assertEqual(reader.call_count, 0)

    def test_conflicting_directives_and_outside_app_root_fail_closed(self):
        with tempfile.TemporaryDirectory(prefix="ahmv-inventory-fixture-") as fixture:
            home = Path(fixture).resolve()
            docroot = home / "public"
            docroot.mkdir()
            domain = {"status": "ready", "domain": {"domain": "takatak.ca", "documentRoot": fixture_api_path(docroot)}}
            htaccess = docroot / ".htaccess"
            htaccess.write_text("PassengerStartupFile first.js\nPassengerStartupFile second.js\n", encoding="utf8")
            self.assertEqual(projection.project_domain_directives(domain, home)["status"], "schema_unavailable")
            htaccess.write_text("PassengerAppRoot /unrelated-account/takatak\nPassengerStartupFile server.js\n", encoding="utf8")
            result = projection.project_domain_directives(domain, home)
            self.assertEqual(result["status"], "scope_unavailable")
            self.assertIsNone(result["PassengerAppRoot"])
            self.assertIsNone(result["envFileExists"])
            self.assertIsNone(result["appRootIsSymlink"])

    def test_configured_current_symlink_is_detected_before_resolution(self):
        with tempfile.TemporaryDirectory(prefix="ahmv-inventory-fixture-") as fixture:
            home = Path(fixture).resolve()
            docroot = home / "public"
            release = home / "releases" / "fixture-release"
            docroot.mkdir()
            release.mkdir(parents=True)
            current = home / "current"
            try:
                current.symlink_to(release, target_is_directory=True)
            except (NotImplementedError, OSError):
                self.skipTest("Directory symlink creation requires privileges; CI Linux covers this case")
            (release / "server.js").write_text("fixture startup", encoding="utf8")
            (docroot / ".htaccess").write_text('PassengerAppRoot "' + fixture_api_path(home) + '/current"\nPassengerStartupFile server.js\n', encoding="utf8")
            domain = {"status": "ready", "domain": {"domain": "takatak.ca", "documentRoot": fixture_api_path(docroot)}}
            result = projection.project_domain_directives(domain, home)
            self.assertEqual(result["PassengerAppRoot"], fixture_api_path(home) + "/current")
            self.assertTrue(result["appRootIsSymlink"])
            self.assertFalse(result["currentIsSymlink"])
            self.assertTrue(result["startupFileExists"])


if __name__ == "__main__":
    unittest.main()
