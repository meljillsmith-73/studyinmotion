"use client";
import React, { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [library, setLibrary] = useState<any[]>([]); 
  const [activeId, setActiveId] = useState<string | null>(null); 
  const [pdfPage, setPdfPage] = useState(1);
  const [view, setView] = useState<"text" | "map" | "chat">("text");
  const [contextQuery, setContextQuery] = useState<string | null>(null);
  const [anchorQuote, setAnchorQuote] = useState<string>("");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  
  // Chat States
  const [chatMsg, setChatMsg] = useState("");
  const [chatLog, setChatLog] = useState<{role: string, content: string}[]>([]);
  const [isChatting, setIsChatting] = useState(false);

  const activeData = library.find(item => item.fileId === activeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const existingLabels = library.flatMap(doc => doc.graph.nodes.map((n:any) => n.label)).join(", ");
    formData.append("existingKnowledge", existingLabels);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setLibrary(prev => [json, ...prev]);
      setActiveId(json.fileId);
      if (json.startPage) setPdfPage(json.startPage);
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg || !activeData) return;
    setIsChatting(true);
    const userMsg = chatMsg;
    setChatMsg("");
    setChatLog(prev => [...prev, { role: "user", content: userMsg }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg, 
          pdfText: activeData.sections.map((s:any) => s.text).join(" ")
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}. Check if folder is lowercase 'chat'!`);
      }

      const data = await res.json();
      setChatLog(prev => [...prev, { role: "assistant", content: data.answer }]);
      if (data.relevantPage) handleJump(data.relevantPage, data.quote);
    } catch (err: any) {
      setChatLog(prev => [...prev, { role: "assistant", content: "⚠️ " + err.message }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleJump = (page: number, quote?: string) => {
    setPdfPage(page);
    setAnchorQuote(quote || "");
  };

  const renderText = (text: string) => {
    if (!text) return "";
    return text.split(/(\[p\.\s*\d+\])/g).map((part, i) => {
      const match = part.match(/\[p\.\s*(\d+)\]/);
      if (match) {
        const p = parseInt(match[1]);
        return <button key={i} onClick={() => handleJump(p)} style={{ color: "#2563eb", background: "#dbeafe", border: "none", borderRadius: 4, padding: "2px 6px", fontSize: "12px", cursor: "pointer", fontWeight: "bold" }}>p. {p}</button>;
      }
      return part;
    });
  };

  const physicalPage = activeData?.startPage 
    ? (pdfPage - activeData.startPage + 1 + (activeData.physicalOffset || 0)) 
    : pdfPage;

  return (
    <main style={{ display: "flex", width: "100%", height: "100vh", fontFamily: "sans-serif", backgroundColor: "#f3f4f6", overflow: "hidden" }}>
      
      {/* LIBRARY SIDEBAR */}
      <div style={{ width: "260px", background: "#1e293b", color: "white", padding: "20px", display: "flex", flexDirection: "column" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "20px", color: "#38bdf8", fontWeight: 800 }}>Brain Library</h2>
        <button onClick={() => { setActiveId(null); setChatLog([]); }} style={{ width: "100%", padding: "12px", background: "#38bdf8", borderRadius: "10px", border: "none", fontWeight: "bold", cursor: "pointer", marginBottom: "20px" }}>+ New PDF</button>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {library.map(doc => (
            <div key={doc.fileId} onClick={() => { setActiveId(doc.fileId); setPdfPage(doc.startPage || 1); setChatLog([]); }} style={{ padding: "12px", borderRadius: "10px", background: activeId === doc.fileId ? "#334155" : "transparent", cursor: "pointer", marginBottom: "8px", border: activeId === doc.fileId ? "1px solid #38bdf8" : "1px solid transparent" }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.fileName}</p>
            </div>
          ))}
        </div>
      </div>

      {/* WORKBENCH */}
      <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", height: "100vh" }}>
        <header style={{ textAlign: "center", marginBottom: 15 }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0 }}>Study<span style={{ color: "#2563eb" }}>In</span>Motion</h1>
        </header>

        {!activeId ? (
          <div style={{ maxWidth: 500, margin: "auto", padding: 40, background: "white", borderRadius: 20, boxShadow: "0 10px 15px rgba(0,0,0,0.1)", textAlign: "center" }}>
            <h3 style={{ marginBottom: 20 }}>Synthesize Knowledge</h3>
            <form onSubmit={handleSubmit}>
              <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ marginBottom: 20, width: "100%" }} />
              <button type="submit" disabled={loading} style={{ width: "100%", padding: 14, background: "#2563eb", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                {loading ? "Cross-Linking Data..." : "Analyze Paper"}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "20px", flex: 1, overflow: "hidden" }}>
            <div style={{ width: "450px", display: "flex", flexDirection: "column", gap: 10, height: "100%" }}>
              <div style={{ display: "flex", gap: 5 }}>
                <button onClick={() => setView("text")} style={{ flex: 1, padding: 10, borderRadius: 10, background: view === "text" ? "#2563eb" : "white", color: view === "text" ? "white" : "black", border: "1px solid #ddd", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>Summary</button>
                <button onClick={() => setView("map")} style={{ flex: 1, padding: 10, borderRadius: 10, background: view === "map" ? "#2563eb" : "white", color: view === "map" ? "white" : "black", border: "1px solid #ddd", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>Mind Map</button>
                <button onClick={() => setView("chat")} style={{ flex: 1, padding: 10, borderRadius: 10, background: view === "chat" ? "#2563eb" : "white", color: view === "chat" ? "white" : "black", border: "1px solid #ddd", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>💬 Chat</button>
              </div>
              
              <div style={{ flex: 1, overflowY: "auto", background: "white", padding: "20px", borderRadius: 16, border: "1px solid #eee", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                {view === "text" && (
                  <div>
                    {activeData.sections?.map((s: any, i: number) => (
                      <div key={i} onClick={() => handleJump(s.page, s.anchorQuote)} style={{ marginBottom: 20, cursor: "pointer" }}>
                        <h4 style={{ margin: "0 0 5px 0" }}>{s.title}</h4>
                        <p style={{ fontSize: "13px", lineHeight: "1.5", color: "#475569" }}>{renderText(s.text)}</p>
                      </div>
                    ))}
                    {activeData.mcqs && (
                      <div style={{ marginTop: 30, borderTop: "2px solid #f1f5f9", paddingTop: 20 }}>
                        <h4 style={{ color: "#1e40af", marginBottom: 15 }}>Knowledge Check</h4>
                        {activeData.mcqs.map((q: any, i: number) => (
                          <div key={i} style={{ marginBottom: 20, background: "#f8fafc", padding: 15, borderRadius: 12 }}>
                            <p style={{ fontWeight: 700, fontSize: "13px", marginBottom: 10 }}>{q.question}</p>
                            {q.options?.map((o: any) => (
                              <button key={o} onClick={() => setSelectedAnswers({...selectedAnswers, [i]: o})} style={{ display: "block", width: "100%", textAlign: "left", padding: 10, marginTop: 6, borderRadius: 8, border: "1px solid #e2e8f0", background: selectedAnswers[i] === o ? (o === q.answer ? "#dcfce7" : "#fee2e2") : "white", cursor: "pointer", fontSize: "12px" }}>{o}</button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {view === "map" && (
                  <div style={{ position: "relative", minHeight: "1000px" }}>
                    {activeData.graph?.nodes?.map((n: any, i: number) => (
                      <button key={i} onClick={() => handleJump(n.page, n.insight)} style={{ position: "absolute", left: i%2===0?"5%":"55%", top: (Math.floor(i/2)*130), width: "42%", padding: "12px", borderRadius: 12, border: "2px solid #2563eb", background: "white", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}>
                        {n.label}
                        <span onClick={(e) => { e.stopPropagation(); setContextQuery(n.label); }} style={{ display: "block", color: "#059669", marginTop: 5, fontSize: "10px" }}>🔍 Deep Dive</span>
                      </button>
                    ))}
                  </div>
                )}

                {view === "chat" && (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ flex: 1, overflowY: "auto", paddingBottom: "10px" }}>
                      {chatLog.map((m, i) => (
                        <div key={i} style={{ marginBottom: "12px", padding: "12px", borderRadius: "12px", background: m.role === "user" ? "#eff6ff" : "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.5" }}><b>{m.role === "user" ? "You" : "Claude"}:</b> {m.content}</p>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleChat} style={{ display: "flex", gap: "8px", paddingTop: "10px", borderTop: "1px solid #eee" }}>
                      <input value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} placeholder="Ask about the evidence..." style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "13px" }} />
                      <button type="submit" disabled={isChatting} style={{ padding: "10px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>{isChatting ? "..." : "Send"}</button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
               <iframe key={`${activeId}-${physicalPage}-${anchorQuote}`} src={`${activeData.pdfUrl}#page=${physicalPage}${anchorQuote ? `&search="${encodeURIComponent(anchorQuote)}"` : ""}&view=FitH`} style={{ width: "100%", flex: 1, border: "none", borderRadius: 16, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }} />
            </div>
          </div>
        )}
      </div>

      {contextQuery && (
        <div style={{ position: "fixed", right: 0, top: 0, width: "380px", height: "100vh", background: "white", boxShadow: "-10px 0 30px rgba(0,0,0,0.1)", padding: 30, zIndex: 100, display: "flex", flexDirection: "column" }}>
          <h3 style={{ marginBottom: 20 }}>{contextQuery}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 25 }}>
            <button onClick={() => window.open(`https://www.youtube.com/results?search_query=${contextQuery}+lecture`, "_blank")} style={{ padding: 14, background: "#ff0000", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>YouTube Lectures ↗</button>
            <button onClick={() => window.open(`https://scholar.google.com/scholar?q=${contextQuery}`, "_blank")} style={{ padding: 14, background: "#ff0000", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>Google Scholar ↗</button>
          </div>
          <div style={{ padding: 20, background: "#eff6ff", borderRadius: 14, fontSize: "14px", lineHeight: "1.6", color: "#1e3a8a", border: "1px solid #bfdbfe" }}>
            <b>AI Insight:</b> {activeData?.graph?.nodes?.find((n:any)=>n.label===contextQuery)?.insight}
          </div>
          <button onClick={() => setContextQuery(null)} style={{ marginTop: "auto", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer" }}>Close</button>
        </div>
      )}
    </main>
  );
}