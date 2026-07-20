# SEO deploy checklist (manual, post-merge)

1. **Vercel primary domain:** Project → Settings → Domains. Set
   `www.my-pokedex.com` as **Primary**; confirm `my-pokedex.com` shows
   "Redirect to www.my-pokedex.com" (308). HTTPS is enforced by Vercel.
2. **Search Console:** Resubmit `https://www.my-pokedex.com/sitemap.xml`.
3. **Validate markup:** Run a home URL, a `/details/{id}` URL, and a
   `/type-interactions/{type}` URL through Google's Rich Results Test —
   expect a valid BreadcrumbList (and WebSite/Organization on home).
4. **Social preview:** Paste a detail URL into the Facebook Sharing
   Debugger / Twitter Card Validator — expect title, description, image.
