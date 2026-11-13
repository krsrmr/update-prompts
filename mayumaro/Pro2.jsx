// 필요 훅: useState (react)
// 마유마로 첫인사 프롤로그 2 (인트로 2 [世界は恋に落ちている] 전용)
// 처음엔 정기권 케이스 속 IC 카드 앞면. '카드 뒤집기'를 누르면 카드 뒷면(이용 안내)에 프롤로그가 적혀 있다.
// 글은 맨 아래 M2_BLOCKS에 있다. t:"n" 서술, t:"d" 대사(who 화자, ja 일본어, ko 한국어).
// 펼친 채로 시작하려면 <Pro2 defaultOpen={true} />

function Pro2(props = {}) {
  const { defaultOpen = false } = props;
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <div className="m2-root">
      <style>{M2_CSS}</style>
      {open ? m2Page(() => setOpen(false)) : m2Cover(() => setOpen(true))}
    </div>
  );
}

/* ---------- 접힌 상태: 정기권 케이스 속 카드 앞면 ---------- */
function m2Cover(onOpen) {
  return (
    <div className="m2-cover">
      <div className="m2-case-stitch" aria-hidden="true" />
      <div className="m2-case-strap" aria-hidden="true" />

      <div className="m2-window">
        <div className="m2-card">
          <svg className="m2-card-wave" viewBox="0 0 320 120" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 0 H320 V78 C280 98 248 64 206 80 C164 96 132 112 92 96 C60 84 30 94 0 108 Z" fill="#37b5d3" />
            <path d="M0 116 C30 102 60 92 92 104 C132 120 164 104 206 88 C248 72 280 106 320 86" fill="none" stroke="#86c440" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <div className="m2-card-top">
            <div className="m2-card-brand">
              <div className="m2-card-logo-row">
                <span className="m2-card-logo">NORECA</span>
                <span className="m2-card-ic" aria-hidden="true">{m2Waves()}</span>
              </div>
              <span className="m2-card-kana" lang="ja">ノレカ 定期券</span>
            </div>
          </div>
          <div className="m2-card-critter" aria-hidden="true">{m2Critter(50)}</div>

          <div className="m2-teiki">
            <div className="m2-teiki-row">
              <span className="m2-printed">区間</span>
              <span className="m2-print" lang="ja">天王寺 ⇔ 梅田</span>
              <span className="m2-gloss">덴노지 ⇔ 우메다</span>
            </div>
            <div className="m2-teiki-row">
              <span className="m2-printed">有効</span>
              <span className="m2-print m2-expired" lang="ja">26.04.08 まで</span>
              <span className="m2-hand m2-uh" lang="ja">あれ…?</span>
            </div>
            <div className="m2-teiki-row m2-teiki-last">
              <span className="m2-printed">氏名</span>
              <span className="m2-print" lang="ja">マツユカワ マシロ 様</span>
            </div>
          </div>
        </div>
        <div className="m2-glare" aria-hidden="true" />
      </div>

      <div className="m2-sticker" aria-hidden="true">
        <span>프롤로그</span>
      </div>

      <button type="button" className="m2-btn m2-btn-open" onClick={onOpen} aria-expanded="false">
        {m2FlipIcon()}
        <span>카드 뒤집기</span>
      </button>
    </div>
  );
}

/* ---------- 펼친 상태: 카드 뒷면 이용 안내 ---------- */
function m2Page(onClose) {
  return (
    <div className="m2-open">
      <div className="m2-band">
        <span className="m2-band-title" lang="ja">NORECA ご利用案内</span>
        <button type="button" className="m2-btn m2-btn-small" onClick={onClose} aria-expanded="true">
          앞면 보기
        </button>
      </div>

      <div className="m2-paper">
        <div className="m2-marks" aria-hidden="true"><span /><span /></div>

        <div className="m2-head">
          <div className="m2-meta">
            <span className="m2-printed">No.</span>
            <span className="m2-hand m2-meta-val">0409</span>
            <span className="m2-printed">区間</span>
            <span className="m2-hand m2-meta-val" lang="ja">天王寺⇔梅田</span>
          </div>
          <div className="m2-critter m2-critter-page" aria-hidden="true">{m2Critter(46)}</div>
        </div>

        <div className="m2-title-row">
          <h3 className="m2-title"><span>프롤로그</span></h3>
          <div className="m2-postit" aria-hidden="true">
            <span className="m2-postit-ja" lang="ja">〆切まで<br />あと10日</span>
            <span className="m2-postit-ko">마감까지 10일</span>
          </div>
        </div>

        {m2WobbleDefs()}
        <div className="m2-lines">
          {M2_BLOCKS.map((b, i) =>
            b.t === "d" ? m2Balloon(b, i) : b.t === "profile" ? m2Profile(i) : (
              <p className="m2-blk m2-n" key={i}>{m2Rich(b.text)}</p>
            )
          )}
        </div>

        <div className="m2-foot">
          <div className="m2-cont">
            <span className="m2-spark m2-spark-a" aria-hidden="true">✦</span>
            <span className="m2-spark m2-spark-b" aria-hidden="true">✦</span>
            <div className="m2-cont-critter" aria-hidden="true">{m2Critter(44)}</div>
            <div className="m2-ribbon">
              <span className="m2-serial" aria-hidden="true">MS 0409 2026</span>
              <span className="m2-ribbon-ja" lang="ja">つづく</span>
            </div>
          </div>
          <div className="m2-cont-ko">아래에서 계속!</div>
          <div className="m2-cont-arrow" aria-hidden="true">{m2DownArrow()}</div>
        </div>
      </div>

      <button type="button" className="m2-btn m2-btn-close" onClick={onClose} aria-expanded="true">
        앞면 보기
      </button>
    </div>
  );
}

/* 카드의 비접촉 표시(물결 세 줄) */
function m2Waves() {
  const s = { fill: "none", stroke: "#ffffff", strokeWidth: 2.2, strokeLinecap: "round" };
  return (
    <svg width="26" height="26" viewBox="0 0 26 26">
      <path d="M8 7 Q12 13 8 19" {...s} />
      <path d="M13 4 Q19 13 13 22" {...s} />
      <path d="M18 1.5 Q26 13 18 24.5" {...s} />
    </svg>
  );
}

/* 카드 뒤집기 아이콘 */
function m2FlipIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="6" width="17" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 10h17" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 3.2 L12 1.5 L16 3.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* 만화 말풍선
   학생: 속삭임 점선 풍선 / 교수: 각진 풍선 / 마시로: 떨리는 선 풍선(오른쪽) */
const M2_SIDE = { "남학생": "left", "여학생": "right", "교수": "left", "마시로": "right" };
const M2_KIND = { "남학생": "whisper", "여학생": "whisper", "교수": "box", "마시로": "shaky" };

function m2Balloon(b, i) {
  const side = M2_SIDE[b.who] || "left";
  const kind = M2_KIND[b.who] || "box";
  return (
    <div className={"m2-blk m2-bal-row m2-" + side} key={i}>
      <span className={"m2-who m2-who-" + kind}>{b.who}</span>
      <div className={"m2-bal m2-bal-" + kind}>
        <div className="m2-bal-shape" aria-hidden="true" />
        <svg className="m2-tail" width="26" height="20" viewBox="0 0 26 20" aria-hidden="true">
          <path d="M3 0 C7 7 6 13 2 19 C11 14 17 8 22 0" />
        </svg>
        <div className="m2-bal-text">
          <div className="m2-ja" lang="ja">{m2Mark(b.ja)}</div>
          <div className="m2-ko">{m2Mark(b.ko)}</div>
        </div>
        {b.sfx ? <span className="m2-sfx" lang="ja" aria-hidden="true">{b.sfx}</span> : null}
      </div>
    </div>
  );
}

/* 마시로 풍선의 떨리는 선 */
function m2WobbleDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <filter id="m2-wobble" x="-5%" y="-10%" width="110%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

/* 서술 한 문단: 줄바꿈(\n)은 줄을 나누고, **굵게**는 형광펜 강조 */
function m2Rich(text) {
  const lines = String(text).split("\n");
  const out = [];
  lines.forEach((line, li) => {
    if (li > 0) out.push(<br key={"br" + li} />);
    line.split(/\*\*(.+?)\*\*/).forEach((seg, si) => {
      if (!seg) return;
      out.push(
        si % 2 === 1 ? (
          <strong className="m2-em" key={li + "-" + si}>{m2Mark(seg)}</strong>
        ) : (
          <span key={li + "-" + si}>{m2Mark(seg)}</span>
        )
      );
    });
  });
  return out;
}

/* 루넬 작가 프로필 (짧게) */
function m2Profile(i) {
  return (
    <div className="m2-blk m2-prof-row" key={i}>
      <div className="m2-prof">
        <div className="m2-tape m2-tape-prof" aria-hidden="true" />
        <div className="m2-prof-bar">
          <span className="m2-moon" aria-hidden="true" />
          <span className="m2-logo">Lunelle</span>
          <span className="m2-prof-bar-sub" lang="ja">作家ページ</span>
        </div>
        <div className="m2-prof-body">
          <div className="m2-prof-avatar" aria-hidden="true">{m2Marshmallow()}</div>
          <div className="m2-prof-main">
            <div className="m2-prof-name">
              <span lang="ja">マユマロ</span>
              <span className="m2-prof-name-ko">마유마로</span>
            </div>
            <div className="m2-prof-badges">
              <span className="m2-badge m2-badge-fill" lang="ja">看板作家</span>
              <span className="m2-badge" lang="ja">R18</span>
            </div>
          </div>
          <span className="m2-prof-follow" lang="ja" aria-hidden="true">フォロー</span>
        </div>
        <p className="m2-prof-bio">
          <span lang="ja">ふわふわ甘くて、ちょっぴりえっちなお話を描いています🍡</span>
          <span className="m2-prof-bio-ko">폭신하고 달콤한, 살짝 야한 이야기를 그려요🍡</span>
        </p>
        <div className="m2-prof-stats">
          <span><b>8.6万</b> <span lang="ja">フォロワー</span></span>
          <span className="m2-prof-heart"><b>61万</b> <span lang="ja">いいね</span></span>
        </div>
      </div>
    </div>
  );
}

function m2Marshmallow() {
  return (
    <svg viewBox="0 0 40 40" width="52" height="52">
      <circle cx="20" cy="20" r="20" fill="#f6c9d6" />
      <rect x="9" y="12" width="22" height="17" rx="7" fill="#ffffff" />
      <circle cx="16" cy="20" r="1.4" fill="#5a5560" />
      <circle cx="24" cy="20" r="1.4" fill="#5a5560" />
      <path d="M18.5 23.5c1 .8 2 .8 3 0" stroke="#5a5560" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <ellipse cx="13.5" cy="23" rx="2" ry="1.2" fill="#f6b9c7" />
      <ellipse cx="26.5" cy="23" rx="2" ry="1.2" fill="#f6b9c7" />
    </svg>
  );
}

/* 교수가 잘못 부르는 성에 빨간 물결 밑줄 */
function m2Mark(text) {
  const parts = String(text).split(/(신바이우가와|シンバイウガワ)/);
  return parts.map((p, i) =>
    p === "신바이우가와" || p === "シンバイウガワ" ? (
      <span className="m2-mark" key={i}>{p}</span>
    ) : (
      p
    )
  );
}

/* 오리지널 마스코트 스티커: 둥근 흰 몸, 점 눈, 작은 귀, 분홍 볼 */
function m2Critter(size) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <circle cx="21" cy="17" r="7" fill="#fff" stroke="#b9bfcc" strokeWidth="1.6" />
      <circle cx="43" cy="17" r="7" fill="#fff" stroke="#b9bfcc" strokeWidth="1.6" />
      <circle cx="21" cy="17" r="3" fill="#f6cdd6" />
      <circle cx="43" cy="17" r="3" fill="#f6cdd6" />
      <ellipse cx="32" cy="37" rx="22" ry="19" fill="#fff" stroke="#b9bfcc" strokeWidth="1.6" />
      <circle cx="24.5" cy="35" r="2.1" fill="#3a3c45" />
      <circle cx="39.5" cy="35" r="2.1" fill="#3a3c45" />
      <ellipse cx="20" cy="41" rx="4" ry="2.4" fill="#f6b9c7" opacity="0.85" />
      <ellipse cx="44" cy="41" rx="4" ry="2.4" fill="#f6b9c7" opacity="0.85" />
      <path d="M29.5 40.5 Q32 43 34.5 40.5" fill="none" stroke="#3a3c45" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* 아래를 가리키는 손그림 화살표 */
function m2DownArrow() {
  const st = { fill: "none", stroke: "#1d84a3", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg width="34" height="34" viewBox="0 0 34 34">
      <path d="M8 6 L17 14 L26 6" {...st} />
      <path d="M8 17 L17 25 L26 17" {...st} opacity="0.55" />
    </svg>
  );
}

const M2_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Gowun+Dodum&family=Noto+Sans+KR:wght@700&family=Cormorant+Garamond:ital,wght@1,700&family=Klee+One:wght@400;600&family=Zen+Maru+Gothic:wght@500;700&display=swap');

.m2-root {
  --m2-leather-a: #3a4762;
  --m2-leather-b: #2a3449;
  --m2-aqua: #37b5d3;
  --m2-aqua-deep: #1d84a3;
  --m2-aqua-soft: #c4ebf5;
  --m2-lime: #86c440;
  --m2-lime-deep: #4d8a1c;
  --m2-card: #eceef1;
  --m2-paper: #eef0f3;
  --m2-paper-b: #e1e4e9;
  --m2-ink: #262730;
  --m2-ink-soft: #383a44;
  --m2-ja: #4f6a80;
  --m2-print: #7b8798;
  --m2-pink-deep: #b5486b;
  --m2-mx: 34px;
  width: 100%;
  max-width: 600px;
  margin: 10px auto;
  padding: 4px 2px 8px;
  box-sizing: border-box;
  font-family: "Gowun Dodum", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  color: var(--m2-ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.m2-root *, .m2-root *::before, .m2-root *::after { box-sizing: border-box; }

/* 공통 글꼴 */
.m2-hand { font-family: "Klee One", "Gaegu", "Zen Maru Gothic", sans-serif; font-weight: 600; color: #30323b; }
.m2-printed { font-family: "Zen Maru Gothic", sans-serif; font-weight: 500; font-size: 11px; color: var(--m2-print); letter-spacing: 0.04em; }

/* ---------- 정기권 케이스 ---------- */
.m2-cover {
  position: relative;
  max-width: 480px;
  margin: 0 auto;
  border-radius: 16px;
  padding: 20px 18px 18px;
  background:
    radial-gradient(circle at 20% 15%, rgba(255,255,255,0.08), transparent 55%),
    repeating-linear-gradient(35deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 4px),
    linear-gradient(160deg, var(--m2-leather-a), var(--m2-leather-b));
  box-shadow: 0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 16px rgba(20,30,50,0.28), 0 1px 3px rgba(20,30,50,0.22);
}
.m2-case-stitch {
  position: absolute; inset: 7px; border-radius: 11px;
  border: 1.6px dashed rgba(255,255,255,0.32);
  pointer-events: none;
}
.m2-case-strap {
  position: absolute; z-index: 1; top: 50%; right: -6px; width: 22px; height: 54px; margin-top: -27px;
  border-radius: 6px 0 0 6px;
  background: linear-gradient(90deg, #232c3e, #34405a);
  box-shadow: -1px 1px 3px rgba(0,0,0,0.25);
}

.m2-window {
  position: relative; z-index: 2;
  padding: 8px;
  border-radius: 12px;
  background: rgba(225,240,248,0.16);
  border: 1px solid rgba(255,255,255,0.28);
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12);
}
.m2-glare {
  position: absolute; inset: 8px; border-radius: 10px; pointer-events: none; z-index: 3;
  background: linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.32) 38%, rgba(255,255,255,0) 46%);
}

.m2-card {
  position: relative; overflow: hidden;
  aspect-ratio: 1.586 / 1;
  border-radius: 10px;
  background: var(--m2-card);
  box-shadow: 0 2px 4px rgba(10,20,40,0.25);
}
.m2-card-wave { position: absolute; left: 0; top: 0; width: 100%; height: 50%; display: block; }
.m2-card-top {
  position: relative; z-index: 1;
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 12px 14px 0 16px;
}
.m2-card-brand { display: flex; flex-direction: column; gap: 1px; }
.m2-card-logo {
  font-family: "Zen Maru Gothic", sans-serif; font-weight: 700; font-size: 28px; line-height: 1.05;
  letter-spacing: 0.08em; color: #fff;
  text-shadow: 0 1px 0 rgba(20,90,120,0.35);
}
.m2-card-kana { font-family: "Zen Maru Gothic", sans-serif; font-weight: 500; font-size: 11px; letter-spacing: 0.18em; color: rgba(255,255,255,0.92); }
.m2-card-logo-row { display: flex; align-items: center; gap: 8px; }
.m2-card-ic { line-height: 0; opacity: 0.95; }
.m2-card-critter {
  position: absolute; z-index: 2; right: 14px; top: 34%;
  line-height: 0; padding: 2px; background: #fff; border-radius: 50%;
  transform: rotate(8deg);
  box-shadow: 0 1px 3px rgba(20,40,60,0.25);
}
.m2-card-critter svg { display: block; }

.m2-teiki {
  position: absolute; left: 16px; right: 16px; bottom: 11px; z-index: 1;
}
.m2-teiki-row {
  display: flex; align-items: baseline; flex-wrap: wrap; column-gap: 8px;
  padding: 3px 0 2px;
  border-bottom: 1px dotted #b9c1cc;
}
.m2-teiki-last { border-bottom: 0; }
.m2-teiki .m2-printed { width: 24px; flex: 0 0 auto; }
.m2-print {
  font-family: "Zen Maru Gothic", "Hiragino Sans", sans-serif; font-weight: 700; font-size: 14px; line-height: 1.45;
  color: #2b2e36; letter-spacing: 0.06em; font-variant-numeric: tabular-nums;
}
.m2-gloss { font-size: 11.5px; color: #6a7080; }
.m2-expired {
  position: relative;
  padding: 0 5px;
}
.m2-expired::after {
  content: ""; position: absolute; left: -3px; right: -4px; top: -3px; bottom: -3px;
  border: 1.8px solid #e0566f; border-radius: 50%;
  transform: rotate(-4deg);
}
.m2-uh { font-size: 12px; color: #d9536d; transform: rotate(-6deg); display: inline-block; }

.m2-sticker {
  position: absolute; z-index: 4; top: -14px; right: 8px;
  width: 74px; height: 74px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at 35% 30%, #e9f7d6, var(--m2-lime) 75%);
  border: 3px solid #fff;
  box-shadow: 0 2px 5px rgba(30,50,20,0.28);
  transform: rotate(9deg);
}
.m2-sticker span { font-family: "Gaegu", sans-serif; font-weight: 700; font-size: 20px; color: #2f5410; letter-spacing: -0.03em; white-space: nowrap; }

.m2-critter { flex: 0 0 auto; line-height: 0; filter: drop-shadow(0 0 0 #fff) drop-shadow(0 2px 3px rgba(40,40,60,0.25)); }
.m2-critter svg { display: block; }

.m2-btn {
  font-family: inherit; cursor: pointer; border: 0;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  -webkit-tap-highlight-color: transparent;
}
.m2-btn:focus-visible { outline: 2.5px solid var(--m2-aqua-deep); outline-offset: 3px; }
.m2-btn-open {
  position: relative; z-index: 2;
  margin-top: 18px; width: 100%; min-height: 50px;
  border-radius: 10px;
  background: #f7f9fb; color: #24324a;
  font-size: 17px; letter-spacing: 0.02em;
  box-shadow: 0 2px 0 #1b2333, 0 4px 10px rgba(10,20,40,0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.m2-btn-open:hover { transform: translateY(-1px); box-shadow: 0 3px 0 #1b2333, 0 6px 14px rgba(10,20,40,0.28); }
.m2-btn-open:active { transform: translateY(1px); box-shadow: 0 1px 0 #1b2333, 0 2px 6px rgba(10,20,40,0.22); }

/* ---------- 카드 뒷면 ---------- */
.m2-open { animation: m2Flip 0.5s cubic-bezier(0.2, 0.75, 0.25, 1) both; transform-origin: center top; }
@keyframes m2Flip {
  from { opacity: 0; transform: perspective(900px) rotateY(-14deg) translateY(-6px); }
  to { opacity: 1; transform: none; }
}

.m2-band {
  position: relative; z-index: 2;
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  min-height: 46px; padding: 6px 10px 6px 16px;
  border-radius: 12px 12px 0 0;
  background:
    repeating-linear-gradient(35deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 4px),
    linear-gradient(160deg, var(--m2-leather-a), var(--m2-leather-b));
  box-shadow: 0 2px 4px rgba(20,30,50,0.22);
}
.m2-band-title { font-family: "Zen Maru Gothic", sans-serif; font-weight: 700; font-size: 16px; letter-spacing: 0.06em; color: #fff; text-shadow: 0 1px 2px rgba(10,20,40,0.35); }
.m2-btn-small {
  min-height: 34px; padding: 0 14px; border-radius: 999px;
  background: rgba(247,249,251,0.96); color: #24324a; font-size: 14px;
  box-shadow: 0 1px 2px rgba(10,20,40,0.25);
}

.m2-paper {
  position: relative; overflow: hidden;
  background:
    linear-gradient(100deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0) 70%),
    linear-gradient(180deg, var(--m2-paper), var(--m2-paper-b));
  border-radius: 0 0 12px 12px;
  padding: 22px 0 0;
  box-shadow: 0 6px 16px rgba(30,40,60,0.18), 0 1px 3px rgba(30,40,60,0.14);
}
.m2-marks { position: absolute; top: 12px; right: 16px; display: flex; gap: 8px; }
.m2-marks span { display: block; width: 22px; height: 22px; background: #1f2229; border-radius: 2px; }

.m2-head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
  padding: 4px 66px 0 calc(var(--m2-mx) + 14px);
}
.m2-meta { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 8px; padding-top: 8px; }
.m2-meta-val { font-size: 17px; min-width: 34px; padding: 0 6px 1px; border-bottom: 1.5px solid #b4bdca; text-align: center; margin-right: 6px; }
.m2-critter-page { transform: rotate(10deg); padding: 2px; background: #fff; border-radius: 50%; margin-top: 18px; }

.m2-title-row {
  position: relative;
  display: flex; align-items: flex-end; justify-content: space-between; gap: 10px;
  padding: 0 18px 0 calc(var(--m2-mx) + 14px);
  margin: 6px 0 18px;
}
.m2-postit {
  position: relative; flex: 0 0 auto; z-index: 1;
  display: flex; flex-direction: column; align-items: flex-start; gap: 0;
  width: 112px; padding: 9px 10px 8px 12px;
  background: #fff;
  border: 2px solid #1f2229;
  border-radius: 3px;
  box-shadow: 3px 3px 0 var(--m2-aqua);
  margin-bottom: -2px;
}
.m2-postit-ja { font-family: "Klee One", sans-serif; font-weight: 600; font-size: 14px; line-height: 1.35; color: #24262d; }
.m2-postit-ko { font-size: 12.5px; line-height: 1.4; color: #5d6472; }
.m2-title {
  margin: 0; padding: 0;
  font-family: "Gaegu", sans-serif; font-weight: 700; font-size: 30px; line-height: 1.2; color: #2d2f3a;
}
.m2-title span { background: linear-gradient(transparent 58%, var(--m2-aqua-soft) 58%, var(--m2-aqua-soft) 92%, transparent 92%); padding: 0 6px; }

.m2-blk {
  position: relative;
  margin: 0;
  padding: 0 18px 30px calc(var(--m2-mx) + 14px);
}
.m2-n {
  font-size: 16px; line-height: 30px; color: var(--m2-ink-soft);
  word-break: keep-all; overflow-wrap: break-word;
}
.m2-n::before {
  content: "●"; position: absolute; left: calc(var(--m2-mx) - 6px); top: 0;
  font-size: 9px; line-height: 30px; color: var(--m2-aqua-deep);
}

/* ---- 말풍선 ---- */
.m2-bal-row { display: flex; flex-direction: column; align-items: flex-start; padding-top: 4px; padding-bottom: 34px; }
.m2-bal-row.m2-right { align-items: flex-end; }
.m2-bal {
  position: relative;
  max-width: calc(100% - 34px);
  padding: 12px 20px 13px;
  margin-top: 5px;
}
.m2-bal-shape { position: absolute; inset: 0; border: 2px solid #3c404d; background: #fff; }
.m2-bal-text { position: relative; z-index: 2; }
.m2-ja {
  font-family: "Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Hiragino Sans", sans-serif; font-weight: 500;
  font-size: 14px; line-height: 22px; color: var(--m2-ja);
  line-break: strict; overflow-wrap: anywhere;
}
.m2-ko {
  margin-top: 3px;
  font-size: 16px; line-height: 26px; color: var(--m2-ink);
  word-break: keep-all; overflow-wrap: break-word;
}

.m2-tail { position: absolute; z-index: 1; bottom: -17px; left: 30px; overflow: visible; }
.m2-tail path { fill: #fff; stroke: #3c404d; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
.m2-right .m2-tail { left: auto; right: 30px; transform: scaleX(-1); }

/* 학생: 속삭임 점선 */
.m2-bal-whisper .m2-bal-shape { border: 2px dashed #737b8f; border-radius: 34px / 28px; }
.m2-bal-whisper .m2-tail path { stroke: #737b8f; stroke-dasharray: 4 3; }

/* 교수: 각진 풍선 */
.m2-bal-box .m2-bal-shape { border-radius: 8px; border-width: 2.2px; }

/* 마시로: 떨리는 선, 분홍빛 */
.m2-bal-shaky .m2-bal-shape {
  border: 2px solid #6e4656; background: #fff4f7;
  border-radius: 36px 30px 38px 28px / 30px 36px 28px 34px;
  filter: url(#m2-wobble);
}
.m2-bal-shaky .m2-tail { filter: url(#m2-wobble); }
.m2-bal-shaky .m2-tail path { stroke: #6e4656; fill: #fff4f7; }

/* 화자 이름표 */
.m2-who {
  display: inline-block;
  padding: 0 9px;
  font-family: "Gowun Dodum", "Noto Sans KR", sans-serif; font-size: 12px; line-height: 20px;
  color: #4d6081; background: #e7edf6; border-radius: 999px;
}
.m2-right .m2-who { margin-right: 8px; }
.m2-bal-row.m2-left .m2-who { margin-left: 8px; }
.m2-who-shaky { color: var(--m2-pink-deep); background: #fbe2e9; }
.m2-who-box { color: #4a4d58; background: #eceae4; }

/* 만화 효과음(세로쓰기) */
.m2-sfx {
  position: absolute; top: 50%; transform: translateY(-50%) rotate(6deg);
  writing-mode: vertical-rl; text-orientation: upright;
  font-family: "Klee One", sans-serif; font-weight: 600; font-size: 14px; letter-spacing: 0.06em; line-height: 1;
  color: #8b8f9b; white-space: nowrap;
}
.m2-left .m2-sfx { right: -28px; }
.m2-right .m2-sfx { left: -28px; transform: translateY(-50%) rotate(-6deg); color: #c56a85; }

.m2-mark { text-decoration: underline wavy #e07b93; text-decoration-thickness: 1.5px; text-underline-offset: 4px; }

/* **강조**: 굵은 글씨 + 하늘색 형광펜 */
.m2-em {
  font-family: "Noto Sans KR", "Gowun Dodum", "Apple SD Gothic Neo", sans-serif; font-weight: 700;
  color: #17181e;
  background: linear-gradient(transparent 52%, #bfe8f4 52%, #bfe8f4 90%, transparent 90%);
  -webkit-box-decoration-break: clone; box-decoration-break: clone;
  padding: 0 2px;
}

/* ---- 루넬 작가 프로필 ---- */
.m2-prof-row { padding-top: 10px; padding-bottom: 36px; }
.m2-prof {
  position: relative;
  max-width: 400px;
  background: #fff; color: #222027;
  border: 1px solid #e9e5ee; border-radius: 12px;
  box-shadow: 0 4px 12px rgba(60,40,70,0.12), 0 1px 2px rgba(60,40,70,0.08);
  font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif;
}
.m2-tape-prof { top: -11px; right: 34%; width: 74px; transform: rotate(-5deg); z-index: 3; }
.m2-prof-bar { display: flex; align-items: center; gap: 7px; padding: 9px 14px; border-bottom: 1px solid #e9e5ee; }
.m2-moon { width: 15px; height: 15px; border-radius: 50%; box-shadow: inset -5px -1px 0 0 #d63c72; transform: rotate(-20deg); display: inline-block; flex: none; }
.m2-logo { font-family: "Cormorant Garamond", "Times New Roman", serif; font-style: italic; font-weight: 700; font-size: 19px; line-height: 1; color: #d63c72; }
.m2-prof-bar-sub { margin-left: auto; font-size: 11.5px; color: #75707e; }
.m2-prof-body { display: flex; align-items: center; gap: 12px; padding: 12px 14px 4px; }
.m2-prof-avatar { flex: none; line-height: 0; border-radius: 50%; box-shadow: 0 0 0 3px #fbe8ef; }
.m2-prof-main { flex: 1 1 auto; min-width: 0; }
.m2-prof-name { display: flex; align-items: baseline; flex-wrap: wrap; gap: 2px 7px; font-size: 18px; font-weight: 800; line-height: 1.3; }
.m2-prof-name-ko { font-size: 12.5px; font-weight: 400; color: #75707e; }
.m2-prof-badges { display: flex; gap: 5px; margin-top: 5px; }
.m2-badge { white-space: nowrap; font-size: 11px; font-weight: 700; line-height: 18px; padding: 0 7px; border-radius: 4px; color: #d63c72; border: 1px solid #f0b6c9; background: #fff; }
.m2-badge-fill { color: #fff; background: #d63c72; border-color: #d63c72; }
.m2-prof-follow { flex: none; align-self: flex-start; margin-top: 4px; font-size: 12px; font-weight: 700; color: #fff; background: #d63c72; border-radius: 999px; padding: 5px 12px; }
.m2-prof-bio { margin: 0; padding: 8px 14px 0; font-size: 13.5px; line-height: 1.6; color: #222027; }
.m2-prof-bio-ko { display: block; font-size: 12.5px; color: #75707e; }
.m2-prof-stats { display: flex; gap: 16px; padding: 9px 14px 12px; font-size: 12.5px; color: #75707e; }
.m2-prof-stats b { color: #222027; font-size: 14px; font-variant-numeric: tabular-nums; }
.m2-prof-heart b { color: #d63c72; }

/* ---- 아래에서 계속! (카드 뒷면 아래 검은 띠) ---- */
.m2-foot {
  display: flex; flex-direction: column; align-items: center;
  padding: 18px 16px 30px;
}
.m2-cont { position: relative; display: inline-flex; filter: drop-shadow(0 2px 3px rgba(20,30,50,0.25)); }
.m2-ribbon {
  position: relative;
  display: flex; align-items: center; gap: 14px;
  padding: 8px 22px 7px 20px;
  background: #1f2229;
  border-radius: 3px;
}
.m2-serial {
  font-family: "Zen Maru Gothic", ui-monospace, monospace; font-weight: 500; font-size: 13px;
  letter-spacing: 0.14em; color: #c9ced6; font-variant-numeric: tabular-nums; white-space: nowrap;
}
.m2-ribbon-ja {
  font-family: "Klee One", "Zen Maru Gothic", sans-serif; font-weight: 600; font-size: 21px; line-height: 1.3;
  letter-spacing: 0.18em; color: #fff;
  padding-left: 14px; border-left: 1.5px solid rgba(255,255,255,0.35);
}
.m2-cont-critter {
  position: absolute; z-index: 2; left: -30px; top: -20px;
  line-height: 0; padding: 2px; background: #fff; border-radius: 50%;
  transform: rotate(-14deg);
  box-shadow: 0 1px 3px rgba(30,40,60,0.25);
}
.m2-spark { position: absolute; z-index: 2; line-height: 1; }
.m2-spark-a { top: -14px; right: -8px; font-size: 16px; color: var(--m2-lime); transform: rotate(12deg); }
.m2-spark-b { bottom: -10px; right: 18px; font-size: 11px; color: var(--m2-aqua); }
.m2-cont-ko {
  margin-top: 12px;
  font-family: "Gaegu", "Gowun Dodum", sans-serif; font-weight: 700; font-size: 22px; line-height: 1.2;
  color: var(--m2-aqua-deep); letter-spacing: -0.01em;
}
.m2-cont-arrow { margin-top: 2px; line-height: 0; animation: m2Bob 1.4s ease-in-out infinite; }
@keyframes m2Bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(5px); }
}

.m2-btn-close {
  margin-top: 14px; width: 100%; min-height: 48px; border-radius: 10px;
  background: #f7f9fb; color: #24324a; font-size: 16px;
  box-shadow: 0 2px 0 #3a4762, 0 4px 10px rgba(20,30,50,0.18);
}
.m2-btn-close:active { transform: translateY(1px); box-shadow: 0 1px 0 #3a4762, 0 2px 6px rgba(20,30,50,0.18); }

/* ---------- 좁은 화면 ---------- */
@media (max-width: 440px) {
  .m2-root { --m2-mx: 22px; }
  .m2-cover { padding: 18px 12px 14px; }
  .m2-window { padding: 6px; }
  .m2-glare { inset: 6px; }
  .m2-sticker { width: 60px; height: 60px; top: -12px; right: 0; }
  .m2-sticker span { font-size: 16px; }
  .m2-card-top { padding: 9px 10px 0 12px; }
  .m2-card-logo { font-size: 22px; }
  .m2-card-kana { font-size: 10px; letter-spacing: 0.12em; }
  .m2-card-critter { right: 10px; top: 31%; }
  .m2-card-critter svg { width: 40px; height: 40px; }
  .m2-teiki { left: 12px; right: 12px; bottom: 7px; }
  .m2-teiki-row { column-gap: 6px; padding: 2px 0 1px; }
  .m2-print { font-size: 12.5px; letter-spacing: 0.03em; }
  .m2-gloss { display: none; }
  .m2-uh { font-size: 11px; }
  .m2-blk { padding-right: 14px; padding-left: calc(var(--m2-mx) + 10px); }
  .m2-n::before { left: calc(var(--m2-mx) - 9px); }
  .m2-bal { padding: 11px 16px 12px; }
  .m2-head, .m2-title-row { padding-left: calc(var(--m2-mx) + 10px); }
  .m2-head { padding-right: 60px; }
  .m2-marks { right: 12px; }
  .m2-marks span { width: 18px; height: 18px; }
  .m2-title-row { padding-right: 12px; }
  .m2-title { font-size: 27px; }
  .m2-postit { width: 100px; padding: 8px 8px 7px 10px; }
  .m2-postit-ja { font-size: 13px; }
  .m2-postit-ko { font-size: 12px; }
  .m2-ribbon { padding: 7px 16px 6px 14px; gap: 10px; }
  .m2-serial { font-size: 11.5px; letter-spacing: 0.1em; }
  .m2-ribbon-ja { font-size: 19px; padding-left: 10px; }
}

@media (prefers-reduced-motion: reduce) {
  .m2-open { animation: none; }
  .m2-cont-arrow { animation: none; }
  .m2-btn-open { transition: none; }
}
`;

const M2_BLOCKS = [
  {"t": "n", "text": "모든 사달의 시작은 1년 전, 퇴근 시간의 미도스지선 안에서 우연히 스쳐 지나간 단 한 순간이었다.\n사람이 눈을 한 번 깜빡이는 시간, 고작 **0.3초**의 찰나.\n그 짧은 마주침이 마츠유카와 마시로의 평온했던 인생을 송두리째 뒤집어 놓았다."},
  {"t": "n", "text": "눈을 뗄 수가 없었다. 아니, 머릿속에서 지워지질 않았다.\n그 찰나의 잔상이 온몸에 진득하게 들러붙어, 예방접종도 없이 덮친 독감처럼 밤새도록 숨통을 조여 왔다.\n몸도 머리도 열병을 앓듯 달아오르고 속이 근질거려 견딜 수가 없었다. 이 정체 모를 거대한 충동을 어떻게든 밖으로 쏟아내야만 했다."},
  {"t": "n", "text": "그날 새벽, 홀린 듯 책상에 앉은 순간 만화의 신이라도 강림한 것처럼 구상부터 콘티까지 단숨에 끝났다.\n못 마시는 커피와 에너지 드링크를 약처럼 들이부으며 사흘 밤낮을 꼬박 새운 끝에 완성한 16페이지짜리 단편.\n투고 하루 만에 'Poxiv' 랭킹 1위, 이틀 만에 SNS 10만 하트, 일주일 뒤엔 담당 편집자의 스카우트 메일."},
  {"t": "n", "text": "그렇게 0.3초의 기억 하나로 그려 낸 첫 고수위 만화가 '루넬'의 간판 인기작이 되기까지, 연재를 시작하고 고작 석 달."},
  {"t": "profile"},
  {"t": "n", "text": "여기까지는 인터뷰 때마다 포장해 온 눈부신 성공담이고, **진짜 재앙은 그다음에 찾아왔다.**\n연재를 시작한 지 다섯 달, 인생 최대의 슬럼프가 덮친 것이다."},
  {"t": "n", "text": "마감은 코앞인데 콘티는 백지였고 머릿속은 하얗게 비어 버렸다.\n세이브 원고는 바닥난 지 오래, 길어지는 휴재에 '마유마로도 이제 감 다 죽었네' 같은 날 선 반응들이 가슴을 후벼 팠다.\n메일함에 쌓인 '선생님, 요즘 잘 지내시나요?'라는 편집자의 안부 메일 세 통이 사형 선고장처럼 무서워, 이불 속에 거대한 몸을 웅크리고 훌쩍이던 것이 불과 2주 전의 일이었다."}
];
