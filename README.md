# Aarnav Thakur Portfolio

Static personal portfolio website built for GitHub Pages.

## Files

- `index.html` - premium homepage with hero, about, skills, sports, guitar, YouTube, books, places, and contact preview.
- `interests.html` - dedicated interests, sports, guitar, and YouTube page.
- `books.html` - book cards with short original reviews.
- `places.html` - travel and memories cards with local images.
- `find-me.html` - contact, Instagram, and YouTube links.
- `assets/css/styles.css` - shared responsive design system.
- `assets/js/main.js` - starfield, reveal animations, swipe rails, video modal, audio button, and Instagram popover.

## Edit Points

Search the HTML files for comments starting with `EDIT:` or `YOUTUBE:`. Those mark the safest places to update:

- name and initials
- Instagram ID
- guitar profile picture
- YouTube video IDs
- future book or travel photos

## YouTube Embeds

To make a video tile play inside the site, paste the YouTube video ID into `data-video-id`.

Example:

```html
data-video-id="abc123xyz"
```

For a URL like `https://www.youtube.com/watch?v=abc123xyz`, the ID is `abc123xyz`.

## GitHub Pages

Push this folder to a GitHub repository, then enable GitHub Pages from the repository settings. The site uses only relative paths and local assets, so it can run from the repository root without a backend.
