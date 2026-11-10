// 필요 훅: useState (react)
// [포키] 명령어 전용. 포키 게임 한 판의 결과를 다시 보여 주는 기록 카드.
// 결과는 AI가 정하고, 위젯은 두 사람이 한 입씩 다가가는 모습을 재생한다.
//   result: 기권 / 부러짐 / 닿음      by: 기권하거나 부러뜨린 사람 (닿음이면 생략)
//   left: 남은 거리 mm (0~135)        bpm: 마시로의 최고 심박
//   flavor: 맛 (초코·딸기·말차·아몬드·극세, 그 밖은 초코 색)
// 결과 그림: 그림을 올린 뒤 아래 PG_IMG의 따옴표 안에 주소를 넣으면 카드 맨 위에 뜬다. 비워 두면 그림 없이 나온다.
//   예) 기권: "https://krsrmr.github.io/mayumaro/img/pocky-giveup.webp"

const PG_IMG = {
  기권: "",
  부러짐: "",
  닿음: ""
};

function PockyGame(props = {}) {
  const {
    title = "ポッキーの日",
    date = "11/11",
    flavor = "초코",
    left = 12,
    result = "기권",
    by = "마시로",
    bpm = 158,
    mashiroFace = "(>﹏<)💦",
    userFace = "(・ω・)",
    userName = "당신",
    memo = "12mm. 안경이 먼저 닿는다. 콘티 수정 필요"
  } = props;

  const [play, setPlay] = useState(0);
  const c = PG_C;

  const res = result === "부러짐" || result === "닿음" ? result : "기권";
  const mm = Math.max(0, Math.min(PG_FULL_MM, Math.round(Number(left) || 0)));
  const heart = Math.max(60, Math.min(220, Math.round(Number(bpm) || 120)));
  const fl = pgFlavor(flavor);
  const stickH = fl.thin ? 4 : 7;
  const endPx = res === "닿음" ? 0 : Math.max(6, Math.round((mm / PG_FULL_MM) * PG_STICK_PX));
  const img = PG_IMG[res];
  const stamp = PG_STAMP[res];
  const who = String(by || "").trim();
  const sub = res === "닿음" ? "닿음" : res === "부러짐" ? (who ? who + " 쪽에서 부러짐" : "부러짐") : (who ? who + " 기권" : "기권");
  const anim = "pg-shrink-" + endPx;
  const css = PG_CSS + "@keyframes " + anim + " { from { width: " + PG_STICK_PX + "px; } to { width: " + endPx + "px; } }";
  const T = 2.4; // 다가가는 시간(초)

  return (
    <div style={{ width: "100%", maxWidth: 360, margin: "10px auto", fontFamily: PG_FONT, color: c.ink }}>
      <style>{css}</style>
      <div style={{ background: c.card, border: "2px solid " + c.ink, borderRadius: 14, boxShadow: "3px 3px 0 " + c.ink, overflow: "hidden" }}>

        {/* 결과 그림 (파일이 있을 때만) */}
        {img ? (
          <img src={img} alt="" style={{ display: "block", width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderBottom: "2px solid " + c.ink }} />
        ) : null}

        {/* 제목 줄 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 12px", background: c.pink, borderBottom: "2px solid " + c.ink }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: ".02em" }}>{String(date).replace("/", ".")}</span>
            <span style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{String(title)}</span>
          </div>
          <span style={{ flex: "none", fontSize: 11.5, fontWeight: 700, background: "#fff", border: "2px solid " + c.ink, borderRadius: 999, padding: "1px 8px" }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: fl.coat, marginRight: 5, verticalAlign: "0px" }} />
            {String(flavor)}
          </span>
        </div>

        {/* 무대: 두 사람 + 포키 */}
        <div key={play} style={{ position: "relative", padding: "26px 10px 14px", background: c.stage }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 64 }}>
            <PgFace face={userFace} name={userName} c={c} />
            <div style={{ position: "relative", height: stickH, width: endPx, flex: "none", animation: anim + " " + T + "s steps(9, end) .3s both", marginLeft: res === "닿음" ? -2 : 0, marginRight: res === "닿음" ? -2 : 0 }}>
              <div className={res === "부러짐" ? "pg-half-l" : ""} style={{ position: "absolute", left: 0, top: 0, width: "50%", height: "100%", background: "linear-gradient(90deg," + c.biscuit + " 0 22%," + fl.coat + " 22% 100%)", borderRadius: "3px 0 0 3px", animationDelay: T + 0.35 + "s" }}>
                {fl.dots ? <div style={{ position: "absolute", inset: 0, backgroundImage: PG_DOTS, opacity: .9 }} /> : null}
              </div>
              <div className={res === "부러짐" ? "pg-half-r" : ""} style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", background: fl.coat, borderRadius: "0 3px 3px 0", animationDelay: T + 0.35 + "s" }}>
                {fl.dots ? <div style={{ position: "absolute", inset: 0, backgroundImage: PG_DOTS, opacity: .9 }} /> : null}
              </div>
            </div>
            <div className={res === "기권" ? "pg-flee" : ""} style={{ animationDelay: T + 0.35 + "s" }}>
              <PgFace face={mashiroFace} name="真白" c={c} dark />
            </div>
          </div>

          {/* 판정 순간의 효과 */}
          {res === "부러짐" ? <div className="pg-pop" style={{ position: "absolute", left: 0, right: 0, top: 6, textAlign: "center", fontWeight: 900, fontSize: 15, color: c.red, animationDelay: T + 0.35 + "s" }}>ポキッ！</div> : null}
          {res === "닿음" ? <div className="pg-pop" style={{ position: "absolute", left: 0, right: 0, top: 2, textAlign: "center", fontSize: 22, color: c.red, animationDelay: T + 0.35 + "s" }}>♡</div> : null}

          {/* 도장 */}
          <div className="pg-stamp" style={{ position: "absolute", right: 12, bottom: 8, transform: "rotate(-10deg)", border: "2.5px solid " + stamp.color, color: stamp.color, borderRadius: 8, padding: "1px 7px", fontWeight: 900, fontSize: 15, background: "rgba(255,255,255,.75)", animationDelay: T + 0.6 + "s" }}>
            {stamp.label}
          </div>
        </div>

        {/* 자: 남은 거리 */}
        <div style={{ padding: "10px 14px 4px", borderTop: "2px dashed " + c.line }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: c.sub, fontWeight: 700 }}>남은 거리</span>
            <span style={{ fontSize: 20, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
              {mm}<span style={{ fontSize: 12, fontWeight: 700, marginLeft: 2 }}>mm</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: stamp.color, marginLeft: 8 }}>{sub}</span>
            </span>
          </div>
          <div style={{ position: "relative", height: 30 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 14, background: c.ruler, border: "1.5px solid " + c.ink, borderRadius: 3 }} />
            <div style={{ position: "absolute", left: 0, top: 3, height: 8, width: (mm / PG_FULL_MM) * 100 + "%", background: fl.coat, borderRadius: 2, marginLeft: 2 }} />
            {PG_TICKS.map((t) => (
              <div key={t} style={{ position: "absolute", left: (t / PG_FULL_MM) * 100 + "%", top: 0, width: 1, height: t % 50 === 0 ? 14 : 7, background: c.ink }} />
            ))}
            {[0, 50, 100].map((t) => (
              <div key={"n" + t} style={{ position: "absolute", left: (t / PG_FULL_MM) * 100 + "%", top: 16, fontSize: 9.5, color: c.sub, transform: t ? "translateX(-50%)" : "none" }}>{t}</div>
            ))}
            <div style={{ position: "absolute", left: "calc(" + (mm / PG_FULL_MM) * 100 + "% - 5px)", top: 14, width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "7px solid " + c.red }} />
          </div>
        </div>

        {/* 심박 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 8px" }}>
          <span style={{ fontSize: 12, color: c.sub, fontWeight: 700, flex: "none" }}>마시로 심박</span>
          <div style={{ flex: 1, minWidth: 0, height: 24 }}>
          <svg viewBox="0 0 120 24" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 24 }}>
            <polyline points="0,14 14,14 18,10 22,14 30,14 33,3 37,22 41,14 52,14 56,10 60,14 68,14 71,2 75,23 79,14 90,14 94,10 98,14 106,14 109,3 113,22 117,14 120,14" fill="none" stroke={c.red} strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          </div>
          <span style={{ flex: "none", fontWeight: 900, fontSize: 15, color: c.red, fontVariantNumeric: "tabular-nums" }}>
            <span className="pg-beat" style={{ display: "inline-block", marginRight: 3 }}>♥</span>{heart}
            <span style={{ fontSize: 10.5, fontWeight: 700, marginLeft: 2 }}>bpm</span>
          </span>
        </div>

        {/* 메모 */}
        {memo ? (
          <div style={{ padding: "4px 14px 14px" }}>
            <div style={{ background: c.note, border: "1.5px solid " + c.noteLine, borderRadius: 4, padding: "8px 10px", transform: "rotate(-1deg)", boxShadow: "2px 2px 0 rgba(0,0,0,.08)" }}>
              <div style={{ fontSize: 10.5, color: c.sub, fontWeight: 700, marginBottom: 2 }}>마시로 메모</div>
              <div style={{ fontSize: 13, lineHeight: 1.5, wordBreak: "keep-all" }}>{String(memo)}</div>
            </div>
          </div>
        ) : null}

        {/* 다시 보기 */}
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 12px 10px" }}>
          <button
            type="button"
            onClick={() => setPlay((n) => n + 1)}
            style={{ border: "2px solid " + c.ink, background: "#fff", color: c.ink, fontFamily: "inherit", fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 999, cursor: "pointer" }}
          >
            ↻ 다시 보기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── 보조 요소 ───────── */

function PgFace({ face, name, c, dark }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: "none", width: 86 }}>
      <div style={{ background: dark ? c.ink : "#fff", color: dark ? "#fff" : c.ink, border: "2px solid " + c.ink, borderRadius: 999, padding: "4px 7px", fontSize: 12, whiteSpace: "nowrap", maxWidth: 86, overflow: "hidden", textOverflow: "clip", textAlign: "center" }}>
        {String(face || "")}
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: c.sub, maxWidth: 86, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{String(name || "")}</div>
    </div>
  );
}

function pgFlavor(name) {
  const s = String(name || "");
  if (s.indexOf("딸기") >= 0 || s.indexOf("いちご") >= 0) return { coat: "#f2a3b8" };
  if (s.indexOf("말차") >= 0 || s.indexOf("抹茶") >= 0) return { coat: "#9dbe86" };
  if (s.indexOf("아몬드") >= 0) return { coat: "#6b4632", dots: true };
  if (s.indexOf("극세") >= 0) return { coat: "#4e3128", thin: true };
  if (s.indexOf("화이트") >= 0) return { coat: "#f3eadb" };
  return { coat: "#5b3a2c" };
}

const PG_FULL_MM = 135;
const PG_STICK_PX = 140;
const PG_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130];
const PG_DOTS = "radial-gradient(circle at 30% 40%, #e8cfa6 0 1.2px, transparent 1.5px), radial-gradient(circle at 75% 60%, #e8cfa6 0 1.2px, transparent 1.5px)";

const PG_STAMP = {
  기권: { label: "棄権", color: "#5a6fa8" },
  부러짐: { label: "ポキッ", color: "#d9566e" },
  닿음: { label: "♡ 成功", color: "#e0577f" }
};

const PG_FONT = '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans JP", sans-serif';

const PG_C = {
  ink: "#3b3236",
  card: "#fffaf5",
  stage: "#fdeef0",
  pink: "#f9c9d4",
  red: "#d9566e",
  sub: "#8a7c78",
  line: "#ead9d4",
  ruler: "#fff3d6",
  biscuit: "#e9c48c",
  note: "#fff7c7",
  noteLine: "#efe0a0"
};

const PG_CSS = `
.pg-half-l { animation: pg-break-l .5s ease-out both; transform-origin: right center; }
.pg-half-r { animation: pg-break-r .5s ease-out both; transform-origin: left center; }
.pg-flee { animation: pg-flee .45s ease-out both; }
.pg-pop { animation: pg-pop .6s ease-out both; }
.pg-stamp { animation: pg-stamp .35s cubic-bezier(.2,1.6,.4,1) both; }
.pg-beat { animation: pg-beat .7s ease-in-out infinite; }
@keyframes pg-break-l { from { transform: none; } to { transform: translate(-4px, 5px) rotate(-14deg); } }
@keyframes pg-break-r { from { transform: none; } to { transform: translate(4px, 5px) rotate(14deg); } }
@keyframes pg-flee { from { transform: none; } to { transform: translateX(18px) rotate(10deg); } }
@keyframes pg-pop { from { opacity: 0; transform: translateY(6px) scale(.7); } to { opacity: 1; transform: none; } }
@keyframes pg-stamp { from { opacity: 0; transform: rotate(-10deg) scale(1.8); } to { opacity: 1; transform: rotate(-10deg) scale(1); } }
@keyframes pg-beat { 0%, 100% { transform: scale(1); } 40% { transform: scale(1.25); } }
@media (prefers-reduced-motion: reduce) { .pg-beat { animation: none; } }
`;
