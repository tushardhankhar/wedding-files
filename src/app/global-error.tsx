"use client";

/**
 * Last-resort boundary: catches errors thrown by the ROOT layout itself, which
 * the nested error.tsx files cannot see. It replaces the root layout when
 * active, so it renders its own <html>/<body> and cannot rely on globals.css,
 * next/font, or any provider — hence the inline styles.
 *
 * `metadata` isn't supported in a Client Component, so the tab title is set
 * with React's <title>.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          textAlign: "center",
          background: "#fffaf3",
          color: "#2f3342",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        <title>Something went wrong · Join the Jashn</title>
        <main style={{ maxWidth: "26rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 .5rem" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: ".875rem", lineHeight: 1.6, margin: "0 0 1.25rem", opacity: 0.75 }}>
            We hit an unexpected problem. Please try again — if it keeps
            happening, get in touch at hello@jointhejashn.com.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              cursor: "pointer",
              borderRadius: "9999px",
              border: "none",
              background: "#864797",
              color: "#fff",
              padding: ".625rem 1.25rem",
              fontSize: ".875rem",
              fontWeight: 600,
            }}
          >
            Try again
          </button>
          {error.digest ? (
            <p style={{ marginTop: "1.25rem", fontSize: ".6875rem", opacity: 0.5 }}>
              Reference: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
