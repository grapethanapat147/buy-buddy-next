# Fonts — LINE Seed Sans TH

The official BuyBuddy typeface is **LINE Seed Sans** (Thai + Latin), with **Sukhumvit Set**
as the Apple-device fallback (see `docs/DESIGN.md` §6 / §23).

LINE Seed Sans is a **licensed** font and is **not** committed to this repo. To self-host it:

1. Obtain the licensed `.woff2` files from the LINE Seed distribution.
2. Drop them into this folder (`public/fonts/`) using these exact filenames:
   - `LINESeedSansTH_W_Rg.woff2` (weight 400)
   - `LINESeedSansTH_W_Md.woff2` (weight 500)
   - `LINESeedSansTH_W_Bd.woff2` (weight 700)
3. Uncomment the `@font-face` block at the bottom of `src/styles/tokens.css`.

Until the files exist, the `@font-face` rules stay commented out so the browser never
requests missing files (no 404s). The `--font-sans` stack already lists
`"LINE Seed Sans"` first and falls back to `"Sukhumvit Set"`, then the loaded Plus Jakarta
Sans web-safe fallback, then the system sans-serif — so text renders correctly either way.

Do **not** hotlink LINE Seed Sans from a CDN — host the licensed files here.
