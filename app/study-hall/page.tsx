"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function AudioPlayerContent() {
  const searchParams = useSearchParams();
  const audioUrl = searchParams.get("audio");
  const title = searchParams.get("title");

  return (
    <div style={{ textAlign: "center", width: "100%", maxWidth: "600px" }}>
      {/* Branding Header */}
      <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", marginBottom: 10 }}>
        Study<span style={{ color: "#2563eb" }}>In</span>Motion
      </h1>
      <h2 style={{ fontSize: "1.2rem", color: "#6b7280", fontWeight: 400, marginBottom: 40 }}>
        Listening Room: <span style={{ color: "#111827", fontWeight: 600 }}>{title || "Research Paper"}</span>
      </h2>

      {/* Main Player Card */}
      {audioUrl ? (
        <div style={{ 
          background: "white", 
          padding: "60px 40px", 
          borderRadius: "32px", 
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)",
          border: "1px solid #f1f5f9"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "30px" }}>🎧</div>
          
          <audio 
            controls 
            src={audioUrl} 
            style={{ width: "100%", height: "54px" }} 
            autoPlay 
          />
          
          <div style={{ marginTop: "30px", borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
            <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: "1.6" }}>
              <b>Pro Tip:</b> Close your eyes and visualize the <b>Mind Map</b> while you listen. 
              This helps cement the connections Claude found in the text.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ padding: "40px", background: "#fee2e2", borderRadius: "16px", color: "#b91c1c" }}>
          <p style={{ fontWeight: 600 }}>No audio data found.</p>
          <p style={{ fontSize: "0.9rem" }}>Please return to the upload page and try again.</p>
        </div>
      )}

      {/* Navigation Footer */}
      <footer style={{ marginTop: "60px" }}>
        <button 
          onClick={() => window.close()} 
          style={{ 
            background: "none", 
            border: "1px solid #d1d5db", 
            padding: "10px 24px", 
            borderRadius: "10px", 
            cursor: "pointer",
            color: "#6b7280",
            fontWeight: 500,
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          Return to Workbench
        </button>
      </footer>
    </div>
  );
}

export default function StudyHallPage() {
  return (
    <main style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f9fafb", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      padding: "20px",
      fontFamily: "sans-serif"
    }}>
      <Suspense fallback={
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <p>Preparing the Listening Room...</p>
        </div>
      }>
        <AudioPlayerContent />
      </Suspense>
    </main>
  );
}