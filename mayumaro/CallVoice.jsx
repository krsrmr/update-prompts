// 필요 훅: 없음
// 통화 중 수화기 너머 마시로의 대사 한 마디. 본문 사이, 대사가 들어갈 자리에 한 줄씩 쓴다.
//   ja  : 일본어 대사 (한글 없이)
//   ko  : 한국어 번역 (평소 대사 규칙 그대로, 칸사이벤이면 사투리)
//   who : 화자 이름 (기본 真白)
// 예) <CallVoice ja="……もしもし。起きてました？" ko="……여보세요. 깨어 계셨어요?" />

function CallVoice(props = {}) {
  const { ja = "……もしもし。", ko = "……여보세요.", who = "真白" } = props;
  const c = CV_COLORS;

  return (
    <div className="cv-row" style={{ width: "100%", maxWidth: 440, margin: "6px 0", fontFamily: CV_FONT }}>
      <style>{CV_CSS}</style>
      <div style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
        {/* 수화기 */}
        <div style={{ flex: "none", width: 30, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }} aria-hidden="true">
          <span style={{ width: 28, height: 28, borderRadius: "50%", background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(180,70,100,.3)" }}>
            <svg viewBox="0 0 24 24" width="15" height="15">
              <path d="M6.6 3.5l2.6 3.2-1.6 2.2c.9 1.9 2.4 3.4 4.3 4.3l2.2-1.6 3.2 2.6-1.4 3c-6.3-.6-11.3-5.6-11.9-11.9z" fill="#fff" />
            </svg>
          </span>
          <span style={{ flex: 1, width: 2, marginTop: 4, background: "repeating-linear-gradient(" + c.accent + " 0 3px, transparent 3px 6px)", opacity: 0.5 }} />
        </div>

        {/* 말 */}
        <div className="cv-bub" style={{ flex: 1, minWidth: 0, position: "relative", padding: "8px 12px 9px", borderRadius: "4px 16px 16px 16px", background: c.bg, border: "1.5px solid " + c.line, boxShadow: "0 2px 6px rgba(120,90,130,.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: c.accentDeep, letterSpacing: 0.3 }}>{String(who)}</span>
            <span className="cv-wave" aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 2, height: 10, marginLeft: "auto" }}>
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <i key={k} style={{ width: 2, height: 10, borderRadius: 1, background: c.accent, animationDelay: k * 0.11 + "s" }} />
              ))}
            </span>
          </div>
          <div lang="ja" className="cv-ja" style={{ fontSize: 14.5, lineHeight: 1.6, color: c.ink, wordBreak: "break-word" }}>{String(ja)}</div>
          {ko ? (
            <div lang="ko" style={{ marginTop: 4, paddingTop: 4, borderTop: "1px dashed " + c.line, fontSize: 13.5, lineHeight: 1.6, color: c.sub, wordBreak: "keep-all", overflowWrap: "anywhere" }}>{String(ko)}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ───────── 보조 요소 ───────── */

const CV_FONT =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';

const CV_COLORS = {
  bg: "linear-gradient(160deg, #fff7fa 0%, #f4f1fb 100%)",
  line: "#e9cbd7",
  accent: "#e07b93",
  accentDeep: "#b5486b",
  ink: "#2b2a33",
  sub: "#5b5866"
};

const CV_CSS = `
@keyframes cv-in { 0% { opacity: 0; transform: translateX(-4px); filter: blur(1.5px); } 60% { opacity: 1; filter: blur(.3px); } 100% { opacity: 1; transform: none; filter: none; } }
@keyframes cv-bar { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
@keyframes cv-hiss { 0%, 92%, 100% { opacity: 1; } 94% { opacity: .55; } 96% { opacity: .9; } }
.cv-row { animation: cv-in .45s ease-out both; }
.cv-wave i { display: block; transform-origin: center; animation: cv-bar .8s ease-in-out infinite; }
.cv-ja { animation: cv-hiss 4.5s steps(1) infinite; }
@media (prefers-reduced-motion: reduce) { .cv-row, .cv-wave i, .cv-ja { animation: none; } }
`;
