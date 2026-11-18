// 필요 훅: useState (react)
// !실황 명령어 전용. 여성 익명 게시판 'ガールズちゃんねむ(가루네무)'의 마유마로 최신화 실황 트피를 몰래 들여다보는 화면.
// 직전 장면까지가 루넬 최신화로 올라왔다고 치고 독자들이 떠든다(실화인 줄 모른다). 마시로는 이 화면을 모른다.
//   topics : 트피 목록. 트피 하나 = 문자열 배열.
//            첫 줄 "종류|제목JA|제목KO|본문JA|본문KO|플러스|마이너스"   종류: 感想·考察·予想·妄想
//            다음 줄부터 댓글 "댓글JA|댓글KO|플러스|마이너스"  (댓글 번호는 코드가 붙인다)
//            칸 안의 줄바꿈은 " / ". >>3 처럼 쓰면 3번 댓글을 가리키는 파란 글씨가 된다.
//   clock  : 지금 시각
// 예) <GirlsThread clock="23:41" topics={[["感想|メガネくん顔赤すぎ|안경군 얼굴 너무 빨개|本文|본문|1243|18", "わかる|ㅇㅈ|312|2"]]} />

function GirlsThread(props = {}) {
  const { clock = "23:41", topics = GT_SAMPLE } = props;
  const list = gtTopics(topics);
  const [tab, setTab] = useState(0);
  const [hideKo, setHideKo] = useState(false);
  const [votes, setVotes] = useState({});
  const c = GT_COLORS;
  const cur = list[Math.min(tab, Math.max(0, list.length - 1))];

  const vote = (key, d) => setVotes((v) => ({ ...v, [key]: (v[key] || 0) + d }));
  const best = cur ? cur.comments.reduce((b, x, i) => (x.plus > (b < 0 ? -1 : cur.comments[b].plus) ? i : b), -1) : -1;

  return (
    <div style={{ width: "100%", maxWidth: 460, margin: "10px auto", fontFamily: GT_FONT }}>
      <style>{GT_CSS}</style>
      <div className="gt-card" style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 6px 20px -8px rgba(120,40,80,.35)", border: "1px solid " + c.line, color: c.ink }}>
        {/* 머리: 사이트 이름 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: c.pink, color: "#fff" }}>
          <GtLogo />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.5 }}>ガールズちゃんねむ</div>
            <div style={{ fontSize: 9.5, opacity: 0.9 }}>女子の本音が眠らない掲示板</div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 11, fontVariantNumeric: "tabular-nums", opacity: 0.95 }}>{String(clock)}</span>
        </div>

        {/* 실황 띠 + 번역 단추 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", background: c.soft, borderBottom: "1px solid " + c.line }}>
          <span className="gt-live" style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: c.red, borderRadius: 4, padding: "2px 6px" }}>実況</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, minWidth: 0, flex: 1 }}>マユマロ先生 最新話を語ろう</span>
          <button type="button" className="gt-btn" onClick={() => setHideKo(!hideKo)} style={{ fontSize: 10.5, color: c.sub, border: "1px solid " + c.line, background: "#fff", borderRadius: 999, padding: "3px 9px" }}>
            {hideKo ? "번역 보기" : "번역 숨기기"}
          </button>
        </div>

        {/* 트피 고르기 */}
        <div style={{ display: "flex", gap: 6, padding: "10px 12px 2px", overflowX: "auto" }}>
          {list.map((t, i) => (
            <button key={i} type="button" className={"gt-btn gt-tab" + (i === tab ? " on" : "")} onClick={() => setTab(i)} aria-pressed={i === tab}
              style={{ flex: "1 1 0", minWidth: 92, textAlign: "left", padding: "7px 9px", borderRadius: 10, border: "1.5px solid " + (i === tab ? c.pink : c.line), background: i === tab ? "#fff5f9" : "#fff" }}>
              <GtKind kind={t.kind} />{t.flame ? <GtFlame small /> : null}
              <span style={{ display: "block", marginTop: 4, fontSize: 11.5, fontWeight: 700, color: c.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.tJa}</span>
              <span style={{ display: "block", fontSize: 10, color: c.meta }}>コメント {t.comments.length}</span>
            </button>
          ))}
        </div>

        {cur ? (
          <div key={"t" + tab} className="gt-in" style={{ padding: "12px 14px 14px" }}>
            {/* 트피 본문 */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <GtKind kind={cur.kind} />
              {cur.flame ? <GtFlame /> : null}
              <span style={{ fontSize: 10.5, color: c.meta }}>匿名 · {String(clock)}</span>
            </div>
            <div lang="ja" style={{ marginTop: 6, fontSize: 16, fontWeight: 800, lineHeight: 1.45 }}>{cur.tJa}</div>
            {!hideKo && cur.tKo ? <div lang="ko" style={{ fontSize: 12.5, color: c.sub, fontWeight: 700, marginTop: 2 }}>{cur.tKo}</div> : null}
            <GtText ja={cur.bJa} ko={cur.bKo} hideKo={hideKo} big />
            <GtVotes plus={cur.plus + Math.max(0, votes["t" + tab + "p"] || 0)} minus={cur.minus + Math.max(0, votes["t" + tab + "m"] || 0)} onPlus={() => vote("t" + tab + "p", 1)} onMinus={() => vote("t" + tab + "m", 1)} />

            {/* 댓글 */}
            <div style={{ marginTop: 12, borderTop: "2px solid " + c.pink, paddingTop: 2 }}>
              {cur.comments.map((m, i) => {
                const hot = i === best && m.plus >= 100;
                return (
                  <div key={i} className="gt-cm" style={{ padding: "10px 4px 9px", borderBottom: "1px solid " + c.line, background: hot ? "#fff7fb" : "transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: c.meta }}>
                      <b style={{ color: c.pinkDeep, fontVariantNumeric: "tabular-nums" }}>{i + 1}.</b>
                      <span>匿名</span>
                      {hot ? <span style={{ fontSize: 9.5, fontWeight: 800, color: "#fff", background: c.pink, borderRadius: 4, padding: "1px 5px" }}>人気</span> : null}
                    </div>
                    <GtText ja={m.ja} ko={m.ko} hideKo={hideKo} />
                    <GtVotes small plus={m.plus + Math.max(0, votes["t" + tab + "c" + i + "p"] || 0)} minus={m.minus + Math.max(0, votes["t" + tab + "c" + i + "m"] || 0)} onPlus={() => vote("t" + tab + "c" + i + "p", 1)} onMinus={() => vote("t" + tab + "c" + i + "m", 1)} />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ padding: 24, textAlign: "center", fontSize: 12, color: c.meta }}>トピックがありません</div>
        )}
      </div>
    </div>
  );
}

/* ───────── 보조 요소 ───────── */

/* 본문·댓글 글: " / "는 줄바꿈, >>숫자는 파란 글씨 */
function GtText({ ja, ko, hideKo, big }) {
  return (
    <div style={{ marginTop: big ? 8 : 4 }}>
      <div lang="ja" style={{ fontSize: big ? 14 : 13.5, lineHeight: 1.7, color: GT_COLORS.ink, wordBreak: "break-word" }}>{gtLines(ja)}</div>
      {!hideKo && ko ? (
        <div lang="ko" style={{ marginTop: 3, fontSize: big ? 13 : 12.5, lineHeight: 1.65, color: GT_COLORS.sub, wordBreak: "keep-all", overflowWrap: "anywhere" }}>{gtLines(ko)}</div>
      ) : null}
    </div>
  );
}

function GtVotes({ plus, minus, onPlus, onMinus, small }) {
  const c = GT_COLORS;
  const pad = small ? "2px 9px" : "5px 14px";
  const fs = small ? 11 : 12.5;
  return (
    <div style={{ display: "flex", gap: 6, marginTop: small ? 6 : 10, justifyContent: small ? "flex-end" : "flex-start" }}>
      <button type="button" className="gt-btn gt-vote" onClick={onPlus} style={{ padding: pad, fontSize: fs, borderRadius: 999, border: "1px solid " + c.pink, background: "#fff0f6", color: c.pinkDeep, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>＋ {gtNum(plus)}</button>
      <button type="button" className="gt-btn gt-vote" onClick={onMinus} style={{ padding: pad, fontSize: fs, borderRadius: 999, border: "1px solid " + c.line, background: "#f6f6f8", color: c.meta, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>－ {gtNum(minus)}</button>
    </div>
  );
}

function GtKind({ kind }) {
  const k = GT_KINDS[kind] || { bg: "#9aa0ab", ko: "" };
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 800, color: "#fff", background: k.bg, borderRadius: 4, padding: "1px 6px", letterSpacing: 0.5 }}>
      {String(kind || "トピ")}
    </span>
  );
}

/* 싸움 댓글(마이너스가 더 많은 댓글)이 2개 이상인 트피 */
function GtFlame({ small }) {
  return (
    <span className="gt-flame" style={{ display: "inline-block", marginLeft: small ? 4 : 0, fontSize: small ? 9 : 10, fontWeight: 800, color: "#e5484d", background: "#fff0ec", border: "1px solid #f7c2b3", borderRadius: 4, padding: small ? "0 4px" : "1px 6px" }}>
      🔥荒れてます
    </span>
  );
}

/* 오리지널 로고: 말풍선 안의 잠자는 달 */
function GtLogo() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
      <path d="M4 7a5 5 0 0 1 5-5h14a5 5 0 0 1 5 5v11a5 5 0 0 1-5 5H14l-6 5v-5H9a5 5 0 0 1-5-5z" fill="#fff" />
      <path d="M19.5 8.5a6 6 0 1 0 2 9.8a5 5 0 0 1-2-9.8z" fill="#f05a92" />
      <path d="M22.5 7.5h3l-3 3h3" stroke="#f05a92" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function gtTopics(topics) {
  return (Array.isArray(topics) ? topics : [])
    .map((t) => (Array.isArray(t) ? t : [t]).filter(Boolean).map((x) => String(x)))
    .filter((t) => t.length > 0)
    .map((t) => {
      const h = t[0].split("|");
      return {
        kind: (h[0] || "").trim(),
        tJa: h[1] || "", tKo: h[2] || "", bJa: h[3] || "", bKo: h[4] || "",
        plus: gtInt(h[5]), minus: gtInt(h[6]),
        comments: t.slice(1).map((line) => {
          const p = line.split("|");
          return { ja: p[0] || "", ko: p[1] || "", plus: gtInt(p[2]), minus: gtInt(p[3]) };
        })
      };
    })
    .map((t) => ({ ...t, flame: t.comments.filter((m) => m.minus > m.plus).length >= 2 }));
}

function gtInt(v) {
  const n = parseInt(String(v == null ? "" : v).replace(/[^0-9]/g, ""), 10);
  return isFinite(n) ? n : 0;
}

function gtNum(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* " / " → 줄바꿈, >>숫자 → 파란 글씨 */
function gtLines(s) {
  return String(s || "").split(/\s+\/\s+/).map((line, i) => (
    <span key={i} style={{ display: "block" }}>
      {line.split(/(>>\d+|＞＞\d+)/).map((part, j) =>
        /^(>>|＞＞)\d+$/.test(part) ? <b key={j} style={{ color: "#2f7fd0", fontWeight: 700 }}>{part}</b> : <span key={j}>{part}</span>
      )}
    </span>
  ));
}

const GT_FONT =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';

const GT_COLORS = {
  pink: "#f05a92",
  pinkDeep: "#c93a72",
  red: "#e5484d",
  soft: "#fff3f8",
  line: "#f1dbe5",
  ink: "#2b2730",
  sub: "#5f5a66",
  meta: "#8d8794"
};

const GT_KINDS = {
  感想: { bg: "#f05a92" },
  考察: { bg: "#3f8fd8" },
  予想: { bg: "#8a63d2" },
  妄想: { bg: "#e0663c" }
};

const GT_CSS = `
@keyframes gt-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes gt-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
@keyframes gt-live { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }
@keyframes gt-flame { 0%, 100% { transform: none; } 50% { transform: translateY(-1px) scale(1.04); } }
.gt-flame { animation: gt-flame 1.2s ease-in-out infinite; }
.gt-card { animation: gt-rise .4s cubic-bezier(.2,.9,.25,1) both; }
.gt-in { animation: gt-in .25s ease-out both; }
.gt-live { animation: gt-live 1.6s ease-in-out infinite; }
.gt-btn { cursor: pointer; font: inherit; -webkit-tap-highlight-color: transparent; }
.gt-btn:focus-visible { outline: 2px solid #c93a72; outline-offset: 2px; }
.gt-vote:active { transform: scale(.94); }
@media (prefers-reduced-motion: reduce) { .gt-card, .gt-in, .gt-live, .gt-flame { animation: none; } }
`;

/* 미리보기용 기본 내용 */
const GT_SAMPLE = [
  [
    "感想|最新話のメガネくん、顔赤すぎて死んだ|최신화 안경군 얼굴 너무 빨개서 죽음|待って今回の引きなに？？ / 手が触れただけで耳まで真っ赤になるデカい男、需要しかないんだが / 作者さん毎回ここで切るの本当に鬼。来週まで生きていけない|잠깐 이번 화 엔딩 뭔데?? / 손 닿았다고 귀까지 새빨개지는 덩치남, 수요밖에 없는데요 / 작가님 맨날 여기서 끊는 거 진짜 악마임. 다음 주까지 못 살아|1243|18",
    "わかる。あの体格で照れるのずるい|ㅇㅈ 그 덩치로 수줍어하는 거 반칙임|312|2",
    ">>1 しかも本人『資料のため』とか言い張ってるの草|>>1 심지어 본인은 '자료 때문'이라고 우기는 거 ㅋㅋㅋ|287|1",
    "作者絶対経験豊富でしょ。描写がリアルすぎる|작가 무조건 경험 많음. 묘사가 너무 리얼해|154|40",
    ">>3 マユマロ先生をそういう目で見るな|>>3 마유마로 쌤을 그런 눈으로 보지 마라|98|12"
  ],
  [
    "予想|来週ついに告白くる？|다음 주 드디어 고백각?|伏線拾うとそろそろだと思うんだよね / 3話の傘のシーン覚えてる？あれ絶対つながってる|떡밥 주워 보면 슬슬인 것 같음 / 3화 우산 장면 기억함? 그거 무조건 연결됨|532|44",
    "まだ早い。この作者は焦らしの天才|아직 일러. 이 작가 애태우기 장인임|201|9",
    "どうせまた『資料です』で逃げる|어차피 또 '자료입니다'로 튈 듯|188|3",
    "頼むから付き合って。作者さん働いて|제발 사귀어. 작가님 일하세요|420|6",
    "告白とかどうでもいい。早く次の取材シーン描け|고백이고 뭐고 됐고 빨리 다음 취재씬이나 그려|35|210",
    ">>4 エロ目当ては巣に帰れ。ここ考察トピなんだけど|>>4 섹무새는 집에 가라. 여기 궁예 트피거든|388|41",
    ">>5 は？あんたの重い解釈のほうが地雷なんだが|>>5 하? 니 무거운 해석이 더 지뢰거든|22|156"
  ],
  [
    "妄想|この二人が同棲したら|이 둘이 동거하면|メガネくん絶対朝ごはん作りすぎる / 冷蔵庫ぬいぐるみの形のプリンで埋まってそう|안경군 무조건 아침밥 과하게 만들 듯 / 냉장고 인형 모양 푸딩으로 꽉 차 있을 것 같음|388|21",
    "夜の方の妄想は自重しろ（もっと書け）|밤 쪽 망상은 자제해라 (더 써라)|276|4",
    "解釈一致すぎて泣いた|해석 일치 너무 해서 울었음|133|0"
  ]
];
