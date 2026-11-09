// 필요 훅: useState (react)
// [리스트] 명령어 전용. 마시로 작업실 잠금 수납장의 '자료'(성인용품) 목록을 게임 아이템 창처럼 보여 준다.
// 마시로는 {{user}}가 이 화면을 본 사실을 모른다.
// items 한 줄 = 물건 하나: "이름|분류|개수|상태|메모" (새로 들어온 물건은 끝에 "|new")
//   분류: 장난감 / 구속 / 코스튬 / 소모품 / 마사지 / 기타
//   상태: 미개봉 / 개봉 / 취재 사용
//   메모: 마시로가 붙여 둔 연구 메모(30자 안팎)
// NEW 물건은 맨 위로 올라가고 반짝인다. 물건을 누르면 아래 설명 칸에 메모가 뜬다.

function MashiroStash(props = {}) {
  const {
    items = [
      "토끼귀 머리띠|코스튬|1|미개봉|움직이면 귀가 흔들린다. 자료용…|new",
      "핑크 털 수갑|구속|2|개봉|안쪽 털이 부드러움. 손목 자국 안 남음 확인",
      "미니 로터 '퐁퐁'|장난감|3|취재 사용|진동 7단계. 3단계부터 소리 남",
      "러브젤 (복숭아향)|소모품|4|개봉|향이 생각보다 진하다. 작업실 환기 필수"
    ]
  } = props;

  const c = MZ_C;
  const list = (Array.isArray(items) ? items : [])
    .filter(Boolean)
    .map((line, i) => {
      const p = String(line).split("|").map((x) => x.trim());
      const isNew = p.slice(5).some((x) => x.toLowerCase() === "new") || p[4] === "new";
      return {
        name: p[0] || "???",
        cat: MZ_CAT[p[1]] ? p[1] : "기타",
        count: p[2] || "1",
        state: p[3] && p[3] !== "new" ? p[3] : "미개봉",
        memo: p[4] && p[4] !== "new" ? p[4] : "",
        isNew,
        order: i
      };
    })
    .sort((a, b) => (a.isNew === b.isNew ? a.order - b.order : a.isNew ? -1 : 1));

  const cats = ["전체"].concat(Object.keys(MZ_CAT).filter((k) => list.some((x) => x.cat === k)));
  const [tab, setTab] = useState("전체");
  const [sel, setSel] = useState(0);
  const shown = tab === "전체" ? list : list.filter((x) => x.cat === tab);
  const cur = shown[Math.min(sel, shown.length - 1)] || null;
  const newCount = list.filter((x) => x.isNew).length;

  return (
    <div style={{ width: "100%", maxWidth: 380, margin: "10px auto", fontFamily: MZ_FONT, color: c.ink }}>
      <style>{MZ_CSS}</style>
      <div className="mz-win" style={{ background: c.body, border: "3px solid " + c.ink, borderRadius: 6, boxShadow: "4px 4px 0 " + c.shadow, overflow: "hidden" }}>
        {/* 제목줄 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: c.title, borderBottom: "3px solid " + c.ink, padding: "6px 10px" }}>
          <span style={{ fontSize: 16 }} aria-hidden="true">🗝️</span>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
            <div className="mz-dot" style={{ fontSize: 15, color: "#fff", textShadow: MZ_OL }}>マユマロ資料庫</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.ink }}>작업실 잠금 수납장</div>
          </div>
          <span className="mz-dot" style={{ fontSize: 12, background: "#fff", border: "2px solid " + c.ink, padding: "0 6px", whiteSpace: "nowrap" }}>
            {list.length}종{newCount ? <b style={{ color: c.newc, marginLeft: 5 }}>NEW {newCount}</b> : null}
          </span>
        </div>

        {/* 분류 탭 */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", padding: "8px 8px 2px" }}>
          {cats.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => { setTab(k); setSel(0); }}
              aria-pressed={tab === k}
              style={{ border: "2px solid " + c.ink, background: tab === k ? c.ink : "#fff", color: tab === k ? "#fff" : c.ink, fontSize: 11.5, fontWeight: 700, padding: "1px 7px", cursor: "pointer", fontFamily: "inherit", borderRadius: 3 }}
            >
              {k === "전체" ? "전체" : MZ_CAT[k].icon + " " + k}
            </button>
          ))}
        </div>

        {/* 목록 */}
        <ul style={{ listStyle: "none", margin: 0, padding: "6px 8px", maxHeight: 372, overflowY: "auto" }}>
          {shown.map((it, i) => {
            const on = cur === it;
            const cat = MZ_CAT[it.cat];
            return (
              <li key={it.name + i}>
                <button
                  type="button"
                  onClick={() => setSel(i)}
                  aria-pressed={on}
                  className={"mz-row" + (it.isNew ? " mz-new" : "")}
                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", border: "2px solid " + (on ? c.ink : "transparent"), background: on ? "#fff" : "transparent", padding: "4px 6px", margin: "2px 0", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", color: c.ink, animationDelay: i * 0.06 + "s" }}
                >
                  <span style={{ width: 10, flex: "none", display: "flex", alignItems: "center" }}>{on ? <MzArrow color={c.newc} /> : null}</span>
                  <span style={{ width: 30, height: 30, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: cat.bg, border: "2px solid " + c.ink, borderRadius: 4, fontSize: 16 }}>{cat.icon}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</span>
                      {it.isNew ? <span className="mz-badge mz-dot">NEW!</span> : null}
                    </span>
                    <span style={{ fontSize: 11, color: c.sub }}>{it.cat}</span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flex: "none" }}>
                    <span className="mz-dot" style={{ fontSize: 14 }}>×{it.count}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "0 5px", borderRadius: 3, background: (MZ_STATE[it.state] || MZ_STATE["개봉"]).bg, color: (MZ_STATE[it.state] || MZ_STATE["개봉"]).fg }}>{it.state}</span>
                  </span>
                </button>
              </li>
            );
          })}
          {shown.length === 0 ? <li style={{ fontSize: 13, color: c.sub, padding: 8 }}>비어 있어요.</li> : null}
        </ul>

        {/* 설명 칸 */}
        <div style={{ margin: "0 8px 8px", background: c.box, color: "#fff", border: "3px solid " + c.ink, borderRadius: 4, padding: "8px 10px", minHeight: 62, boxShadow: "inset 0 0 0 2px #fff" }}>
          {cur ? (
            <>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 2 }}>
                {MZ_CAT[cur.cat].icon} {cur.name} · ×{cur.count} · {cur.state}
              </div>
              <div key={cur.name} className="mz-type" style={{ fontSize: 14, lineHeight: 1.5 }}>
                ✎ {cur.memo || "메모 없음."}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13 }}>…</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────── 보조 요소 ───────── */

const MZ_FONT = '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans JP", sans-serif';

const MZ_C = {
  ink: "#2b2420",
  body: "#fff6e9",
  title: "#ff9fbe",
  shadow: "#d9688e",
  sub: "#7a6d66",
  box: "#3b3550",
  newc: "#e2457a"
};

const MZ_OL = "1.5px 0 #2b2420,-1.5px 0 #2b2420,0 1.5px #2b2420,0 -1.5px #2b2420,1.5px 1.5px #2b2420,-1.5px -1.5px #2b2420";

/* 분류별 아이콘과 칸 색 */
const MZ_CAT = {
  장난감: { icon: "💗", bg: "#ffd6e2" },
  구속: { icon: "⛓️", bg: "#dcd6f7" },
  코스튬: { icon: "🎀", bg: "#ffe3c7" },
  소모품: { icon: "🧴", bg: "#d4f0e8" },
  마사지: { icon: "🪶", bg: "#e8f1c9" },
  기타: { icon: "📦", bg: "#e6e1dc" }
};

const MZ_STATE = {
  미개봉: { bg: "#e9e4de", fg: "#5d534c" },
  개봉: { bg: "#cfe6f7", fg: "#245a80" },
  "취재 사용": { bg: "#ffd1dc", fg: "#a82d55" }
};

const MZ_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DotGothic16&family=Noto+Sans+KR:wght@400;700&display=swap');
.mz-dot { font-family: "DotGothic16", "Noto Sans JP", monospace; }
@keyframes mz-open { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: none; } }
@keyframes mz-in { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
@keyframes mz-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(226,69,122,0); } 50% { box-shadow: 0 0 0 3px rgba(226,69,122,.28); } }
@keyframes mz-blink { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
@keyframes mz-type { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
.mz-win { animation: mz-open .3s ease-out both; }
.mz-row { animation: mz-in .3s ease-out both; }
.mz-new { background: linear-gradient(90deg, rgba(255,214,226,.75), rgba(255,255,255,0)) !important; animation: mz-in .3s ease-out both, mz-glow 1.6s ease-in-out .4s infinite; }
.mz-badge { font-size: 10.5px; color: #fff; background: #e2457a; border: 1.5px solid #2b2420; padding: 0 4px; line-height: 15px; flex: none; animation: mz-blink 1s steps(2) infinite; }
.mz-type { animation: mz-type .5s steps(18) both; }
@keyframes mz-nudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(2px); } }
.mz-cur { animation: mz-nudge .8s steps(2) infinite; }
@media (prefers-reduced-motion: reduce) { .mz-win, .mz-row, .mz-new, .mz-badge, .mz-type, .mz-cur { animation: none; } }
`;

/* 선택 커서: 도트 화살표 (글자 ▶는 아이폰에서 파란 이모지로 바뀌어서 직접 그린다) */
function MzArrow({ color }) {
  return (
    <svg viewBox="0 0 5 7" width="10" height="14" aria-hidden="true" shapeRendering="crispEdges" className="mz-cur" style={{ display: "block" }}>
      <path d="M0 0h1v7H0zM1 1h1v5H1zM2 2h1v3H2zM3 3h1v1H3z" fill={color} />
    </svg>
  );
}
