// 필요 훅: 없음
// 오손 위젯 · 수리 접수 꼬리표 v0

function Repairtag(props = {}) {
  const p = props || {};
  const no = rtVal(p.no, "0000");
  const date = rtVal(p.date, "");
  const customer = rtVal(p.customer, "");
  const item = rtVal(p.item, "");
  const issue = rtVal(p.issue, "");
  const diagnosis = rtVal(p.diagnosis, "");
  const estimate = rtVal(p.estimate, "");
  const due = rtVal(p.due, "");
  const st = rtStatus(rtVal(p.status, "접수"));

  const mono = "'Courier New', ui-monospace, Menlo, monospace";
  const ink = "#22375c";
  const estText = estimate === "" ? "—" : isFinite(Number(estimate)) ? "$" + Number(estimate).toFixed(2) : estimate;

  const label = (t) => <div style={{ fontSize: 9.5, letterSpacing: 1.6, fontWeight: 700, color: "#7a6a4c", marginBottom: 3 }}>{t}</div>;

  const field = (t, v, extra) =>
    v ? (
      <div style={{ padding: "7px 0", borderBottom: "1px dashed rgba(90,74,45,.35)", ...(extra || {}) }}>
        {label(t)}
        <div style={{ fontSize: 13, lineHeight: 1.45, wordBreak: "keep-all" }}>{v}</div>
      </div>
    ) : null;

  return (
    <div style={{ maxWidth: 380, margin: "8px auto", padding: "34px 10px 10px", boxSizing: "border-box", fontFamily: mono, color: "#2b2620" }}>
      <style>{RT_CSS}</style>
      <div className="rt-swing" style={{ position: "relative", transformOrigin: "50% -26px", filter: "drop-shadow(0 8px 12px rgba(0,0,0,.35))" }}>
        <svg width="80" height="44" viewBox="0 0 80 44" style={{ position: "absolute", left: "50%", top: -34, marginLeft: -40, overflow: "visible" }}>
          <path d="M40 44 C 30 26, 52 14, 36 -6" stroke="#bfa676" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M40 44 C 48 28, 30 18, 46 -6" stroke="#b49a68" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
        <div
          style={{
            position: "relative",
            background: "radial-gradient(rgba(90,70,30,.06) 1px, transparent 1.2px) 0 0 / 7px 7px, linear-gradient(180deg, #ecdfbf, #e2d0a4)",
            clipPath: "polygon(17% 0, 83% 0, 100% 11%, 100% 100%, 0 100%, 0 11%)",
            padding: "38px 20px 0",
          }}
        >
          <div style={{ position: "absolute", left: "50%", top: 12, width: 20, height: 20, marginLeft: -10, borderRadius: "50%", background: "#3b342b", boxShadow: "0 0 0 4px #f2e8cf, 0 0 0 5px #c6ae7e" }} />

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, paddingBottom: 8, borderBottom: "2px solid #5a4a2d" }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#7a6a4c" }}>B-SIDE VINYL & FRETS</div>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 3 }}>REPAIR TAG</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>No. {no}</div>
              {date ? <div style={{ fontSize: 10.5, color: "#7a6a4c" }}>{date}</div> : null}
            </div>
          </div>

          {field("ITEM", item)}
          {field("OWNER", customer)}
          {issue ? (
            <div style={{ padding: "7px 0", borderBottom: "1px dashed rgba(90,74,45,.35)" }}>
              {label("COMPLAINT")}
              <div style={{ fontSize: 13, lineHeight: 1.45, fontStyle: "italic", wordBreak: "keep-all" }}>{"“" + issue + "”"}</div>
            </div>
          ) : null}
          {diagnosis ? (
            <div style={{ padding: "8px 0 10px", borderBottom: "1px dashed rgba(90,74,45,.35)" }}>
              {label("DIAGNOSIS — O.C.")}
              <div className="rt-ink" style={{ fontFamily: "Georgia, 'Nanum Myeongjo', serif", fontStyle: "italic", fontSize: 14.5, lineHeight: 1.5, color: ink, transform: "rotate(-0.8deg)", wordBreak: "keep-all" }}>{diagnosis}</div>
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 10, padding: "8px 0 12px" }}>
            <div style={{ flex: 1 }}>
              {label("ESTIMATE")}
              <div style={{ fontSize: 15, fontWeight: 700 }}>{estText}</div>
            </div>
            <div style={{ flex: 1 }}>
              {label("READY BY")}
              <div style={{ fontSize: 13, fontWeight: 700, wordBreak: "keep-all" }}>{due || "—"}</div>
            </div>
          </div>

          <div className="rt-stamp" style={{ position: "absolute", right: 16, top: 84, padding: "3px 9px 2px", border: "2.5px solid " + st.color, borderRadius: 4, color: st.color, textAlign: "center", transform: "rotate(-12deg)", background: "rgba(236,223,191,.55)" }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>{st.en}</div>
            <div style={{ fontSize: 9.5, letterSpacing: 1 }}>{st.kr}</div>
          </div>

          <div style={{ position: "relative", margin: "0 -20px", borderTop: "2px dashed rgba(90,74,45,.55)" }}>
            <span style={{ position: "absolute", left: -6, top: -7, width: 12, height: 12, borderRadius: "50%", background: "#3b342b" }} />
            <span style={{ position: "absolute", right: -6, top: -7, width: 12, height: 12, borderRadius: "50%", background: "#3b342b" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "9px 0 12px", fontSize: 10.5, color: "#5a4a2d" }}>
            <span style={{ letterSpacing: 1.5, fontWeight: 700 }}>CLAIM CHECK</span>
            <span style={{ flex: 1, minWidth: 0, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item}</span>
            <span style={{ fontWeight: 700 }}>No. {no}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function rtVal(v, d) {
  if (v === undefined || v === null) return d;
  const s = String(v).trim();
  return s === "" || s === "undefined" || s === "null" ? d : s;
}

function rtStatus(s) {
  if (/완료|ready|done/i.test(s)) return { en: "READY", kr: "수리 완료", color: "#2f7a4c" };
  if (/중|진행|repair/i.test(s)) return { en: "IN REPAIR", kr: "수리 중", color: "#b5432b" };
  if (/보류|대기|hold|부품/i.test(s)) return { en: "ON HOLD", kr: s, color: "#6b6559" };
  if (/불가|포기|거절|no fix/i.test(s)) return { en: "NO FIX", kr: "수리 불가", color: "#8b1e1e" };
  return { en: "RECEIVED", kr: "접수", color: "#8a5a22" };
}

const RT_CSS = `
@keyframes rtSwing { 0% { transform: rotate(-7deg); } 30% { transform: rotate(4deg); } 55% { transform: rotate(-2deg); } 78% { transform: rotate(1deg); } 100% { transform: rotate(0deg); } }
.rt-swing { animation: rtSwing 1.6s cubic-bezier(.3,.6,.3,1) both; }
@keyframes rtStamp { 0% { opacity: 0; transform: rotate(-12deg) scale(2.2); } 70% { opacity: 1; transform: rotate(-12deg) scale(.92); } 100% { opacity: .92; transform: rotate(-12deg) scale(1); } }
.rt-stamp { animation: rtStamp .45s 1.1s both; }
@keyframes rtInk { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
.rt-ink { animation: rtInk 1.2s .5s steps(24) both; }
@media (prefers-reduced-motion: reduce) { .rt-swing, .rt-stamp, .rt-ink { animation: none !important; } }
`;
