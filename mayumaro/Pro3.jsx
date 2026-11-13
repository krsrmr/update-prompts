// 필요 훅: useState (react)
// 마유마로 첫인사 프롤로그 3 (인트로 3 서점 편 전용)
// 처음엔 서점 매대에 세워 둔 인쇄 POP. 'POP 펼치기'를 누르면 POP 안쪽에 프롤로그가 적혀 있다.
// 글은 맨 아래 M3_BLOCKS에 있다. t:"n" 서술, t:"d" 대사(who 화자, ja 일본어, ko 한국어).
// 펼친 채로 시작하려면 <Pro3 defaultOpen={true} />

function Pro3(props = {}) {
  const { defaultOpen = false } = props;
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <div className="m3-root">
      <style>{M3_CSS}</style>
      {open ? m3Page(() => setOpen(false)) : m3Cover(() => setOpen(true))}
    </div>
  );
}

/* ---------- 접힌 상태: 서점 매대 인쇄 POP ---------- */
function m3Cover(onOpen) {
  return (
    <div className="m3-cover">
      <div className="m3-tab" aria-hidden="true">프롤로그</div>

      <div className="m3-pop">
        <div className="m3-pop-main">
          <div className="m3-pop-left">
            <div className="m3-src" lang="ja">
              <span className="m3-src-name">ルネル</span>
              <span className="m3-src-date">(2026/07)</span>
            </div>
            <div className="m3-h m3-h-mag" lang="ja">総合ランキング</div>
            <div className="m3-h" lang="ja">
              <span className="m3-h-box">1位</span>作家、
            </div>
            <div className="m3-h" lang="ja">ついに単行本化!</div>
            <div className="m3-h-ko">루넬 종합 랭킹 1위 작가, 드디어 단행본으로!</div>

            <div className="m3-stat" lang="ja">
              <span className="m3-stat-lead">― SNS累計</span>
              <span className="m3-num-grp"><span className="m3-num">61</span><span className="m3-num-unit">万</span></span>
              <span className="m3-stat-tail">いいね</span>
            </div>
          </div>

          <div className="m3-pop-right">
            <div className="m3-vt" lang="ja">
              <div className="m3-vt-kicker">ルネル看板作家</div>
              <div className="m3-vt-title">マユマロ</div>
              <div className="m3-vt-mag">誕生秘話、初公開!</div>
              <div className="m3-vt-quote">
                「たった<span className="m3-tcy">0.3</span>秒で、<br />人生ひっくり返った。」
              </div>
            </div>
          </div>
        </div>

        <div className="m3-gloss">마유마로 탄생 비화 첫 공개! “단 0.3초 만에 인생이 뒤집혔다.”</div>

        <div className="m3-pop-foot">
          <div className="m3-foot-text">
            <span className="m3-foot-ja" lang="ja">第1巻 好評発売中!</span>
            <span className="m3-foot-ko">1권 절찬 발매 중</span>
          </div>
          <div className="m3-foot-critter" aria-hidden="true">{m3Critter(54)}</div>
        </div>
      </div>

      <div className="m3-hot" aria-hidden="true">
        <span lang="ja">話題<br />沸騰!</span>
      </div>

      <button type="button" className="m3-btn m3-btn-open" onClick={onOpen} aria-expanded="false">
        {m3OpenIcon()}
        <span>POP 펼치기</span>
      </button>
    </div>
  );
}

/* ---------- 펼친 상태: POP 안쪽 ---------- */
function m3Page(onClose) {
  return (
    <div className="m3-open">
      <div className="m3-band">
        <span className="m3-band-title" lang="ja">マユマロ 誕生秘話</span>
        <button type="button" className="m3-btn m3-btn-small" onClick={onClose} aria-expanded="true">
          POP 보기
        </button>
      </div>
      <div className="m3-strip" aria-hidden="true" />

      <div className="m3-paper">
        <div className="m3-head">
          <div className="m3-meta">
            <span className="m3-printed">No.</span>
            <span className="m3-hand m3-meta-val">0730</span>
            <span className="m3-printed" lang="ja">売場</span>
            <span className="m3-hand m3-meta-val" lang="ja">新刊コミック</span>
          </div>
          <div className="m3-critter m3-critter-page" aria-hidden="true">{m3Critter(46)}</div>
        </div>

        <div className="m3-title-row">
          <h3 className="m3-title"><span>프롤로그</span></h3>
          <div className="m3-tag" aria-hidden="true">
            <span className="m3-tag-ja" lang="ja">〆切まで あと<b>10</b>日</span>
            <span className="m3-tag-ko">마감까지 10일</span>
          </div>
        </div>

        {m3WobbleDefs()}
        <div className="m3-lines">
          {M3_BLOCKS.map((b, i) =>
            b.t === "d" ? m3Balloon(b, i) : b.t === "profile" ? m3Profile(i) : (
              <p className="m3-blk m3-n" key={i}>{m3Rich(b.text)}</p>
            )
          )}
        </div>

        <div className="m3-foot">
          <div className="m3-cont">
            <span className="m3-spark m3-spark-a" aria-hidden="true">✦</span>
            <span className="m3-spark m3-spark-b" aria-hidden="true">✦</span>
            <div className="m3-cont-critter" aria-hidden="true">{m3Critter(44)}</div>
            <div className="m3-ribbon">
              <span className="m3-serial" aria-hidden="true">MS 0730 2026</span>
              <span className="m3-ribbon-ja" lang="ja">つづく</span>
            </div>
          </div>
          <div className="m3-cont-ko">아래에서 계속!</div>
          <div className="m3-cont-arrow" aria-hidden="true">{m3DownArrow()}</div>
        </div>
      </div>

      <button type="button" className="m3-btn m3-btn-close" onClick={onClose} aria-expanded="true">
        POP 보기
      </button>
    </div>
  );
}

/* 펼치기 아이콘(펼친 책) */
function m3OpenIcon() {
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinejoin: "round", strokeLinecap: "round" };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 6.5 C9.5 4.8 6.5 4.5 3 5 V18.5 C6.5 18 9.5 18.3 12 20 C14.5 18.3 17.5 18 21 18.5 V5 C17.5 4.5 14.5 4.8 12 6.5 Z" {...s} />
      <path d="M12 6.5 V20" {...s} />
    </svg>
  );
}

/* 만화 말풍선
   학생: 속삭임 점선 풍선 / 교수: 각진 풍선 / 마시로: 떨리는 선 풍선(오른쪽) */
const M3_SIDE = { "남학생": "left", "여학생": "right", "교수": "left", "마시로": "right" };
const M3_KIND = { "남학생": "whisper", "여학생": "whisper", "교수": "box", "마시로": "shaky" };

function m3Balloon(b, i) {
  const side = M3_SIDE[b.who] || "left";
  const kind = M3_KIND[b.who] || "box";
  return (
    <div className={"m3-blk m3-bal-row m3-" + side} key={i}>
      <span className={"m3-who m3-who-" + kind}>{b.who}</span>
      <div className={"m3-bal m3-bal-" + kind}>
        <div className="m3-bal-shape" aria-hidden="true" />
        <svg className="m3-tail" width="26" height="20" viewBox="0 0 26 20" aria-hidden="true">
          <path d="M3 0 C7 7 6 13 2 19 C11 14 17 8 22 0" />
        </svg>
        <div className="m3-bal-text">
          <div className="m3-ja" lang="ja">{m3Mark(b.ja)}</div>
          <div className="m3-ko">{m3Mark(b.ko)}</div>
        </div>
        {b.sfx ? <span className="m3-sfx" lang="ja" aria-hidden="true">{b.sfx}</span> : null}
      </div>
    </div>
  );
}

/* 마시로 풍선의 떨리는 선 */
function m3WobbleDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <filter id="m3-wobble" x="-5%" y="-10%" width="110%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

/* 서술 한 문단: 줄바꿈(\n)은 줄을 나누고, **굵게**는 형광펜 강조 */
function m3Rich(text) {
  const lines = String(text).split("\n");
  const out = [];
  lines.forEach((line, li) => {
    if (li > 0) out.push(<br key={"br" + li} />);
    line.split(/\*\*(.+?)\*\*/).forEach((seg, si) => {
      if (!seg) return;
      out.push(
        si % 2 === 1 ? (
          <strong className="m3-em" key={li + "-" + si}>{m3Mark(seg)}</strong>
        ) : (
          <span key={li + "-" + si}>{m3Mark(seg)}</span>
        )
      );
    });
  });
  return out;
}

/* 루넬 작가 프로필 (짧게) */
function m3Profile(i) {
  return (
    <div className="m3-blk m3-prof-row" key={i}>
      <div className="m3-prof">
        <div className="m3-prof-bar">
          <span className="m3-moon" aria-hidden="true" />
          <span className="m3-logo">Lunelle</span>
          <span className="m3-prof-bar-sub" lang="ja">作家ページ</span>
        </div>
        <div className="m3-prof-body">
          <div className="m3-prof-avatar" aria-hidden="true">{m3Marshmallow()}</div>
          <div className="m3-prof-main">
            <div className="m3-prof-name">
              <span lang="ja">マユマロ</span>
              <span className="m3-prof-name-ko">마유마로</span>
            </div>
            <div className="m3-prof-badges">
              <span className="m3-badge m3-badge-fill" lang="ja">看板作家</span>
              <span className="m3-badge" lang="ja">R18</span>
            </div>
          </div>
          <span className="m3-prof-follow" lang="ja" aria-hidden="true">フォロー</span>
        </div>
        <p className="m3-prof-bio">
          <span lang="ja">ふわふわ甘くて、ちょっぴりえっちなお話を描いています🍡</span>
          <span className="m3-prof-bio-ko">폭신하고 달콤한, 살짝 야한 이야기를 그려요🍡</span>
        </p>
        <div className="m3-prof-stats">
          <span><b>8.6万</b> <span lang="ja">フォロワー</span></span>
          <span className="m3-prof-heart"><b>61万</b> <span lang="ja">いいね</span></span>
        </div>
      </div>
    </div>
  );
}

function m3Marshmallow() {
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
function m3Mark(text) {
  const parts = String(text).split(/(신바이우가와|シンバイウガワ)/);
  return parts.map((p, i) =>
    p === "신바이우가와" || p === "シンバイウガワ" ? (
      <span className="m3-mark" key={i}>{p}</span>
    ) : (
      p
    )
  );
}

/* 오리지널 마스코트 스티커: 둥근 흰 몸, 점 눈, 작은 귀, 분홍 볼 */
function m3Critter(size) {
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
function m3DownArrow() {
  const st = { fill: "none", stroke: "#e5337d", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg width="34" height="34" viewBox="0 0 34 34">
      <path d="M8 6 L17 14 L26 6" {...st} />
      <path d="M8 17 L17 25 L26 17" {...st} opacity="0.55" />
    </svg>
  );
}

const M3_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Noto+Sans+KR:wght@700;900&family=Cormorant+Garamond:ital,wght@1,700&family=Klee+One:wght@600&family=Zen+Maru+Gothic:wght@500;700&family=Zen+Kaku+Gothic+New:wght@700;900&family=Shippori+Mincho+B1:wght@600;800&display=swap');

.m3-root {
  --m3-mag: #e5337d;
  --m3-mag-deep: #c41f63;
  --m3-mag-soft: #fde0ec;
  --m3-yellow: #ffd93b;
  --m3-yellow-pale: #fff3a3;
  --m3-yellow-soft: #fff08a;
  --m3-navy: #1f2547;
  --m3-red: #e60039;
  --m3-cyan: #19a7da;
  --m3-paper: #fffdf6;
  --m3-ink: #262730;
  --m3-ink-soft: #383a44;
  --m3-ja: #5d6178;
  --m3-print: #8c8fa0;
  --m3-mx: 34px;
  width: 100%;
  max-width: 600px;
  margin: 10px auto;
  padding: 4px 2px 8px;
  box-sizing: border-box;
  font-family: "Gowun Dodum", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  color: var(--m3-ink);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.m3-root *, .m3-root *::before, .m3-root *::after { box-sizing: border-box; }

/* 공통 글꼴 */
.m3-goth { font-family: "Zen Kaku Gothic New", "Noto Sans JP", "Hiragino Sans", sans-serif; }
.m3-hand { font-family: "Zen Kaku Gothic New", "Noto Sans JP", sans-serif; font-weight: 700; color: var(--m3-navy); }
.m3-printed { font-family: "Zen Maru Gothic", sans-serif; font-weight: 500; font-size: 11px; color: var(--m3-print); letter-spacing: 0.04em; }

/* ---------- 인쇄 POP ---------- */
.m3-cover {
  position: relative;
  max-width: 480px;
  margin: 0 auto;
  padding: 30px 4px 2px;
}
.m3-tab {
  position: absolute; z-index: 1; top: 4px; left: 16px;
  padding: 5px 16px 8px;
  border-radius: 8px 8px 0 0;
  background: var(--m3-mag);
  font-family: "Noto Sans KR", sans-serif; font-weight: 900; font-size: 14px; letter-spacing: 0.08em;
  color: #fff;
}
.m3-pop {
  position: relative; z-index: 2;
  overflow: hidden;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 8px 18px rgba(30,30,60,0.2), 0 1px 3px rgba(30,30,60,0.18);
}
.m3-pop-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 166px;
}

/* 왼쪽: 노란 바탕 헤드라인 */
.m3-pop-left {
  position: relative;
  padding: 18px 14px 16px 18px;
  background: var(--m3-yellow-pale);
  font-family: "Zen Kaku Gothic New", "Noto Sans JP", "Hiragino Sans", sans-serif; font-weight: 900;
  color: var(--m3-navy);
}
.m3-pop-left::after {
  content: ""; position: absolute; right: 0; bottom: 0; width: 70%; height: 55%;
  background: radial-gradient(circle, rgba(255,200,0,0.55) 1.6px, transparent 2px) 0 0 / 9px 9px;
  -webkit-mask-image: linear-gradient(135deg, transparent 30%, #000 100%);
  mask-image: linear-gradient(135deg, transparent 30%, #000 100%);
  pointer-events: none;
}
.m3-src { position: relative; z-index: 1; display: flex; align-items: baseline; gap: 4px; }
.m3-src-name { font-size: 26px; line-height: 1.2; letter-spacing: 0.04em; }
.m3-src-date { font-size: 10.5px; font-weight: 700; color: #5d6178; letter-spacing: 0.02em; }
.m3-h { position: relative; z-index: 1; font-size: 29px; line-height: 1.3; letter-spacing: 0.01em; word-break: keep-all; }
.m3-h-mag { color: var(--m3-mag); margin-top: 2px; }
.m3-h-box {
  display: inline-block;
  margin: 3px 4px 3px 0; padding: 0 10px 1px;
  border-radius: 8px;
  background: var(--m3-mag); color: #fff;
}
.m3-h-ko {
  position: relative; z-index: 1;
  margin-top: 6px;
  font-family: "Gowun Dodum", "Noto Sans KR", sans-serif; font-weight: 400; font-size: 12.5px; line-height: 1.5;
  color: #6b6a55; word-break: keep-all;
}
.m3-stat {
  position: relative; z-index: 1;
  display: flex; align-items: baseline; flex-wrap: wrap;
  margin-top: 10px;
  font-size: 17px; line-height: 1;
}
.m3-stat-lead { margin-right: 4px; }
.m3-num {
  font-size: 54px; line-height: 0.95; letter-spacing: -0.02em; color: var(--m3-red);
  font-style: italic; padding-right: 2px;
}
.m3-num-grp { white-space: nowrap; }
.m3-num-unit { font-size: 28px; color: var(--m3-red); margin-right: 3px; }
.m3-stat-tail { font-size: 17px; }

/* 오른쪽: 흰 바탕 세로쓰기 */
.m3-pop-right {
  position: relative;
  display: flex; justify-content: center;
  padding: 58px 8px 14px;
  background: #fff;
  border-left: 3px solid var(--m3-mag);
  overflow: hidden;
}
.m3-vt {
  writing-mode: vertical-rl; text-orientation: mixed;
  height: 252px;
}
.m3-vt > div { margin-left: 5px; }
.m3-vt > div:last-child { margin-left: 0; }
.m3-vt-kicker {
  font-family: "Zen Kaku Gothic New", sans-serif; font-weight: 700; font-size: 12px; line-height: 1.3; letter-spacing: 0.12em;
  color: var(--m3-mag);
}
.m3-vt-title {
  font-family: "Shippori Mincho B1", "Hiragino Mincho ProN", "Noto Serif JP", serif; font-weight: 800;
  font-size: 38px; line-height: 1; letter-spacing: 0.1em; color: var(--m3-navy);
}
.m3-vt-mag {
  font-family: "Zen Kaku Gothic New", sans-serif; font-weight: 900; font-size: 18px; line-height: 1.1; letter-spacing: 0.06em;
  color: var(--m3-mag);
}
.m3-vt-quote {
  margin-top: 26px;
  padding: 8px 4px;
  border: 1px solid var(--m3-navy);
  height: -webkit-fit-content; height: fit-content;
  font-family: "Shippori Mincho B1", "Hiragino Mincho ProN", serif; font-weight: 600;
  font-size: 13px; line-height: 1.65; letter-spacing: 0.06em; color: var(--m3-navy);
}
.m3-tcy { text-combine-upright: all; -webkit-text-combine: horizontal; }

.m3-gloss {
  padding: 7px 14px 8px;
  background: #fff;
  border-top: 1px solid #eee6c4;
  font-size: 12.5px; line-height: 1.5; color: #75707e; text-align: center; word-break: keep-all;
}

.m3-pop-foot {
  position: relative;
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 16px 10px 18px;
  background: var(--m3-navy);
}
.m3-foot-text { display: flex; align-items: baseline; flex-wrap: wrap; gap: 2px 10px; }
.m3-foot-ja {
  font-family: "Zen Kaku Gothic New", sans-serif; font-weight: 900; font-size: 21px; letter-spacing: 0.06em;
  color: var(--m3-yellow);
}
.m3-foot-ko { font-size: 12.5px; color: rgba(255,255,255,0.75); }
.m3-foot-critter {
  position: absolute; right: 12px; bottom: 6px;
  line-height: 0; padding: 2px; background: #fff; border-radius: 50%;
  transform: rotate(10deg);
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
.m3-foot-critter svg { display: block; }

.m3-hot {
  position: absolute; z-index: 4; top: 10px; right: -4px;
  width: 78px; height: 78px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--m3-red);
  border: 3px solid #fff;
  box-shadow: 0 3px 6px rgba(120,0,30,0.3);
  transform: rotate(10deg);
}
.m3-hot::before {
  content: ""; position: absolute; inset: 4px; border-radius: 50%;
  border: 1.5px dashed rgba(255,255,255,0.7);
}
.m3-hot span {
  position: relative; text-align: center;
  font-family: "Zen Kaku Gothic New", sans-serif; font-weight: 900; font-size: 17px; line-height: 1.15; letter-spacing: 0.04em;
  color: #fff;
}

.m3-critter { flex: 0 0 auto; line-height: 0; filter: drop-shadow(0 2px 3px rgba(40,40,70,0.22)); }
.m3-critter svg { display: block; }

.m3-btn {
  font-family: inherit; cursor: pointer; border: 0;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  -webkit-tap-highlight-color: transparent;
}
.m3-btn:focus-visible { outline: 2.5px solid var(--m3-mag-deep); outline-offset: 3px; }
.m3-btn-open {
  position: relative; z-index: 2;
  margin-top: 18px; width: 100%; min-height: 50px;
  border-radius: 10px;
  background: #fff; color: var(--m3-mag-deep);
  border: 2px solid var(--m3-mag);
  font-size: 17px; letter-spacing: 0.02em;
  box-shadow: 0 3px 0 var(--m3-mag-deep), 0 5px 12px rgba(140,30,70,0.16);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.m3-btn-open:hover { transform: translateY(-1px); box-shadow: 0 4px 0 var(--m3-mag-deep), 0 7px 14px rgba(140,30,70,0.18); }
.m3-btn-open:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--m3-mag-deep), 0 2px 6px rgba(140,30,70,0.16); }

/* ---------- POP 안쪽 ---------- */
.m3-open { animation: m3Pop 0.4s cubic-bezier(0.2, 0.8, 0.25, 1) both; transform-origin: center top; }
@keyframes m3Pop {
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to { opacity: 1; transform: none; }
}

.m3-band {
  position: relative; z-index: 2;
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  min-height: 46px; padding: 6px 10px 6px 16px;
  border-radius: 12px 12px 0 0;
  background: var(--m3-mag);
}
.m3-band-title {
  font-family: "Zen Kaku Gothic New", sans-serif; font-weight: 900; font-size: 18px; letter-spacing: 0.08em;
  color: #fff;
}
.m3-btn-small {
  min-height: 34px; padding: 0 14px; border-radius: 999px;
  background: #fff; color: var(--m3-mag-deep); font-size: 14px;
  box-shadow: 0 1px 2px rgba(120,20,60,0.3);
}
.m3-strip { height: 8px; background: var(--m3-yellow); border-bottom: 3px solid var(--m3-navy); }

.m3-paper {
  position: relative; overflow: hidden;
  background: var(--m3-paper);
  border-radius: 0 0 12px 12px;
  padding: 22px 0 0;
  box-shadow: 0 6px 16px rgba(30,30,60,0.14), 0 1px 3px rgba(30,30,60,0.12);
}

.m3-head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
  padding: 4px 66px 0 calc(var(--m3-mx) + 14px);
}
.m3-meta { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 8px; padding-top: 8px; }
.m3-meta-val { font-size: 16px; min-width: 34px; padding: 0 6px 1px; border-bottom: 1.5px solid #cfd2dc; text-align: center; margin-right: 6px; }
.m3-critter-page { transform: rotate(10deg); padding: 2px; background: #fff; border-radius: 50%; margin-top: 10px; }

.m3-title-row {
  position: relative;
  display: flex; align-items: flex-end; justify-content: space-between; gap: 10px;
  padding: 0 18px 0 calc(var(--m3-mx) + 14px);
  margin: 8px 0 20px;
}
.m3-title {
  margin: 0; padding: 0;
  font-family: "Noto Sans KR", sans-serif; font-weight: 900; font-size: 26px; line-height: 1.25; letter-spacing: 0.04em;
  color: var(--m3-navy);
}
.m3-title span { background: linear-gradient(transparent 60%, var(--m3-yellow-soft) 60%, var(--m3-yellow-soft) 94%, transparent 94%); padding: 0 6px; }

/* 마감 딱지 */
.m3-tag {
  flex: 0 0 auto;
  display: flex; flex-direction: column; align-items: center;
  padding: 6px 10px 6px;
  background: #fff;
  border: 2px solid var(--m3-navy);
  box-shadow: 3px 3px 0 var(--m3-yellow);
  margin-bottom: 2px;
}
.m3-tag-ja {
  font-family: "Zen Kaku Gothic New", sans-serif; font-weight: 900; font-size: 13px; line-height: 1.3; color: var(--m3-navy); white-space: nowrap;
}
.m3-tag-ja b { font-size: 22px; color: var(--m3-red); font-style: italic; padding: 0 1px; }
.m3-tag-ko { font-size: 11.5px; line-height: 1.4; color: #6b6e80; }

.m3-blk {
  position: relative;
  margin: 0;
  padding: 0 18px 30px calc(var(--m3-mx) + 14px);
}
.m3-n {
  font-size: 16px; line-height: 30px; color: var(--m3-ink-soft);
  word-break: keep-all; overflow-wrap: break-word;
}
.m3-n::before {
  content: ""; position: absolute; left: calc(var(--m3-mx) - 5px); top: 12px;
  width: 7px; height: 7px; background: var(--m3-mag);
}

/* ---- 말풍선 ---- */
.m3-bal-row { display: flex; flex-direction: column; align-items: flex-start; padding-top: 4px; padding-bottom: 34px; }
.m3-bal-row.m3-right { align-items: flex-end; }
.m3-bal {
  position: relative;
  max-width: calc(100% - 34px);
  padding: 12px 20px 13px;
  margin-top: 5px;
}
.m3-bal-shape { position: absolute; inset: 0; border: 2px solid #3c404d; background: #fff; }
.m3-bal-text { position: relative; z-index: 2; }
.m3-ja {
  font-family: "Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Hiragino Sans", sans-serif; font-weight: 500;
  font-size: 14px; line-height: 22px; color: var(--m3-ja);
  line-break: strict; overflow-wrap: anywhere;
}
.m3-ko {
  margin-top: 3px;
  font-size: 16px; line-height: 26px; color: var(--m3-ink);
  word-break: keep-all; overflow-wrap: break-word;
}

.m3-tail { position: absolute; z-index: 1; bottom: -17px; left: 30px; overflow: visible; }
.m3-tail path { fill: #fff; stroke: #3c404d; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
.m3-right .m3-tail { left: auto; right: 30px; transform: scaleX(-1); }

/* 학생: 속삭임 점선 */
.m3-bal-whisper .m3-bal-shape { border: 2px dashed #737b8f; border-radius: 34px / 28px; }
.m3-bal-whisper .m3-tail path { stroke: #737b8f; stroke-dasharray: 4 3; }

/* 교수: 각진 풍선 */
.m3-bal-box .m3-bal-shape { border-radius: 8px; border-width: 2.2px; }

/* 마시로: 떨리는 선, 분홍빛 */
.m3-bal-shaky .m3-bal-shape {
  border: 2px solid #6e4656; background: #fff4f7;
  border-radius: 36px 30px 38px 28px / 30px 36px 28px 34px;
  filter: url(#m3-wobble);
}
.m3-bal-shaky .m3-tail { filter: url(#m3-wobble); }
.m3-bal-shaky .m3-tail path { stroke: #6e4656; fill: #fff4f7; }

/* 화자 이름표 */
.m3-who {
  display: inline-block;
  padding: 0 9px;
  font-family: "Gowun Dodum", "Noto Sans KR", sans-serif; font-size: 12px; line-height: 20px;
  color: #4d6081; background: #e7edf6; border-radius: 999px;
}
.m3-right .m3-who { margin-right: 8px; }
.m3-bal-row.m3-left .m3-who { margin-left: 8px; }
.m3-who-shaky { color: var(--m3-pink-deep); background: #fbe2e9; }
.m3-who-box { color: #4a4d58; background: #eceae4; }

/* 만화 효과음(세로쓰기) */
.m3-sfx {
  position: absolute; top: 50%; transform: translateY(-50%) rotate(6deg);
  writing-mode: vertical-rl; text-orientation: upright;
  font-family: "Klee One", sans-serif; font-weight: 600; font-size: 14px; letter-spacing: 0.06em; line-height: 1;
  color: #8b8f9b; white-space: nowrap;
}
.m3-left .m3-sfx { right: -28px; }
.m3-right .m3-sfx { left: -28px; transform: translateY(-50%) rotate(-6deg); color: #c56a85; }

.m3-mark { text-decoration: underline wavy #e07b93; text-decoration-thickness: 1.5px; text-underline-offset: 4px; }

/* **강조**: 굵은 글씨 + 하늘색 형광펜 */
.m3-em {
  font-family: "Noto Sans KR", "Gowun Dodum", "Apple SD Gothic Neo", sans-serif; font-weight: 700;
  color: #17181e;
  background: linear-gradient(transparent 52%, #fff08a 52%, #fff08a 90%, transparent 90%);
  -webkit-box-decoration-break: clone; box-decoration-break: clone;
  padding: 0 2px;
}

/* ---- 루넬 작가 프로필 ---- */
.m3-prof-row { padding-top: 10px; padding-bottom: 36px; }
.m3-prof {
  position: relative;
  max-width: 400px;
  background: #fff; color: #222027;
  border: 1px solid #e9e5ee; border-radius: 12px;
  box-shadow: 0 4px 12px rgba(60,40,70,0.12), 0 1px 2px rgba(60,40,70,0.08);
  font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif;
}
.m3-prof-bar { display: flex; align-items: center; gap: 7px; padding: 9px 14px; border-bottom: 1px solid #e9e5ee; }
.m3-moon { width: 15px; height: 15px; border-radius: 50%; box-shadow: inset -5px -1px 0 0 #d63c72; transform: rotate(-20deg); display: inline-block; flex: none; }
.m3-logo { font-family: "Cormorant Garamond", "Times New Roman", serif; font-style: italic; font-weight: 700; font-size: 19px; line-height: 1; color: #d63c72; }
.m3-prof-bar-sub { margin-left: auto; font-size: 11.5px; color: #75707e; }
.m3-prof-body { display: flex; align-items: center; gap: 12px; padding: 12px 14px 4px; }
.m3-prof-avatar { flex: none; line-height: 0; border-radius: 50%; box-shadow: 0 0 0 3px #fbe8ef; }
.m3-prof-main { flex: 1 1 auto; min-width: 0; }
.m3-prof-name { display: flex; align-items: baseline; flex-wrap: wrap; gap: 2px 7px; font-size: 18px; font-weight: 800; line-height: 1.3; }
.m3-prof-name-ko { font-size: 12.5px; font-weight: 400; color: #75707e; }
.m3-prof-badges { display: flex; gap: 5px; margin-top: 5px; }
.m3-badge { white-space: nowrap; font-size: 11px; font-weight: 700; line-height: 18px; padding: 0 7px; border-radius: 4px; color: #d63c72; border: 1px solid #f0b6c9; background: #fff; }
.m3-badge-fill { color: #fff; background: #d63c72; border-color: #d63c72; }
.m3-prof-follow { flex: none; align-self: flex-start; margin-top: 4px; font-size: 12px; font-weight: 700; color: #fff; background: #d63c72; border-radius: 999px; padding: 5px 12px; }
.m3-prof-bio { margin: 0; padding: 8px 14px 0; font-size: 13.5px; line-height: 1.6; color: #222027; }
.m3-prof-bio-ko { display: block; font-size: 12.5px; color: #75707e; }
.m3-prof-stats { display: flex; gap: 16px; padding: 9px 14px 12px; font-size: 12.5px; color: #75707e; }
.m3-prof-stats b { color: #222027; font-size: 14px; font-variant-numeric: tabular-nums; }
.m3-prof-heart b { color: #d63c72; }

/* ---- 아래에서 계속! ---- */
.m3-foot {
  display: flex; flex-direction: column; align-items: center;
  padding: 18px 16px 30px;
}
.m3-cont { position: relative; display: inline-flex; filter: drop-shadow(0 2px 3px rgba(20,25,50,0.25)); }
.m3-ribbon {
  position: relative;
  display: flex; align-items: center; gap: 14px;
  padding: 8px 22px 7px 20px;
  background: var(--m3-navy);
  border-radius: 3px;
}
.m3-serial {
  font-family: "Zen Maru Gothic", ui-monospace, monospace; font-weight: 500; font-size: 13px;
  letter-spacing: 0.14em; color: #c9cde0; font-variant-numeric: tabular-nums; white-space: nowrap;
}
.m3-ribbon-ja {
  font-family: "Zen Kaku Gothic New", sans-serif; font-weight: 900; font-size: 21px; line-height: 1.3;
  letter-spacing: 0.18em; color: var(--m3-yellow);
  padding-left: 14px; border-left: 1.5px solid rgba(255,255,255,0.35);
}
.m3-cont-critter {
  position: absolute; z-index: 2; left: -30px; top: -20px;
  line-height: 0; padding: 2px; background: #fff; border-radius: 50%;
  transform: rotate(-14deg);
  box-shadow: 0 1px 3px rgba(30,30,60,0.25);
}
.m3-spark { position: absolute; z-index: 2; line-height: 1; }
.m3-spark-a { top: -14px; right: -8px; font-size: 17px; color: var(--m3-mag); transform: rotate(12deg); }
.m3-spark-b { bottom: -10px; right: 18px; font-size: 12px; color: var(--m3-cyan); }
.m3-cont-ko {
  margin-top: 12px;
  font-family: "Noto Sans KR", sans-serif; font-weight: 900; font-size: 18px; line-height: 1.2; letter-spacing: 0.04em;
  color: var(--m3-mag);
}
.m3-cont-arrow { margin-top: 2px; line-height: 0; animation: m3Bob 1.4s ease-in-out infinite; }
@keyframes m3Bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(5px); }
}

.m3-btn-close {
  margin-top: 14px; width: 100%; min-height: 48px; border-radius: 10px;
  background: #fff; color: var(--m3-mag-deep); font-size: 16px;
  border: 2px solid var(--m3-mag);
  box-shadow: 0 2px 0 var(--m3-mag-deep), 0 4px 10px rgba(140,30,70,0.14);
}
.m3-btn-close:active { transform: translateY(1px); box-shadow: 0 1px 0 var(--m3-mag-deep), 0 2px 6px rgba(140,30,70,0.14); }

/* ---------- 좁은 화면 ---------- */
@media (max-width: 440px) {
  .m3-root { --m3-mx: 22px; }
  .m3-cover { padding: 28px 2px 2px; }
  .m3-tab { left: 12px; font-size: 13px; padding: 4px 13px 8px; }
  .m3-pop-main { grid-template-columns: minmax(0, 1fr) 132px; }
  .m3-pop-left { padding: 14px 8px 14px 12px; }
  .m3-src-name { font-size: 21px; }
  .m3-src-date { font-size: 9.5px; }
  .m3-h { font-size: 21px; }
  .m3-h-box { padding: 0 7px 1px; border-radius: 6px; }
  .m3-h-ko { font-size: 11.5px; }
  .m3-stat { font-size: 14px; margin-top: 8px; }
  .m3-num { font-size: 42px; }
  .m3-num-unit { font-size: 22px; }
  .m3-stat-tail { font-size: 14px; }
  .m3-pop-right { padding: 50px 4px 12px; }
  .m3-vt { height: 220px; }
  .m3-vt > div { margin-left: 4px; }
  .m3-vt-kicker { font-size: 10.5px; }
  .m3-vt-title { font-size: 30px; }
  .m3-vt-mag { font-size: 15px; }
  .m3-vt-quote { font-size: 11.5px; line-height: 1.6; padding: 6px 3px; margin-top: 16px; }
  .m3-gloss { font-size: 11.5px; padding: 6px 10px 7px; }
  .m3-pop-foot { padding: 8px 12px 9px 12px; }
  .m3-foot-ja { font-size: 17px; }
  .m3-foot-ko { font-size: 11.5px; }
  .m3-foot-critter svg { width: 44px; height: 44px; }
  .m3-hot { width: 64px; height: 64px; top: 12px; right: -2px; }
  .m3-hot span { font-size: 14px; }
  .m3-blk { padding-right: 14px; padding-left: calc(var(--m3-mx) + 10px); }
  .m3-n::before { left: calc(var(--m3-mx) - 8px); }
  .m3-bal { padding: 11px 16px 12px; }
  .m3-head, .m3-title-row { padding-left: calc(var(--m3-mx) + 10px); }
  .m3-head { padding-right: 60px; }
  .m3-title-row { padding-right: 12px; }
  .m3-title { font-size: 23px; }
  .m3-tag { padding: 5px 8px; }
  .m3-tag-ja { font-size: 12px; }
  .m3-tag-ja b { font-size: 19px; }
  .m3-tag-ko { font-size: 11px; }
  .m3-band-title { font-size: 16px; }
  .m3-ribbon { padding: 7px 16px 6px 14px; gap: 10px; }
  .m3-serial { font-size: 11.5px; letter-spacing: 0.1em; }
  .m3-ribbon-ja { font-size: 19px; padding-left: 10px; }
}

@media (prefers-reduced-motion: reduce) {
  .m3-open { animation: none; }
  .m3-cont-arrow { animation: none; }
  .m3-btn-open { transition: none; }
}
`;

const M3_BLOCKS = [
  {"t": "n", "text": "모든 사달의 시작은 1년 전, 오사카역 앞 횡단보도에서 우연히 스쳐 지나간 단 한 순간이었다.\n사람이 눈을 한 번 깜빡이는 시간, 고작 **0.3초**의 찰나.\n그 짧은 마주침이 마츠유카와 마시로의 평온했던 인생을 송두리째 뒤집어 놓았다."},
  {"t": "n", "text": "눈을 뗄 수가 없었다. 아니, 머릿속에서 지워지질 않았다.\n그 찰나의 잔상이 온몸에 진득하게 들러붙어, 예방접종도 없이 덮친 독감처럼 밤새도록 숨통을 조여 왔다.\n몸도 머리도 열병을 앓듯 달아오르고 속이 근질거려 견딜 수가 없었다. 이 정체 모를 거대한 충동을 어떻게든 밖으로 쏟아내야만 했다."},
  {"t": "n", "text": "그날 새벽, 홀린 듯 책상에 앉은 순간 만화의 신이라도 강림한 것처럼 구상부터 콘티까지 단숨에 끝났다.\n못 마시는 커피와 에너지 드링크를 약처럼 들이부으며 사흘 밤낮을 꼬박 새운 끝에 완성한 16페이지짜리 단편.\n투고 하루 만에 'Poxiv' 랭킹 1위, 이틀 만에 SNS 10만 하트, 일주일 뒤엔 담당 편집자의 스카우트 메일."},
  {"t": "n", "text": "그렇게 0.3초의 기억 하나로 그려 낸 첫 고수위 만화가 '루넬'의 간판 인기작이 되기까지, 연재를 시작하고 고작 석 달."},
  {"t": "profile"},
  {"t": "n", "text": "여기까지는 인터뷰 때마다 포장해 온 눈부신 성공담이고, **진짜 재앙은 그다음에 찾아왔다.**\n연재를 시작한 지 여덟 달, 인생 최대의 슬럼프가 덮친 것이다."},
  {"t": "n", "text": "마감은 코앞인데 콘티는 백지였고 머릿속은 하얗게 비어 버렸다.\n세이브 원고는 바닥난 지 오래, 길어지는 휴재에 '마유마로도 이제 감 다 죽었네' 같은 날 선 반응들이 가슴을 후벼 팠다.\n메일함에 쌓인 '선생님, 요즘 잘 지내시나요?'라는 편집자의 안부 메일 세 통이 사형 선고장처럼 무서워, 이불 속에 거대한 몸을 웅크리고 훌쩍이던 것이 불과 2주 전의 일이었다."}
];
