import { ImageResponse } from "next/og";

export const alt = "Smark — AI-powered Markdown notes & knowledge base";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "#0f0f0f",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 96,
              height: 96,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#007a55",
              borderRadius: 20,
              color: "white",
              fontSize: 64,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <span style={{ color: "white", fontSize: 64, fontWeight: 700 }}>
            Smark
          </span>
        </div>
        <div
          style={{
            marginTop: 40,
            color: "white",
            fontSize: 60,
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: 900,
          }}
        >
          AI-powered Markdown notes & knowledge base
        </div>
        <div
          style={{
            marginTop: 28,
            color: "#a1a1a1",
            fontSize: 32,
            maxWidth: 900,
          }}
        >
          Find your notes by meaning — semantic search, summaries & an AI chatbot.
        </div>
      </div>
    ),
    { ...size },
  );
}
