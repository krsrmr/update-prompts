// 필요 훅: useState (react)
// 루넬(가상의 여성향 웹코믹 플랫폼) 회차 페이지의 하단: 회차 정보 + 작가 후기 + 독자 댓글.
// 원문은 일본어. '번역 보기'를 누르면 모든 문장 아래에 한국어가 펼쳐진다.
// synopsis: 회차 소개문(あらすじ). 제목 바로 아래에 나온다.

function LunelleEpisode(props = {}) {
  const {
    series = "",
    episode = 12,
    subtitle = "取材、という名目で",
    subtitleKo = "취재라는 명목으로",
    synopsis = "「資料のためだから」――そう言い聞かせて差し出した手は、思っていたよりずっと熱かった。真剣な顔のまま、彼の視線は一度も逸れない。ページをめくるたび、越えてはいけない線が近づいていく。",
    synopsisKo = "'자료를 위해서니까'— 그렇게 되뇌며 내민 손은 생각보다 훨씬 뜨거웠다. 진지한 얼굴 그대로, 그의 시선은 한 번도 비켜나지 않는다. 페이지를 넘길 때마다, 넘어서는 안 될 선이 가까워진다.",
    date = "11月2日 更新",
    rating = 4.9,
    ratingCount = 1204,
    likes = 23810,
    afterword = "今回もお読みいただきありがとうございました🍡 描きながら何度も手が震えました…。",
    afterwordKo = "이번 화도 읽어주셔서 감사합니다🍡 그리면서 몇 번이나 손이 떨렸어요….",
    comments = [
      "ももんが|先生…今回の表情、リアルすぎませんか…?|선생님… 이번 표정, 너무 리얼하지 않아요…?|812",
      "夜ふかし|手の描写だけでご飯三杯いける|손 묘사만으로 밥 세 공기 가능|540",
      "しろくま|モデルいるでしょ絶対|모델 있죠 이거 절대|233"
    ]
  } = props;

  const [showKo, setShowKo] = useState(false);
  const c = LE_COLORS;
  const list = (Array.isArray(comments) ? comments : []).map(leParse).filter(Boolean);
  const r = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div style={{ width: "100%", maxWidth: 520, margin: "12px auto", fontFamily: LE_FONT, color: c.ink }}>
      <div style={{ background: c.bg, border: `1px solid ${c.line}`, borderRadius: 12, overflow: "hidden" }}>
        {/* 상단 바 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderBottom: `1px solid ${c.line}`
          }}
        >
          <LeMoon />
          <span style={{ fontFamily: LE_LOGO, fontStyle: "italic", fontWeight: 700, fontSize: 19, color: c.primary }}>
            Lunelle
          </span>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 12,
              color: c.muted,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {String(series)}
          </span>
          <button
            type="button"
            onClick={() => setShowKo(!showKo)}
            aria-pressed={showKo}
            style={{
              flex: "none",
              border: `1px solid ${showKo ? c.primary : c.outline}`,
              background: showKo ? c.primarySoft : c.bg,
              color: showKo ? c.primary : c.ink,
              borderRadius: 999,
              padding: "3px 10px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit"
            }}
          >
            {showKo ? "원문만 보기" : "번역 보기"}
          </button>
        </div>

        {/* 회차 정보 */}
        <div style={{ padding: "14px 14px 12px", borderBottom: `1px solid ${c.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                background: c.primary,
                borderRadius: 3,
                padding: "1px 6px"
              }}
            >
              NEW
            </span>
            <span style={{ fontSize: 12, color: c.muted }}>{String(date)}</span>
          </div>
          <div lang="ja" style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.45 }}>
            第{String(episode)}話「{String(subtitle)}」
          </div>
          {showKo && subtitleKo ? (
            <div lang="ko" style={{ fontSize: 13, color: c.muted, marginTop: 2 }}>
              제{String(episode)}화 「{String(subtitleKo)}」
            </div>
          ) : null}
          {synopsis ? (
            <div style={{ marginTop: 10, padding: "8px 10px", background: c.paper, borderLeft: `3px solid ${c.primary}`, borderRadius: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.primary, marginBottom: 3 }}>
                あらすじ{showKo ? " · 줄거리" : ""}
              </div>
              <p lang="ja" style={{ margin: 0, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {String(synopsis)}
              </p>
              {showKo && synopsisKo ? (
                <p lang="ko" style={{ margin: "5px 0 0", fontSize: 12.5, lineHeight: 1.6, color: c.muted, whiteSpace: "pre-wrap" }}>
                  {String(synopsisKo)}
                </p>
              ) : null}
            </div>
          ) : null}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8, fontSize: 13 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <LeStars value={r} c={c} />
              <b style={{ fontVariantNumeric: "tabular-nums" }}>{r.toFixed(1)}</b>
              <span style={{ color: c.muted }}>({leNum(ratingCount)})</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: c.primary }}>
              <LeHeart color={c.primary} />
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{leNum(likes)}</span>
            </span>
          </div>
        </div>

        {/* 작가 후기 */}
        {afterword ? (
          <div style={{ padding: "12px 14px", background: c.paper, borderBottom: `1px solid ${c.line}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <LeMarshmallow />
              <span style={{ fontSize: 12, fontWeight: 700 }}>マユマロ</span>
              <span style={{ fontSize: 11, color: c.muted }}>作者あとがき{showKo ? " · 작가 후기" : ""}</span>
            </div>
            <p lang="ja" style={{ margin: 0, fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
              {String(afterword)}
            </p>
            {showKo && afterwordKo ? (
              <p
                lang="ko"
                style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.6, color: c.muted, whiteSpace: "pre-wrap" }}
              >
                {String(afterwordKo)}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* 댓글 */}
        <div style={{ padding: "10px 14px 4px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
            コメント <span style={{ color: c.muted, fontWeight: 400 }}>{list.length}</span>
            {showKo ? <span style={{ color: c.muted, fontWeight: 400 }}> · 댓글</span> : null}
          </div>
          {list.map((m, i) => (
            <div
              key={`${m.name}-${i}`}
              style={{
                display: "grid",
                gridTemplateColumns: "30px minmax(0, 1fr)",
                gap: 10,
                padding: "10px 0",
                borderTop: i === 0 ? "none" : `1px solid ${c.line}`
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: leTint(m.name),
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  fontWeight: 700
                }}
              >
                {m.name.slice(0, 1)}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  {i < 2 ? (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: c.primary,
                        border: `1px solid ${c.primary}`,
                        borderRadius: 3,
                        padding: "0 4px"
                      }}
                    >
                      BEST
                    </span>
                  ) : null}
                  <b>{m.name}</b>
                </div>
                <p lang="ja" style={{ margin: "3px 0 0", fontSize: 14, lineHeight: 1.6, wordBreak: "break-word" }}>
                  {m.ja}
                </p>
                {showKo && m.ko ? (
                  <p lang="ko" style={{ margin: "2px 0 0", fontSize: 13, lineHeight: 1.55, color: c.muted }}>
                    {m.ko}
                  </p>
                ) : null}
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 12, color: c.muted }}>
                  <LeHeart color={c.muted} outline />
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>{leNum(m.likes)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────── 보조 요소 ───────── */

const LE_FONT =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';
const LE_LOGO = '"Cormorant Garamond", "Times New Roman", serif';

const LE_COLORS = {
  bg: "#ffffff",
  paper: "#fbf6f8",
  ink: "#222027",
  muted: "#75707e",
  line: "#e9e5ee",
  outline: "#c9c4d0",
  primary: "#d63c72",
  primarySoft: "#fbe8ef",
  star: "#f4a922",
  starOff: "#dedae3"
};

function leParse(s) {
  const parts = String(s).split("|");
  if (!parts[0]) return null;
  return { name: parts[0].trim(), ja: (parts[1] || "").trim(), ko: (parts[2] || "").trim(), likes: parts[3] };
}

function leNum(v) {
  const n = Number(v);
  return isFinite(n) ? n.toLocaleString("ja-JP") : String(v);
}

function leTint(name) {
  const palette = ["#e39ab3", "#8fb3d9", "#a6c99a", "#c7a3d9", "#e3b98f", "#8fcfc7"];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return palette[sum % palette.length];
}

function LeStars(p) {
  const value = p.value, c = p.c;
  return (
    <span aria-label={`별점 ${value}`} style={{ position: "relative", display: "inline-block", fontSize: 14, letterSpacing: 1, lineHeight: 1, color: c.starOff }}>
      ★★★★★
      <span
        aria-hidden="true"
        style={{ position: "absolute", left: 0, top: 0, width: `${(value / 5) * 100}%`, overflow: "hidden", whiteSpace: "nowrap", color: c.star }}
      >
        ★★★★★
      </span>
    </span>
  );
}

function LeHeart(p) {
  const color = p.color, outline = p.outline;
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" style={{ flex: "none" }}>
      <path
        d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
        fill={outline ? "none" : color}
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LeMoon() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 16,
        height: 16,
        borderRadius: "50%",
        boxShadow: `inset -5px -1px 0 0 ${LE_COLORS.primary}`,
        transform: "rotate(-20deg)",
        display: "inline-block",
        flex: "none"
      }}
    />
  );
}

function LeMarshmallow() {
  return (
    <svg viewBox="0 0 40 40" width="22" height="22" aria-hidden="true" style={{ flex: "none", borderRadius: "50%" }}>
      <circle cx="20" cy="20" r="20" fill="#f6c9d6" />
      <rect x="9" y="12" width="22" height="17" rx="7" fill="#ffffff" />
      <circle cx="16" cy="20" r="1.4" fill="#5a5560" />
      <circle cx="24" cy="20" r="1.4" fill="#5a5560" />
      <path d="M18.5 23.5c1 .8 2 .8 3 0" stroke="#5a5560" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </svg>
  );
}
