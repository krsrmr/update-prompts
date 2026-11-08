// 필요 훅: useState (react)
// 마유마로 첫인사 프롤로그 (첫인사 전용)
// 처음엔 접힌 노트 표지. '노트 펼치기'를 누르면 미학 입문 노트가 펼쳐진다.
// 글은 맨 아래 MP_BLOCKS에 있다. t:"n" 서술, t:"d" 대사(who 화자, ja 일본어, ko 한국어), t:"gap" 장면 구분.
// 펼친 채로 시작하려면 <MashiroPrologue defaultOpen={true} />

function MashiroPrologue(props = {}) {
  const { defaultOpen = false } = props;
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <div className="mp-root">
      <style>{MP_CSS}</style>
      {open ? mpPage(() => setOpen(false)) : mpCover(() => setOpen(true))}
    </div>
  );
}

/* ---------- 접힌 상태: 노트 표지 ---------- */
function mpCover(onOpen) {
  return (
    <div className="mp-cover">
      <div className="mp-bind" aria-hidden="true"><div className="mp-stitch" /></div>
      <div className="mp-tape mp-tape-cover" aria-hidden="true" />
      <div className="mp-doodle" aria-hidden="true">{mpDoodle()}</div>
      <div className="mp-mini mp-mini-star" aria-hidden="true">★</div>
      <div className="mp-mini mp-mini-heart" aria-hidden="true">♥</div>

      <div className="mp-cover-body">
        <div className="mp-label">
          <div className="mp-field">
            <span className="mp-printed">科目</span>
            <span className="mp-hand mp-hand-lg">美学入門</span>
            <span className="mp-gloss">미학 입문</span>
          </div>
          <div className="mp-field">
            <span className="mp-printed">時限</span>
            <span className="mp-hand">金曜 3限</span>
            <span className="mp-gloss">금요일 3교시</span>
          </div>
          <div className="mp-field mp-field-last">
            <span className="mp-printed">名前</span>
            <span className="mp-hand">
              <ruby>真梅雨川<rt>まつゆかわ!!</rt></ruby> 真白
            </span>
          </div>
        </div>

        <div className="mp-sticker" aria-hidden="true">
          <span>프롤로그</span>
        </div>
        <div className="mp-critter mp-critter-cover" aria-hidden="true">{mpCritter(64)}</div>
      </div>

      <button type="button" className="mp-btn mp-btn-open" onClick={onOpen} aria-expanded="false">
        {mpBookIcon()}
        <span>노트 펼치기</span>
      </button>
    </div>
  );
}

/* ---------- 펼친 상태: 노트 한 장 ---------- */
function mpPage(onClose) {
  return (
    <div className="mp-open">
      <div className="mp-band">
        <span className="mp-band-title">美学入門</span>
        <button type="button" className="mp-btn mp-btn-small" onClick={onClose} aria-expanded="true">
          노트 접기
        </button>
      </div>

      <div className="mp-paper">
        <div className="mp-tape mp-tape-page" aria-hidden="true" />

        <div className="mp-head">
          <div className="mp-meta">
            <span className="mp-printed">No.</span>
            <span className="mp-hand mp-meta-val">5</span>
            <span className="mp-printed">Date</span>
            <span className="mp-hand mp-meta-val">金曜 3限</span>
          </div>
          <div className="mp-critter mp-critter-page" aria-hidden="true">{mpCritter(46)}</div>
        </div>

        <div className="mp-title-row">
          <h3 className="mp-title"><span>프롤로그</span></h3>
          <div className="mp-postit" aria-hidden="true">
            <div className="mp-clip">{mpClip()}</div>
            <span className="mp-postit-ja" lang="ja">〆切まで<br />あと10日</span>
            <span className="mp-postit-ko">마감까지 10일</span>
          </div>
        </div>

        {mpWobbleDefs()}
        <div className="mp-lines">
          {MP_BLOCKS.map((b, i) =>
            b.t === "d" ? mpBalloon(b, i) : b.t === "profile" ? mpProfile(i) : b.t === "gap" ? (
              <div className="mp-blk mp-gap" key={i} aria-hidden="true">✦　✦　✦</div>
            ) : (
              <p className="mp-blk mp-n" key={i}>{mpRich(b.text)}</p>
            )
          )}
        </div>

        <div className="mp-foot">
          <div className="mp-cont">
            <span className="mp-spark mp-spark-a" aria-hidden="true">✦</span>
            <span className="mp-spark mp-spark-b" aria-hidden="true">✦</span>
            <span className="mp-spark mp-spark-c" aria-hidden="true">♥</span>
            <div className="mp-cont-critter" aria-hidden="true">{mpCritter(44)}</div>
            <div className="mp-ribbon"><span lang="ja">つづく</span></div>
          </div>
          <div className="mp-cont-ko">아래에서 계속!</div>
          <div className="mp-cont-arrow" aria-hidden="true">{mpDownArrow()}</div>
        </div>
        <div className="mp-dogear" aria-hidden="true" />
      </div>

      <button type="button" className="mp-btn mp-btn-close" onClick={onClose} aria-expanded="true">
        노트 접기
      </button>
    </div>
  );
}

/* 만화 말풍선
   학생: 속삭임 점선 풍선 / 교수: 각진 풍선 / 마시로: 떨리는 선 풍선(오른쪽) */
const MP_SIDE = { "남학생": "left", "여학생": "right", "교수": "left", "마시로": "right" };
const MP_KIND = { "남학생": "whisper", "여학생": "whisper", "교수": "box", "마시로": "shaky" };

function mpBalloon(b, i) {
  const side = MP_SIDE[b.who] || "left";
  const kind = MP_KIND[b.who] || "box";
  return (
    <div className={"mp-blk mp-bal-row mp-" + side} key={i}>
      <span className={"mp-who mp-who-" + kind}>{b.who}</span>
      <div className={"mp-bal mp-bal-" + kind}>
        <div className="mp-bal-shape" aria-hidden="true" />
        <svg className="mp-tail" width="26" height="20" viewBox="0 0 26 20" aria-hidden="true">
          <path d="M3 0 C7 7 6 13 2 19 C11 14 17 8 22 0" />
        </svg>
        <div className="mp-bal-text">
          <div className="mp-ja" lang="ja">{mpMark(b.ja)}</div>
          <div className="mp-ko">{mpMark(b.ko)}</div>
        </div>
        {b.sfx ? <span className="mp-sfx" lang="ja" aria-hidden="true">{b.sfx}</span> : null}
      </div>
    </div>
  );
}

/* 마시로 풍선의 떨리는 선 */
function mpWobbleDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <filter id="mp-wobble" x="-5%" y="-10%" width="110%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

/* 서술 한 문단: 줄바꿈(\n)은 줄을 나누고, **굵게**는 형광펜 강조 */
function mpRich(text) {
  const lines = String(text).split("\n");
  const out = [];
  lines.forEach((line, li) => {
    if (li > 0) out.push(<br key={"br" + li} />);
    line.split(/\*\*(.+?)\*\*/).forEach((seg, si) => {
      if (!seg) return;
      out.push(
        si % 2 === 1 ? (
          <strong className="mp-em" key={li + "-" + si}>{mpMark(seg)}</strong>
        ) : (
          <span key={li + "-" + si}>{mpMark(seg)}</span>
        )
      );
    });
  });
  return out;
}

/* 루넬 작가 프로필 (짧게) */
function mpProfile(i) {
  return (
    <div className="mp-blk mp-prof-row" key={i}>
      <div className="mp-prof">
        <div className="mp-tape mp-tape-prof" aria-hidden="true" />
        <div className="mp-prof-bar">
          <span className="mp-moon" aria-hidden="true" />
          <span className="mp-logo">Lunelle</span>
          <span className="mp-prof-bar-sub" lang="ja">作家ページ</span>
        </div>
        <div className="mp-prof-body">
          <div className="mp-prof-avatar" aria-hidden="true">{mpMarshmallow()}</div>
          <div className="mp-prof-main">
            <div className="mp-prof-name">
              <span lang="ja">マユマロ</span>
              <span className="mp-prof-name-ko">마유마로</span>
            </div>
            <div className="mp-prof-badges">
              <span className="mp-badge mp-badge-fill" lang="ja">看板作家</span>
              <span className="mp-badge" lang="ja">R18</span>
            </div>
          </div>
          <span className="mp-prof-follow" lang="ja" aria-hidden="true">フォロー</span>
        </div>
        <p className="mp-prof-bio">
          <span lang="ja">ふわふわ甘くて、ちょっぴりえっちなお話を描いています🍡</span>
          <span className="mp-prof-bio-ko">폭신하고 달콤한, 살짝 야한 이야기를 그려요🍡</span>
        </p>
        <div className="mp-prof-stats">
          <span><b>8.6万</b> <span lang="ja">フォロワー</span></span>
          <span className="mp-prof-heart"><b>61万</b> <span lang="ja">いいね</span></span>
        </div>
      </div>
    </div>
  );
}

function mpMarshmallow() {
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
function mpMark(text) {
  const parts = String(text).split(/(신바이우가와|シンバイウガワ)/);
  return parts.map((p, i) =>
    p === "신바이우가와" || p === "シンバイウガワ" ? (
      <span className="mp-mark" key={i}>{p}</span>
    ) : (
      p
    )
  );
}

/* 오리지널 마스코트 스티커: 둥근 흰 몸, 점 눈, 작은 귀, 분홍 볼 */
function mpCritter(size) {
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

/* 표지의 흰 젤펜 낙서 */
function mpDoodle() {
  const s = { fill: "none", stroke: "rgba(255,255,255,0.75)", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg width="120" height="34" viewBox="0 0 120 34">
      <path d="M8 17 l3 -7 l3 7 l7 1 l-5 5 l1 7 l-6 -4 l-6 4 l1 -7 l-5 -5 z" {...s} />
      <path d="M34 22 c4 -8 10 -8 12 -2 c2 -6 8 -6 12 2" {...s} />
      <path d="M70 9 v8 M66 13 h8" {...s} />
      <path d="M84 24 q6 -10 12 0 t12 0" {...s} />
      <circle cx="114" cy="10" r="2.2" {...s} />
    </svg>
  );
}

/* 포스트잇을 붙든 클립 */
function mpClip() {
  return (
    <svg width="18" height="44" viewBox="0 0 18 44">
      <path d="M6 30 V8 a4 4 0 0 1 8 0 V34 a6 6 0 0 1 -12 0 V12" fill="none" stroke="#9aa3b4" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.6 30 V8.5" fill="none" stroke="#e8ecf3" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

function mpBookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 6.5C10 5 7 4.6 3.5 5v13c3.5-.4 6.5 0 8.5 1.5 2-1.5 5-1.9 8.5-1.5V5C17 4.6 14 5 12 6.5z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 6.5v13" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

/* 아래를 가리키는 손그림 화살표 */
function mpDownArrow() {
  const st = { fill: "none", stroke: "#d9708c", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg width="34" height="34" viewBox="0 0 34 34">
      <path d="M8 6 L17 14 L26 6" {...st} />
      <path d="M8 17 L17 25 L26 17" {...st} opacity="0.55" />
    </svg>
  );
}

const MP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Gowun+Dodum&family=Noto+Sans+KR:wght@700&family=Cormorant+Garamond:ital,wght@1,700&family=Klee+One:wght@400;600&family=Zen+Maru+Gothic:wght@500;700&display=swap');

.mp-root {
  --mp-cover-a: #9cb1cd;
  --mp-cover-b: #8098ba;
  --mp-bind: #4b4e58;
  --mp-paper: #fffdf8;
  --mp-rule: #dce4ef;
  --mp-margin: #f0b0b4;
  --mp-ink: #262730;
  --mp-ink-soft: #383a44;
  --mp-ja: #556a8b;
  --mp-print: #8aa0c2;
  --mp-pink: #f4c4cf;
  --mp-pink-deep: #b5486b;
  --mp-pencil: #868a95;
  --mp-mx: 34px;
  width: 100%;
  max-width: 600px;
  margin: 10px auto;
  padding: 4px 2px 8px;
  box-sizing: border-box;
  font-family: "Gowun Dodum", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  color: var(--mp-ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.mp-root *, .mp-root *::before, .mp-root *::after { box-sizing: border-box; }

/* 공통 글꼴 */
.mp-hand { font-family: "Klee One", "Gaegu", "Zen Maru Gothic", sans-serif; font-weight: 600; color: #30323b; }
.mp-printed { font-family: "Zen Maru Gothic", sans-serif; font-weight: 500; font-size: 11px; color: var(--mp-print); letter-spacing: 0.04em; }

/* ---------- 표지 ---------- */
.mp-cover {
  position: relative;
  overflow: hidden;
  border-radius: 5px 14px 14px 5px;
  padding: 26px 18px 18px 44px;
  background:
    repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 5px),
    repeating-linear-gradient(-45deg, rgba(20,30,60,0.045) 0 2px, transparent 2px 5px),
    linear-gradient(155deg, var(--mp-cover-a), var(--mp-cover-b));
  box-shadow: 0 1px 0 rgba(255,255,255,0.4) inset, 0 6px 16px rgba(40,50,80,0.22), 0 1px 3px rgba(40,50,80,0.2);
}
.mp-bind {
  position: absolute; left: 0; top: 0; bottom: 0; width: 26px;
  background: linear-gradient(90deg, #3f424b, var(--mp-bind) 60%, #5a5d68);
  box-shadow: 2px 0 4px rgba(0,0,0,0.18);
}
.mp-stitch { position: absolute; top: 10px; bottom: 10px; right: 6px; border-left: 2px dashed rgba(255,255,255,0.38); }

.mp-tape {
  position: absolute; height: 24px;
  background:
    radial-gradient(circle, rgba(255,255,255,0.75) 1.4px, transparent 1.6px) 0 0 / 9px 9px,
    rgba(243,190,203,0.88);
  clip-path: polygon(0 8%, 4% 0, 8% 10%, 12% 0, 88% 0, 92% 10%, 96% 0, 100% 8%, 100% 92%, 96% 100%, 92% 90%, 88% 100%, 12% 100%, 8% 90%, 4% 100%, 0 92%);
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}
.mp-tape-cover { top: 10px; right: 26%; width: 92px; transform: rotate(-4deg); }

.mp-cover-body { position: relative; display: flex; align-items: flex-end; gap: 12px; padding-right: 4px; }
.mp-label {
  position: relative;
  flex: 1 1 auto;
  max-width: 360px;
  background: var(--mp-paper);
  border: 1.5px solid #a9bbd6;
  border-radius: 4px;
  padding: 8px 14px 6px;
  box-shadow: 0 0 0 4px rgba(255,253,248,0.35), 0 2px 6px rgba(30,40,70,0.15);
}
.mp-field {
  display: flex; align-items: baseline; flex-wrap: wrap; column-gap: 10px; row-gap: 0;
  padding: 7px 0 6px;
  border-bottom: 1.5px dotted #b8c7dd;
}
.mp-field-last { border-bottom: 0; padding-top: 12px; }
.mp-field .mp-printed { width: 26px; flex: 0 0 auto; }
.mp-field .mp-hand { font-size: 19px; line-height: 1.35; }
.mp-hand-lg { font-size: 22px !important; }
.mp-gloss { font-size: 13px; color: #5d6170; }
.mp-label ruby { ruby-position: over; }
.mp-label rt { font-family: "Klee One", sans-serif; font-size: 10px; font-weight: 600; color: var(--mp-pink-deep); letter-spacing: 0.02em; }

.mp-sticker {
  position: absolute; z-index: 3; top: -14px; right: 2px;
  width: 78px; height: 78px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at 35% 30%, #fde3ea, var(--mp-pink) 70%);
  border: 3px solid #fff;
  box-shadow: 0 2px 5px rgba(60,30,50,0.25);
  transform: rotate(9deg);
}
.mp-sticker span { font-family: "Gaegu", sans-serif; font-weight: 700; font-size: 21px; color: #8a3550; letter-spacing: -0.03em; white-space: nowrap; }

.mp-doodle { position: absolute; left: 50px; bottom: 74px; line-height: 0; opacity: 0.9; pointer-events: none; }
.mp-mini {
  position: absolute; z-index: 3; display: flex; align-items: center; justify-content: center;
  border-radius: 50%; border: 2px solid #fff; line-height: 1;
  box-shadow: 0 1px 3px rgba(40,40,60,0.25);
}
.mp-mini-star { width: 26px; height: 26px; top: 8px; left: 38px; background: #fbe7a6; color: #c79a2c; font-size: 14px; transform: rotate(-12deg); }
.mp-mini-heart { width: 22px; height: 22px; top: 96px; right: 92px; background: #fde3ea; color: #d9667f; font-size: 12px; transform: rotate(14deg); }

.mp-critter { flex: 0 0 auto; line-height: 0; filter: drop-shadow(0 0 0 #fff) drop-shadow(0 2px 3px rgba(40,40,60,0.25)); }
.mp-critter svg { display: block; }
.mp-critter-cover { transform: rotate(-8deg); margin-bottom: -4px; padding: 3px; background: #fff; border-radius: 50%; }

.mp-btn {
  font-family: inherit; cursor: pointer; border: 0;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  -webkit-tap-highlight-color: transparent;
}
.mp-btn:focus-visible { outline: 2.5px solid #2f4f86; outline-offset: 3px; }
.mp-btn-open {
  margin-top: 40px; width: 100%; min-height: 50px;
  border-radius: 10px;
  background: var(--mp-paper); color: #2c3350;
  font-size: 17px; letter-spacing: 0.02em;
  box-shadow: 0 2px 0 #5f7499, 0 4px 10px rgba(30,40,70,0.18);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.mp-btn-open:hover { transform: translateY(-1px); box-shadow: 0 3px 0 #5f7499, 0 6px 14px rgba(30,40,70,0.2); }
.mp-btn-open:active { transform: translateY(1px); box-shadow: 0 1px 0 #5f7499, 0 2px 6px rgba(30,40,70,0.18); }

/* ---------- 펼친 노트 ---------- */
.mp-open { animation: mpOpen 0.5s cubic-bezier(0.2, 0.75, 0.25, 1) both; transform-origin: top center; }
@keyframes mpOpen {
  from { opacity: 0; transform: perspective(900px) rotateX(-10deg) translateY(-8px); }
  to { opacity: 1; transform: none; }
}

.mp-band {
  position: relative; z-index: 2;
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  min-height: 46px; padding: 6px 10px 6px 16px;
  border-radius: 12px 12px 0 0;
  background:
    repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 5px),
    linear-gradient(155deg, var(--mp-cover-a), var(--mp-cover-b));
  box-shadow: 0 2px 4px rgba(30,40,70,0.18);
}
.mp-band-title { font-family: "Klee One", sans-serif; font-weight: 600; font-size: 17px; color: #fff; text-shadow: 0 1px 2px rgba(30,40,70,0.35); }
.mp-btn-small {
  min-height: 34px; padding: 0 14px; border-radius: 999px;
  background: rgba(255,253,248,0.95); color: #2c3350; font-size: 14px;
  box-shadow: 0 1px 2px rgba(30,40,70,0.2);
}

.mp-paper {
  position: relative; overflow: hidden;
  background: var(--mp-paper);
  border-radius: 0 0 4px 4px;
  padding: 22px 0 0;
  box-shadow: inset 12px 0 14px -12px rgba(60,60,80,0.28), 0 6px 16px rgba(40,50,80,0.16), 0 1px 3px rgba(40,50,80,0.14);
}
.mp-tape-page { top: -6px; left: 50%; width: 96px; margin-left: -48px; transform: rotate(3deg); z-index: 3; }

.mp-head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
  padding: 4px 16px 0 calc(var(--mp-mx) + 14px);
}
.mp-meta { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 8px; padding-top: 8px; }
.mp-meta-val { font-size: 17px; min-width: 34px; padding: 0 6px 1px; border-bottom: 1.5px solid #c3d0e3; text-align: center; margin-right: 6px; }
.mp-critter-page { transform: rotate(10deg); padding: 2px; background: #fff; border-radius: 50%; margin-top: -4px; }

.mp-title-row {
  position: relative;
  display: flex; align-items: flex-end; justify-content: space-between; gap: 10px;
  padding: 0 18px 0 calc(var(--mp-mx) + 14px);
  margin: 6px 0 18px;
}
.mp-postit {
  position: relative; flex: 0 0 auto; z-index: 1;
  display: flex; flex-direction: column; align-items: flex-start; gap: 0;
  width: 112px; padding: 12px 10px 9px 12px;
  background: linear-gradient(170deg, #fff5c9, #fdeca9);
  box-shadow: 0 3px 6px rgba(80,70,30,0.18), 0 1px 1px rgba(80,70,30,0.12);
  transform: rotate(3.5deg);
  margin-bottom: -2px;
}
.mp-clip { position: absolute; top: -20px; right: 12px; line-height: 0; transform: rotate(8deg); }
.mp-postit-ja { font-family: "Klee One", sans-serif; font-weight: 600; font-size: 14px; line-height: 1.35; color: #3b3a33; }
.mp-postit-ko { font-size: 12.5px; line-height: 1.4; color: #6b6656; }
.mp-title {
  margin: 0; padding: 0;
  font-family: "Gaegu", sans-serif; font-weight: 700; font-size: 30px; line-height: 1.2; color: #2d2f3a;
}
.mp-title span { background: linear-gradient(transparent 58%, #fbd2dc 58%, #fbd2dc 92%, transparent 92%); padding: 0 6px; }

.mp-lines {
  background-image: linear-gradient(to right, transparent 0, transparent var(--mp-mx), var(--mp-margin) var(--mp-mx), var(--mp-margin) calc(var(--mp-mx) + 1.5px), transparent calc(var(--mp-mx) + 1.5px));
}
.mp-blk {
  margin: 0;
  padding: 0 18px 30px calc(var(--mp-mx) + 14px);
  background-image: repeating-linear-gradient(to bottom, transparent 0, transparent 29px, var(--mp-rule) 29px, var(--mp-rule) 30px);
}
.mp-n {
  font-size: 16px; line-height: 30px; color: var(--mp-ink-soft);
  word-break: keep-all; overflow-wrap: break-word;
}
/* 장면 구분: 공책 두 줄 높이, 별 세 개 */
.mp-gap {
  height: 60px; padding-bottom: 0;
  font-size: 12px; line-height: 30px; letter-spacing: 0.3em;
  text-align: center; color: var(--mp-pencil);
}

/* ---- 말풍선 ---- */
.mp-bal-row { display: flex; flex-direction: column; align-items: flex-start; padding-top: 4px; padding-bottom: 34px; }
.mp-bal-row.mp-right { align-items: flex-end; }
.mp-bal {
  position: relative;
  max-width: calc(100% - 34px);
  padding: 12px 20px 13px;
  margin-top: 5px;
}
.mp-bal-shape { position: absolute; inset: 0; border: 2px solid #3c404d; background: #fff; }
.mp-bal-text { position: relative; z-index: 2; }
.mp-ja {
  font-family: "Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Hiragino Sans", sans-serif; font-weight: 500;
  font-size: 14px; line-height: 22px; color: var(--mp-ja);
  line-break: strict; overflow-wrap: anywhere;
}
.mp-ko {
  margin-top: 3px;
  font-size: 16px; line-height: 26px; color: var(--mp-ink);
  word-break: keep-all; overflow-wrap: break-word;
}

.mp-tail { position: absolute; z-index: 1; bottom: -17px; left: 30px; overflow: visible; }
.mp-tail path { fill: #fff; stroke: #3c404d; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
.mp-right .mp-tail { left: auto; right: 30px; transform: scaleX(-1); }

/* 학생: 속삭임 점선 */
.mp-bal-whisper .mp-bal-shape { border: 2px dashed #737b8f; border-radius: 34px / 28px; }
.mp-bal-whisper .mp-tail path { stroke: #737b8f; stroke-dasharray: 4 3; }

/* 교수: 각진 풍선 */
.mp-bal-box .mp-bal-shape { border-radius: 8px; border-width: 2.2px; }

/* 마시로: 떨리는 선, 분홍빛 */
.mp-bal-shaky .mp-bal-shape {
  border: 2px solid #6e4656; background: #fff4f7;
  border-radius: 36px 30px 38px 28px / 30px 36px 28px 34px;
  filter: url(#mp-wobble);
}
.mp-bal-shaky .mp-tail { filter: url(#mp-wobble); }
.mp-bal-shaky .mp-tail path { stroke: #6e4656; fill: #fff4f7; }

/* 화자 이름표 */
.mp-who {
  display: inline-block;
  padding: 0 9px;
  font-family: "Gowun Dodum", "Noto Sans KR", sans-serif; font-size: 12px; line-height: 20px;
  color: #4d6081; background: #e7edf6; border-radius: 999px;
}
.mp-right .mp-who { margin-right: 8px; }
.mp-bal-row.mp-left .mp-who { margin-left: 8px; }
.mp-who-shaky { color: var(--mp-pink-deep); background: #fbe2e9; }
.mp-who-box { color: #4a4d58; background: #eceae4; }

/* 만화 효과음(세로쓰기) */
.mp-sfx {
  position: absolute; top: 50%; transform: translateY(-50%) rotate(6deg);
  writing-mode: vertical-rl; text-orientation: upright;
  font-family: "Klee One", sans-serif; font-weight: 600; font-size: 14px; letter-spacing: 0.06em; line-height: 1;
  color: #8b8f9b; white-space: nowrap;
}
.mp-left .mp-sfx { right: -28px; }
.mp-right .mp-sfx { left: -28px; transform: translateY(-50%) rotate(-6deg); color: #c56a85; }

.mp-mark { text-decoration: underline wavy #e07b93; text-decoration-thickness: 1.5px; text-underline-offset: 4px; }

/* **강조**: 굵은 글씨 + 분홍 형광펜 */
.mp-em {
  font-family: "Noto Sans KR", "Gowun Dodum", "Apple SD Gothic Neo", sans-serif; font-weight: 700;
  color: #17181e;
  background: linear-gradient(transparent 52%, #ffc6d4 52%, #ffc6d4 90%, transparent 90%);
  -webkit-box-decoration-break: clone; box-decoration-break: clone;
  padding: 0 2px;
}

/* ---- 루넬 작가 프로필 ---- */
.mp-prof-row { padding-top: 10px; padding-bottom: 36px; }
.mp-prof {
  position: relative;
  max-width: 400px;
  background: #fff; color: #222027;
  border: 1px solid #e9e5ee; border-radius: 12px;
  box-shadow: 0 4px 12px rgba(60,40,70,0.12), 0 1px 2px rgba(60,40,70,0.08);
  font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif;
}
.mp-tape-prof { top: -11px; right: 34%; width: 74px; transform: rotate(-5deg); z-index: 3; }
.mp-prof-bar { display: flex; align-items: center; gap: 7px; padding: 9px 14px; border-bottom: 1px solid #e9e5ee; }
.mp-moon { width: 15px; height: 15px; border-radius: 50%; box-shadow: inset -5px -1px 0 0 #d63c72; transform: rotate(-20deg); display: inline-block; flex: none; }
.mp-logo { font-family: "Cormorant Garamond", "Times New Roman", serif; font-style: italic; font-weight: 700; font-size: 19px; line-height: 1; color: #d63c72; }
.mp-prof-bar-sub { margin-left: auto; font-size: 11.5px; color: #75707e; }
.mp-prof-body { display: flex; align-items: center; gap: 12px; padding: 12px 14px 4px; }
.mp-prof-avatar { flex: none; line-height: 0; border-radius: 50%; box-shadow: 0 0 0 3px #fbe8ef; }
.mp-prof-main { flex: 1 1 auto; min-width: 0; }
.mp-prof-name { display: flex; align-items: baseline; flex-wrap: wrap; gap: 2px 7px; font-size: 18px; font-weight: 800; line-height: 1.3; }
.mp-prof-name-ko { font-size: 12.5px; font-weight: 400; color: #75707e; }
.mp-prof-badges { display: flex; gap: 5px; margin-top: 5px; }
.mp-badge { white-space: nowrap; font-size: 11px; font-weight: 700; line-height: 18px; padding: 0 7px; border-radius: 4px; color: #d63c72; border: 1px solid #f0b6c9; background: #fff; }
.mp-badge-fill { color: #fff; background: #d63c72; border-color: #d63c72; }
.mp-prof-follow { flex: none; align-self: flex-start; margin-top: 4px; font-size: 12px; font-weight: 700; color: #fff; background: #d63c72; border-radius: 999px; padding: 5px 12px; }
.mp-prof-bio { margin: 0; padding: 8px 14px 0; font-size: 13.5px; line-height: 1.6; color: #222027; }
.mp-prof-bio-ko { display: block; font-size: 12.5px; color: #75707e; }
.mp-prof-stats { display: flex; gap: 16px; padding: 9px 14px 12px; font-size: 12.5px; color: #75707e; }
.mp-prof-stats b { color: #222027; font-size: 14px; font-variant-numeric: tabular-nums; }
.mp-prof-heart b { color: #d63c72; }

/* ---- 아래에서 계속! ---- */
.mp-foot {
  display: flex; flex-direction: column; align-items: center;
  padding: 18px 16px 34px;
}
.mp-cont { position: relative; display: inline-flex; filter: drop-shadow(0 2px 3px rgba(150,60,90,0.25)); }
.mp-ribbon {
  position: relative;
  padding: 7px 36px 6px;
  background: linear-gradient(180deg, #ec93aa, #db7391);
  clip-path: polygon(0 0, 100% 0, calc(100% - 14px) 50%, 100% 100%, 0 100%, 14px 50%);
}
.mp-ribbon span {
  display: block;
  padding: 2px 6px;
  border-top: 1.5px dashed rgba(255,255,255,0.75);
  border-bottom: 1.5px dashed rgba(255,255,255,0.75);
  font-family: "Klee One", "Zen Maru Gothic", sans-serif; font-weight: 600; font-size: 21px; line-height: 1.3;
  letter-spacing: 0.18em; color: #fff; text-shadow: 0 1px 0 rgba(150,40,80,0.35);
}
.mp-cont-critter {
  position: absolute; z-index: 2; left: -30px; top: -20px;
  line-height: 0; padding: 2px; background: #fff; border-radius: 50%;
  transform: rotate(-14deg);
  box-shadow: 0 1px 3px rgba(60,40,60,0.25);
}
.mp-spark { position: absolute; z-index: 2; line-height: 1; }
.mp-spark-a { top: -14px; right: -8px; font-size: 16px; color: #f2b84b; transform: rotate(12deg); }
.mp-spark-b { bottom: -10px; right: 18px; font-size: 11px; color: #f2b84b; }
.mp-spark-c { top: -12px; right: 24px; font-size: 11px; color: #e07b93; transform: rotate(-10deg); }
.mp-cont-ko {
  margin-top: 12px;
  font-family: "Gaegu", "Gowun Dodum", sans-serif; font-weight: 700; font-size: 22px; line-height: 1.2;
  color: #8a3550; letter-spacing: -0.01em;
}
.mp-cont-arrow { margin-top: 2px; line-height: 0; animation: mpBob 1.4s ease-in-out infinite; }
@keyframes mpBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(5px); }
}
.mp-dogear {
  position: absolute; right: 0; bottom: 0; width: 30px; height: 30px;
  background: linear-gradient(135deg, var(--mp-paper) 0, var(--mp-paper) 50%, #e9e6df 50%, #f4f1ea 100%);
  box-shadow: -2px -2px 4px rgba(0,0,0,0.06);
  border-top-left-radius: 4px;
}

.mp-btn-close {
  margin-top: 14px; width: 100%; min-height: 48px; border-radius: 10px;
  background: var(--mp-paper); color: #2c3350; font-size: 16px;
  box-shadow: 0 2px 0 #8fa3c3, 0 4px 10px rgba(30,40,70,0.16);
}
.mp-btn-close:active { transform: translateY(1px); box-shadow: 0 1px 0 #8fa3c3, 0 2px 6px rgba(30,40,70,0.16); }

/* ---------- 좁은 화면 ---------- */
@media (max-width: 440px) {
  .mp-root { --mp-mx: 22px; }
  .mp-cover { padding: 22px 12px 14px 36px; }
  .mp-bind { width: 22px; }
  .mp-sticker { width: 64px; height: 64px; top: -12px; right: -2px; }
  .mp-sticker span { font-size: 17px; }
  .mp-label { padding: 6px 10px 4px; margin-right: 0; }
  .mp-field .mp-hand { font-size: 17px; }
  .mp-hand-lg { font-size: 20px !important; }
  .mp-critter-cover { position: absolute; right: -4px; bottom: -10px; }
  .mp-critter-cover svg { width: 48px; height: 48px; }
  .mp-cover-body { padding-right: 34px; }
  .mp-blk { padding-right: 14px; padding-left: calc(var(--mp-mx) + 10px); }
  .mp-bal { padding: 11px 16px 12px; }
  .mp-head, .mp-title-row { padding-left: calc(var(--mp-mx) + 10px); }
  .mp-title-row { padding-right: 12px; }
  .mp-title { font-size: 27px; }
  .mp-postit { width: 100px; padding: 11px 8px 8px 10px; }
  .mp-postit-ja { font-size: 13px; }
  .mp-postit-ko { font-size: 12px; }
  .mp-doodle { left: 42px; bottom: 68px; }
  .mp-doodle svg { width: 96px; height: 27px; }
  .mp-mini-star { left: 32px; top: 6px; }
  .mp-mini-heart { right: 70px; top: 88px; }
  .mp-ribbon { padding: 6px 30px 5px; }
  .mp-ribbon span { font-size: 19px; }
}

@media (prefers-reduced-motion: reduce) {
  .mp-open { animation: none; }
  .mp-cont-arrow { animation: none; }
  .mp-btn-open { transition: none; }
}
`;

const MP_BLOCKS = [
  {"t": "n", "text": "모든 사달의 시작은 1년 전, 캠퍼스에서 우연히 스쳐 지나간 단 한 순간이었다.\n사람이 눈을 한 번 깜빡이는 시간, 고작 **0.3초**의 찰나.\n그 짧은 마주침이 마츠유카와 마시로의 평온했던 인생을 송두리째 뒤집어 놓았다."},
  {"t": "n", "text": "눈을 뗄 수가 없었다. 아니, 머릿속에서 지워지질 않았다.\n그 찰나의 잔상이 온몸에 진득하게 들러붙어, 예방접종도 없이 덮친 독감처럼 밤새도록 숨통을 조여 왔다.\n몸도 머리도 열병을 앓듯 달아오르고 속이 근질거려 견딜 수가 없었다. 이 정체 모를 거대한 충동을 어떻게든 밖으로 쏟아내야만 했다."},
  {"t": "n", "text": "그날 새벽, 홀린 듯 책상에 앉은 순간 만화의 신이라도 강림한 것처럼 구상부터 콘티까지 단숨에 끝났다.\n못 마시는 커피와 에너지 드링크를 약처럼 들이부으며 사흘 밤낮을 꼬박 새운 끝에 완성한 16페이지짜리 단편.\n투고 하루 만에 'Poxiv' 랭킹 1위, 이틀 만에 SNS 10만 하트, 일주일 뒤엔 담당 편집자의 스카우트 메일."},
  {"t": "n", "text": "그렇게 0.3초의 기억 하나로 그려 낸 첫 고수위 만화가 '루넬'의 간판 인기작이 되기까지 걸린 시간은 고작 반년."},
  {"t": "profile"},
  {"t": "n", "text": "여기까지는 인터뷰 때마다 포장해 온 눈부신 성공담이고, **진짜 재앙은 그다음에 찾아왔다.**\n연재 1년 차, 인생 최대의 슬럼프가 덮친 것이다."},
  {"t": "n", "text": "마감은 코앞인데 콘티는 백지였고 머릿속은 하얗게 비어 버렸다.\n세이브 원고는 바닥난 지 오래, 길어지는 휴재에 '마유마로도 이제 감 다 죽었네' 같은 날 선 반응들이 가슴을 후벼 팠다.\n메일함에 쌓인 '선생님, 요즘 잘 지내시나요?'라는 편집자의 안부 메일 세 통이 사형 선고장처럼 무서워, 이불 속에 거대한 몸을 웅크리고 훌쩍이던 것이 불과 2주 전의 일이었다."},
  {"t": "gap"},
  {"t": "d", "who": "남학생", "ja": "「ねえねえ、この漫画…すっげぇエロくね？」", "ko": "야, 이 만화… 겁나 야하지 않냐?", "sfx": "ヒソヒソ"},
  {"t": "n", "text": "강의실 중간 언저리, 나란히 앉은 남학생이 옆자리 여학생에게 폰 화면을 슬며시 내밀며 속닥거렸다."},
  {"t": "d", "who": "여학생", "ja": "「あ、これ知ってる！」", "ko": "아, 나 이거 알아!"},
  {"t": "d", "who": "남학생", "ja": "「え～すけべぇ～」", "ko": "에~ 변태~."},
  {"t": "d", "who": "여학생", "ja": "「ちーがーいーまーす！まわりの友達が全部読んでるって言ったから、おすすめしてもらっただけだし。あたしここまでアレなのはちょっと……」", "ko": "아~니~거~든! 주변 친구들이 다 본다길래 추천받은 것뿐이거든? 난 이렇게까지는 좀……."},
  {"t": "n", "text": "금요일 3교시.\n창가로 쏟아지는 따끈한 오후 햇살이 멀쩡한 대학생들을 집단 최면으로 몰살시키는 마의 시간대."},
  {"t": "n", "text": "밥때도 애매한 데다 공석 창출의 일등 공신인 '미학 입문'이라는 수면제 같은 강의명까지.\n몇몇 독기 가득한 전공생을 빼면 다들 영혼이 가출한 얼굴로 널브러진 이 공간은 오늘도 쾌적하다 못해 황량했다."},
  {"t": "n", "text": "하지만 누군가에게 이 하품 나는 수업은 일주일에 단 한 번 찾아오는 눈물겨운 **'구원의 시간'**이었는데……"}
];
