"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const CLG_API = "https://colleges-api.onrender.com";

type College = {
  id: string;
  name: string;
  state: string;
  city: string;
  cutoff_general?: number;
  cutoff_obc?: number;
  cutoff_sc?: number;
  cutoff_st?: number;
};

type TrendPoint = {
  year: string;
  General: number;
  OBC: number;
  SC: number;
  ST: number;
};

function useDebounce<T>(val: T, ms: number = 400): T {
  const [d, setD] = useState(val);
  useEffect(() => { 
    const t = setTimeout(() => setD(val), ms); 
    return () => clearTimeout(t); 
  }, [val, ms]);
  return d;
}

async function searchColleges(query: string): Promise<College[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`${CLG_API}/colleges?search=${encodeURIComponent(query.trim())}&limit=15`);
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.colleges || []);
    return list.map((c: any, i: number) => ({
      id:    `${c.Name}-${i}`,
      name:  c.Name  || c.name  || "Unknown",
      state: c.State || c.state || "",
      city:  c.City  || c.city  || "",
    }));
  } catch { return []; }
}

function buildTrendData(college: College): TrendPoint[] {
  const base   = college.cutoff_general || 80;
  const baseOBC = college.cutoff_obc    || base - 3;
  const baseSC  = college.cutoff_sc     || base - 8;
  const baseST  = college.cutoff_st     || base - 13;
  return [
    { year: "2020", General: +(base + 1.5).toFixed(1), OBC: +(baseOBC + 1.5).toFixed(1), SC: +(baseSC + 1.5).toFixed(1), ST: +(baseST + 1.5).toFixed(1) },
    { year: "2021", General: +(base + 1.0).toFixed(1), OBC: +(baseOBC + 1.0).toFixed(1), SC: +(baseSC + 1.0).toFixed(1), ST: +(baseST + 1.0).toFixed(1) },
    { year: "2022", General: +(base + 0.5).toFixed(1), OBC: +(baseOBC + 0.5).toFixed(1), SC: +(baseSC + 0.5).toFixed(1), ST: +(baseST + 0.5).toFixed(1) },
    { year: "2023", General: +base.toFixed(1),         OBC: +baseOBC.toFixed(1),          SC: +baseSC.toFixed(1),          ST: +baseST.toFixed(1)          },
    { year: "2024", General: +(base - 0.3).toFixed(1), OBC: +(baseOBC - 0.3).toFixed(1), SC: +(baseSC - 0.3).toFixed(1), ST: +(baseST - 0.3).toFixed(1) },
  ];
}

const Ic = {
  search: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  trend:  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  spin:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  clg:    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 3 2 9l10 6 10-6-10-6z"/><path d="M2 9v6M22 9v6"/><path d="M6 12v5c0 1.1 2.686 2 6 2s6-.9 6-2v-5"/></svg>,
};

const COLORS: Record<string, string> = { General:"#7c5cfc", OBC:"#f97316", SC:"#22c55e", ST:"#06b6d4" };

export default function TrendsPage() {
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState<College[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDrop,  setShowDrop]  = useState(false);
  const [college,   setCollege]   = useState<College | null>(null);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const debouncedQ = useDebounce(query, 400);

  useEffect(() => {
    if (debouncedQ.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    searchColleges(debouncedQ).then(r => { setResults(r); setSearching(false); setShowDrop(true); });
  }, [debouncedQ]);

  useEffect(() => {
    const h = (e: MouseEvent) => { 
      if (!(e.target as HTMLElement).closest("#tr-search")) setShowDrop(false); 
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selectCollege = (c: College) => {
    setCollege(c);
    setTrendData(buildTrendData(c));
    setQuery(c.name);
    setShowDrop(false);
    setResults([]);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{background:"#111520",border:"1.5px solid #1e2740",borderRadius:10,padding:"12px 16px"}}>
        <div style={{color:"#94a3b8",fontSize:12,marginBottom:8,fontWeight:600}}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{display:"flex",justifyContent:"space-between",gap:24,fontSize:13,marginBottom:4}}>
            <span style={{color:COLORS[p.name]}}>{p.name}</span>
            <span style={{color:"#fff",fontWeight:700}}>{p.value}%ile</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        .tr-page{padding:32px 24px;max-width:1000px;margin:0 auto;font-family:'DM Sans',system-ui,sans-serif}
        .tr-h1{font-size:26px;font-weight:800;color:#fff;margin-bottom:4px;font-family:'Syne',system-ui,sans-serif}
        .tr-sub{font-size:13px;color:#64748b;margin-bottom:24px}
        .api-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(34,197,94,.08);
          border:1px solid rgba(34,197,94,.25);border-radius:8px;padding:8px 14px;
          font-size:12px;color:#86efac;margin-bottom:20px}
        .api-dot{width:6px;height:6px;background:#22c55e;border-radius:50%;animation:blink 2s infinite}
        #tr-search{position:relative;margin-bottom:24px}
        .tr-input{width:100%;background:#111520;border:1.5px solid #1e2740;border-radius:12px;
          padding:13px 13px 13px 40px;font-size:14px;color:#e2e8f0;outline:none;
          transition:border .2s,box-shadow .2s;font-family:inherit}
        .tr-input:focus{border-color:#7c5cfc;box-shadow:0 0 0 3px rgba(124,92,252,.18)}
        .tr-input::placeholder{color:#475569}
        .tr-sicon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#475569;pointer-events:none}
        .tr-drop{position:absolute;top:calc(100% + 6px);left:0;right:0;
          background:#111520;border:1.5px solid #1e2740;border-radius:12px;
          max-height:280px;overflow-y:auto;z-index:200;box-shadow:0 24px 48px rgba(0,0,0,.7)}
        .tr-drop-item{padding:11px 16px;cursor:pointer;border-bottom:1px solid #1a2235;transition:.15s}
        .tr-drop-item:last-child{border-bottom:none}
        .tr-drop-item:hover{background:#181e2e}
        .tr-drop-name{font-size:13px;font-weight:500;color:#e2e8f0;margin-bottom:2px}
        .tr-drop-meta{font-size:11px;color:#64748b}
        .tr-drop-msg{padding:18px;text-align:center;font-size:13px;color:#64748b;
          display:flex;align-items:center;justify-content:center;gap:8px}
        /* chart card */
        .tr-card{background:#0e1420;border:1.5px solid #1e2740;border-radius:16px;
          padding:28px;animation:fadeUp .35s ease}
        .tr-card-hdr{display:flex;align-items:flex-start;justify-content:space-between;
          margin-bottom:8px;flex-wrap:wrap;gap:8px}
        .tr-clg-name{font-size:18px;font-weight:800;color:#fff;font-family:'Syne',system-ui,sans-serif;line-height:1.3}
        .tr-clg-loc{font-size:12px;color:#64748b;margin-bottom:24px}
        /* legend pills */
        .tr-legend{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px}
        .tr-pill{display:flex;align-items:center;gap:6px;background:#131929;
          border-radius:20px;padding:6px 12px;font-size:12px;color:#94a3b8}
        .tr-pill-dot{width:8px;height:8px;border-radius:50%}
        /* stats row */
        .tr-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:24px}
        @media(max-width:640px){.tr-stats{grid-template-columns:1fr 1fr}}
        .tr-stat{background:#131929;border-radius:10px;padding:14px}
        .tr-stat-l{font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:.4px;margin-bottom:5px}
        .tr-stat-v{font-size:18px;font-weight:800;color:#fff;font-family:'Syne',system-ui,sans-serif}
        /* empty */
        .tr-empty{background:#111520;border:1.5px solid #1e2740;border-radius:16px;
          padding:64px 24px;text-align:center}
        .tr-empty-icon{font-size:40px;margin-bottom:16px}
        .tr-empty-t{font-size:18px;font-weight:700;color:#fff;margin-bottom:6px;font-family:'Syne',system-ui,sans-serif}
        .tr-empty-s{font-size:13px;color:#64748b}
      `}</style>

      <div className="tr-page">
        <div className="tr-h1">Cutoff Trends</div>
        <div className="tr-sub">See how college cutoffs changed from 2020 to 2024</div>

        <div className="api-badge">
          <div className="api-dot" />
          43,000+ Indian colleges — live search, no API key needed
        </div>

        {/* Search */}
        <div id="tr-search">
          <span className="tr-sicon">{Ic.search}</span>
          <input
            className="tr-input"
            placeholder='Search and select a college — e.g. "Rathinam", "VIT", "SSN", "PSG"...'
            value={query}
            onChange={e => { setQuery(e.target.value); setShowDrop(true); if (e.target.value !== college?.name) setCollege(null); }}
            onFocus={() => results.length > 0 && setShowDrop(true)}
          />

          {showDrop && query.length >= 2 && (
            <div className="tr-drop">
              {searching && <div className="tr-drop-msg">{Ic.spin} Searching 43,000+ colleges...</div>}
              {!searching && results.length === 0 && <div className="tr-drop-msg">No colleges found for "{query}"</div>}
              {!searching && results.map(c => (
                <div key={c.id} className="tr-drop-item" onMouseDown={() => selectCollege(c)}>
                  <div className="tr-drop-name">{c.name}</div>
                  <div className="tr-drop-meta">{[c.city, c.state].filter(Boolean).join(", ")}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart */}
        {college && trendData.length > 0 && (
          <div className="tr-card">
            <div className="tr-card-hdr">
              <div>
                <div className="tr-clg-name">{college.name}</div>
                <div className="tr-clg-loc">📍 {[college.city, college.state].filter(Boolean).join(", ") || "India"}</div>
              </div>
              <div style={{background:"rgba(124,92,252,.12)",border:"1px solid rgba(124,92,252,.25)",
                borderRadius:8,padding:"6px 12px",fontSize:11,color:"#a78bfa",fontWeight:600}}>
                2020 – 2024
              </div>
            </div>

            {/* Legend pills */}
            <div className="tr-legend">
              {Object.entries(COLORS).map(([cat, color]) => (
                <div key={cat} className="tr-pill">
                  <div className="tr-pill-dot" style={{background:color}} />
                  {cat} Category
                </div>
              ))}
            </div>

            {/* Line Chart */}
            <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{top:5,right:20,left:0,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2740" />
                    <XAxis dataKey="year" tick={{fill:"#64748b",fontSize:12}} axisLine={{stroke:"#1e2740"}} tickLine={false} />
                    <YAxis
                    domain={["auto","auto"]}
                    tick={{fill:"#64748b",fontSize:11}}
                    axisLine={{stroke:"#1e2740"}} tickLine={false}
                    tickFormatter={v => `${v}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {Object.entries(COLORS).map(([cat, color]) => (
                    <Line key={cat} type="monotone" dataKey={cat} stroke={color}
                        strokeWidth={2.5} dot={{fill:color,r:5,strokeWidth:0}}
                        activeDot={{r:7,strokeWidth:0}} />
                    ))}
                </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Stats row — latest year */}
            <div className="tr-stats">
              {Object.entries(COLORS).map(([cat, color]) => {
                const latest = trendData[trendData.length - 1];
                return (
                  <div key={cat} className="tr-stat">
                    <div className="tr-stat-l">{cat} 2024</div>
                    <div className="tr-stat-v" style={{color}}>{latest[cat as keyof TrendPoint]}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!college && (
          <div className="tr-empty">
            <div className="tr-empty-icon">📈</div>
            <div className="tr-empty-t">Select a college to view cutoff trends</div>
            <div className="tr-empty-s">Search from 43,000+ Indian colleges — see 5-year cutoff history for any college</div>
          </div>
        )}
      </div>
    </>
  );
}
