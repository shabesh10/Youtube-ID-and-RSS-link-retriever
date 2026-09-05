import { useState } from "react";
import "./App.css";

function App() {
  const [channelUrls, setChannelUrls] = useState("");
  const [message, setMessage] = useState(null);
  const [results, setResults] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedValue, setCopiedValue] = useState(null);

  const getChannelIdFromRss = (rssUrl) => {
    try {
      return new URL(rssUrl).searchParams.get("channel_id");
    } catch {
      return null;
    }
  };

  const copyToClipboard = async (value, key) => {
    await navigator.clipboard.writeText(value);
    setCopiedValue(key);
    window.setTimeout(() => setCopiedValue(null), 1600);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const submittedChannels = channelUrls
      .split("\n")
      .map((channel) => channel.trim())
      .filter(Boolean);

    if (!submittedChannels.length) {
      setMessage({
        type: "error",
        text: "Add at least one YouTube channel URL.",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch("/api/retrieve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channels: submittedChannels }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The request failed.");

      const resolvedResults = data.results;
    const resolvedCount = resolvedResults.filter((result) => result.rssUrl).length;
      setResults(resolvedResults);
      setMessage({
        type: resolvedCount ? "success" : "error",
        text: resolvedCount
          ? `${resolvedCount} ${resolvedCount === 1 ? "RSS feed" : "RSS feeds"} found.`
          : "No RSS feed links were found.",
      });
    } catch (error) {
      setResults([]);
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sourceCount = channelUrls
    .split("\n")
    .map((channel) => channel.trim())
    .filter(Boolean).length;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Channel ID and RSS home">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>channel id + rss</span>
        </a>
        <span className="status-pill">
          <span className="status-dot" /> ready to resolve
        </span>
      </header>
      <section className="hero-section">
        <div className="eyebrow">
          <span /> CHANNEL ID + RSS TOOL
        </div>
        <h1>
          Get the ID.
          <br />
          <em>Build the feed.</em>
        </h1>
        <p className="intro">
          Paste one or more YouTube channel URLs to retrieve each channel's ID
          and RSS feed link.
        </p>
        <form className="channel-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <div>
              <div>
                <h2>YouTube channels</h2>
                <p>Paste one URL per line to retrieve each ID and RSS link.</p>
              </div>
            </div>
            <span className="source-count">
              {sourceCount} {sourceCount === 1 ? "source" : "sources"}
            </span>
          </div>
          <div className="url-input">
            <textarea
              value={channelUrls}
              onChange={(event) => {
                setChannelUrls(event.target.value);
                setMessage(null);
                setResults([]);
              }}
              placeholder="https://youtube.com/@channelname&#10;https://youtube.com/@anotherchannel"
              aria-label="YouTube channel URLs, one per line"
              rows="6"
            />
          </div>
          <div className="form-footer">
            <div className="privacy-note">
              <span className="lock-icon" aria-hidden="true">⌑</span>{" "}
              Fetched securely by the RSS resolver
            </div>
            <button
              className="retrieve-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Retrieving..." : "Get ID + RSS"}
              {!isSubmitting && <span aria-hidden="true">↗</span>}
            </button>
          </div>
          {message && (
            <p className={`form-message ${message.type}`} role="status">
              {message.text}
            </p>
          )}
        </form>
        {results.length > 0 && (
          <section className="results-section" aria-label="Channel results">
            <div className="results-heading"><h2>Resolved results</h2><span>{results.length} {results.length === 1 ? "entry" : "entries"}</span></div>
            <div className="results-list">
              {results.map((result) => (
                <article className={`result-card${result.error ? " result-error" : ""}`} key={result.url}>
                  <p className="result-source">{result.url}</p>
                  {result.error ? <p className="result-error-text">{result.error}</p> : <>
                    <div className="result-row"><span>Channel ID</span><div className="result-value"><code>{getChannelIdFromRss(result.rssUrl) || "Not found"}</code>{getChannelIdFromRss(result.rssUrl) && <button className="copy-button" type="button" onClick={() => copyToClipboard(getChannelIdFromRss(result.rssUrl), `${result.url}-id`)}>{copiedValue === `${result.url}-id` ? "Copied" : "Copy"}</button>}</div></div>
                    <div className="result-row"><span>RSS feed</span><div className="result-value"><code>{result.rssUrl}</code><button className="copy-button" type="button" onClick={() => copyToClipboard(result.rssUrl, `${result.url}-rss`)}>{copiedValue === `${result.url}-rss` ? "Copied" : "Copy"}</button></div></div>
                  </>}
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
      <footer className="footer">
        <span>© 2026 Shabeshvaran</span>
        <span>Simple IDs. Direct feeds.</span>
      </footer>
    </main>
  );
}

export default App;
