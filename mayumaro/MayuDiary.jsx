// 필요 훅: useState (react)
// [비계] 명령어 전용. 마유마로의 비공개 사담계(@mayumaro_diary) 프로필과 최근 글 목록을 몰래 들여다보는 화면.
// 마시로는 {{user}}가 이 화면을 본 사실을 모른다.
// posts 한 줄 = 글 하나, 최신 글이 위: "시간|日本語|한국어|좋아요"  예) "3分|…|…|4"
// 시간은 "3分", "2時間", "昨日", "11月3日"처럼. 좋아요는 1~99.

function MayuDiary(props = {}) {
  const {
    clock = "23:41",
    following = 38,
    followers = 12,
    posts = [
      "3分|あの人のこと考えてたら、ペン入れ1ページも進まなかった|그분 생각하다가 펜선 한 페이지도 못 나갔다|2",
      "2時間|コンビニの新作プリン、ふたつ買っちゃった。ひとつは…いや、なんでもない🍮|편의점 신상 푸딩 두 개 사버렸다. 하나는… 아니, 아무것도 아님🍮|7",
      "昨日|締め切り3日前なのに、クロッキー帳ばっかり埋まっていく…原稿は…?|마감 3일 전인데 크로키북만 채우고 있다… 원고는…?|11"
    ]
  } = props;

  const [hideKo, setHideKo] = useState(false);
  const [liked, setLiked] = useState({});
  const c = MD_COLORS;
  const list = (Array.isArray(posts) ? posts : []).filter(Boolean).map((line) => {
    const p = String(line).split("|");
    return { time: p[0] || "", ja: p[1] || "", ko: p[2] || "", likes: mdNum(p[3]) };
  });

  return (
    <div style={{ width: "100%", maxWidth: 340, margin: "8px auto", fontFamily: MD_FONT, padding: "8px 8px 18px", overflow: "hidden" }}>
      <style>{MD_CSS}</style>
      <div className="md-phone" style={{ position: "relative", background: "#1b1c20", borderRadius: 44, padding: 10, boxShadow: "0 18px 40px -16px rgba(0,0,0,.55), inset 0 0 0 2px #3a3c43" }}>
        <div style={{ position: "relative", background: c.bg, borderRadius: 34, overflow: "hidden", color: c.ink }}>
          <div style={{ position: "absolute", top: 9, left: "50%", width: 86, height: 24, marginLeft: -43, borderRadius: 14, background: "#0c0c0e", zIndex: 2 }} />
          {/* 상태 표시줄 */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px 6px", fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            <span>{String(clock)}</span>
            <MdStatusIcons color={c.ink} />
          </div>

          {/* 배너 + 몰래 보는 중 표시 */}
          <div style={{ position: "relative", height: 74, background: "linear-gradient(135deg,#c9d3e6 0%,#e7dcef 55%,#f6d9e3 100%)" }}>
            <span className="md-peek" style={{ position: "absolute", right: 10, top: 8, fontSize: 11, fontWeight: 700, color: "#fff", background: "rgba(30,30,40,.55)", borderRadius: 999, padding: "3px 9px" }}>
              👀 몰래 보는 중
            </span>
            <span style={{ position: "absolute", left: 14, bottom: -26, borderRadius: "50%", border: "3px solid " + c.bg, background: c.bg, display: "flex" }}>
              <MdAvatar size={58} />
            </span>
          </div>

          {/* 프로필 */}
          <div style={{ padding: "32px 16px 10px", borderBottom: "1px solid " + c.line }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 17 }}>まゆまろ｜日常</span>
              <MdLock color={c.ink} />
            </div>
            <div style={{ color: c.muted, fontSize: 14 }}>@mayumaro_diary</div>
            <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.55 }}>ひとりごと置き場。作品の話はしません🫧</p>
            <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 13, color: c.muted }}>
              <span><b style={{ color: c.ink }}>{mdNum(following)}</b> フォロー中</span>
              <span><b style={{ color: c.ink }}>{mdNum(followers)}</b> フォロワー</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
              <span style={{ display: "flex", gap: 16, fontSize: 14, fontWeight: 700 }}>
                <span style={{ borderBottom: "3px solid " + c.link, paddingBottom: 4 }}>ポスト</span>
                <span style={{ color: c.muted, fontWeight: 500 }}>いいね</span>
              </span>
              <button
                type="button"
                onClick={() => setHideKo(!hideKo)}
                aria-pressed={!hideKo}
                style={{ border: 0, background: "none", color: c.link, fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit" }}
              >
                {hideKo ? "번역 보기" : "번역 숨기기"}
              </button>
            </div>
          </div>

          {/* 글 목록 */}
          {list.map((p, i) => (
            <div key={i} className="md-post" style={{ display: "flex", gap: 10, padding: "12px 14px", borderBottom: "1px solid " + c.line, animationDelay: 0.9 + i * 0.15 + "s" }}>
              <MdAvatar size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", fontSize: 13.5, lineHeight: 1.3 }}>
                  <b>まゆまろ｜日常</b>
                  <MdLock color={c.ink} />
                  <span style={{ color: c.muted }}>· {p.time}</span>
                </div>
                <p lang="ja" style={{ margin: "4px 0 0", fontSize: 14.5, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{p.ja}</p>
                {p.ko && !hideKo ? (
                  <p lang="ko" style={{ margin: "5px 0 0", padding: "5px 8px", background: "#f4f5f7", borderRadius: 8, fontSize: 13, lineHeight: 1.55, color: c.sub, whiteSpace: "pre-wrap", wordBreak: "keep-all" }}>{p.ko}</p>
                ) : null}
                <div style={{ display: "flex", gap: 22, marginTop: 7, fontSize: 12.5, color: c.muted }}>
                  <MdIcon d={MD_ICON.reply} color={c.muted} />
                  <span title="비공개 계정의 글은 리포스트할 수 없어요"><MdIcon d={MD_ICON.repost} color={c.faint} /></span>
                  <button
                    type="button"
                    onClick={() => setLiked(Object.assign({}, liked, { [i]: !liked[i] }))}
                    aria-pressed={!!liked[i]}
                    aria-label="좋아요"
                    style={{ display: "flex", alignItems: "center", gap: 5, border: 0, background: "none", padding: 0, cursor: "pointer", color: liked[i] ? c.like : c.muted, fontSize: 12.5, fontFamily: "inherit" }}
                  >
                    <MdIcon d={MD_ICON.heart} color={liked[i] ? c.like : c.muted} fill={!!liked[i]} />
                    {p.likes + (liked[i] ? 1 : 0)}
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div style={{ padding: "8px 14px 8px" }}>
            <div style={{ width: 110, height: 4, borderRadius: 4, background: "#16181c", margin: "6px auto 2px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── 보조 요소 ───────── */

const MD_CSS = `
@keyframes md-rise { from { transform: translateY(40px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes md-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes md-blink { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }
.md-phone { animation: md-rise .6s cubic-bezier(.2,.9,.25,1) both; }
.md-post { animation: md-fade .4s ease-out both; }
.md-peek { animation: md-blink 2.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .md-phone, .md-post, .md-peek { animation: none; } }
`;

const MD_FONT =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';

const MD_COLORS = {
  bg: "#ffffff",
  ink: "#16181c",
  muted: "#5f6873",
  sub: "#454c55",
  faint: "#c3c8ce",
  line: "#e3e6ea",
  link: "#2f7fd8",
  like: "#e2457a"
};

const MD_ICON = {
  reply: "M4 5h16v10H9l-5 4z",
  repost: "M7 7h9l-2-2M17 17H8l2 2M7 7v6M17 17v-6",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
};

function mdNum(v) {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

function MdIcon({ d, color, fill }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style={{ flex: "none", display: "block" }}>
      <path d={d} fill={fill ? color : "none"} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MdLock({ color }) {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-label="비공개 계정" style={{ flex: "none" }}>
      <path d="M7 10V7a5 5 0 0 1 10 0v3h1.5v11h-13V10zm2 0h6V7a3 3 0 0 0-6 0z" fill={color} />
    </svg>
  );
}

/* 사담계 프로필 사진: 졸린 마시멜로 (MayuPost의 사담계 아이콘과 같은 그림) */
function MdAvatar({ size }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" style={{ flex: "none", borderRadius: "50%", display: "block" }}>
      <circle cx="20" cy="20" r="20" fill="#c9d3e6" />
      <rect x="9" y="12" width="22" height="17" rx="7" fill="#ffffff" stroke="#e8dde3" strokeWidth="1" />
      <g stroke="#5a5560" strokeWidth="1.4" strokeLinecap="round" fill="none">
        <path d="M14.5 20.5h3" />
        <path d="M22.5 20.5h3" />
      </g>
      <circle cx="13.5" cy="23" r="1.6" fill="#f3a9bd" opacity=".8" />
      <circle cx="26.5" cy="23" r="1.6" fill="#f3a9bd" opacity=".8" />
      <path d="M18.5 23.5c1 .8 2 .8 3 0" stroke="#5a5560" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function MdStatusIcons({ color }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5 }} aria-hidden="true">
      <svg viewBox="0 0 18 12" width="17" height="11">
        <rect x="0" y="8" width="3" height="4" rx="1" fill={color} />
        <rect x="5" y="5" width="3" height="7" rx="1" fill={color} />
        <rect x="10" y="2.5" width="3" height="9.5" rx="1" fill={color} />
        <rect x="15" y="0" width="3" height="12" rx="1" fill={color} />
      </svg>
      <svg viewBox="0 0 27 13" width="25" height="12">
        <rect x=".5" y=".5" width="22" height="12" rx="3.5" fill="none" stroke={color} opacity=".45" />
        <rect x="2.5" y="2.5" width="9" height="8" rx="2" fill={color} />
        <rect x="24" y="4.5" width="2" height="4" rx="1" fill={color} opacity=".45" />
      </svg>
    </span>
  );
}
