# Graduation Invitation

A cute one-page invitation site: animated hero, an envelope that opens into a letter, a countdown, a private RSVP form and a public wishes wall.

## 1. Fill in your details

Edit **`js/config.js`**: your name, school, the date/venue (leave `""` until known, the page shows "Coming soon"), and the letter text.

Optional:
- Photo: put it in `assets/` and set `photo: "assets/me.jpg"`.
- Music: put an mp3 in `assets/` and set `musicUrl`.

## 2. Personal links for each friend

Add `?to=Name` to the link and the letter greets them by name:

```
https://your-site.com/?to=Minh%20Anh
```

The RSVP sheet also records which link was used ("Tên trong link mời" column).

## 3. Connect Google Sheets (stores RSVPs and wishes)

1. Create a new Google Sheet (e.g. "Graduation RSVP").
2. **Extensions > Apps Script**, delete the sample code, paste in `apps-script/Code.gs`, and save.
3. **Deploy > New deployment** > type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Authorize it when asked. If Google says the app isn't verified, click **Advanced > Go to project**.
5. Copy the **Web app URL** (ends with `/exec`) into `appsScriptUrl` in `js/config.js`.

The `RSVP` and `Wishes` tabs are created on the first submission.

- **RSVP is private.** Only you can see it in the Sheet. The website has no way to read it back.
- **Wishes are public** on the wall. To hide one, tick its **Ẩn** (hidden) checkbox in the Sheet.

If you change `Code.gs` later, use **Deploy > Manage deployments > Edit > New version** so the URL stays the same.

Until `appsScriptUrl` is set, the site runs in **demo mode**: forms animate, but nothing is saved.

## 4. Preview locally

Open `index.html` in a browser, or run a small server:

```
npx serve .
```

## 5. Publish (free)

- **Netlify Drop**: drag the folder onto https://app.netlify.com/drop
- **GitHub Pages**: push to a repo, then Settings > Pages > deploy from the main branch.
- **Vercel**: `npx vercel`
