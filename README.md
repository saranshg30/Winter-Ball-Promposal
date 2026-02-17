# Winter Ball Promposal Quest

A multi-page, vanilla HTML/CSS/JS promposal game for Tanvi.

## Included flow

1. `index.html` - intro
2. `game1.html` - Snow Rush (20s, pass at 18)
3. `game2.html` - Heart Runner (25s, pass at 22)
4. `game3.html` - Flashback Blitz memory reel
5. `game4.html` - Rhythm of Us (12 beats, pass at 8 Great)
6. `game5.html` - Final Lock (`TANVI19022026`)
7. `finale.html` - proposal with Yes/No interaction

## Assets you should replace

The repository currently includes placeholder images at:

- `assets/images/candid-1.jpg`
- `assets/images/candid-2.jpg`
- `assets/images/candid-3.jpg`
- `assets/images/candid-4.jpg`
- `assets/images/candid-5.jpg`

Replace them with your real photos (including intimate/kissing photos if you want).
Keep the same filenames to avoid code changes.

## Audio behavior

No external audio file is required.
Ambient background sound is generated in-browser using Web Audio API and can be toggled with `Sound: On/Off`.

## Run locally

Open `index.html` in a browser.

For best cross-page navigation behavior, run a local static server (optional):

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080/`.

## Deploy on GitHub Pages

1. Push all files to your repository's `main` branch.
2. Go to repository Settings -> Pages.
3. Source: `Deploy from a branch`.
4. Branch: `main` and folder: `/ (root)`.
5. Save and wait for deploy.
6. Open the published URL and test the full quest flow.

## Reset progress

Use the `Reset` button in the top bar on any page.
