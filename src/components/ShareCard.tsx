"use client";

import { College } from "@/types";

interface ShareCardProps {
  colleges: College[];
  studentName?: string;
  stream?: string;
  state?: string;
}

export default function ShareCard({ colleges, studentName, stream, state }: ShareCardProps) {
  const top3 = colleges.slice(0, 3);

  const handleDownload = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const card = document.getElementById("share-card");
      if (!card) return;

      const canvas = await html2canvas(card, {
        useCORS: true,
        backgroundColor: "#05071a",
        scale: 2,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = "my-college-matches.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to download card:", error);
    }
  };

  const handleWhatsAppShare = () => {
    const topCollege = top3[0]?.name ?? "a great college";
    const topScore = top3[0]?.match_score ?? 0;
    const message = `I used CollegeMatch-AI and found my top college matches! My top match: ${topCollege} with ${topScore}% accuracy. Find your college match free at: https://collegematch-ai.vercel.app`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Off-screen card for capture */}
      <div
        id="share-card"
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: "800px",
          height: "450px",
          backgroundColor: "#05071a",
          border: "2px solid #4f46e5",
          borderRadius: "24px",
          padding: "40px",
          fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
          boxSizing: "border-box",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #4f46e5, #06b6d4)",
            borderRadius: "24px 24px 0 0",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-0.5px",
                marginBottom: "4px",
              }}
            >
              CollegeMatch
              <span style={{ color: "#4f46e5" }}>-AI</span>
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "3px",
              }}
            >
              My College Matches
            </div>
          </div>

          {/* Student info */}
          <div style={{ textAlign: "right" }}>
            {studentName && (
              <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: "4px" }}>
                {studentName}
              </div>
            )}
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              {stream && (
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    color: "#818cf8",
                    backgroundColor: "rgba(79,70,229,0.15)",
                    border: "1px solid rgba(79,70,229,0.3)",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {stream}
                </span>
              )}
              {state && (
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    color: "#67e8f9",
                    backgroundColor: "rgba(6,182,212,0.1)",
                    border: "1px solid rgba(6,182,212,0.2)",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {state}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* College rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1, marginTop: "28px" }}>
          {top3.map((college, idx) => {
            const score = college.match_score ?? 0;
            const scoreColor = score > 80 ? "#2dd4bf" : score > 60 ? "#fbbf24" : "#f87171";
            const rankColors = ["#fbbf24", "#94a3b8", "#cd7c2f"];
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "14px",
                  padding: "14px 18px",
                }}
              >
                {/* Rank */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 900,
                    color: rankColors[idx] ?? "#ffffff",
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>

                {/* College name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#ffffff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {college.name}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.35)",
                      fontWeight: 600,
                      marginTop: "2px",
                    }}
                  >
                    {college.location}, {college.state}
                  </div>
                </div>

                {/* Match score bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                  <div
                    style={{
                      width: "100px",
                      height: "6px",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${score}%`,
                        height: "100%",
                        backgroundColor: scoreColor,
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 900,
                      color: scoreColor,
                      minWidth: "42px",
                      textAlign: "right",
                    }}
                  >
                    {score}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "2px" }}>
            AI-Powered College Matching
          </div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#818cf8" }}>
            Find yours free at collegematch-ai.vercel.app
          </div>
        </div>
      </div>

      {/* Action buttons (visible on page) */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          onClick={handleDownload}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 24px",
            backgroundColor: "rgba(79,70,229,0.15)",
            border: "1px solid rgba(79,70,229,0.3)",
            borderRadius: "14px",
            color: "#818cf8",
            fontWeight: 800,
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(79,70,229,0.25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(79,70,229,0.15)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download result card
        </button>

        <button
          onClick={handleWhatsAppShare}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 24px",
            backgroundColor: "rgba(37,211,102,0.1)",
            border: "1px solid rgba(37,211,102,0.25)",
            borderRadius: "14px",
            color: "#4ade80",
            fontWeight: 800,
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(37,211,102,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(37,211,102,0.1)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Share on WhatsApp
        </button>
      </div>
    </div>
  );
}
