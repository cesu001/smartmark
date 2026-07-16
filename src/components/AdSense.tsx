import Script from "next/script";

const ADSENSE_CLIENT_ID = "ca-pub-3579350849681597";

/**
 * Loads the Google AdSense auto-ads loader script.
 *
 * Rendered only from public surfaces (the marketing homepage and the `(auth)`
 * route group) — never from the dashboard layout — so ads stay off the
 * authenticated app. A `next/script` with the default `afterInteractive`
 * strategy executes only when the page/layout it lives in is opened.
 */
export function AdSense() {
  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
