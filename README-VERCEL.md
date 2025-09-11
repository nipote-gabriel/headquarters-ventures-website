# Headquarters Ventures — Vercel-ready Static Site

## Automatic Deployment
This site is now connected to GitHub and deploys automatically!
- Repository: https://github.com/nipote-gabriel/headquarters-ventures-website
- Any push to the main branch triggers automatic deployment

## Manual Deploy (if needed)
1) `npm i -g vercel` (once)
2) In this folder: `vercel --prod`
3) Add your domain in **Project → Settings → Domains** and follow the DNS prompts.

### Notes
- `vercel.json` sets:
  - `cleanUrls: true` → `/episodes` works in addition to `/episodes.html`
  - Long-cache for assets (`css/js/images`) and short-cache for `/data` + `/posts`
- Update `data/config.json` to toggle LIVE, set YouTube ID, socials, and paste your subscribe form embed.
- Add/edit episodes in `data/episodes.json`.
- Write articles in `posts/*.md` and list them in `data/posts.json`.
- Replace `https://example.com` in `robots.txt` and `sitemap.xml` with your domain.

## Local preview
Open `index.html` directly or run:
```
python3 -m http.server 8080
```
