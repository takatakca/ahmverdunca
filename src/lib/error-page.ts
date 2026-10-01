export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>AHM Verdun — Page temporairement indisponible</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      body {
        font: 15px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #f7f9fc;
        color: #111a33;
        display: grid;
        place-items: center;
        min-height: 100vh;
        margin: 0;
        padding: 1.5rem;
      }
      .card {
        max-width: 34rem;
        width: 100%;
        text-align: center;
        padding: 2rem;
        border: 1px solid #dfe5ee;
        border-top: 4px solid #c7362f;
        border-radius: 0.75rem;
        background: #fff;
        box-shadow: 0 16px 40px -24px rgba(17,26,51,.35);
      }
      .brand { font-weight: 800; letter-spacing: .08em; text-transform: uppercase; font-size: .75rem; color: #c7362f; }
      h1 { font-size: 1.5rem; margin: .75rem 0 .5rem; line-height: 1.15; }
      p { color: #5d6678; margin: 0 auto 1.5rem; max-width: 28rem; }
      .actions { display: flex; gap: .6rem; justify-content: center; flex-wrap: wrap; }
      a, button {
        min-height: 44px;
        padding: .65rem 1rem;
        border-radius: .45rem;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;
        border: 1px solid transparent;
      }
      .primary { background: #111a33; color: #fff; }
      .secondary { background: #fff; color: #111a33; border-color: #cfd6e1; }
      small { display: block; margin-top: 1rem; color: #7b8495; }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="brand">AHM Verdun</div>
      <h1>Page temporairement indisponible</h1>
      <p>Une erreur technique est survenue. Réessayez maintenant ou revenez à l'accueil.<br />A technical error occurred. Try again or return home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Réessayer / Retry</button>
        <a class="secondary" href="/">Accueil / Home</a>
      </div>
      <small>Aucune opération hockey officielle n'est affectée par cette page.</small>
    </main>
  </body>
</html>`;
}
