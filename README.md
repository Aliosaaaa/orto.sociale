# Orto Sociale — sito web

Sito statico (HTML + CSS + JS vanilla, **nessun build step**) per il progetto **Orto Sociale** dei fratelli Maltagliati — orti in affitto con servizi inclusi a Pescia (PT).

**Repo:** `Aliosaaaa/orto.sociale` · **URL:** https://aliosaaaa.github.io/orto.sociale/

## Struttura

```
index.html          → tutto il sito (one-page)
assets/css/style.css
assets/js/main.js   → menu mobile, animazioni reveal, form → WhatsApp
assets/img/         → foto ottimizzate, logo trasparente, favicon
sitemap.xml, robots.txt, .nojekyll
BRIEF.md, BRAND.md, RICERCHE/, FOTO/, GRAFICHE/, RIFERIMENTI/ → materiale di progetto
```

## ⚠️ Da sostituire PRIMA del lancio

| Cosa | Dove | Valore attuale (placeholder) |
|---|---|---|
| **Numero WhatsApp/telefono** | `index.html` (cerca `390000000000` e `+39 000 000 0000`) e `assets/js/main.js` riga `WHATSAPP_NUMBER` | `+39 000 000 0000` |
| **Email** | `index.html` (cerca `info@ortosociale.it`) | `info@ortosociale.it` |
| **Testimonianze** | sezione `#testimonianze` — sono **esempi**, vanno sostituite con citazioni reali dei primi partecipanti | Franco, Elisa, Marta e Luca |
| **Prezzi** | sezione `#orti` — prezzi indicativi di lancio (290/420/590 €/anno), confermarli | |
| **Mappa** | iframe in `#contatti` — ora punta a "Pescia, PT" generico; sostituire con l'indirizzo esatto del terreno | |
| **Dominio** | quando scelto (es. ortosociale.it): creare file `CNAME` col dominio, aggiornare `canonical`, URL Open Graph, `sitemap.xml` e `robots.txt` | |

## Deploy su GitHub Pages

1. Push su `main`:
   ```bash
   git add -A
   git commit -m "Sito Orto Sociale"
   git push -u origin main
   ```
2. Su GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / (root)** → Save.
3. Dopo 1-2 minuti il sito è su https://aliosaaaa.github.io/orto.sociale/

### Dominio personalizzato (quando pronto)
1. `echo "www.ortosociale.it" > CNAME` e push.
2. DNS: CNAME `www` → `aliosaaaa.github.io`, più i 4 record A apex di GitHub Pages.
3. Aggiornare gli URL assoluti in `index.html` (canonical, og:url, og:image), `sitemap.xml` e `robots.txt`.

## Note tecniche

- Foto originali (11 MB) ridotte a JPEG progressivi in 3 tagli (640/1080/1920 px) con `srcset`.
- Logo: sfondo bianco rimosso via script Python (PIL), versione chiara per il footer, favicon dal germoglio.
- SEO: title/description, Open Graph + Twitter Card, JSON-LD `LocalBusiness` + `FAQPage`, sitemap, robots, alt text su tutte le immagini.
- Accessibilità: skip-link, focus visibile, `aria-label`/`aria-expanded`, contrasto AA (terracotta scurita nei bottoni), `prefers-reduced-motion` rispettato.
- Il form contatti non ha backend: apre WhatsApp con il messaggio precompilato (scelta adatta al traffico da social).
