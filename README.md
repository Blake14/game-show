# Quiz-O-Rama

A retro trivia board game for family night. The host runs it on one computer and screen-shares the browser window on Discord (with "share audio" on).

```bash
npm install
npm run dev
```

Open http://localhost:5173 and press F11 for full screen.

## Host keys

| Key | Does |
|---|---|
| Space / Enter | Roll |
| 1–4 or A–D | Pick an answer |
| Ctrl+Z | Undo the last answer |

Click a player's scoreboard card before rolling to make it their turn. If the page gets refreshed, **Resume last game** shows up on the title screen.

## Customizing

- **Questions:** `src/data/questions.json`. `answer` is the index of the correct choice, counting from 0.
- **Picture questions:** put the file in `public/images/` and add `"image": "/images/yourfile.jpg"` to the question (see `q051` for an example). The image shows on the left and the answers on the right, and the host can click the image to enlarge it. Landscape pictures around 800px wide work best (JPG, PNG, WebP or SVG). Keep the answers short, since they share the space with the picture. If an image fails to load, the question just shows without it.
- **Sounds:** drop `.mp3` files into `public/sounds/` using the names in `src/config/sounds.js`. Any missing sound plays a built-in synth bleep instead.
- **Rules and timing:** `src/config/rules.js` (points, reveal delay, colors, and the game title).
