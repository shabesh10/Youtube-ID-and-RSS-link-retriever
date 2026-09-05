import { createServer } from "node:http";

const port = Number(process.env.PORT || 3001);

async function getRssUrl(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "youtube-rss-finder/1.0" },
  });
  if (!response.ok) throw new Error(`Could not fetch ${url}.`);

  const html = await response.text();
  const match = html.match(
    /<link[^>]+type=["']application\/rss\+xml["'][^>]+href=["']([^"']+)["']/i,
  );

  return match ? new URL(match[1], url).href : null;
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  return JSON.parse(body || "{}");
}

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/api/retrieve") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  try {
    const { channels } = await readJson(request);
    if (!Array.isArray(channels) || channels.length === 0) {
      sendJson(response, 400, { error: "At least one channel URL is required." });
      return;
    }

    const results = await Promise.all(
      channels.map(async (url) => {
        try {
          const rssUrl = await getRssUrl(url);
          return rssUrl
            ? { url, rssUrl }
            : { url, error: "No RSS feed link was found on this page." };
        } catch (error) {
          return { url, error: error.message };
        }
      }),
    );

    sendJson(response, 200, { results });
  } catch {
    sendJson(response, 400, { error: "Invalid request body." });
  }
});

server.listen(port, () => {
  console.log(`YouTube RSS API listening on http://localhost:${port}`);
});