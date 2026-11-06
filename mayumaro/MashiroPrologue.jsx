// 필요 훅: useState (react)
// 마유마로 첫인사 프롤로그 (첫인사 전용)
// 처음엔 접힌 노트 표지. '노트 펼치기'를 누르면 미학 입문 노트가 펼쳐진다.
// 글은 맨 아래 MP_BLOCKS에 있다. t:"n" 서술, t:"d" 대사(who 화자, ja 일본어, ko 한국어).
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

        <div className="mp-lines">
          {MP_BLOCKS.map((b, i) =>
            b.t === "d" ? (
              <div className={"mp-d" + (b.who === "마시로" ? " mp-d-mashiro" : "")} key={i}>
                <div className="mp-ja" lang="ja">
                  <span className="mp-who">{b.who}</span>
                  {mpMark(b.ja)}
                </div>
                <div className="mp-ko">{mpMark(b.ko)}</div>
              </div>
            ) : (
              <p className="mp-n" key={i}>{mpMark(b.text)}</p>
            )
          )}
        </div>

        <div className="mp-foot" aria-hidden="true">
          <div className="mp-sketch">{mpSketch()}</div>
          <div className="mp-foot-notes">
            <span className="mp-scribble" lang="ja">線がええ…</span>
            <span className="mp-tsuzuku" lang="ja">つづく</span>
          </div>
        </div>
        <div className="mp-dogear" aria-hidden="true" />
      </div>

      <button type="button" className="mp-btn mp-btn-close" onClick={onClose} aria-expanded="true">
        노트 접기
      </button>
    </div>
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

/* 연필 크로키: 목덜미에서 어깨로 이어지는 선 */
function mpSketch() {
  const s = { fill: "none", stroke: "#8c909b", strokeLinecap: "round" };
  return (
    <svg width="150" height="92" viewBox="0 0 150 92">
      <path d="M40 8 C44 26 46 40 44 52 C42 60 30 66 12 72" {...s} strokeWidth="1.5" />
      <path d="M41 10 C45 27 47 41 45 53" {...s} strokeWidth="0.8" opacity="0.6" />
      <path d="M44 52 C60 58 92 60 138 66" {...s} strokeWidth="1.5" />
      <path d="M46 54 C62 60 94 62 136 68" {...s} strokeWidth="0.8" opacity="0.55" />
      <path d="M62 6 C64 18 66 28 70 36 C76 42 84 44 96 44" {...s} strokeWidth="1.3" />
      <path d="M70 36 C66 40 62 46 60 54" {...s} strokeWidth="1" opacity="0.7" />
      <path d="M50 60 L56 52 M56 61 L62 53 M62 62 L68 54 M68 62 L74 55 M74 63 L80 56" {...s} strokeWidth="0.8" opacity="0.6" />
      <path d="M20 84 C50 80 92 82 128 86" {...s} strokeWidth="0.7" opacity="0.35" />
    </svg>
  );
}

const MP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Gowun+Dodum&family=Klee+One:wght@400;600&family=Zen+Maru+Gothic:wght@500;700&display=swap');

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
  padding: 0 18px 0 calc(var(--mp-mx) + 14px);
  background-image:
    linear-gradient(to right, transparent 0, transparent var(--mp-mx), var(--mp-margin) var(--mp-mx), var(--mp-margin) calc(var(--mp-mx) + 1.5px), transparent calc(var(--mp-mx) + 1.5px)),
    repeating-linear-gradient(to bottom, transparent 0, transparent 29px, var(--mp-rule) 29px, var(--mp-rule) 30px);
}
.mp-n, .mp-ko {
  margin: 0;
  font-size: 16px; line-height: 30px;
  word-break: keep-all; overflow-wrap: break-word;
}
.mp-n { color: var(--mp-ink-soft); margin-bottom: 30px; }
.mp-d { margin: 0 0 30px; padding-left: 10px; border-left: 2.5px solid #c9d5e8; }
.mp-d-mashiro { border-left-color: var(--mp-pink); }
.mp-ko { color: var(--mp-ink); }
.mp-ja {
  font-family: "Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Hiragino Sans", sans-serif; font-weight: 500;
  font-size: 14.5px; line-height: 30px; color: var(--mp-ja);
  line-break: strict; overflow-wrap: anywhere;
}
.mp-who {
  display: inline-block; vertical-align: 1px;
  margin-right: 8px; padding: 0 8px;
  font-family: "Gowun Dodum", "Noto Sans KR", sans-serif; font-size: 12px; line-height: 20px;
  color: #4d6081; background: #e7edf6; border-radius: 999px;
}
.mp-d-mashiro .mp-who { color: var(--mp-pink-deep); background: #fbe2e9; }
.mp-mark { text-decoration: underline wavy #e07b93; text-decoration-thickness: 1.5px; text-underline-offset: 4px; }

.mp-foot {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 8px;
  padding: 0 22px 26px calc(var(--mp-mx) + 6px);
}
.mp-sketch { line-height: 0; opacity: 0.95; }
.mp-foot-notes { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; padding-bottom: 6px; }
.mp-scribble { font-family: "Klee One", sans-serif; font-size: 15px; color: var(--mp-pencil); transform: rotate(-4deg); }
.mp-tsuzuku { font-family: "Klee One", sans-serif; font-weight: 600; font-size: 19px; color: #3a3d48; border-bottom: 2px solid var(--mp-pink); padding: 0 2px; }
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
  .mp-lines { padding-right: 14px; padding-left: calc(var(--mp-mx) + 10px); }
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
  .mp-foot { padding-left: calc(var(--mp-mx) + 4px); }
  .mp-sketch svg { width: 120px; height: 74px; }
}

@media (prefers-reduced-motion: reduce) {
  .mp-open { animation: none; }
  .mp-btn-open { transition: none; }
}
`;

const MP_BLOCKS = [
  {"t": "d", "who": "남학생", "ja": "「ねえねえ、この漫画…すっげぇエロくね？」", "ko": "\"야, 이 만화… 장난 아니게 야하지 않냐?\""},
  {"t": "n", "text": "강의실 중간 언저리에 나란히 앉은 남학생이 옆자리 여학생 쪽으로 스마트폰 화면을 슬며시 내밀며 속닥거렸다."},
  {"t": "d", "who": "여학생", "ja": "「あ、これ知ってる！」", "ko": "\"아, 나 이거 알아!\""},
  {"t": "d", "who": "남학생", "ja": "「え～すけべぇ～」", "ko": "\"에이~ 변태구만~.\""},
  {"t": "d", "who": "여학생", "ja": "「ちーがーいーまーす！まわりの友達が全部読んでるって言ったから、おすすめしてもらっただけだから。あたしここまでやらしいのはちょっと……」", "ko": "\"아~니~거~든! 주변 친구들이 다 본다길래 추천받은 것뿐이거든? 난 이렇게까지 야한 건 좀…….\""},
  {"t": "n", "text": "금요일 3교시. 나른한 오후 햇살이 창가 자리를 노곤하게 데우는 탓에, 숨만 쉬어도 눈꺼풀이 천근만근 무거워지는 마의 시간대다."},
  {"t": "n", "text": "점심을 먹기 전도 아니고 먹은 직후도 아닌 어중간한 시간에 걸쳐 버린 이 수업은 늘 강의실이 한산했다. 교양 '미학 입문'이라는, 듣기만 해도 하품이 절로 나오는 정직한 강의명도 공석 창출에 한몫 단단히 거들고 있을 터였다."},
  {"t": "n", "text": "하지만 이 무료한 강의실 구석, 누군가에게만큼은 이 수업이 일주일에 단 한 번 찾아오는 '인생 구원의 시간'이었다."},
  {"t": "n", "text": "강의실 맨 뒷줄 구석, 좁은 일체형 책상에 커다란 덩치를 구겨 넣은 마시로의 시선이 단 한 곳에 진득하게 꽂혀 있었다. 정확히 세 줄 앞, 햇살이 부서지는 창가 자리. 두꺼운 뿔테 안경 너머로 피사체를 좇는 눈동자가 바쁘게 움직이고, 큼직한 손에 쥔 4B 연필이 크로키북 위를 사각거리며 경쾌하게 미끄러졌다."},
  {"t": "d", "who": "마시로", "ja": "「あかん…今日も線がええ…めっちゃええで…」", "ko": "\"아이고 마, 큰일 났네… 오늘도 선이 억수로 좋다 아이가…\""},
  {"t": "n", "text": "목탄의 끝이 피사체의 목덜미에서 어깨로 떨어지는 매끄러운 곡선, 날렵한 턱선과 콧대를 거침없이 낚아챈다. 숨소리조차 죽인 채 코끝이 종이에 닿을 듯 말 듯 몰입하던 찰나, 과집중 끝에 뒤늦은 이성이 퍽 하고 뒤통수를 후려쳤다."},
  {"t": "n", "text": "물론 마시로 본인도 잘 알고 있다. 아무리 작화 연습이라지만 남의 뒷모습을 허락도 없이 훔쳐 그리는 건 누가 봐도 수상한 짓거리라는 걸! 머리로는 백번 천번 알면서도, 홀린 듯 움직이는 이 야속한 손을 멈출 수가 없으니 미칠 노릇이었다."},
  {"t": "n", "text": "가뜩이나 그늘진 마시로의 얼굴이 금방이라도 울음을 터뜨릴 듯 쭈글쭈글하게 구겨졌다. 훌쩍이는 와중에도 손목만큼은 프로의 머슬 메모리를 발휘해 사각사각 맹렬하게 선을 쌓아 올리고 있으니, 참으로 눈물겨운 장인 정신이 아닐 수 없었다."},
  {"t": "d", "who": "교수", "ja": "「雪道くんー」", "ko": "\"유키미치 군~.\""},
  {"t": "d", "who": "남학생", "ja": "「はーい」", "ko": "\"네~에.\""},
  {"t": "n", "text": "낯선 이름들이 귓가에 섞여 들어와 번쩍 고개를 드니, 어느새 출석 호명이 시작되고 있었다. 마시로의 순서는 열네 번째, 거의 끝자락이다."},
  {"t": "n", "text": "쿵, 쿵. 흉곽 안에서 심장이 콩알만 하게 쪼그라들어 방망이질을 해댔다. 초등학교, 중학교, 고등학교를 거쳐 대학생이 된 지금까지도 이 순간만 다가오면 양 손바닥이 식은땀으로 축축해지고 만다."},
  {"t": "d", "who": "교수", "ja": "「えー、次ー。……ええと。シンバイウガワ、くん？」", "ko": "\"어, 다음. ……음, 신바이우가와 군?\""},
  {"t": "n", "text": "……역시나. 개강 이후 단 한 주도 빠짐없이, 이번 주로 벌써 다섯 번째 개명이다."},
  {"t": "d", "who": "마시로", "ja": "「……まつゆかわ、です……」", "ko": "\"……마츠유카와, 입니다…….\""},
  {"t": "n", "text": "정정해야 할지 그냥 넘어갈지 머릿속이 약 2초간 과부하에 걸렸다가, 마침내 모기만 한 목소리를 겨우 쥐어짜 냈다. 그래 봤자 다음 주에도, 아니 졸업장을 받을 때까지도 저 교수님에게 자신은 영원히 '신바이우가와'일 것이다. 평생 그래 왔으니까."},
  {"t": "n", "text": "여기저기서 풉, 하고 새어 나오는 웃음소리에 마시로는 화끈거리는 두 뺨을 펑퍼짐한 후드티 소매에 푹 파묻었다. 그나마 다행이라면 다행이었다. 자기 성씨 하나 제대로 정정하지 못해 벌벌 떠는 이 맹한 남자가, 방금 앞자리 학생들이 속닥거리던 여성향 웹코믹 플랫폼 '루넬'의 최고 수위 인기 작가 '마유마로'라는 걸 대체 누가 상상이나 하겠는가."}
];
