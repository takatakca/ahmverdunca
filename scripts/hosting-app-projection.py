"""Read-only cPanel metadata and one home-confined document-root .htaccess.

Sent to python3 -B - over SSH stdin. No host file is written.
"""
import json
import os
from pathlib import Path
import re
import shlex
import subprocess
import sys
import threading

UAPI = "/usr/local/cpanel/bin/uapi"
COMMANDS = {
    "applications": [UAPI, "--output=json", "PassengerApps", "list_applications"],
    "domain": [UAPI, "--output=json", "DomainInfo", "single_domain_data", "domain=takatak.ca"],
}
ALLOWED_DOMAINS = {"takatak.ca", "ahmverdun.ca"}
MAX_RESPONSE_BYTES = 1_048_576
MAX_APPLICATIONS = 128


def domain_name(value):
    if not isinstance(value, str):
        return None
    name = value.lower().strip()
    if name.startswith("www."):
        name = name[4:]
    return name if name in ALLOWED_DOMAINS else None


def safe_name(value):
    return value if isinstance(value, str) and re.fullmatch(r"[A-Za-z0-9_. -]{1,128}", value) else None


def safe_path(value):
    if not isinstance(value, str) or len(value) > 512:
        return None
    if not re.fullmatch(r"/[A-Za-z0-9_. /-]+", value):
        return None
    if any(part in (".", "..") for part in value.split("/")):
        return None
    return value


def environment_names(value):
    # PassengerApps documents envvars as an object keyed by variable name.
    # Values are never traversed or returned, regardless of their type.
    if isinstance(value, dict):
        candidates = value.keys()
    elif isinstance(value, list):
        candidates = [item.get("name") for item in value if isinstance(item, dict)]
    else:
        candidates = []
    names = {name for name in candidates if isinstance(name, str) and re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]{0,127}", name)}
    return sorted(names)[:256]


def safe_startup(value):
    return value if isinstance(value, str) and value not in (".", "..") and re.fullmatch(r"[A-Za-z0-9_.-]{1,128}", value) else None


def api_data(payload, module, function):
    if not isinstance(payload, dict) or payload.get("apiversion") != 3:
        return "schema_unavailable", None
    if payload.get("module") != module or payload.get("func") != function:
        return "schema_unavailable", None
    result = payload.get("result")
    if not isinstance(result, dict) or result.get("status") != 1:
        return "api_unavailable", None
    return "ready", result.get("data")


def project_applications(payload):
    status, data = api_data(payload, "PassengerApps", "list_applications")
    if status != "ready":
        return {"status": status, "applications": []}
    if not isinstance(data, dict) or len(data) > MAX_APPLICATIONS:
        return {"status": "schema_unavailable", "applications": []}
    applications = []
    for key, record in data.items():
        if not isinstance(record, dict):
            continue
        domain = domain_name(record.get("domain"))
        if domain is None:
            continue
        enabled = record.get("enabled")
        state = "enabled" if enabled in (1, "1", True) else "disabled" if enabled in (0, "0", False) else "unknown"
        # startup_file is not present in the current PassengerApps list schema.
        # Preserve an explicitly returned filename on older hosts; never guess it.
        startup = record.get("startup_file")
        applications.append({
            "domain": domain,
            "appName": safe_name(record.get("name")) or safe_name(key),
            "appRoot": safe_path(record.get("path")),
            "startupFile": safe_startup(startup),
            "environmentVariableNames": environment_names(record.get("envvars")),
            "status": state,
        })
    applications.sort(key=lambda app: (app["domain"], app["appName"] or ""))
    return {"status": "ready" if applications else "no_matching_apps", "applications": applications}


def project_domain(payload):
    status, data = api_data(payload, "DomainInfo", "single_domain_data")
    if status != "ready":
        return {"status": status, "domain": None}
    if not isinstance(data, dict) or domain_name(data.get("domain", data.get("servername"))) != "takatak.ca":
        return {"status": "schema_unavailable", "domain": None}
    return {
        "status": "ready",
        "domain": {"domain": "takatak.ca", "documentRoot": safe_path(data.get("documentroot"))},
    }


def current_home():
    try:
        import pwd
        if os.geteuid() == 0:
            return None
        return Path(pwd.getpwuid(os.geteuid()).pw_dir).resolve(strict=True)
    except Exception:
        return None


def within_home(candidate, home):
    try:
        resolved = Path(candidate).resolve(strict=True)
        return resolved if os.path.commonpath((str(resolved), str(home))) == str(home) else None
    except Exception:
        return None


def scoped_file_exists(candidate, home):
    try:
        resolved = Path(candidate).resolve(strict=True)
        return resolved.is_file() if os.path.commonpath((str(resolved), str(home))) == str(home) else None
    except FileNotFoundError:
        return False
    except Exception:
        return None


def empty_directives(status):
    return {"status": status, "domain": "takatak.ca", "PassengerAppRoot": None, "PassengerStartupFile": None, "PassengerNodejs": None, "PassengerAppType": None, "PassengerEnabled": None, "currentIsSymlink": None, "envFileExists": None, "startupFileExists": None}


def read_htaccess_bytes(candidate):
    if candidate.is_symlink():
        raise ValueError("Scoped configuration must not be a symlink")
    descriptor = os.open(str(candidate), os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    with os.fdopen(descriptor, "rb") as handle:
        return handle.read(65_537)


def project_domain_directives(domain_result, home):
    """Read only the single scoped document root's existing .htaccess file.

    Non-Passenger lines (including SetEnv values) are discarded on the host.
    Existence flags use stat; application/startup/env contents are never read.
    """
    if home is None or domain_result.get("status") != "ready":
        return empty_directives("scope_unavailable")
    record = domain_result.get("domain")
    if not isinstance(record, dict) or record.get("domain") != "takatak.ca":
        return empty_directives("scope_unavailable")
    root = within_home(record.get("documentRoot"), home)
    if root is None or not root.is_dir():
        return empty_directives("scope_unavailable")
    candidate = root / ".htaccess"
    if candidate.is_symlink():
        return empty_directives("scope_unavailable")
    htaccess = within_home(candidate, home)
    if htaccess is None:
        return empty_directives("not_available")
    if not htaccess.is_file():
        return empty_directives("not_available")
    allowed = {"PassengerAppRoot", "PassengerStartupFile", "PassengerNodejs", "PassengerAppType", "PassengerEnabled"}
    found = {name: set() for name in allowed}
    try:
        raw = read_htaccess_bytes(candidate)
        if len(raw) > 65_536:
            return empty_directives("schema_unavailable")
        for line in raw.decode("utf8").splitlines():
            stripped = line.strip()
            if not stripped or stripped.split(None, 1)[0] not in allowed:
                continue
            parts = shlex.split(stripped, comments=True, posix=True)
            if len(parts) == 2:
                found[parts[0]].add(parts[1])
    except Exception:
        return empty_directives("not_available")
    if any(len(values) > 1 for values in found.values()):
        return empty_directives("schema_unavailable")
    values = {name: next(iter(found[name])) if found[name] else None for name in allowed}
    output = empty_directives("ready" if any(found.values()) else "not_available")
    app_root_value = safe_path(values["PassengerAppRoot"])
    scoped_root = within_home(app_root_value, home) if app_root_value else None
    output["PassengerAppRoot"] = app_root_value if scoped_root is not None else None
    output["PassengerNodejs"] = safe_path(values["PassengerNodejs"])
    startup = values["PassengerStartupFile"]
    output["PassengerStartupFile"] = safe_startup(startup)
    output["PassengerAppType"] = values["PassengerAppType"] if values["PassengerAppType"] in ("node", "python", "ruby") else None
    output["PassengerEnabled"] = values["PassengerEnabled"].lower() if isinstance(values["PassengerEnabled"], str) and values["PassengerEnabled"].lower() in ("on", "off") else None
    if app_root_value and scoped_root is None:
        output["status"] = "scope_unavailable"
    if scoped_root is not None and scoped_root.is_dir():
        output["currentIsSymlink"] = (scoped_root / "current").is_symlink()
        output["envFileExists"] = scoped_file_exists(scoped_root / ".env", home)
        if output["PassengerStartupFile"] is not None:
            output["startupFileExists"] = scoped_file_exists(scoped_root / output["PassengerStartupFile"], home)
    return output


def read_api(command):
    process = None
    timer = None
    try:
        process = subprocess.Popen(command, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        timer = threading.Timer(30, process.kill)
        timer.daemon = True
        timer.start()
        raw = process.stdout.read(MAX_RESPONSE_BYTES + 1)
        if len(raw) > MAX_RESPONSE_BYTES:
            process.kill()
            return None
        if process.wait(timeout=5) != 0:
            return None
        return json.loads(raw)
    except Exception:
        # No API error text, stderr, environment value or traceback is exported.
        return None
    finally:
        if timer is not None:
            timer.cancel()
        if process is not None:
            if process.poll() is None:
                process.kill()
            if process.stdout is not None:
                process.stdout.close()


def main():
    apps = project_applications(read_api(COMMANDS["applications"]))
    domain = project_domain(read_api(COMMANDS["domain"]))
    directives = project_domain_directives(domain, current_home())
    projection = {"version": 1, "passenger": apps, "domainConfiguration": domain, "domainPassengerDirectives": directives}
    sys.stdout.write(json.dumps(projection, ensure_ascii=True, separators=(",", ":")))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.stdout.write('{"version":1,"passenger":{"status":"api_unavailable","applications":[]},"domainConfiguration":{"status":"api_unavailable","domain":null}}')
