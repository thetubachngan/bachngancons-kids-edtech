import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF7D6 0%, #FFD166 52%, #F4A261 100%)",
        }}
      >
        <div
          style={{
            width: 400,
            height: 400,
            borderRadius: 120,
            background: "rgba(255,255,255,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 190,
              height: 230,
              borderRadius: 999,
              background: "#1E293B",
              position: "relative",
              marginTop: 35,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "absolute", left: 28, top: 80, width: 134, height: 20, borderRadius: 999, background: "#FFD166" }} />
            <div style={{ position: "absolute", left: 22, top: 116, width: 146, height: 20, borderRadius: 999, background: "#FFD166" }} />
            <div style={{ position: "absolute", left: 28, top: 152, width: 134, height: 20, borderRadius: 999, background: "#FFD166" }} />

            <div style={{ position: "absolute", left: 54, top: 56, width: 18, height: 18, borderRadius: 999, background: "#1E293B" }} />
            <div style={{ position: "absolute", right: 54, top: 56, width: 18, height: 18, borderRadius: 999, background: "#1E293B" }} />
            <div style={{ position: "absolute", left: 76, top: 88, width: 38, height: 10, borderRadius: 999, background: "#1E293B" }} />
          </div>

          <div
            style={{
              position: "absolute",
              left: 64,
              top: 78,
              width: 92,
              height: 60,
              borderRadius: 999,
              transform: "rotate(-18deg)",
              background: "rgba(255,255,255,0.95)",
              filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.08))",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 64,
              top: 78,
              width: 92,
              height: 60,
              borderRadius: 999,
              transform: "rotate(18deg)",
              background: "rgba(255,255,255,0.95)",
              filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.08))",
            }}
          />

          <div style={{ position: "absolute", left: 58, top: 26, width: 48, height: 48, borderRadius: 18, background: "rgba(255,255,255,0.85)" }} />
          <div style={{ position: "absolute", right: 58, top: 26, width: 48, height: 48, borderRadius: 18, background: "rgba(255,255,255,0.85)" }} />
          <div style={{ position: "absolute", left: 76, top: 42, width: 14, height: 14, transform: "rotate(45deg)", background: "#F59E0B" }} />
          <div style={{ position: "absolute", right: 76, top: 42, width: 14, height: 14, transform: "rotate(45deg)", background: "#F59E0B" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
