// 필요 훅: useState, useRef, useEffect (react)
// 오손의 아이팟 v1.0 — !플리 위젯 · 구형 아이팟 클래식(흑백 LCD) + 리뷰 사이트 창

function OrsonPod(props = {}) {
  const p = props || {};
  const H = opHooks();
  const mkRef = H.r || ((v) => H.s(() => ({ current: v }))[0]);
  const rootRef = mkRef(null);
  const [rootW, setRootW] = H.s(0);

  H.e(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const check = () => {
      const w = el.clientWidth;
      setRootW((v) => (v === w ? v : w));
    };
    check();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const title = opVal(p.title, "Oz's Mix");
  const tracks = opList(p.tracks).map(opTrack);
  const battery = Math.max(0, Math.min(4, Math.round(Number(p.battery === undefined ? 1 : p.battery) || 0)));

  const [view, setView] = H.s("list");
  const [sel, setSel] = H.s(0);
  const [playing, setPlaying] = H.s(true);
  const [sec, setSec] = H.s(0);

  const n = tracks.length;
  const cur = n ? tracks[Math.min(sel, n - 1)] : null;
  const dur = cur ? 140 + (opHue(cur.title + cur.artist) % 160) : 0;

  H.e(() => {
    if (cur) setSec(opHue(cur.artist + cur.title) % 50);
  }, [sel]);

  H.e(() => {
    if (view !== "now" || !playing || !cur) return undefined;
    const id = setInterval(() => setSec((s) => (s + 1) % dur), 1000);
    return () => clearInterval(id);
  }, [view, playing, sel, dur]);

  const move = (d) => {
    if (!n) return;
    setSel((s) => (s + d + n) % n);
  };
  const press = (k) => {
    if (k === "menu") setView("list");
    if (k === "prev") move(-1);
    if (k === "next") move(1);
    if (k === "play") {
      if (view === "list") setView("now");
      else setPlaying((v) => !v);
    }
    if (k === "center" && view === "list" && n) setView("now");
  };

  // ── 화면 색 (흑백 LCD)
  const lcd = "#c4cab4";
  const ink = "#23271f";
  const mid = "#5f6653";
  const font = "'Chicago', 'Helvetica Neue', Helvetica, Arial, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";

  const SW = 212;
  const SH = 158;
  const rowH = 20;
  const visible = 7;
  const top = Math.max(0, Math.min(sel - (visible - 1), n - visible));

  const batt = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      <span style={{ display: "inline-flex", gap: 1, padding: 1, border: "1px solid " + ink, borderRadius: 1, height: 6 }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ width: 3, height: 6, background: i < battery ? ink : "transparent" }} />
        ))}
      </span>
      <span style={{ width: 2, height: 4, background: ink }} />
    </span>
  );

  const bar = (label) => (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", height: 17, padding: "0 6px", borderBottom: "1px solid " + ink, background: "linear-gradient(" + lcd + ", #b5bba4)" }}>
      <span style={{ width: 22, fontSize: 9, color: ink }}>{playing && cur ? "▶" : "❚❚"}</span>
      <span style={{ flex: 1, minWidth: 0, textAlign: "center", fontSize: 11, fontWeight: 700, color: ink, whiteSpace: "nowrap", overflow: "hidden" }}>{label}</span>
      <span style={{ width: 22, display: "flex", justifyContent: "flex-end" }}>{batt}</span>
    </div>
  );

  const stars = (k) => (
    <span style={{ letterSpacing: 1.5, fontSize: 11 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= k ? ink : "rgba(35,39,31,.25)" }}>★</span>
      ))}
    </span>
  );

  const listView = (
    <div>
      {bar(title)}
      <div style={{ height: SH - 18, overflow: "hidden" }}>
        {n ? (
          <div style={{ transform: "translateY(" + -top * rowH + "px)", transition: "transform .15s ease" }}>
            {tracks.map((t, i) => {
              const on = i === sel;
              return (
                <div
                  key={i}
                  onClick={() => {
                    setSel(i);
                    setView("now");
                  }}
                  style={{ display: "flex", alignItems: "center", height: rowH, padding: "0 6px", gap: 6, cursor: "pointer", background: on ? ink : "transparent", color: on ? lcd : ink }}
                >
                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", fontSize: 11.5, fontWeight: 700 }}>
                    {on ? <OpMarquee>{t.title}</OpMarquee> : t.title}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700 }}>›</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: "40px 10px", textAlign: "center", fontSize: 11, color: mid }}>No Songs</div>
        )}
      </div>
    </div>
  );

  const pct = dur ? (sec / dur) * 100 : 0;
  const nowView = cur ? (
    <div>
      {bar("Now Playing")}
      <div style={{ height: SH - 18, display: "flex", flexDirection: "column", padding: "5px 9px 6px", boxSizing: "border-box", color: ink }}>
        <div style={{ fontSize: 9.5, color: mid }}>{sel + 1 + " of " + n}</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, textAlign: "center", overflow: "hidden" }}>
            <OpMarquee center>{cur.title}</OpMarquee>
          </div>
          <div style={{ fontSize: 11, textAlign: "center", overflow: "hidden" }}>
            <OpMarquee center>{cur.artist}</OpMarquee>
          </div>
          {cur.year ? <div style={{ fontSize: 10, textAlign: "center", color: mid }}>{cur.year}</div> : null}
          <div style={{ textAlign: "center", marginTop: 3 }}>{stars(cur.stars)}</div>
        </div>
        <div>
          <div style={{ height: 6, border: "1px solid " + ink, borderRadius: 1, padding: 1, boxSizing: "border-box" }}>
            <div style={{ height: "100%", width: pct + "%", background: ink, transition: "width 1s linear" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginTop: 1, fontVariantNumeric: "tabular-nums" }}>
            <span>{opClock(sec)}</span>
            <span>{"-" + opClock(dur - sec)}</span>
          </div>
        </div>
      </div>
    </div>
  ) : (
    listView
  );

  const screen = (
    <div
      style={{
        position: "relative",
        width: SW,
        height: SH,
        margin: "0 auto",
        borderRadius: 4,
        overflow: "hidden",
        background: "linear-gradient(160deg, #cfd5bf 0%, " + lcd + " 55%, #b7bda6 100%)",
        boxShadow: "inset 0 2px 5px rgba(0,0,0,.35), 0 0 0 3px #1e1e1c, 0 0 0 4px rgba(255,255,255,.5)",
        fontFamily: font,
      }}
    >
      {view === "now" ? nowView : listView}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, rgba(0,0,0,.035) 0 1px, transparent 1px 2px), repeating-linear-gradient(90deg, rgba(0,0,0,.03) 0 1px, transparent 1px 2px)" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(125deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,0) 40%)" }} />
    </div>
  );

  const W = 156;
  const key = (k, style, label, aria) => (
    <div
      onClick={(e) => {
        e.stopPropagation();
        press(k);
      }}
      title={aria}
      style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9b968a", fontFamily: "Helvetica, Arial, sans-serif", fontWeight: 700, userSelect: "none", ...style }}
    >
      {label}
    </div>
  );

  const wheel = (
    <div style={{ position: "relative", width: W, height: W, margin: "22px auto 0", borderRadius: "50%", background: "radial-gradient(circle at 50% 45%, #f1eee5 0%, #e6e1d4 62%, #d8d2c3 100%)", boxShadow: "inset 0 1px 2px rgba(255,255,255,.9), inset 0 -2px 4px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.06)" }}>
      <div style={{ position: "absolute", inset: 18, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle, transparent 55%, rgba(120,110,90,.10) 70%, transparent 82%)" }} />
      {key("menu", { left: 0, right: 0, top: 6, height: 34, fontSize: 11, letterSpacing: 1 }, "MENU", "MENU")}
      {key("prev", { left: 4, top: 0, bottom: 0, width: 36, fontSize: 12 }, "⏮", "이전")}
      {key("next", { right: 4, top: 0, bottom: 0, width: 36, fontSize: 12 }, "⏭", "다음")}
      {key("play", { left: 0, right: 0, bottom: 6, height: 34, fontSize: 12 }, "⏯", "재생/일시정지")}
      <div
        onClick={() => press("center")}
        title="선택"
        style={{ position: "absolute", left: "50%", top: "50%", width: 56, height: 56, marginLeft: -28, marginTop: -28, borderRadius: "50%", cursor: "pointer", background: "radial-gradient(circle at 50% 35%, #fbfaf6, #e4dfd2)", boxShadow: "0 1px 2px rgba(0,0,0,.18), inset 0 1px 1px rgba(255,255,255,.9)" }}
      />
    </div>
  );

  const body = (
    <div
      style={{
        position: "relative",
        width: 252,
        padding: "22px 20px 26px",
        boxSizing: "border-box",
        borderRadius: 26,
        background: "linear-gradient(165deg, #f6f3ea 0%, #ebe6d8 55%, #ddd6c4 100%)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.7), inset 0 -3px 6px rgba(0,0,0,.06), 0 18px 34px rgba(0,0,0,.55), 0 2px 0 #bcb5a3",
      }}
    >
      {screen}
      {wheel}
      <div style={{ position: "absolute", inset: 0, borderRadius: 26, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(150,125,70,.10) 100%), radial-gradient(circle at 18% 88%, rgba(120,100,60,.06), transparent 22%)" }} />
    </div>
  );

  const cable = (
    <svg width="120" height="64" viewBox="0 0 120 64" style={{ display: "block", margin: "0 0 -6px 0", position: "relative", left: 34, overflow: "visible" }}>
      <path d="M8 64 C 8 36, 40 48, 52 28 S 90 8, 118 2" stroke="rgba(0,0,0,.25)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M8 64 C 8 36, 40 48, 52 28 S 90 8, 118 2" stroke="#eeeae0" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="2" y="54" width="12" height="12" rx="2" fill="#e8e3d6" stroke="rgba(0,0,0,.2)" />
    </svg>
  );

  // ── 리뷰 사이트 창 (선택한 곡의 평가)
  const OVER = 28;
  const side = rootW >= 252 + 300 - OVER;
  const CW = side ? Math.min(300, rootW - 252 + OVER) : Math.min(320, Math.max(240, rootW - 8));
  const serif = "Georgia, 'Times New Roman', 'Nanum Myeongjo', 'Noto Serif KR', serif";
  const sans = "'Helvetica Neue', Helvetica, Arial, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";
  const padL = side ? OVER + 16 : 16;
  const padT = side ? 0 : 26;

  const cover = (t, size) => {
    const h = opHue(t.artist + t.title);
    return (
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0, borderRadius: 2, overflow: "hidden", background: "linear-gradient(140deg, hsl(" + h + ",24%,38%), hsl(" + ((h + 50) % 360) + ",20%,16%))", boxShadow: "0 3px 8px rgba(0,0,0,.28)" }}>
        <div style={{ position: "absolute", right: -size * 0.3, top: -size * 0.3, width: size * 0.85, height: size * 0.85, borderRadius: "50%", background: "repeating-radial-gradient(circle, #121212 0 1px, #262626 1.6px 2.6px)", opacity: 0.6 }} />
        <div style={{ position: "absolute", left: 6, right: 6, bottom: 5, fontFamily: serif, fontSize: 9.5, lineHeight: 1.15, fontWeight: 700, color: "rgba(255,255,255,.88)", wordBreak: "break-word" }}>{t.artist}</div>
      </div>
    );
  };

  const bigStars = (k) => (
    <span style={{ fontSize: 19, letterSpacing: 2, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= k ? "#d4891c" : "#dcd6c8" }}>★</span>
      ))}
    </span>
  );

  const navBtn = (label, d) => (
    <span onClick={() => move(d)} className="op-nav" style={{ cursor: "pointer", padding: "4px 2px", fontSize: 11.5, color: "#5b5648", fontFamily: sans }}>
      {label}
    </span>
  );

  const review = cur ? (
    <div style={{ width: CW, boxSizing: "border-box", borderRadius: 6, overflow: "hidden", background: "#fbfaf6", color: "#1b1a17", boxShadow: "0 16px 32px rgba(0,0,0,.32), 0 0 0 1px rgba(0,0,0,.07)" }}>
      <div style={{ padding: padT + 10 + "px 14px 9px " + padL + "px", background: "#17160f", color: "#f3efe2" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 14, letterSpacing: 2.5 }}>BENCH NOTES</span>
          <span style={{ fontFamily: sans, fontSize: 9, color: "#a39c86", letterSpacing: 1 }}>REVIEWS</span>
        </div>
        <div style={{ fontFamily: sans, fontSize: 9.5, color: "#8f897a", marginTop: 2 }}>reviews from the back room</div>
      </div>

      <div key={sel} className="op-rv" style={{ padding: "13px 16px 12px " + padL + "px", fontFamily: sans }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 9.5, letterSpacing: 1.4, color: "#8a8474", fontWeight: 700 }}>{"TRACK " + String(sel + 1).padStart(2, "0") + " / " + String(n).padStart(2, "0")}</span>
          {cur.stars >= 5 ? <span style={{ fontSize: 9, letterSpacing: 1.2, fontWeight: 800, color: "#fff", background: "#b8322a", padding: "2px 6px", borderRadius: 2 }}>OZ'S PICK</span> : null}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          {cover(cur, 66)}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, lineHeight: 1.2, wordBreak: "keep-all" }}>{cur.title}</div>
            <div style={{ fontSize: 12.5, marginTop: 3, color: "#3c3a33" }}>{cur.artist}</div>
            {cur.year ? <div style={{ fontSize: 11, marginTop: 1, color: "#8a8474" }}>{cur.year}</div> : null}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, paddingBottom: 11, borderBottom: "1px solid #e7e2d6" }}>
          {bigStars(cur.stars)}
          <span style={{ fontSize: 15, fontWeight: 800 }}>{cur.stars.toFixed(1)}</span>
          <span style={{ fontSize: 11, color: "#8a8474" }}>/ 5</span>
        </div>
        {cur.note ? (
          <div style={{ position: "relative", marginTop: 10, paddingLeft: 18 }}>
            <span style={{ position: "absolute", left: 0, top: -6, fontFamily: serif, fontSize: 30, lineHeight: 1, color: "#d4891c" }}>“</span>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: "#2a2823", wordBreak: "keep-all" }}>{cur.note}</div>
          </div>
        ) : null}
        <div style={{ marginTop: 10, fontSize: 10.5, color: "#8a8474", fontStyle: "italic", fontFamily: serif }}>— Oz, B-Side Vinyl & Frets</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 14px 7px " + padL + "px", borderTop: "1px solid #e7e2d6", background: "#f4f1e8" }}>
        {navBtn("‹ 이전 리뷰", -1)}
        {navBtn("다음 리뷰 ›", 1)}
      </div>
    </div>
  ) : null;

  const device = (
    <div style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>
      {cable}
      {body}
    </div>
  );

  return (
    <div ref={rootRef} style={{ width: "100%", boxSizing: "border-box", padding: "4px 0 10px" }}>
      <style>{OP_CSS}</style>
      {side ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
          {device}
          {review ? <div style={{ position: "relative", zIndex: 1, marginLeft: -OVER, marginTop: 96 }}>{review}</div> : null}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {device}
          {review ? <div style={{ position: "relative", zIndex: 1, marginTop: -26 }}>{review}</div> : null}
        </div>
      )}
    </div>
  );
}

// 선택된 줄의 긴 글자를 아이팟처럼 옆으로 흘린다.
function OpMarquee(props = {}) {
  const p = props || {};
  const H = opHooks();
  const mkRef = H.r || ((v) => H.s(() => ({ current: v }))[0]);
  const boxRef = mkRef(null);
  const firstRef = mkRef(null);
  const [dist, setDist] = H.s(0);

  const measure = () => {
    const box = boxRef.current;
    const first = firstRef.current;
    if (!box || !first) return;
    const room = box.clientWidth;
    const w = first.offsetWidth;
    const next = room > 0 && w > room + 1 ? w + 28 : 0;
    setDist((d) => (d === next ? d : next));
  };

  H.e(() => {
    measure();
  });

  const over = dist > 0;
  const total = over ? Math.round(1500 + (dist / 28) * 1000) : 0;
  const holdPct = over ? ((1500 / total) * 100).toFixed(2) : "0";
  const kf = "opMq" + dist;

  return (
    <div ref={boxRef} style={{ overflow: "hidden", whiteSpace: "nowrap", textAlign: over ? "left" : p.center ? "center" : "left" }}>
      {over ? <style>{"@keyframes " + kf + " { 0%, " + holdPct + "% { transform: translateX(0); } 100% { transform: translateX(-" + dist + "px); } }"}</style> : null}
      <span className={over ? "op-mq" : ""} style={{ display: "inline-block", animation: over ? kf + " " + total + "ms linear infinite" : undefined }}>
        <span ref={firstRef} style={{ display: "inline-block" }}>{p.children}</span>
        {over ? <span aria-hidden="true" style={{ display: "inline-block", paddingLeft: 28 }}>{p.children}</span> : null}
      </span>
    </div>
  );
}

function opHooks() {
  const R = typeof React !== "undefined" && React ? React : {};
  return {
    s: R.useState || (typeof useState === "function" ? useState : null),
    e: R.useEffect || (typeof useEffect === "function" ? useEffect : null),
    r: R.useRef || (typeof useRef === "function" ? useRef : null),
  };
}

function opVal(v, d) {
  if (v === undefined || v === null) return d;
  const s = String(v).trim();
  return s === "" || s === "undefined" || s === "null" ? d : s;
}

function opList(v) {
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
  return s.split(/\n|;/).map((x) => x.trim()).filter(Boolean);
}

// "제목|아티스트|연도|별점|추천 한마디"
function opTrack(s) {
  const a = String(s).split("|").map((x) => x.trim());
  const st = Math.max(0, Math.min(5, Math.round(Number(String(a[3] || "").replace(/[^0-9.]/g, "")) || 0)));
  return { title: a[0] || "Untitled", artist: a[1] || "Unknown Artist", year: a[2] || "", stars: st, note: a[4] || "" };
}

function opHue(name) {
  let h = 0;
  const s = String(name || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

function opClock(sec) {
  const s = Math.max(0, Math.round(sec));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

const OP_CSS = `
@keyframes opRv { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.op-rv { animation: opRv .25s ease-out both; }
.op-nav:hover { color: #1b1a17 !important; text-decoration: underline; }
@media (prefers-reduced-motion: reduce) { .op-mq, .op-rv { animation: none !important; } }
`;
