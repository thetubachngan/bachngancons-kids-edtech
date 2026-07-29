import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF7D6 0%, #FFD166 50%, #F4A261 100%)",
          borderRadius: 44,
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 44,
            background: "rgba(255,255,255,0.9)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "absolute", left: 22, top: 20, width: 24, height: 16, borderRadius: 999, transform: "rotate(-20deg)", background: "rgba(255,255,255,0.88)" }} />
          <div style={{ position: "absolute", right: 22, top: 20, width: 24, height: 16, borderRadius: 999, transform: "rotate(20deg)", background: "rgba(255,255,255,0.88)" }} />

          <div style={{ width: 68, height: 84, borderRadius: 999, background: "#1E293B", position: "relative", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", left: 12, top: 26, width: 44, height: 8, borderRadius: 999, background: "#FFD166" }} />
            <div style={{ position: "absolute", left: 8, top: 42, width: 52, height: 8, borderRadius: 999, background: "#FFD166" }} />
            <div style={{ position: "absolute", left: 12, top: 58, width: 44, height: 8, borderRadius: 999, background: "#FFD166" }} />
            <div style={{ position: "absolute", left: 18, top: 14, width: 6, height: 6, borderRadius: 999, background: "#1E293B" }} />
            <div style={{ position: "absolute", right: 18, top: 14, width: 6, height: 6, borderRadius: 999, background: "#1E293B" }} />
            <div style={{ position: "absolute", left: 27, top: 24, width: 14, height: 4, borderRadius: 999, background: "#1E293B" }} />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
