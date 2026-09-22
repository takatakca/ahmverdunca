import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogIn, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DemoNotice } from "@/components/demo-notice";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Accès bénévoles — AHM Verdun" },
      {
        name: "description",
        content:
          "Espace réservé aux bénévoles autorisés de l'AHM Verdun pour la gestion du site. Les comptes des parents restent sur Spordle.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Accès bénévoles — AHM Verdun" },
      { property: "og:description", content: "Connexion réservée aux bénévoles autorisés." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await navigate({ to: "/admin" });
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (error) throw error;
      if (data.session) {
        await navigate({ to: "/admin" });
        return;
      }
      setInfo(
        "Compte créé. Vérifiez votre boîte de courriel pour confirmer l'adresse, puis revenez vous connecter. Un administrateur principal doit ensuite vous attribuer un rôle.",
      );
      setMode("signin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la connexion.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Réservé à l'association"
        title="Accès bénévoles"
        description="Cette connexion sert uniquement à la gestion du site par les bénévoles autorisés. Les comptes des parents et les inscriptions restent sur Spordle."
      />
      <div className="container-site max-w-xl space-y-6 py-10 md:py-16">
        <DemoNotice kind="info" title="Accès contrôlé">
          Un nouveau compte n'a aucun droit de modification tant qu'un administrateur principal ne
          lui a pas attribué un rôle. La vérification des droits est faite par le serveur.
        </DemoNotice>

        <form onSubmit={onSubmit} className="card-elevated space-y-4 p-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-navy">
              Courriel
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="tap-target w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-semibold text-navy">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="tap-target w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            {mode === "signup" && (
              <p className="text-xs text-muted-foreground">Au moins 8 caractères.</p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-sport">
              {error}
            </p>
          )}
          {info && (
            <p role="status" className="text-sm font-medium text-navy">
              {info}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="sport" size="lg" disabled={busy}>
              {mode === "signin" ? (
                <>
                  <LogIn className="size-4" /> {busy ? "Connexion…" : "Se connecter"}
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" /> {busy ? "Création…" : "Créer le compte"}
                </>
              )}
            </Button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setInfo(null);
              }}
              className="text-sm text-navy underline underline-offset-4"
            >
              {mode === "signin" ? "Créer un compte bénévole" : "J'ai déjà un compte"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
