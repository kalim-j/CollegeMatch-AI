"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const GROQ_KEY   = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const CLG_API    = "https://colleges-api.onrender.com";

type College = {
  id: string;
  name: string;
  state: string;
  city: string;
  address: string;
  website?: string;
  nirf_rank?: number;
  cutoff_general?: number;
  avg_package_lpa?: number;
  max_package_lpa?: number;
  naac_grade?: string;
  type?: string;
};

// ── tiny debounce hook ─────────────────────────────────────────
function useDebounce<T>(val: T, ms: number = 400): T {
  const [d, setD] = useState(val);
  useEffect(() => { 
    const t = setTimeout(() => setD(val), ms); 
    return () => clearTimeout(t); 
  }, [val, ms]);
  return d;
}

// ── search colleges from free API ─────────────────────────────
async function searchColleges(query: string): Promise<College[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `${CLG_API}/colleges?search=${encodeURIComponent(query.trim())}&limit=20`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.colleges || []);
    return list.map((c: any, i: number) => ({
      id:      `${c.Name}-${i}`,
      name:    c.Name    || c.name    || "Unknown",
      state:   c.State   || c.state   || "",
      city:    c.City    || c.city    || "",
      address: [c.Address_line1, c.Address_line2].filter(Boolean).join(", "),
    }));
  } catch {
    return [];
  }
}

// ── Groq AI comparison ─────────────────────────────────────────
async function getAIComparison(colleges: College[]) {
  if (!GROQ_KEY) return "⚠️ Add NEXT_PUBLIC_GROQ_API_KEY to .env.local\nGet a free key at https://console.groq.com/keys";

  const list = colleges.map((c, i) =>
    `${i + 1}. ${c.name} — Location: ${c.city}, ${c.state}` +
    (c.nirf_rank      ? ` | NIRF Rank: #${c.nirf_rank}`            : "") +
    (c.cutoff_general ? ` | Cutoff (Gen): ${c.cutoff_general}%`     : "") +
    (c.avg_package_lpa? ` | Avg Package: ${c.avg_package_lpa} LPA`  : "") +
    (c.max_package_lpa? ` | Max Package: ${c.max_package_lpa} LPA`  : "") +
    (c.naac_grade     ? ` | NAAC: ${c.naac_grade}`                  : "") +
    (c.type           ? ` | Type: ${c.type}`                         : "")
  ).join("\n");

  const prompt = `You are an expert Indian engineering college counselor.

Compare these ${colleges.length} colleges for an Indian student choosing engineering:

${list}

Give a DETAILED, HONEST comparison under these headings:
🏆 Rankings & Reputation
📚 Academics & Curriculum  
💼 Placements & Salary Packages
📊 Admission Difficulty (Cutoffs)
💰 Fees vs Value for Money
🎯 Who Should Choose Which College
✅ Final Verdict — Best overall pick and why

Be specific and practical. Use numbers. Help the student make a clear decision.`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GROQ_MODEL, max_tokens: 1500, temperature: 0.6,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) { 
    const e = await res.json().catch(()=>({})); 
    throw new Error(e?.error?.message || `Groq error ${res.status}`); 
  }
  const d = await res.json();
  return d.choices?.[0]?.message?.content || "No response.";
}

// ── icons ──────────────────────────────────────────────────────
const Ic = {
  search:  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  x:       <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  spark:   <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2 9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></svg>,
  bot:     <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 15h.01M16 15h.01"/></svg>,
  spin:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  clg:     <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 3 2 9l10 6 10-6-10-6z"/><path d="M2 9v6M22 9v6"/><path d="M6 12v5c0 1.1 2.686 2 6 2s6-.9 6-2v-5"/></svg>,
};

export default function ComparePage() {
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState<College[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDrop,  setShowDrop]  = useState(false);
  const [selected,  setSelected]  = useState<College[]>([]);   // max 3
  const [aiText,    setAiText]    = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr,     setAiErr]     = useState("");
  const inputRef  = useRef<HTMLInputElement>(null);
  const debouncedQ = useDebounce(query, 400);

  // search effect
  useEffect(() => {
    if (debouncedQ.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    searchColleges(debouncedQ).then(r => { setResults(r); setSearching(false); setShowDrop(true); });
  }, [debouncedQ]);

  // close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { 
      if (!(e.target as HTMLElement).closest("#cmp-search")) setShowDrop(false); 
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const addCollege = useCallback((c: College) => {
    if (selected.length >= 3 || selected.find(s => s.name === c.name)) return;
    setSelected(p => [...p, c]);
    setQuery(""); setResults([]); setShowDrop(false);
    setAiText(""); setAiErr("");
  }, [selected]);

  const removeCollege = (id: string) => { 
    setSelected(p => p.filter(c => c.id !== id)); 
    setAiText(""); 
    setAiErr(""); 
  };

  const handleCompare = async () => {
    setAiLoading(true); setAiText(""); setAiErr("");
    try { 
      const result = await getAIComparison(selected);
      setAiText(result); 
    }
    catch(e: any) { setAiErr(e.message); }
    finally { setAiLoading(false); }
  };

  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        .cmp-fade{animation:fadeUp .35s ease}
        .cmp-page{padding:32px 24px;max-width:1300px;margin:0 auto;font-family:'DM Sans',system-ui,sans-serif}
        .cmp-h1{font-size:26px;font-weight:800;color:#fff;margin-bottom:4px;font-family:'Syne',system-ui,sans-serif}
        .cmp-sub{font-size:13px;color:#64748b;margin-bottom:24px}
        /* api badge */
        .api-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(34,197,94,.08);
          border:1px solid rgba(34,197,94,.25);border-radius:8px;padding:8px 14px;
          font-size:12px;color:#86efac;margin-bottom:20px}
        .api-dot{width:6px;height:6px;background:#22c55e;border-radius:50%;animation:blink 2s infinite}
        /* search */
        #cmp-search{position:relative;margin-bottom:14px}
        .cmp-input{width:100%;background:#111520;border:1.5px solid #1e2740;border-radius:12px;
          padding:13px 13px 13px 40px;font-size:14px;color:#e2e8f0;outline:none;
          transition:border .2s,box-shadow .2s;font-family:inherit}
        .cmp-input:focus{border-color:#7c5cfc;box-shadow:0 0 0 3px rgba(124,92,252,.18)}
        .cmp-input::placeholder{color:#475569}
        .cmp-input:disabled{opacity:.5;cursor:not-allowed}
        .cmp-search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#475569;pointer-events:none}
        /* dropdown */
        .cmp-drop{position:absolute;top:calc(100% + 6px);left:0;right:0;
          background:#111520;border:1.5px solid #1e2740;border-radius:12px;
          max-height:300px;overflow-y:auto;z-index:200;box-shadow:0 24px 48px rgba(0,0,0,.7)}
        .cmp-drop-item{padding:11px 16px;cursor:pointer;border-bottom:1px solid #1a2235;transition:.15s}
        .cmp-drop-item:last-child{border-bottom:none}
        .cmp-drop-item:hover{background:#181e2e}
        .cmp-drop-name{font-size:13px;font-weight:500;color:#e2e8f0;margin-bottom:2px}
        .cmp-drop-meta{font-size:11px;color:#64748b}
        .cmp-drop-msg{padding:18px;text-align:center;font-size:13px;color:#64748b;
          display:flex;align-items:center;justify-content:center;gap:8px}
        /* tags */
        .cmp-tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;min-height:34px}
        .cmp-tag{display:flex;align-items:center;gap:6px;background:rgba(124,92,252,.14);
          border:1px solid rgba(124,92,252,.3);border-radius:8px;padding:6px 10px;
          font-size:12px;color:#a78bfa}
        .cmp-tag-rm{cursor:pointer;opacity:.6;display:flex;transition:.15s}
        .cmp-tag-rm:hover{opacity:1;color:#ef4444}
        /* button */
        .cmp-btn{display:inline-flex;align-items:center;gap:8px;
          background:linear-gradient(135deg,#7c5cfc,#6d28d9);color:#fff;border:none;
          border-radius:12px;padding:13px 22px;font-size:14px;font-weight:700;
          cursor:pointer;transition:.2s;margin-bottom:24px;font-family:'Syne',system-ui,sans-serif}
        .cmp-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 28px rgba(124,92,252,.45)}
        .cmp-btn:disabled{opacity:.5;cursor:not-allowed}
        /* cards grid */
        .cmp-grid{display:grid;gap:14px;margin-bottom:24px}
        .cmp-grid.g2{grid-template-columns:1fr 1fr}
        .cmp-grid.g3{grid-template-columns:1fr 1fr 1fr}
        @media(max-width:860px){.cmp-grid.g2,.cmp-grid.g3{grid-template-columns:1fr}}
        .cmp-card{background:#0e1420;border:1.5px solid #1e2740;border-radius:14px;
          padding:18px;position:relative;transition:border .2s}
        .cmp-card:hover{border-color:rgba(124,92,252,.4)}
        .cmp-card-rm{position:absolute;top:12px;right:12px;background:rgba(239,68,68,.1);
          border:1px solid rgba(239,68,68,.2);border-radius:6px;padding:5px;cursor:pointer;
          color:#ef4444;display:flex;transition:.2s}
        .cmp-card-rm:hover{background:rgba(239,68,68,.25)}
        .cmp-card-type{display:inline-block;background:rgba(124,92,252,.12);
          border:1px solid rgba(124,92,252,.22);border-radius:5px;padding:3px 8px;
          font-size:10px;color:#a78bfa;font-weight:600;letter-spacing:.5px;
          text-transform:uppercase;margin-bottom:10px}
        .cmp-card-name{font-size:15px;font-weight:700;color:#fff;margin-bottom:4px;
          line-height:1.35;padding-right:28px;font-family:'Syne',system-ui,sans-serif}
        .cmp-card-loc{font-size:12px;color:#64748b;margin-bottom:14px}
        .cmp-card-loc a{color:#7c5cfc;margin-left:6px;text-decoration:none}
        .cmp-stats{display:grid;grid-template-columns:1fr 1fr;gap:6px}
        .cmp-stat{background:#131929;border-radius:8px;padding:10px}
        .cmp-stat-l{font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px}
        .cmp-stat-v{font-size:15px;font-weight:700;color:#fff;font-family:'Syne',system-ui,sans-serif}
        .cmp-stat-v.g{color:#22c55e}.cmp-stat-v.o{color:#f97316}.cmp-stat-v.p{color:#a78bfa}
        /* empty */
        .cmp-empty{background:#111520;border:1.5px solid #1e2740;border-radius:16px;
          padding:64px 24px;text-align:center}
        .vs-box{display:inline-flex;align-items:center;justify-content:center;
          width:52px;height:52px;background:#f97316;border-radius:10px;
          font-size:16px;font-weight:800;color:#fff;margin-bottom:16px;font-family:'Syne',system-ui,sans-serif}
        .cmp-empty-t{font-size:18px;font-weight:700;color:#fff;margin-bottom:6px;font-family:'Syne',system-ui,sans-serif}
        .cmp-empty-s{font-size:13px;color:#64748b}
        /* AI box */
        .ai-box{background:#0e1420;border:1.5px solid rgba(124,92,252,.3);
          border-radius:16px;padding:24px;animation:fadeUp .4s ease}
        .ai-hdr{display:flex;align-items:center;gap:10px;margin-bottom:18px;
          padding-bottom:16px;border-bottom:1px solid #1e2740}
        .ai-logo{width:36px;height:36px;background:linear-gradient(135deg,#7c5cfc,#6d28d9);
          border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff}
        .ai-t{font-size:15px;font-weight:700;color:#fff;font-family:'Syne',system-ui,sans-serif}
        .ai-s{font-size:11px;color:#64748b}
        .ai-body{font-size:13.5px;color:#cbd5e1;line-height:1.85;white-space:pre-wrap}
        .ai-body strong,.ai-body b{color:#fff}
        .ai-err{color:#fca5a5;font-size:13px}
        .ai-wait{display:flex;align-items:center;gap:10px;color:#64748b;font-size:13px}
      `}</style>

      <div className="cmp-page">
        <div className="cmp-h1">College Comparison</div>
        <div className="cmp-sub">Compare up to 3 colleges side by side with AI-powered analysis</div>

        {/* live API badge */}
        <div className="api-badge">
          <div className="api-dot" />
          43,000+ Indian colleges — live search, no API key needed
        </div>

        {/* Search */}
        <div id="cmp-search">
          <span className="cmp-search-icon">{Ic.search}</span>
          <input
            ref={inputRef}
            className="cmp-input"
            placeholder='Search any college — e.g. "Rathinam", "VIT", "IIT Madras", "Anna"...'
            value={query}
            disabled={selected.length >= 3}
            onChange={e => { setQuery(e.target.value); setShowDrop(true); }}
            onFocus={() => results.length > 0 && setShowDrop(true)}
          />

          {showDrop && query.length >= 2 && (
            <div className="cmp-drop">
              {searching && (
                <div className="cmp-drop-msg">{Ic.spin} Searching 43,000+ colleges...</div>
              )}
              {!searching && results.length === 0 && (
                <div className="cmp-drop-msg">No colleges found for "{query}"</div>
              )}
              {!searching && results.map(c => (
                <div key={c.id} className="cmp-drop-item" onMouseDown={() => addCollege(c)}>
                  <div className="cmp-drop-name">{c.name}</div>
                  <div className="cmp-drop-meta">
                    {[c.city, c.state].filter(Boolean).join(", ")}
                    {c.address ? ` • ${c.address}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected tags */}
        <div className="cmp-tags">
          {selected.map(c => (
            <div key={c.id} className="cmp-tag">
              {Ic.clg}
              <span style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</span>
              <span className="cmp-tag-rm" onClick={() => removeCollege(c.id)}>{Ic.x}</span>
            </div>
          ))}
          {selected.length >= 3 && <span style={{fontSize:12,color:"#64748b",alignSelf:"center"}}>Max 3 reached</span>}
        </div>

        {/* Compare button */}
        {selected.length >= 2 && (
          <button className="cmp-btn" onClick={handleCompare} disabled={aiLoading}>
            {aiLoading ? <>{Ic.spin} Groq AI is analyzing...</> : <>{Ic.spark} Compare with Groq AI</>}
          </button>
        )}

        {/* Cards */}
        {selected.length > 0 && (
          <div className={`cmp-grid ${selected.length === 1 ? "" : selected.length === 2 ? "g2" : "g3"}`}
               style={selected.length === 1 ? {gridTemplateColumns:"360px"} : {}}>
            {selected.map(c => (
              <div key={c.id} className="cmp-card cmp-fade">
                <button className="cmp-card-rm" onClick={() => removeCollege(c.id)}>{Ic.x}</button>
                <div className="cmp-card-type">Engineering College</div>
                <div className="cmp-card-name">{c.name}</div>
                <div className="cmp-card-loc">
                  📍 {[c.city, c.state].filter(Boolean).join(", ") || "India"}
                  {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer">🌐 Website</a>}
                </div>
                <div className="cmp-stats">
                  <div className="cmp-stat">
                    <div className="cmp-stat-l">NIRF Rank</div>
                    <div className="cmp-stat-v p">{c.nirf_rank ? `#${c.nirf_rank}` : "—"}</div>
                  </div>
                  <div className="cmp-stat">
                    <div className="cmp-stat-l">Cutoff (Gen)</div>
                    <div className="cmp-stat-v o">{c.cutoff_general ? `${c.cutoff_general}%ile` : "—"}</div>
                  </div>
                  <div className="cmp-stat">
                    <div className="cmp-stat-l">Avg Package</div>
                    <div className="cmp-stat-v g">{c.avg_package_lpa ? `${c.avg_package_lpa} LPA` : "—"}</div>
                  </div>
                  <div className="cmp-stat">
                    <div className="cmp-stat-l">NAAC Grade</div>
                    <div className="cmp-stat-v">{c.naac_grade || "—"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {selected.length === 0 && (
          <div className="cmp-empty">
            <div className="vs-box">VS</div>
            <div className="cmp-empty-t">Select at least 2 colleges to compare</div>
            <div className="cmp-empty-s">Search above — results from 43,000+ Indian colleges database, no API key needed</div>
          </div>
        )}

        {/* AI Result */}
        {(aiLoading || aiText || aiErr) && (
          <div className="ai-box">
            <div className="ai-hdr">
              <div className="ai-logo">{Ic.bot}</div>
              <div>
                <div className="ai-t">Groq AI Analysis</div>
                <div className="ai-s">LLaMA 3.3 70B via GroqCloud — Free tier</div>
              </div>
            </div>
            {aiLoading && <div className="ai-wait">{Ic.spin} Generating comparison...</div>}
            {aiErr     && <div className="ai-err">⚠️ {aiErr}</div>}
            {aiText    && <div className="ai-body">{aiText}</div>}
          </div>
        )}
      </div>
    </>
  );
}
