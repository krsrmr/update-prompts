// 필요 훅: 없음
// 오손 위젯 · 수첩 한 장 v0

function Orsonnote(props = {}) {
  const p = props || {};
  const date = onVal(p.date, "");
  const lines = onList(p.lines);
  const tally = Math.max(0, Math.min(40, Math.round(Number(p.tally) || 0)));

  const ink = "#23364f";
  const pencil = "#5b5b5b";
  const hand = "Georgia, 'Nanum Myeongjo', serif";
  const LH = 28;

  const row = (raw, i) => {
    const tilt = i % 3 === 0 ? -0.5 : i % 3 === 1 ? 0.35 : -0.15;
    const base = { minHeight: LH, lineHeight: LH + "px", fontFamily: hand, fontStyle: "italic", fontSize: 15, color: ink, transform: "rotate(" + tilt + "deg)", transformOrigin: "left center", wordBreak: "keep-all", animationDelay: 0.35 + i * 0.12 + "s" };
    let t = raw;
    if (/^~.+~$/.test(t)) {
      t = t.slice(1, -1);
      return (
        <div key={i} className="on-write" style={{ ...base, color: pencil }}>
          <span style={{ position: "relative", display: "inline-block" }}>
            {t}
            <svg viewBox="0 0 100 10" preserveAspectRatio="none" style={{ position: "absolute", left: -2, right: -2, top: "50%", width: "calc(100% + 4px)", height: 9, marginTop: -5, overflow: "visible" }}>
              <path d="M0 6 C 15 2, 25 8, 40 4 S 70 7, 100 3" stroke={pencil} strokeWidth="1.6" fill="none" vectorEffect="non-scaling-stroke" />
              <path d="M0 4 C 20 8, 35 1, 55 6 S 85 2, 100 6" stroke={pencil} strokeWidth="1.3" fill="none" vectorEffect="non-scaling-stroke" />
            </svg>
          </span>
        </div>
      );
    }
    const box = t.match(/^\[( |x|X|v|V)\]\s*(.*)$/);
    if (box) {
      const done = box[1] !== " ";
      return (
        <div key={i} className="on-write" style={{ ...base, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 13, height: 13, flexShrink: 0, border: "1.5px solid " + ink, borderRadius: 2, position: "relative", top: 1 }}>
            {done ? <span style={{ position: "absolute", left: 1, top: -7, fontSize: 16, fontStyle: "normal", color: ink }}>✓</span> : null}
          </span>
          <span style={{ textDecoration: done ? "line-through" : "none", textDecorationColor: "rgba(35,54,79,.6)" }}>{box[2]}</span>
        </div>
      );
    }
    if (/^♪/.test(t)) {
      return (
        <div key={i} className="on-write" style={{ ...base, color: pencil, fontSize: 15.5, paddingLeft: 10 }}>
          {t}
        </div>
      );
    }
    return (
      <div key={i} className="on-write" style={base}>
        {t}
      </div>
    );
  };

  const groups = [];
  for (let n = tally; n > 0; n -= 5) groups.push(Math.min(5, n));

  return (
    <div style={{ maxWidth: 360, margin: "8px auto", padding: "8px 8px 12px", boxSizing: "border-box" }}>
      <style>{ON_CSS}</style>
      <div className="on-flip" style={{ position: "relative", filter: "drop-shadow(0 8px 14px rgba(0,0,0,.35))", transformOrigin: "50% 0" }}>
        <div style={{ height: 26, borderRadius: "6px 6px 0 0", background: "linear-gradient(180deg, #3a3631, #2a2724)", position: "relative" }}>
          <div style={{ position: "absolute", left: 16, right: 16, top: 7, display: "flex", justifyContent: "space-between" }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => (
              <span key={k} style={{ width: 7, height: 18, borderRadius: 4, background: "linear-gradient(90deg, #8d8d8d, #e2e2e2 45%, #7a7a7a)", marginTop: -2 }} />
            ))}
          </div>
        </div>
        <div
          style={{
            position: "relative",
            minHeight: 230,
            padding: "14px 18px 18px 34px",
            background: "repeating-linear-gradient(180deg, transparent 0px, transparent " + (LH - 1) + "px, rgba(80,120,170,.28) " + (LH - 1) + "px, rgba(80,120,170,.28) " + LH + "px), linear-gradient(180deg, #f6efd9, #efe4c4)",
            backgroundPosition: "0 14px, 0 0",
            borderRadius: "0 0 4px 4px",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", left: 24, top: 0, bottom: 0, width: 1.5, background: "rgba(200,70,60,.4)" }} />
          <div style={{ position: "absolute", right: -18, top: 38, width: 92, height: 92, borderRadius: "50%", border: "7px solid rgba(120,80,40,.13)", boxShadow: "inset 0 0 6px rgba(120,80,40,.12)" }} />
          {date ? (
            <div style={{ height: LH, lineHeight: LH + "px", textAlign: "right", fontFamily: hand, fontStyle: "italic", fontSize: 13, color: pencil }}>{date}</div>
          ) : null}
          {lines.length ? lines.map(row) : <div style={{ height: LH, lineHeight: LH + "px", fontFamily: hand, fontStyle: "italic", fontSize: 14, color: pencil }}>…</div>}
          {groups.length ? (
            <div className="on-write" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap", animationDelay: 0.4 + lines.length * 0.12 + "s" }}>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 1.5, color: pencil, fontWeight: 700 }}>DRY</span>
              {groups.map((g, gi) => (
                <svg key={gi} width="34" height="22" viewBox="0 0 34 22" style={{ overflow: "visible" }}>
                  {[0, 1, 2, 3].slice(0, Math.min(4, g)).map((k) => (
                    <path key={k} d={"M" + (5 + k * 7) + " 2 L" + (4 + k * 7) + " 20"} stroke={ink} strokeWidth="1.8" strokeLinecap="round" />
                  ))}
                  {g === 5 ? <path d="M1 16 L31 5" stroke={ink} strokeWidth="1.8" strokeLinecap="round" /> : null}
                </svg>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function onVal(v, d) {
  if (v === undefined || v === null) return d;
  const s = String(v).trim();
  return s === "" || s === "undefined" || s === "null" ? d : s;
}

function onList(v) {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (v === undefined || v === null) return [];
  const s = String(v).trim();
  if (!s) return [];
  if (s.charAt(0) === "[") {
    try {
      const a = JSON.parse(s);
      if (Array.isArray(a)) return a.map((x) => String(x).trim()).filter(Boolean);
    } catch (e) {}
  }
  return s.split(/\n|\|/).map((x) => x.trim()).filter(Boolean);
}

const ON_CSS = `
@keyframes onFlip { from { opacity: 0; transform: perspective(700px) rotateX(-70deg); } to { opacity: 1; transform: perspective(700px) rotateX(0deg); } }
.on-flip { animation: onFlip .8s cubic-bezier(.2,.8,.2,1) both; }
@keyframes onWrite { from { opacity: 0; clip-path: inset(0 100% 0 0); } to { opacity: 1; clip-path: inset(0 0 0 0); } }
.on-write { animation: onWrite .7s ease-out both; }
@media (prefers-reduced-motion: reduce) { .on-flip, .on-write { animation: none !important; } }
`;
