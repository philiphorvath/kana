# Kana — Japanese learning PWA

Hiragana → katakana → everyday sentence patterns. Spaced repetition, flashcards, on-screen handwriting (trace → guided → from memory), sentence builder, device text-to-speech. Runs fully offline once installed. No accounts, no server, no tracking; progress is stored on the phone.

## Deploy to GitHub Pages (once, ~5 minutes)

1. Create a GitHub account if you do not have one, then create a new **public** repository, e.g. `kana`.
2. Upload every file in this folder to the repository root (drag and drop on the repo page → "Add file" → "Upload files" → Commit).
3. In the repo: **Settings → Pages → Build and deployment → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)` → Save.**
4. After a minute the site is live at `https://<your-username>.github.io/kana/`.

## Install on Android

1. Open the URL in Chrome on the phone.
2. Tap the **Install** button in the app header (or Chrome menu ⋮ → "Add to Home screen" / "Install app").
3. Open it from the home screen. From now on it works without a connection.

Japanese voice: Android **Settings → System → Languages → Text-to-speech → Google Speech Services → Install voice data → Japanese**. The app falls back silently if no voice is installed.

## Updating

Replace the changed files in the repository. Also bump `VERSION` in `sw.js` (e.g. `kana-v1.0.1`) so installed phones fetch the new files — the app shows "Update ready" and picks it up on the next launch.

## Backup

Settings → Export copies your progress as text. Paste it into Import on a new phone.

## Curriculum

Edit `data.js` to add vocabulary, sentence patterns or mnemonics. Patterns use `{X}` (and optionally `{Y}`) as slots; `slot` lists which vocabulary types may fill it. New cards appear automatically in the level given by `tier`.

## Credits

Stroke data from [KanjiVG](http://kanjivg.tagaini.net) (Ulrich Apel), CC BY-SA 3.0.
