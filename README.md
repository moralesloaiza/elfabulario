# El Fabulario

Colección abierta de fábulas en español. Sitio estático construido con [Astro](https://astro.build), editable por colaboradores vía [Decap CMS](https://decapcms.org), hospedado gratuitamente en [Cloudflare Pages](https://pages.cloudflare.com).

## Stack

| Capa | Herramienta | Coste |
|---|---|---|
| Dominio | elfabulario.com | ya pagado |
| Generador | Astro 6 | Gratis |
| Contenido | Markdown en `src/content/fabulas/` | — |
| CMS editorial | Decap CMS | Gratis |
| Repositorio + auth | GitHub | Gratis |
| Hosting + CDN + SSL | Cloudflare Pages | Gratis |

---

## Estructura del proyecto

```
elfabulario/
├── public/
│   ├── admin/
│   │   ├── index.html      ← Panel editorial (/admin)
│   │   └── config.yml      ← Esquema del CMS (mantener sincronizado con content.config.ts)
│   └── favicon.svg
├── src/
│   ├── content/
│   │   └── fabulas/        ← Cada fábula es un archivo .md
│   ├── components/
│   ├── layouts/
│   │   └── Fabula.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── sobre.astro
│   │   ├── fabulas/
│   │   │   ├── index.astro      ← Listado
│   │   │   └── [...slug].astro  ← Fábula individual
│   │   └── rss.xml.js
│   ├── consts.ts           ← Título, descripción, URL
│   └── content.config.ts   ← Esquema Zod (fuente de verdad)
└── astro.config.mjs
```

## Esquema de una fábula

Cada archivo en `src/content/fabulas/*.md` tiene este frontmatter:

```yaml
---
titulo: "Título de la fábula"
resumen: "1–2 frases. Se usa en listados y RSS."
autor: "Nombre visible (real o seudónimo)"
es_seudonimo: false           # true si "autor" es seudónimo
nombre_real: "Opcional"       # privado, solo registro interno
fecha: 2026-04-22
fecha_actualizada: 2026-05-01 # opcional
ilustracion: ../../assets/uploads/zorra.jpg  # opcional
etiquetas: ["orgullo", "clásica"]
borrador: false               # true oculta la fábula del sitio
---

Cuerpo de la fábula en Markdown.
```

---

## Desarrollo local

```sh
npm install
npm run dev          # servidor de desarrollo en localhost:4321
npm run build        # genera ./dist
npm run preview      # sirve ./dist localmente
```

---

## Despliegue — pasos para Alejandro

### 1. Crear el repositorio en GitHub

1. Entra a [github.com/new](https://github.com/new).
2. Nombre del repo: `elfabulario`.
3. Visibilidad: **público**.
4. No inicialices con README (ya existe este).
5. En tu máquina local:

   ```sh
   cd /ruta/a/elfabulario
   git init
   git add .
   git commit -m "Configuración inicial"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/elfabulario.git
   git push -u origin main
   ```

### 2. Conectar Cloudflare Pages

1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Autoriza acceso al repo `elfabulario`.
3. Configuración de build:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: 22
4. Guarda y despliega. En ~2 minutos tendrás el sitio en `elfabulario.pages.dev`.

### 3. Apuntar el dominio elfabulario.com

1. En el proyecto de Cloudflare Pages, ve a **Custom domains** → **Set up a custom domain** → `elfabulario.com`.
2. Si el dominio ya está gestionado por Cloudflare, se configura automático.
3. Si está en otro registrador: crea en tu registrador un `CNAME` de `www` apuntando a `elfabulario.pages.dev`, y sigue las instrucciones de Cloudflare para el dominio raíz.
4. SSL se emite automáticamente (Let's Encrypt).

### 4. Autenticar Decap CMS con GitHub

Decap necesita un proxy OAuth para que los colaboradores se autentiquen sin exponer el client secret. La forma más limpia en este stack es un Cloudflare Worker.

**4a. Crear una GitHub OAuth App**

1. GitHub → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. Application name: `El Fabulario CMS`
3. Homepage URL: `https://elfabulario.com`
4. Authorization callback URL: `https://auth.elfabulario.com/callback` (la definirás en el paso 4b).
5. Guarda. Anota el **Client ID** y genera un **Client Secret**.

**4b. Desplegar el proxy OAuth como Cloudflare Worker**

Hay varios proyectos open-source listos para usar. Recomendados:

- [`decap-proxy`](https://github.com/sterlingwes/decap-proxy) (más simple)
- [`cloudflare-pages-decap-oauth-provider`](https://github.com/i40west/netlify-cms-oauth) (actualizado)

Pasos generales:

```sh
npm install -g wrangler
git clone https://github.com/sterlingwes/decap-proxy
cd decap-proxy
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler deploy
```

Luego en Cloudflare, asigna el subdominio `auth.elfabulario.com` al Worker.

**4c. Actualizar `public/admin/config.yml`**

Descomenta y ajusta:

```yaml
backend:
  name: github
  repo: TU_USUARIO/elfabulario
  branch: main
base_url: https://auth.elfabulario.com
```

Commit y push. En ~1 minuto, los colaboradores podrán entrar en `elfabulario.com/admin`.

### 5. Invitar colaboradores

Cada colaborador necesita:

1. Cuenta GitHub gratuita.
2. Acceso como colaborador al repo: **Settings** → **Collaborators** → **Add people**.

Una vez aceptada la invitación, entran a `elfabulario.com/admin`, hacen login con GitHub, y pueden crear/editar fábulas desde un editor visual.

---

## Flujo editorial

El archivo `public/admin/config.yml` tiene `publish_mode: editorial_workflow`, lo que significa:

1. Un colaborador crea una fábula en `/admin`.
2. Al "Guardar", se crea un pull request en GitHub en lugar de publicar directamente.
3. El admin revisa el PR y lo fusiona.
4. Cloudflare Pages detecta el cambio y despliega automáticamente (~1 min).

Si prefieres publicación directa sin revisión, cambia `publish_mode` a `simple` en `config.yml`.

---

## Rotación semanal del destacado ("La fábula de la semana")

La portada puede mostrar una **fábula distinta cada semana**, elegida sola de
entre las fábulas publicadas con ilustración. Se activa desde el panel editorial
(**Destacado de la home → Rotación semanal automática**) o poniendo
`rotacion_semanal: true` en `src/content/destacado/actual.md`. En ese modo se
ignoran los campos Tipo/Fábula/Entrada/Autor: la elige el código.

Cómo funciona:

- **Selección** — `src/utils/fabulaSemanal.ts` elige de forma *determinista* la
  fábula según la semana en curso. Todos ven la misma durante los siete días, y
  se recorre todo el archivo antes de repetir (~300 ilustradas = ~6 años).
- **Disparador** — como el sitio es estático, la portada solo cambia al
  recompilar. La GitHub Action `.github/workflows/fabula-semanal.yml` fuerza un
  rebuild de Cloudflare Pages **cada lunes 06:00 UTC**.

### Paso manual (una sola vez): crear el Deploy Hook

El workflow necesita un secreto con la URL del Deploy Hook de Cloudflare Pages:

1. **Cloudflare** → Workers & Pages → proyecto `elfabulario` → **Settings** →
   **Builds & deployments** → **Deploy hooks** → **Add deploy hook**.
   - Nombre: `fabula-semanal`
   - Rama: `main`
   - Copia la URL que genera (algo como `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/…`).
2. **GitHub** → repo `elfabulario` → **Settings** → **Secrets and variables** →
   **Actions** → **New repository secret**.
   - Nombre: `CF_DEPLOY_HOOK`
   - Valor: la URL copiada.
3. (Opcional) Prueba: **Actions** → *Fábula de la semana* → **Run workflow**.
   En ~2 min Cloudflare habrá recompilado con la fábula de esa semana.

Para volver a un destacado fijo (un autor, una entrada, una fábula concreta),
desactiva la rotación semanal y elige el elemento a mano.

---

## Mantener sincronizados los esquemas

Hay **dos archivos** que describen el esquema de una fábula:

- `src/content.config.ts` — Zod schema (lo usa Astro al compilar)
- `public/admin/config.yml` — Decap CMS schema (lo ven los colaboradores)

**Cualquier cambio en uno debe reflejarse en el otro**, o bien el CMS permitirá guardar cosas que Astro rechazará al compilar. Esto es una fricción conocida del stack; no hay forma de evitarla en esta versión.

---

## Próximos pasos (Fases 2–4)

- **Fase 2**: Diseño Art-Déco custom (paleta oro / esmeralda / coral / azul zafiro / marfil / negro; tipografía Déco).
- **Fase 3**: Migración del contenido de `elfabulario.tumblr.com` (script XML → Markdown).
- **Fase 4**: Onboarding de los primeros 1–2 colaboradores.
