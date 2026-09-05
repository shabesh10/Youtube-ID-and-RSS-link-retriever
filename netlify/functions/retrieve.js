async function getRssUrl(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "youtube-rss-finder/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Could not fetch ${url}.`);
  }

  const html = await response.text();
  const match = html.match(
    /<link[^>]+type=["']application\/rss\+xml["'][^>]+href=["']([^"']+)["']/i,
  );

  return match ? new URL(match[1], url).href : null;
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { channels } = await request.json();

    if (!Array.isArray(channels) || channels.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one channel URL is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
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

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}