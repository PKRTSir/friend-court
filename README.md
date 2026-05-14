# Friend Court — ศาลตัดสินเพื่อนสนิท

Static Thai/English friendship court game. Players choose a silly friendship case, answer short questions, and receive a shareable verdict card. The app is entertainment only and is not legal advice.

## Features

- Solo Mode for one-player verdicts.
- Duo Same Device Mode for two players on one phone or computer.
- Duo Link Mode with encoded URL parameters. No server stores friend data.
- Daily Case Mode with local daily streak tracking.
- Verdict history saved in `localStorage`.
- Share text, copy links, and export a 1080x1350 PNG result image with canvas.
- Bilingual UI: Thai and English.
- Language switcher in the top-right corner with flag-only options: `🇹🇭` and `🇬🇧`.
- Selected language is saved in `localStorage` with `friendCourtLang`.
- Midnight Court theme: dark glass UI with a cream court-judgment verdict card.
- No backend, database, login, framework, build step, or AI API.

## How To Run Locally

Open `index.html` directly in a browser.

You can also use any simple static server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy To GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js`, and `README.md`.
3. Go to Settings -> Pages.
4. Choose "Deploy from a branch".
5. Select the main branch and root folder.
6. Save and wait for the GitHub Pages URL.

## File Structure

```text
.
├── index.html   # Page shell, fonts, app mount, export canvas
├── styles.css   # Midnight Court UI, responsive layout, animations
├── app.js       # Data, translations, scoring, routing, localStorage, sharing
└── README.md
```

## Adding Translations

General UI text lives in the `translations` object in `app.js`.

```js
const translations = {
  th: { buttons: { solo: "เริ่มเล่น" } },
  en: { buttons: { solo: "Play Solo" } }
};
```

Use `t("buttons.solo")` for UI labels. Use `getLocalized(value)` for bilingual data shaped like:

```js
{ th: "คดีอ่านแล้วไม่ตอบ", en: "The Read But No Reply Case" }
```

## Adding Cases And Questions

Cases are kept easy to edit:

- Add the Thai case entry in `cases`.
- Add the Thai question set in `CASE_QUESTION_SETS`.
- Add the English title, description, level, questions, and answer choices in `caseTranslations`.
- Keep each question at 3-4 options.
- Keep scores on the same axes: `chaos`, `honesty`, `responsibility`, `drama`, `ghosting`, `snackEnergy`.

Answer format:

```js
c("เปิดอ่านแล้วซ้อมคำตอบในหัว", {
  chaos: 1,
  drama: 2,
  ghosting: 1
});
```

## Adding Results

- Thai result templates are in `resultTemplates`.
- English result copy is in `resultTranslations`, keyed by the Thai result title.
- Funny punishments are in `punishments`; English equivalents are in `punishmentTranslations`.
- Duo relationship titles are in `friendshipTitles`; English equivalents are in `friendshipTitleTranslations`.

## Notes

The project is 100% static and GitHub Pages compatible. All saved data stays on the user's device through `localStorage`, while Duo Link Mode uses encoded JSON in the URL parameter. There is no backend and no personal data is sent to a server.
