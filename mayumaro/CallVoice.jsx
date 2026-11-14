// 필요 훅: 없음
// 통화 중 수화기 너머 대사 한 마디. 본문 사이, 대사가 들어갈 자리에 한 줄씩 쓴다.
//   ja  : 일본어 대사 (한글 없이)
//   ko  : 한국어 번역 (평소 대사 규칙 그대로, 칸사이벤이면 사투리)
//   who : 화자 이름 (기본: 마시로 쪽 真白, 유저 쪽 YOU)
//   me  : {true}면 유저 쪽 대사. 오른쪽에서 나오는 연두색 말풍선. (풀사칭/위임으로 봇이 유저 대사를 쓸 때)
// 예) <CallVoice ja="……もしもし。起きてました？" ko="……여보세요. 깨어 계셨어요?" />
// 예) <CallVoice me={true} ja="起きてたよ。" ko="깨어 있었어." />

function CallVoice(props = {}) {
  const { ja = "……もしもし。", ko = "……여보세요.", who = "", me = false } = props;
  const mine = me === true || me === "true";
  const c = mine ? CV_ME : CV_MASHIRO;
  const label = mine ? (who && who !== "真白" ? String(who) : "YOU") : String(who || "真白");

  const icon = (
    <div style={{ flex: "none", width: 30, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 6 }} aria-hidden="true">
      <span style={{ width: 28, height: 28, borderRadius: "50%", background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px " + c.shadow, transform: mine ? "scaleX(-1)" : "none" }}>
        <svg viewBox="0 0 24 24" width="15" height="15">
          <path d="M6.6 3.5l2.6 3.2-1.6 2.2c.9 1.9 2.4 3.4 4.3 4.3l2.2-1.6 3.2 2.6-1.4 3c-6.3-.6-11.3-5.6-11.9-11.9z" fill="#fff" />
        </svg>
      </span>
      <span style={{ flex: 1, width: 2, marginTop: 5, background: "repeating-linear-gradient(" + c.accent + " 0 3px, transparent 3px 6px)", opacity: 0.5 }} />
    </div>
  );

  const wave = (
    <span className="cv-wave" aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 2, height: 10 }}>
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <i key={k} style={{ width: 2, height: 10, borderRadius: 1, background: c.accent, animationDelay: k * 0.11 + "s" }} />
      ))}
    </span>
  );

  const bubble = (
    <div style={{ flex: 1, minWidth: 0, padding: "13px 18px 14px", borderRadius: mine ? "16px 4px 16px 16px" : "4px 16px 16px 16px", background: c.bg, border: "1.5px solid " + c.line, boxShadow: "0 2px 6px rgba(80,90,100,.12)" }}>
      <div style={{ display: "flex", flexDirection: mine ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: c.accentDeep, letterSpacing: 0.3 }}>{label}</span>
        {wave}
      </div>
      <div lang="ja" className="cv-ja" style={{ fontSize: 15, lineHeight: 1.65, color: CV_INK, wordBreak: "break-word" }}>{String(ja)}</div>
      {ko ? (
        <div lang="ko" style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed " + c.line, fontSize: 14, lineHeight: 1.65, color: CV_SUB, wordBreak: "keep-all", overflowWrap: "anywhere" }}>{String(ko)}</div>
      ) : null}
    </div>
  );

  return (
    <div className={mine ? "cv-row cv-me" : "cv-row"} style={{ width: "100%", boxSizing: "border-box", padding: "22px 0", fontFamily: CV_FONT }}>
      <style>{CV_CSS}</style>
      <div style={{ display: "flex", flexDirection: mine ? "row-reverse" : "row", alignItems: "stretch", gap: 10 }}>
        {icon}
        {bubble}
      </div>
    </div>
  );
}

/* ───────── 보조 요소 ───────── */

const CV_FONT =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';

const CV_INK = "#2b2a33";
const CV_SUB = "#5b5866";

const CV_MASHIRO = {
  bg: "linear-gradient(160deg, #fff7fa 0%, #f4f1fb 100%)",
  line: "#e9cbd7",
  accent: "#e07b93",
  accentDeep: "#b5486b",
  shadow: "rgba(180,70,100,.3)"
};

const CV_ME = {
  bg: "linear-gradient(200deg, #f6fbe9 0%, #eef7e6 100%)",
  line: "#cfe3b2",
  accent: "#8fc25a",
  accentDeep: "#5b8a2c",
  shadow: "rgba(90,140,50,.3)"
};

const CV_CSS = `
@keyframes cv-in { 0% { opacity: 0; transform: translateX(-4px); filter: blur(1.5px); } 60% { opacity: 1; filter: blur(.3px); } 100% { opacity: 1; transform: none; filter: none; } }
@keyframes cv-in-me { 0% { opacity: 0; transform: translateX(4px); filter: blur(1.5px); } 60% { opacity: 1; filter: blur(.3px); } 100% { opacity: 1; transform: none; filter: none; } }
@keyframes cv-bar { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
@keyframes cv-hiss { 0%, 92%, 100% { opacity: 1; } 94% { opacity: .55; } 96% { opacity: .9; } }
.cv-row { animation: cv-in .45s ease-out both; }
.cv-me { animation-name: cv-in-me; }
.cv-wave i { display: block; transform-origin: center; animation: cv-bar .8s ease-in-out infinite; }
.cv-ja { animation: cv-hiss 4.5s steps(1) infinite; }
@media (prefers-reduced-motion: reduce) { .cv-row, .cv-wave i, .cv-ja { animation: none; } }
`;
