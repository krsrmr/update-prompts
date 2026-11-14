// 필요 훅: useState (react)
// LIME(라인 패러디 메신저) 대화창. {{user}}와 마시로가 문자를 주고받는 [메신저] 모드에서 매 응답에 한 번 쓴다.
// log 한 줄 = 한 칸. 이번 응답에서 오간 것만 넣는다(지난 응답의 메시지는 다시 넣지 않는다).
//   "u|메시지|日本語|시간"      {{user}}가 보낸 메시지 (오른쪽 연두색, 입력한 말 아래 일본어 번역)
//   "m|日本語|한국어|시간"      마시로의 메시지 (왼쪽 흰색, 일본어 아래 한국어)
//   "st|이모지|스티커 이름|시간" 마시로의 스티커 (큰 이모지)
//   "del|시간"                 마시로가 보냈다가 취소한 메시지
//   "day|11/9(月)"             날짜 구분선
// {{user}}의 메시지 뒤에 마시로 칸이 하나라도 있으면 그 메시지에 '既読'(읽음)가 붙는다.
// typing={true}: 맨 아래에 마시로가 입력 중인 점 세 개를 띄운다.
// 상단 '번역' 단추는 양쪽 번역(마시로 쪽 한국어, {{user}} 쪽 일본어)을 함께 숨기고 보인다.
// 숨은 기능(AI는 모름): 전송 취소 칸 일부가 '사진 전송 취소'로 바뀐다. 누르면 마시로가 보냈다 지운 셀카가 열린다.
//   사진은 LC_SELFIE_URL 폴더의 selfie-1.webp, selfie-2.webp … 장수는 LC_SELFIE_COUNT, 빈도는 LC_SELFIE_EVERY(취소 몇 번에 한 번).
//   장수가 0이면 지금처럼 글자 취소로 나온다. 장수는 실제로 올린 사진 수와 맞춰 둔다.

function LimeChat(props = {}) {
  const {
    name = "真白",
    clock = "23:41",
    log = [
      "day|11/9(月)",
      "u|아직 안 자요?|まだ起きてますか？|23:38",
      "m|起きてます……！ 原稿中で……|깨어 있어요……! 원고 중이라서……|23:40",
      "del|23:40",
      "st|🐻💦|꾸벅 곰|23:41"
    ],
    typing = true
  } = props;

  const [hideKo, setHideKo] = useState(false);
  const [peek, setPeek] = useState(-1);
  const c = LC_COLORS;

  // 칸 뒤쪽 값은 순서가 틀려도 받는다: 시각처럼 생긴 값(23:41)은 시간, 나머지는 번역·스티커 이름으로 쓴다.
  const rows = (Array.isArray(log) ? log : []).filter(Boolean).map((line) => {
    const p = String(line).split("|");
    const kind = (p[0] || "").trim();
    const rest = lcSplit(p.slice(2));
    if (kind === "u") return { kind, text: p[1] || "", ja: rest.other, time: rest.time };
    if (kind === "m") return { kind, ja: p[1] || "", ko: rest.other, time: rest.time };
    if (kind === "st") return { kind, emoji: p[1] || "🐰", label: rest.other, time: rest.time };
    if (kind === "del") return { kind, time: lcSplit(p.slice(1)).time };
    if (kind === "day") return { kind, text: p[1] || "" };
    return { kind: "m", ja: p.join(" "), ko: "", time: "" };
  });
  // 읽음 표시: 그 뒤에 마시로가 반응한 칸이 있는 {{user}} 메시지
  let lastMa = -1;
  rows.forEach((r, i) => { if (r.kind === "m" || r.kind === "st" || r.kind === "del") lastMa = i; });

  return (
    <div style={{ width: "100%", maxWidth: 360, margin: "10px auto", fontFamily: LC_FONT, color: c.ink }}>
      <style>{LC_CSS}</style>
      <div className="lc-win" style={{ position: "relative", minHeight: peek >= 0 ? 460 : undefined, borderRadius: 18, overflow: "hidden", background: c.bg, boxShadow: "0 10px 28px -14px rgba(30,50,80,.55)", border: "1px solid " + c.frame }}>
        {/* 상단바 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: c.bar, color: "#fff" }}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span style={{ fontWeight: 700, fontSize: 16, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{String(name)}</span>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1, background: "#fff", color: c.bar, borderRadius: 5, padding: "1px 5px" }}>LIME</span>
          <button
            type="button"
            onClick={() => setHideKo(!hideKo)}
            aria-pressed={!hideKo}
            style={{ border: "1px solid rgba(255,255,255,.7)", background: hideKo ? "transparent" : "rgba(255,255,255,.22)", color: "#fff", borderRadius: 999, fontSize: 11, padding: "2px 8px", cursor: "pointer", fontFamily: "inherit" }}
          >
            {hideKo ? "번역 보기" : "번역 숨기기"}
          </button>
        </div>

        {/* 대화 */}
        <div style={{ padding: "12px 10px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((r, i) => {
            const delay = { animationDelay: Math.min(i, 8) * 0.12 + "s" };
            if (r.kind === "day") {
              return (
                <div key={i} className="lc-in" style={Object.assign({ alignSelf: "center", fontSize: 11, color: "#fff", background: c.chip, borderRadius: 999, padding: "2px 10px" }, delay)}>
                  {r.text}
                </div>
              );
            }
            if (r.kind === "del") {
              const pic = lcSelfie(r.time, i);
              if (pic) {
                return (
                  <button
                    key={i}
                    type="button"
                    className="lc-in lc-pdel"
                    onClick={() => setPeek(i)}
                    aria-label="취소된 사진 보기"
                    style={Object.assign({ alignSelf: "center", textAlign: "center", fontSize: 11, color: "#fff", background: c.chip, borderRadius: 10, padding: "3px 10px", lineHeight: 1.45, border: 0, cursor: "pointer", fontFamily: "inherit" }, delay)}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <LcCam />
                      {String(name)}が写真の送信を取り消しました
                    </span>
                    {hideKo ? null : <div style={{ opacity: 0.85 }}>{String(name)} 님이 사진 전송을 취소했습니다</div>}
                  </button>
                );
              }
              return (
                <div key={i} className="lc-in" style={Object.assign({ alignSelf: "center", textAlign: "center", fontSize: 11, color: "#fff", background: c.chip, borderRadius: 10, padding: "3px 10px", lineHeight: 1.45 }, delay)}>
                  {String(name)}が送信を取り消しました
                  {hideKo ? null : <div style={{ opacity: 0.85 }}>{String(name)} 님이 메시지를 취소했습니다</div>}
                </div>
              );
            }
            if (r.kind === "u") {
              return (
                <div key={i} className="lc-in" style={Object.assign({ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: 5 }, delay)}>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: 10, color: c.meta, lineHeight: 1.3, flex: "none", maxWidth: 44, whiteSpace: "nowrap", overflow: "hidden" }}>
                    {i < lastMa ? <span>既読</span> : null}
                    <span>{r.time}</span>
                  </span>
                  <div className="lc-b lc-me" style={{ background: c.me, color: c.ink, maxWidth: "80%", minWidth: 0 }}>
                    <span lang="ko" style={{ wordBreak: "keep-all", overflowWrap: "anywhere" }}>{r.text}</span>
                    {r.ja && !hideKo ? (
                      <span lang="ja" style={{ display: "block", marginTop: 4, paddingTop: 4, borderTop: "1px dashed " + c.meLine, fontSize: 12.5, color: c.meSub }}>{r.ja}</span>
                    ) : null}
                  </div>
                </div>
              );
            }
            // 마시로 칸 (메시지·스티커)
            const prev = rows[i - 1];
            const showFace = !prev || !(prev.kind === "m" || prev.kind === "st");
            return (
              <div key={i} className="lc-in" style={Object.assign({ display: "flex", alignItems: "flex-start", gap: 6 }, delay)}>
                <span style={{ width: 34, flex: "none" }}>{showFace ? <LcAvatar /> : null}</span>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0, maxWidth: "78%" }}>
                  {showFace ? <span style={{ fontSize: 11, color: c.meta, margin: "0 0 3px 2px" }}>{String(name)}</span> : null}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 5 }}>
                    {r.kind === "st" ? (
                      <div style={{ textAlign: "center" }}>
                        <div className="lc-st" style={{ fontSize: 54, lineHeight: 1.1 }}>{r.emoji}</div>
                        {r.label ? <div style={{ fontSize: 10, color: c.meta }}>{r.label}</div> : null}
                      </div>
                    ) : (
                      <div className="lc-b lc-ma" style={{ background: "#fff", color: c.ink }}>
                        <span lang="ja">{r.ja}</span>
                        {r.ko && !hideKo ? (
                          <span lang="ko" style={{ display: "block", marginTop: 4, paddingTop: 4, borderTop: "1px dashed " + c.line, fontSize: 12.5, color: c.sub, wordBreak: "keep-all", overflowWrap: "anywhere" }}>{r.ko}</span>
                        ) : null}
                      </div>
                    )}
                    <span style={{ fontSize: 10, color: c.meta, flex: "none", maxWidth: 44, whiteSpace: "nowrap", overflow: "hidden" }}>{r.time}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {typing === true || String(typing) === "true" ? (
            <div className="lc-in" style={{ display: "flex", alignItems: "center", gap: 6, animationDelay: Math.min(rows.length, 8) * 0.12 + "s" }}>
              <span style={{ width: 34, flex: "none" }}><LcAvatar /></span>
              <div className="lc-b lc-ma" style={{ background: "#fff", padding: "9px 12px" }} aria-label="입력 중">
                <i className="lc-dot" /><i className="lc-dot" style={{ animationDelay: ".15s" }} /><i className="lc-dot" style={{ animationDelay: ".3s" }} />
              </div>
            </div>
          ) : null}
        </div>

        {/* 취소된 사진 보기 */}
        {peek >= 0 && rows[peek] && lcSelfie(rows[peek].time, peek) ? (
          <button
            type="button"
            className="lc-view"
            onClick={() => setPeek(-1)}
            aria-label="사진 닫기"
            style={{ position: "absolute", inset: 0, zIndex: 5, border: 0, padding: 16, margin: 0, cursor: "pointer", background: "rgba(14,18,26,.86)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}
          >
            <span className="lc-photo" role="img" aria-label="마시로가 보냈다가 취소한 사진" style={{ display: "block", width: "78%", aspectRatio: "3 / 4", borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,.5)", backgroundColor: "#2a2f3d", backgroundImage: 'url("' + lcSelfie(rows[peek].time, peek) + '")', backgroundSize: "cover", backgroundPosition: "center" }} />
            <span style={{ color: "#fff", fontSize: 11.5, opacity: 0.85 }}>{String(rows[peek].time || "")} · 取り消された写真</span>
            <span style={{ color: "#fff", fontSize: 10.5, opacity: 0.6 }}>눌러서 닫기</span>
          </button>
        ) : null}

        {/* 입력줄 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#fff", borderTop: "1px solid " + c.line }}>
          <span style={{ fontSize: 18, color: c.meta, lineHeight: 1 }}>＋</span>
          <span style={{ flex: 1, background: "#f1f3f5", borderRadius: 999, padding: "6px 12px", fontSize: 12, color: "#9aa1a9" }}>メッセージを入力</span>
          <span style={{ fontSize: 11, color: c.meta, fontVariantNumeric: "tabular-nums" }}>{String(clock)}</span>
        </div>
      </div>
    </div>
  );
}

/* ───────── 보조 요소 ───────── */

const LC_FONT =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';

const LC_COLORS = {
  bar: "#5fae3a",
  bg: "#b9cbe0",
  frame: "#9fb4cc",
  me: "#c6f08a",
  meLine: "#9fcf5c",
  meSub: "#46612a",
  ink: "#1f2328",
  sub: "#5b6470",
  meta: "#4d5a6a",
  chip: "rgba(60,80,110,.38)",
  line: "#dfe4ea"
};

const LC_CSS = `
@keyframes lc-pop { from { opacity: 0; transform: translateY(6px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes lc-blink { 0%, 80%, 100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }
.lc-in { animation: lc-pop .32s ease-out both; }
.lc-b { position: relative; border-radius: 16px; padding: 7px 11px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-break: break-word; box-shadow: 0 1px 1px rgba(0,0,0,.06); }
.lc-me { border-top-right-radius: 4px; }
.lc-ma { border-top-left-radius: 4px; }
.lc-pdel { box-shadow: 0 0 0 0 rgba(255,255,255,.0); }
.lc-pdel:hover, .lc-pdel:focus-visible { background: rgba(60,80,110,.55) !important; outline: none; }
@keyframes lc-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes lc-zoom { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: none; } }
.lc-view { animation: lc-fade .2s ease-out both; }
.lc-photo { animation: lc-zoom .25s ease-out both; }
.lc-dot { display: inline-block; width: 6px; height: 6px; margin: 0 2px; border-radius: 50%; background: #8a94a0; animation: lc-blink 1s infinite; }
@media (prefers-reduced-motion: reduce) { .lc-in, .lc-dot, .lc-view, .lc-photo { animation: none; } }
`;

/* 마시로의 LIME 프로필 사진: 동글동글한 오리지널 토끼 인형 */
function LcAvatar() {
  return (
    <svg viewBox="0 0 34 34" width="34" height="34" aria-hidden="true" style={{ display: "block", borderRadius: "50%" }}>
      <circle cx="17" cy="17" r="17" fill="#fde6ee" />
      <ellipse cx="12" cy="9" rx="3" ry="6.5" fill="#fff" stroke="#e7d5dc" />
      <ellipse cx="22" cy="9" rx="3" ry="6.5" fill="#fff" stroke="#e7d5dc" />
      <ellipse cx="17" cy="20.5" rx="10" ry="8.5" fill="#fff" stroke="#e7d5dc" />
      <circle cx="13.5" cy="20" r="1.2" fill="#4a4550" />
      <circle cx="20.5" cy="20" r="1.2" fill="#4a4550" />
      <circle cx="11.5" cy="23" r="1.5" fill="#f6b3c6" opacity=".85" />
      <circle cx="22.5" cy="23" r="1.5" fill="#f6b3c6" opacity=".85" />
      <path d="M15.8 23c.8.6 1.6.6 2.4 0" stroke="#4a4550" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* 시각("23:41")과 그 밖의 값(번역 등)을 가른다 */
function lcSplit(fields) {
  const isTime = (v) => /^\s*\d{1,2}[:：]\d{2}\s*$/.test(String(v || ""));
  const list = (fields || []).map((v) => String(v || "").trim()).filter(Boolean);
  const time = list.find(isTime) || "";
  const other = list.find((v) => !isTime(v)) || "";
  return { time, other };
}

/* ── 취소된 셀카 설정 ── 사진을 올리면 장수만 고친다. */
const LC_SELFIE_URL = "https://mayumaro.vercel.app/img/photo/";
const LC_SELFIE_COUNT = 0; // selfie-1.webp ~ selfie-N.webp 장수
const LC_SELFIE_EVERY = 4; // 전송 취소 몇 번에 한 번꼴로 사진으로 바꿀지 (클수록 드묾)

/* 전송 취소 칸이 사진 칸인지 정하고, 그렇다면 사진 주소를 돌려준다. 시간과 순서로 정해서, 다시 열어도 같다. */
function lcSelfie(time, i) {
  if (!(LC_SELFIE_COUNT > 0)) return "";
  const m = /(\d{1,2})[:：](\d{2})/.exec(String(time || ""));
  const mins = m ? Number(m[1]) * 60 + Number(m[2]) : 0;
  const key = mins * 7 + i * 13;
  if (key % Math.max(1, LC_SELFIE_EVERY) !== 0) return "";
  const n = (Math.floor(key / Math.max(1, LC_SELFIE_EVERY)) % LC_SELFIE_COUNT) + 1;
  return LC_SELFIE_URL + "selfie-" + n + ".webp";
}

/* 사진 취소 칸의 작은 카메라 아이콘 */
function LcCam() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" style={{ display: "block", flex: "none" }}>
      <path d="M2 5h2.5l1.2-1.6h4.6L11.5 5H14v7.5H2z" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="8" cy="8.6" r="2.2" fill="none" stroke="#fff" strokeWidth="1.3" />
    </svg>
  );
}
