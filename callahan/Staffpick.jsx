// 필요 훅: 없음
// 오손 위젯 · 스태프 픽 카드 v0

function Staffpick(props = {}) {
  const p = props || {};
  const album = spVal(p.album, "Untitled");
  const artist = spVal(p.artist, "");
  const year = spVal(p.year, "");
  const theme = spVal(p.theme, "");
  const review = spVal(p.review, "");
  const by = spVal(p.by, "Oz");
  const rating = Math.max(0, Math.min(5, Math.round((Number(p.rating) || 0) * 2) / 2));
  const pan = rating <= 1.5;

  const h = spHue(album + artist);
  const mono = "'Courier New', ui-monospace, Menlo, monospace";
  const ink = "#22375c";
  const red = "#b83a2e";

  const cover = (
    <div style={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
      <div className="sp-slide" style={{ position: "absolute", top: 7, left: 7, width: 136, height: 136, borderRadius: "50%", background: "repeating-radial-gradient(circle at 50% 50%, #121212 0px, #121212 1.4px, #222 2px, #121212 2.8px)", boxShadow: "0 4px 10px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.14)" }}>
        <div style={{ position: "absolute", left: "34%", top: "34%", width: "32%", height: "32%", borderRadius: "50%", background: "hsl(" + h + ", 45%, 62%)" }}>
          <span style={{ position: "absolute", left: "50%", top: "50%", width: 4, height: 4, marginLeft: -2, marginTop: -2, borderRadius: "50%", background: "#0b0b0b" }} />
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, borderRadius: 3, overflow: "hidden", background: "linear-gradient(140deg, hsl(" + h + ", 32%, 46%), hsl(" + ((h + 40) % 360) + ", 30%, 22%))", boxShadow: "0 6px 14px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.08)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,.18), transparent 55%)" }} />
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, color: "#f4efe4" }}>
          <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.15, letterSpacing: -0.2, wordBreak: "keep-all" }}>{album}</div>
          {artist ? <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>{artist}</div> : null}
        </div>
        <div style={{ position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: "50%", border: "1.5px solid rgba(244,239,228,.6)" }} />
      </div>
    </div>
  );

  const stars = (
    <div style={{ position: "relative", display: "inline-block", fontSize: 18, letterSpacing: 2, lineHeight: 1 }}>
      <span style={{ color: "rgba(34,55,92,.22)" }}>★★★★★</span>
      <span className="sp-stars" style={{ position: "absolute", left: 0, top: 0, width: (rating / 5) * 100 + "%", overflow: "hidden", whiteSpace: "nowrap", color: pan ? red : ink }}>★★★★★</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "8px auto", padding: "8px 6px", boxSizing: "border-box", fontFamily: "Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', system-ui, sans-serif" }}>
      <style>{SP_CSS}</style>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <div className="sp-rise" style={{ paddingRight: 36 }}>{cover}</div>

        <div className="sp-rise" style={{ position: "relative", flex: "1 1 230px", minWidth: 0, maxWidth: 300, animationDelay: ".1s", transform: "rotate(1.2deg)" }}>
          <div style={{ position: "absolute", left: "50%", top: -9, width: 74, height: 20, marginLeft: -37, background: "rgba(240,232,200,.75)", transform: "rotate(-4deg)", boxShadow: "0 1px 2px rgba(0,0,0,.15)", zIndex: 2 }} />
          <div
            style={{
              position: "relative",
              padding: "18px 16px 14px 30px",
              background: "repeating-linear-gradient(180deg, transparent 0px, transparent 23px, rgba(70,110,170,.22) 23px, rgba(70,110,170,.22) 24px), #fbf8ef",
              backgroundPosition: "0 10px",
              boxShadow: "0 8px 16px rgba(0,0,0,.35)",
              color: "#2a2a2a",
            }}
          >
            <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 1.5, background: "rgba(200,70,60,.45)" }} />
            <div className="sp-stamp" style={{ display: "inline-block", padding: "2px 8px", border: "2.5px solid " + red, color: red, fontFamily: mono, fontWeight: 800, fontSize: 13, letterSpacing: 2.5, transform: "rotate(-3deg)", borderRadius: 3 }}>
              {pan ? "STAFF PAN" : "STAFF PICK"}
            </div>
            {theme ? <div style={{ fontFamily: mono, fontSize: 10.5, color: "#7a7468", marginTop: 7, letterSpacing: 0.5 }}>{"RE: " + theme}</div> : null}
            <div style={{ marginTop: 8, fontSize: 16.5, fontWeight: 800, lineHeight: 1.25, wordBreak: "keep-all" }}>{album}</div>
            <div style={{ fontSize: 12, color: "#5f5a50", marginTop: 2 }}>{[artist, year].filter(Boolean).join(" · ")}</div>
            <div style={{ marginTop: 8 }}>{stars}</div>
            {review ? (
              <div className="sp-ink" style={{ marginTop: 9, fontFamily: "Georgia, 'Nanum Myeongjo', serif", fontStyle: "italic", fontSize: 14, lineHeight: "24px", color: ink, wordBreak: "keep-all" }}>
                {review}
              </div>
            ) : null}
            <div style={{ marginTop: 6, textAlign: "right", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 15, color: pan ? red : ink }}>{"— " + by}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function spVal(v, d) {
  if (v === undefined || v === null) return d;
  const s = String(v).trim();
  return s === "" || s === "undefined" || s === "null" ? d : s;
}

function spHue(name) {
  let h = 0;
  const s = String(name || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

const SP_CSS = `
@keyframes spRise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; } }
.sp-rise { animation: spRise .55s cubic-bezier(.2,.8,.2,1) both; }
@keyframes spSlide { from { transform: translateX(0) rotate(0deg); } to { transform: translateX(34px) rotate(200deg); } }
.sp-slide { animation: spSlide 1.1s .35s cubic-bezier(.3,.7,.2,1) both; }
@keyframes spStamp { 0% { opacity: 0; transform: rotate(-3deg) scale(2); } 70% { opacity: 1; transform: rotate(-3deg) scale(.94); } 100% { transform: rotate(-3deg) scale(1); } }
.sp-stamp { animation: spStamp .45s .5s both; }
@keyframes spStars { from { max-width: 0; } to { max-width: 100%; } }
.sp-stars { animation: spStars .9s .8s steps(10) both; }
@keyframes spInk { from { opacity: 0; } to { opacity: 1; } }
.sp-ink { animation: spInk .8s 1s both; }
@media (prefers-reduced-motion: reduce) { .sp-rise, .sp-slide, .sp-stamp, .sp-stars, .sp-ink { animation: none !important; } }
`;
