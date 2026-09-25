# RSS Feed + Channel ID Finder

A small React + Node.js tool for finding YouTube channel RSS feeds, with the channel ID available as a secondary result.

Production site: [youtube-channel-id-rss.netlify.app](https://youtube-channel-id-rss.netlify.app/)

## Why this project exists

The primary goal is to help users discover a YouTube channel's RSS feed quickly and reliably. The channel ID is included as a useful companion value as well.

## How it works

1. Paste one or more YouTube channel URLs into the textarea, one URL per line.
2. Click **Get RSS + ID**.
3. The React app sends the URLs to `POST /api/retrieve`.
4. The Netlify Function fetches each page and parses its RSS `<link>` tag.
5. The UI displays the RSS URL first and the channel ID second when it can be extracted from the feed URL.

The RSS feed and channel ID are shown as plain text, with separate copy buttons.

## Contributions are welcomed

## License

This project is licensed under the [MIT License](LICENSE.md).
