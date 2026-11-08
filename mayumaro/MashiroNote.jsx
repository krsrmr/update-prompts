// 필요 훅: useState (react)
// [노트] 명령어 전용. 마시로의 네타 노트(ネタ帳)를 몰래 펼쳐 보는 화면. 마시로는 {{user}}가 본 사실을 모른다.
// ideas: 다음에 쓸 소재 2~4개 "제목|한 줄 설명", 가장 쓰고 싶은 하나는 끝에 "|★"
// mono: 혼잣말·독백 2~4줄 / crossed: 썼다가 줄로 그어 지운 한 줄
// sticky: 포스트잇 한 줄 / secret: 포스트잇 밑에 숨긴 한 줄(포스트잇을 누르면 들춰진다)
// doodle: 구석의 낙서(카오모지 한 개)

function MashiroNote(props = {}) {
  const {
    date = "11/9",
    ideas = [
      "우산 속 어깨|비 오는 날 한 우산. 젖는 쪽 어깨를 일부러 내준다|★",
      "도서관 높은 칸|책 꺼내 주다가 등 뒤에 갇히는 구도",
      "손 크기 재기|손바닥 맞대기 → 손가락 깍지까지 몇 초?"
    ],
    mono = [
      "콘티는 나오는데 표정이 안 그려진다",
      "그분이 웃을 때 눈꼬리 각도… 직접 봐야 아는데",
      "자료다. 이건 자료. 자료니까."
    ],
    crossed = "다음 취재 때 손 잡아 달라고 하기",
    sticky = "마감 D-3!! 밥 먹기",
    secret = "그분 이름 쓰는 연습 10번 했다",
    doodle = "(つ﹏⊂)"
  } = props;

  const [peel, setPeel] = useState(false);
  const c = MN_COLORS;
  const ideaList = (Array.isArray(ideas) ? ideas : []).filter(Boolean).map((line) => {
    const p = String(line).split("|");
    const star = p.some((x, i) => i > 0 && x.trim() === "★");
    return { title: (p[0] || "").trim(), desc: p[1] && p[1].trim() !== "★" ? p[1].trim() : "", star };
  });
  const monoList = (Array.isArray(mono) ? mono : []).filter(Boolean).map(String);

  return (
    <div style={{ width: "100%", maxWidth: 380, margin: "10px auto", padding: "6px 6px 14px" }}>
      <style>{MN_CSS}</style>
      <div className="mn-book" style={{ position: "relative", background: c.cover, borderRadius: 10, padding: "16px 10px 12px 10px", boxShadow: "0 12px 26px -14px rgba(60,40,30,.6)" }}>
        {/* 스프링 */}
        <div style={{ position: "absolute", top: 4, left: 18, right: 18, display: "flex", justifyContent: "space-between" }} aria-hidden="true">
          {Array.from({ length: 11 }).map((_, i) => (
            <span key={i} style={{ width: 9, height: 18, borderRadius: 6, border: "2px solid #8d8f96", background: "linear-gradient(#f4f4f6,#b9bcc4)" }} />
          ))}
        </div>

        {/* 종이 */}
        <div
          className="mn-paper"
          style={{
            position: "relative",
            background: "repeating-linear-gradient(" + c.paper + " 0 27px," + c.rule + " 27px 28px)",
            backgroundPosition: "0 6px",
            borderRadius: 4,
            padding: "14px 14px 16px 30px",
            color: c.ink,
            lineHeight: "28px",
            minHeight: 300,
            overflow: "hidden",
            wordBreak: "keep-all",
            overflowWrap: "anywhere"
          }}
        >
          <span style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 2, background: c.margin }} aria-hidden="true" />

          {/* 몰래 보는 중 */}
          <span className="mn-peek" style={{ position: "absolute", right: 8, bottom: 8, fontFamily: MN_SANS, fontSize: 10.5, fontWeight: 700, color: "#fff", background: "rgba(40,30,30,.5)", borderRadius: 999, padding: "1px 8px", lineHeight: "18px" }}>
            👀 몰래 보는 중
          </span>

          {/* 포스트잇 */}
          <button
            type="button"
            onClick={() => setPeel(!peel)}
            aria-pressed={peel}
            aria-label="포스트잇 들추기"
            className={"mn-sticky" + (peel ? " mn-peeled" : "")}
            style={{ position: "absolute", right: 10, top: 10, width: 112, minHeight: 74, border: 0, padding: "8px 8px 10px", background: c.sticky, color: "#5b3a3a", fontFamily: MN_HAND, fontSize: 16, lineHeight: 1.25, textAlign: "left", cursor: "pointer", boxShadow: "2px 4px 8px -3px rgba(0,0,0,.35)", zIndex: 2 }}
          >
            {String(sticky || "")}
          </button>
          {secret ? (
            <div style={{ position: "absolute", right: 14, top: 18, width: 104, fontFamily: MN_HAND, fontSize: 15, lineHeight: 1.25, color: "#b0475f", zIndex: 1 }}>
              {String(secret)}
            </div>
          ) : null}

          {/* 머리 */}
          <div style={{ fontFamily: MN_JA, fontWeight: 600, fontSize: 18, paddingRight: 118 }}>
            ネタ帳 <span style={{ fontFamily: MN_HAND, fontSize: 17, color: c.pencil, fontWeight: 400 }}>{String(date)}</span>
          </div>

          {/* 다음 소재 */}
          <div style={{ fontFamily: MN_JA, fontSize: 14, color: c.red, fontWeight: 600, paddingRight: 118 }}>次のネタ ✎</div>
          <div style={{ marginTop: 0 }}>
            {ideaList.map((it, i) => (
              <div key={i} className="mn-line" style={{ fontFamily: MN_HAND, fontSize: 18, animationDelay: 0.25 + i * 0.12 + "s", paddingRight: i === 0 ? 112 : 0 }}>
                <span style={{ color: c.pencil }}>{i + 1}. </span>
                <span className={it.star ? "mn-hl" : ""} style={{ fontWeight: 700 }}>{it.title}</span>
                {it.star ? <span style={{ color: c.red, marginLeft: 4 }}>★</span> : null}
                {it.desc ? <span style={{ color: c.sub }}> — {it.desc}</span> : null}
              </div>
            ))}
          </div>

          {/* 혼잣말 */}
          <div style={{ fontFamily: MN_JA, fontSize: 14, color: c.blue, fontWeight: 600, marginTop: 28 }}>ひとりごと</div>
          {monoList.map((t, i) => (
            <div key={i} className="mn-line" style={{ fontFamily: MN_HAND, fontSize: 18, color: c.ink, animationDelay: 0.6 + i * 0.12 + "s", transform: "rotate(" + (i % 2 ? 0.4 : -0.3) + "deg)" }}>
              {t}
            </div>
          ))}
          {crossed ? (
            <div className="mn-line" style={{ fontFamily: MN_HAND, fontSize: 18, color: c.pencil, animationDelay: 0.6 + monoList.length * 0.12 + "s" }}>
              <span className="mn-strike">{String(crossed)}</span>
            </div>
          ) : null}

          {/* 낙서 */}
          {doodle ? (
            <div style={{ textAlign: "right", fontSize: 17, color: c.pencil, marginTop: 4, paddingRight: 90, transform: "rotate(-4deg)" }}>{String(doodle)}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ───────── 보조 요소 ───────── */

const MN_HAND = '"Gaegu", "Nanum Pen Script", "Klee One", cursive';
const MN_JA = '"Klee One", "Zen Maru Gothic", "Noto Sans JP", sans-serif';
const MN_SANS = '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

const MN_COLORS = {
  cover: "#8fa3c0",
  paper: "#fffdf7",
  rule: "#dfe7f2",
  margin: "#f0a8a8",
  ink: "#2e2b33",
  sub: "#5d5866",
  pencil: "#8a8590",
  red: "#d65a6f",
  blue: "#4f7fb5",
  sticky: "#ffd6e2"
};

const MN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Klee+One:wght@400;600&display=swap');
@keyframes mn-open { from { opacity: 0; transform: translateY(14px) rotate(-1.2deg); } to { opacity: 1; transform: none; } }
@keyframes mn-write { from { opacity: 0; clip-path: inset(0 100% 0 0); } to { opacity: 1; clip-path: inset(0 0 0 0); } }
@keyframes mn-blink { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }
.mn-book { animation: mn-open .5s ease-out both; }
.mn-line { animation: mn-write .6s ease-out both; }
.mn-peek { animation: mn-blink 2.4s ease-in-out infinite; }
.mn-hl { background: linear-gradient(transparent 55%, #fff07a 55%, #fff07a 92%, transparent 92%); padding: 0 2px; }
.mn-strike { background: linear-gradient(transparent 46%, #6a6570 46%, #6a6570 54%, transparent 54%); }
.mn-sticky { transform: rotate(3deg); transform-origin: top center; transition: transform .35s ease, opacity .35s ease; }
.mn-sticky.mn-peeled { transform: rotate(-8deg) translate(-40px, -6px) rotateX(55deg); opacity: .35; }
@media (prefers-reduced-motion: reduce) { .mn-book, .mn-line, .mn-peek { animation: none; } .mn-sticky { transition: none; } }
`;
