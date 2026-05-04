"use client";
import React, { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [library, setLibrary] = useState<any[]>([]); 
  const [activeId, setActiveId] = useState<string | null>(null); 
  const [pdfPage, setPdfPage] = useState(1);
  const [view, setView] = useState<"text" | "map" | "chat">("text");
  const [anchorQuote, setAnchorQuote] = useState<string>("");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  
  // Workspace & Deep Dive States
  const [notes, setNotes] = useState<string>("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [contextQuery, setContextQuery] = useState<string | null>(null);
  
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
          pdfText: activeData.sections.map((s:any) => `[PAGE ${s.page}]: ${s.text}`).join("\n\n")
        })
      });
      const data = await res.json();
      setChatLog(prev => [...prev, { role: "assistant", content: data.answer }]);
      if (data.relevantPage) {
        setPdfPage(data.relevantPage);
        setAnchorQuote(data.quote || "");
      }
    } catch (err: any) { console.error(err); } finally { setIsChatting(false); }
  };

  const handleAuditNotes = async () => {
    if (!notes || !activeData) return;
    setIsAuditing(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: `AUDIT MY NOTES: "${notes}". Check for accuracy against the document.`, 
          pdfText: activeData.sections.map((s:any) => s.text).join(" ")
        })
      });
      const data = await res.json();
      setChatLog(prev => [...prev, { role: "assistant", content: `📝 AUDIT: ${data.answer}` }]);
      setView("chat");
    } catch (err) { alert("Audit failed"); } finally { setIsAuditing(false); }
  };

  const handleExport = () => {
    const win = window.open('', '_blank');
    win?.document.write(`<html><body style="font-family:sans-serif;padding:40px;"><h1>Study Report: ${activeData.fileName}</h1><hr/><p style="white-space:pre-wrap;">${notes}</p></body></html>`);
    win?.document.close();
    win?.print();
  };

  const physicalPage = activeData?.startPage 
    ? (pdfPage - activeData.startPage + 1 + (activeData.physicalOffset || 0)) 
    : pdfPage;

  return (
    <main style={{ display: "flex", width: "100%", height: "100vh", fontFamily: "sans-serif", backgroundColor: "#f3f4f6", overflow: "hidden" }}>
      
      {/* SIDEBAR */}
      <div style={{ width: "260px", background: "#1e293b", color: "white", padding: "20px", display: "flex", flexDirection: "column" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "20px", color: "#38bdf8", fontWeight: 800 }}>PDF Library</h2>
        <button onClick={() => setActiveId(null)} style={{ width: "100%", padding: "12px", background: "#38bdf8", borderRadius: "10px", border: "none", fontWeight: "bold", cursor: "pointer", marginBottom: "20px" }}>+ New PDF</button>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {library.map(doc => (
            <div key={doc.fileId} onClick={() => setActiveId(doc.fileId)} style={{ padding: "12px", borderRadius: "10px", background: activeId === doc.fileId ? "#334155" : "transparent", cursor: "pointer", marginBottom: "8px" }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>{doc.fileName}</p>
            </div>
          ))}
        </div>
      </div>

      {/* WORKBENCH */}
      <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column" }}>
        <header style={{ textAlign: "center", marginBottom: 15 }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0 }}>Study<span style={{ color: "#2563eb" }}>In</span>Motion</h1>
        </header>

    {!activeId ? (
          <div style={{ 
            maxWidth: 600, 
            margin: "auto", 
            padding: "60px 40px", 
            background: "white", 
            borderRadius: 30, 
            textAlign: "center", 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
          }}>
            <div style={{ marginBottom: 30 }}>
  {/* NEW BRANDED GRADUATION CAP */}
  <div style={{ marginBottom: 15 }}>
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "auto" }}>
      <path d="M22 10L12 5L2 10L12 15L22 10Z" fill="#1e293b" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 12V17C6 17 8 20 12 20C16 20 18 17 18 17V12" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 10V15" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="22" cy="15.5" r="1.5" fill="#2563eb" />
    </svg>
  </div>

  <h2 style={{ fontSize: "1.8rem", color: "#1e293b", fontWeight: 800, marginBottom: 10 }}>
    Unlock Document Intelligence
  </h2>
  <p style={{ color: "#64748b", fontSize: "15px" }}>
    Upload your research paper to build a Mind Map, generate quizzes, and start a Socratic dialogue.
  </p>
</div>

            <form onSubmit={handleSubmit}>
              <label style={{
                display: "block",
                padding: "40px 20px",
                background: "#f8fafc",
                border: "2px dashed #cbd5e1",
                borderRadius: 20,
                cursor: "pointer",
                transition: "all 0.2s ease",
                marginBottom: 20
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
              >
                <div style={{ fontSize: "24px", marginBottom: 10 }}>📂</div>
                <span style={{ color: "#475569", fontWeight: 600 }}>
                  {file ? file.name : "Click to select or drag & drop PDF"}
                </span>
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                  style={{ display: "none" }} 
                />
              </label>

              <button 
                type="submit" 
                disabled={loading || !file} 
                style={{ 
                  width: "100%", 
                  padding: 16, 
                  background: file ? "#2563eb" : "#94a3b8", 
                  color: "white", 
                  border: "none", 
                  borderRadius: 12, 
                  fontWeight: 700, 
                  fontSize: "16px",
                  cursor: file ? "pointer" : "not-allowed",
                  boxShadow: file ? "0 4px 6px -1px rgba(37, 99, 235, 0.4)" : "none",
                }}
              >
                {loading ? "⚡ Processing Intelligence..." : "Begin Analysis"}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "20px", flex: 1, overflow: "hidden" }}>
            
            {/* LEFT PANEL: Summary / Map / Chat */}
            <div style={{ width: "450px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 5 }}>
                <button onClick={() => setView("text")} style={{ flex: 1, padding: 10, borderRadius: 10, background: view === "text" ? "#2563eb" : "white", color: view === "text" ? "white" : "black" }}>Summary</button>
                <button onClick={() => setView("map")} style={{ flex: 1, padding: 10, borderRadius: 10, background: view === "map" ? "#2563eb" : "white", color: view === "map" ? "white" : "black" }}>Mind Map</button>
                <button onClick={() => setView("chat")} style={{ flex: 1, padding: 10, borderRadius: 10, background: view === "chat" ? "#2563eb" : "white", color: view === "chat" ? "white" : "black" }}>💬 Chat</button>
              </div>
              
              <div style={{ flex: 1, overflowY: "auto", background: "white", padding: "20px", borderRadius: 16, border: "1px solid #eee" }}>
                {view === "text" && (
                  <div>
                    {activeData.sections?.map((s:any, i:number) => (
                      <div key={i} style={{ marginBottom: 20 }}>
                        <h4 onClick={() => { setPdfPage(s.page); setAnchorQuote(s.anchorQuote || ""); }} style={{ cursor: "pointer", color: "#2563eb" }}>{s.title}</h4>
                        <p style={{ fontSize: "13px" }}>{s.text}</p>
                      </div>
                    ))}
                    {activeData.mcqs && (
                      <div style={{ marginTop: 30, borderTop: "2px solid #f1f5f9", paddingTop: 20 }}>
                        <h4 style={{ color: "#1e40af" }}>Knowledge Check</h4>
                        {activeData.mcqs.map((q:any, i:number) => (
                          <div key={i} style={{ marginBottom: 20, background: "#f8fafc", padding: 15, borderRadius: 12 }}>
                            <p style={{ fontWeight: 700, fontSize: "13px" }}>{q.question}</p>
                            {q.options?.map((o:string) => (
                              <button key={o} onClick={() => setSelectedAnswers({...selectedAnswers, [i]: o})} style={{ display: "block", width: "100%", textAlign: "left", padding: 8, marginTop: 5, borderRadius: 8, border: "1px solid #e2e8f0", background: selectedAnswers[i] === o ? (o === q.answer ? "#dcfce7" : "#fee2e2") : "white" }}>{o}</button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {view === "map" && (
                  <div style={{ position: "relative", minHeight: "800px" }}>
                    {activeData.graph?.nodes?.map((n:any, i:number) => (
                      <div key={i} onClick={() => { setPdfPage(n.page); setAnchorQuote(n.insight || ""); }} style={{ position: "absolute", left: i%2===0?"5%":"50%", top: (i*100), width: "45%", padding: "12px", borderRadius: 12, border: "2px solid #2563eb", background: "white", cursor: "pointer", fontSize: "11px" }}>
                        <b>{n.label}</b>
                        <p style={{ margin: "5px 0 0 0", fontSize: "10px", color: "#64748b" }}>{n.insight}</p>
                        <span onClick={(e) => { e.stopPropagation(); setContextQuery(n.label); }} style={{ display: "block", color: "#059669", marginTop: 8, fontWeight: "bold" }}>🔍 Deep Dive</span>
                      </div>
                    ))}
                  </div>
                )}

                {view === "chat" && (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                      {chatLog.map((m, i) => (
                        <div key={i} style={{ marginBottom: "12px", padding: "12px", borderRadius: "12px", background: m.role === "user" ? "#eff6ff" : "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <p style={{ margin: 0, fontSize: "13px" }}><b>{m.role === "user" ? "You" : "Claude"}:</b> {m.content}</p>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleChat} style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <input value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} placeholder="Ask about the evidence..." style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }} />
                      <button type="submit" disabled={isChatting} style={{ padding: "10px 20px", background: "#2563eb", color: "white", borderRadius: "10px", border: "none" }}>{isChatting ? "..." : "Send"}</button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL: PDF + Notes Split */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
              <iframe 
                key={`${activeId}-${physicalPage}-${anchorQuote}`} 
                src={`${activeData.pdfUrl}#page=${physicalPage}${anchorQuote ? `&search=${encodeURIComponent(anchorQuote)}&phrase=true` : ""}&view=FitH`} 
                style={{ width: "100%", height: "60%", border: "none", borderRadius: 16 }} 
              />
              <div style={{ height: "40%", background: "white", borderRadius: 16, padding: 15, display: "flex", flexDirection: "column", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <h3 style={{ fontSize: "14px", margin: 0 }}>Study Workspace</h3>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button onClick={handleAuditNotes} style={{ fontSize: "11px", padding: "4px 8px", borderRadius: 6, cursor: "pointer", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>{isAuditing ? "Auditing..." : "✨ AI Verify"}</button>
                    <button onClick={handleExport} style={{ fontSize: "11px", padding: "4px 8px", borderRadius: 6, cursor: "pointer", background: "#f8fafc", border: "1px solid #e2e8f0" }}>🖨️ Export</button>
                  </div>
                </div>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Collate notes here..." style={{ flex: 1, width: "100%", border: "1px solid #f1f5f9", borderRadius: 8, padding: 10, fontSize: "13px", resize: "none", outline: "none" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DEEP DIVE SIDE PANEL */}
      {contextQuery && (
        <div style={{ position: "fixed", right: 0, top: 0, width: "380px", height: "100vh", background: "white", boxShadow: "-10px 0 30px rgba(0,0,0,0.1)", padding: 30, zIndex: 100, display: "flex", flexDirection: "column" }}>
          <h3 style={{ marginBottom: 20 }}>{contextQuery}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 25 }}>
            <button onClick={() => window.open(`https://www.youtube.com/results?search_query=${contextQuery}+lecture`, "_blank")} style={{ padding: 14, background: "#ff0000", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>YouTube Lectures ↗</button>
            <button onClick={() => window.open(`https://scholar.google.com/scholar?q=${contextQuery}`, "_blank")} style={{ padding: 14, background: "#4285f4", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>Google Scholar ↗</button>
          </div>
          <div style={{ padding: 20, background: "#eff6ff", borderRadius: 14, fontSize: "14px", lineHeight: "1.6", color: "#1e3a8a", border: "1px solid #bfdbfe" }}>
            <b>Socratic Insight:</b> {activeData?.graph?.nodes?.find((n:any)=>n.label===contextQuery)?.insight}
          </div>
          <button onClick={() => setContextQuery(null)} style={{ marginTop: "auto", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", cursor: "pointer" }}>Close Panel</button>
        </div>
      )}
    </main>
  );
}