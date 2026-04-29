export interface Env {
  OAUTH_CLIENT_ID: string;
  OAUTH_CLIENT_SECRET: string;
  SITE_URL: string;
}

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const STATE_COOKIE = "oauth_state";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/auth") return handleAuth(url, env);
    if (url.pathname === "/callback") return handleCallback(request, url, env);
    if (url.pathname === "/") return new Response("oauth-proxy listo.", { status: 200 });
    return new Response("Not found", { status: 404 });
  },
};

async function handleAuth(url: URL, env: Env): Promise<Response> {
  const state = crypto.randomUUID();
  const scope = url.searchParams.get("scope") ?? "repo,user";

  const authorize = new URL(GITHUB_AUTHORIZE_URL);
  authorize.searchParams.set("client_id", env.OAUTH_CLIENT_ID);
  authorize.searchParams.set("scope", scope);
  authorize.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      "Set-Cookie": `${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    },
  });
}

async function handleCallback(request: Request, url: URL, env: Env): Promise<Response> {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = readCookie(request.headers.get("Cookie"), STATE_COOKIE);

  if (!code || !state || state !== cookieState) {
    return renderResult({ error: "invalid_state" }, env.SITE_URL);
  }

  const tokenRes = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "elfabulario-oauth-proxy",
    },
    body: JSON.stringify({
      client_id: env.OAUTH_CLIENT_ID,
      client_secret: env.OAUTH_CLIENT_SECRET,
      code,
    }),
  });

  const data = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!data.access_token) {
    return renderResult({ error: data.error ?? "no_token" }, env.SITE_URL);
  }
  return renderResult({ token: data.access_token, provider: "github" }, env.SITE_URL);
}

function renderResult(
  payload: { token?: string; provider?: string; error?: string },
  siteUrl: string,
): Response {
  const status = payload.error ? "error" : "success";
  const body = payload.error
    ? payload.error
    : JSON.stringify({ token: payload.token, provider: payload.provider });
  const message = `authorization:github:${status}:${body}`;

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>OAuth callback</title></head>
<body>
<script>
(function () {
  function send(target) {
    if (window.opener) window.opener.postMessage(${JSON.stringify(message)}, target);
  }
  window.addEventListener("message", function (e) {
    if (e.data === "authorizing:github") send(e.origin);
  }, false);
  send(${JSON.stringify(siteUrl)});
})();
</script>
<p>Autenticación completa. Esta ventana se cerrará automáticamente.</p>
</body></html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Set-Cookie": `${STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
    },
  });
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const found = header.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return found ? found.slice(name.length + 1) : null;
}