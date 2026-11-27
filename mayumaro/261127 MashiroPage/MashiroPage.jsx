// 필요 훅: 없음
// 마시로의 노트·스케치북 한 장. 본문에서 마시로가 쓰거나 읽거나 보여 줄 때, 또는 {{user}}가 엿볼 때 그 자리에 한 번.
// 호출 규칙은 세계관 문서 [HTML 꾸미기]에 있다(그 문서를 끄면 AI가 이 태그를 쓰지 않는다).
//   kind  : "note"(글: 시나리오·대사 대본·아이디어 메모) | "sketch"(그림: 콘티 컷·크로키 페이지)
//   title : 짧은 제목
//   lines : 3~6줄 목록. 스케치북은 "[컷 1] …"로 시작. 만화 대사는 「日本語」(한국어) 한 줄.
//           문자열 하나로 와도 <br> · " / " · 줄바꿈으로 나눠 읽는다.
// 예) <MashiroPage kind="sketch" title="27화 콘티 p.3" lines={["[컷 1] 우산 속, 어깨가 닿는다", "[컷 2] 「…近い、です」(…가까워요)", "[컷 3] 빨개진 귀 클로즈업"]} />

function MashiroPage(props = {}) {
  const { kind = "note", title = "", lines = [] } = props;
  const sketch = /^(sketch|스케치|스케치북)/i.test(String(kind || ""));
  const list = mpLines(lines);

  const box = sketch
    ? {
        background: "#fff",
        borderTop: "7px dotted #9aa0a6",
        borderRadius: 3,
        padding: "12px 14px",
        lineHeight: 1.7,
        boxShadow: "0 2px 6px rgba(0,0,0,.18)"
      }
    : {
        background: "repeating-linear-gradient(#fffdf7 0 27px,#dfe7f2 27px 28px)",
        borderLeft: "3px solid #f0a8a8",
        borderRadius: 4,
        padding: "2px 14px",
        lineHeight: "28px",
        boxShadow: "0 1px 3px rgba(0,0,0,.15)"
      };

  return (
    <div style={{ ...box, boxSizing: "border-box", width: "100%", margin: "10px 0", color: "#2b2b2b", fontFamily: MP_FONT, fontSize: 15, wordBreak: "keep-all", overflowWrap: "anywhere" }}>
      {title ? <div style={{ fontWeight: 700 }}>{String(title)}</div> : null}
      {list.map((line, i) => (
        <div key={i}>{mpLine(line, sketch)}</div>
      ))}
    </div>
  );
}

// 줄 목록 정리: 배열이면 그대로, 문자열이면 <br> · " / " · 줄바꿈으로 나눈다. 별표·마크다운 굵게는 지운다.
function mpLines(v) {
  let arr = Array.isArray(v) ? v : String(v == null ? "" : v).split(/<br\s*\/?>|\s\/\s|\n/i);
  return arr
    .map((x) => String(x == null ? "" : x).replace(/\*\*|\*/g, "").trim())
    .filter(Boolean)
    .slice(0, 8);
}

// 한 줄 그리기: 맨 앞 [컷 n]은 작은 회색 머리표, 」 뒤의 (번역)은 옅은 글씨.
function mpLine(line, sketch) {
  let head = null;
  let rest = line;
  const m = sketch ? line.match(/^\[([^\]]{1,12})\]\s*/) : null;
  if (m) {
    head = (
      <span style={{ display: "inline-block", marginRight: 6, padding: "0 6px", borderRadius: 3, background: "#eef0f2", color: "#6b7178", fontSize: 12, fontWeight: 700, lineHeight: "20px", verticalAlign: "1px" }}>
        {m[1]}
      </span>
    );
    rest = line.slice(m[0].length);
  }
  const parts = rest.split(/(」\s*[（(][^）)]*[）)])/);
  return (
    <>
      {head}
      {parts.map((p, i) => {
        const t = p.match(/^」\s*([（(][^）)]*[）)])$/);
        if (!t) return <span key={i}>{p}</span>;
        return (
          <span key={i}>
            」<span style={{ color: "#7a7f87" }}>{t[1]}</span>
          </span>
        );
      })}
    </>
  );
}

const MP_FONT = '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans JP", sans-serif';
