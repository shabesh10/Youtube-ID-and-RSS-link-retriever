# Channel ID + RSS

A React and Node.js tool that accepts YouTube channel URLs and retrieves the channel ID and RSS feed URL from each channel page.

Production site: [youtube-channel-id-rss.netlify.app](https://youtube-channel-id-rss.netlify.app/)

## How it works

1. Paste one or more YouTube channel URLs into the textarea, one URL per line.
2. Click **Get ID + RSS**.
3. The React app sends the URLs to `POST /api/retrieve`.
4. The Netlify Function fetches each page and parses its RSS `<link>` tag.
5. The UI displays the RSS URL and the channel ID extracted from its `channel_id` query parameter.

The RSS and channel ID values are displayed as plain text, with separate copy buttons.
