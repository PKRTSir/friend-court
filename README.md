# Friend Court — ศาลตัดสินเพื่อนสนิท

Static Thai/English friendship court game. Players choose a silly friendship case, answer short questions, and receive a shareable verdict card. The app is entertainment only and is not legal advice.

## Features

- Solo Mode for one-player verdicts.
- Duo Same Device Mode for two players on one phone or computer.
- Duo Link Mode with encoded URL parameters. No server stores friend data.
- Daily Case Mode with local daily streak tracking.
- Verdict history saved in `localStorage`.
- Share text, copy links, and export a 1080x1350 PNG result image with canvas.
- SEO basics: canonical URL, robots policy, sitemap, Open Graph, Twitter Card, and a 1200x630 social preview image.
- Viral sharing prompts on the homepage and verdict page.
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
├── og-image.png # Social preview image
├── robots.txt
├── sitemap.xml
└── README.md
```

## Google Search Console

GitHub Pages does not automatically bring traffic. After deploying, submit the site manually:

1. Open Google Search Console.
2. Add a URL prefix property: `https://pkrtsir.github.io/friend-court/`.
3. Verify ownership with the recommended HTML file or meta tag method.
4. Submit `https://pkrtsir.github.io/friend-court/sitemap.xml`.
5. Use URL Inspection for the homepage and request indexing after each meaningful update.

## Test Social Preview

Use these tools after the GitHub Pages deploy is live:

- Facebook Sharing Debugger: scrape `https://pkrtsir.github.io/friend-court/` again after changing `og-image.png`.
- X/Twitter Card Validator or a private post draft to check the `summary_large_image` card.
- LINE, Messenger, Discord, and Slack test chats for real-world preview behavior.

If a platform shows an old image, clear its cache/debugger and confirm `og-image.png` loads directly in the browser.

## Promotion Ideas

Short-form video works best when the first second names a familiar friend crime:

- TikTok/Reels/YouTube Shorts: record the case title, tap through answers quickly, then reveal the verdict card.
- Facebook: post a screenshot of a verdict and ask friends to tag the guilty person.
- Group chats: send the Duo Link Mode result setup so the friend has to answer their side.

Suggested captions:

- `คดีนี้ใครผิด? ส่งให้เพื่อนที่อ่านแล้วไม่ตอบ`
- `ศาลลับกลางคืนตัดสินแล้ว คนในกลุ่มแชตคุณรอดไหม`
- `แท็กเพื่อนที่บอกว่าใกล้ถึงแล้ว แต่ยังไม่ออกจากบ้าน`
- `Friend Court judged me. Your turn.`
- `Send this to the most suspicious friend in the group chat.`

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
