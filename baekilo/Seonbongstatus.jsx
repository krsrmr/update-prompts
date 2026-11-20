function Seonbongstatus(props = {}) {
  const {
    date = "",
    time = "",
    place = "",
    dice = "",
    rift = 0,
    rivalry = 0,
    trouble = 0,
    mood = "",
    battle = false,
    enemy = "",
    enemyStage = "",
    pcVital = 100,
    pcTaint = "없음",
    choices = [],
    phase = "",
    scene = "",
    npcs = [],
    bonds = [],
    greed = 0,
    pact = "",
    ties = [],
  } = props;

  // ties: NPC와의 우정. 화면에 표시하지 않는 숨은 값.
  const hiddenTies = ties;

  const greedV = Math.max(0, Math.min(150, Math.round(Number(greed) || 0)));

  const NAME = { baek: "백일오", yo: "요현", muk: "하묵", cheon: "위천", ah: "주아령", kang: "강무열", crow: "까마귀 신" };
  const nameOf = (code) => { const k = String(code).trim().replace(/^c_/, ""); return NAME[k] || k; };

  let bondList = bonds;
  if (typeof bondList === "string") {
    try { bondList = JSON.parse(bondList); } catch (e) { bondList = bondList ? [bondList] : []; }
  }
  if (!Array.isArray(bondList)) bondList = [];

  const PHASE_LABEL = {
    ph_d1: "첫날·입단식", ph_d2: "첫날·정화당", ph_d3: "첫날·연무장", ph_d4: "첫날·저녁",
    ph_daily: "일상", ph_mission: "임무", ph_battle: "전투", ph_purify: "정화", ph_nsfw: "정사", ph_event: "사건",
  };

  let people = npcs;
  if (typeof people === "string") {
    try { people = JSON.parse(people); } catch (e) { people = people ? [people] : []; }
  }
  if (!Array.isArray(people)) people = [];

  const toNum = (v) => {
    const n = Number(v);
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(4, Math.round(n)));
  };

  let list = choices;
  if (typeof list === "string") {
    try { list = JSON.parse(list); } catch (e) { list = list ? [list] : []; }
  }
  if (!Array.isArray(list)) list = [];

  const copy = (text, e) => {
    const btn = e.currentTarget;
    const original = btn.getAttribute("data-label");
    const done = (ok) => {
      btn.textContent = ok ? "복사됨 · 입력창에 붙여넣으세요" : "복사 실패 · 직접 입력하세요";
      setTimeout(() => { btn.textContent = original; }, 1800);
    };
    const fallback = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        done(ok);
      } catch (err) { done(false); }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => done(true)).catch(fallback);
    } else {
      fallback();
    }
  };

  const box = { fontFamily: "sans-serif", fontSize: 13, color: "#222", background: "#f4f4f2", border: "1px solid #ccc", borderRadius: 6, padding: 10, lineHeight: 1.5 };
  const row = { display: "flex", alignItems: "center", gap: 6, margin: "2px 0" };
  const label = { width: 64, color: "#666", flexShrink: 0 };
  const line = { borderTop: "1px solid #ddd", margin: "8px 0" };

  const Clock = ({ name, value }) => {
    const v = toNum(value);
    const cells = [0, 1, 2, 3].map((i) => (
      <span key={i} style={{ display: "inline-block", width: 14, height: 10, marginRight: 2, border: "1px solid #888", background: i < v ? (v >= 4 ? "#b33" : "#555") : "transparent" }} />
    ));
    return (
      <div style={row}>
        <span style={label}>{name}</span>
        <span>{cells}</span>
        <span style={{ color: "#666" }}>{v}/4</span>
      </div>
    );
  };

  const vital = Math.max(0, Math.min(100, Number(pcVital) || 0));
  const isBattle = phase === "ph_battle" || battle === true || battle === "true";

  return (
    <div style={box}>
      <div style={{ fontWeight: "bold" }}>
        {phase ? <span style={{ border: "1px solid #888", borderRadius: 3, padding: "0 4px", marginRight: 6, fontWeight: "normal", fontSize: 12 }}>{PHASE_LABEL[phase] || phase}</span> : null}
        {[date, time, place].filter(Boolean).join(" · ")}
      </div>
      {scene ? <div>{scene}</div> : null}
      {people.length > 0 ? (
        <div style={{ color: "#555" }}>
          {people.map((p) => {
            const parts = String(p).split(":");
            return nameOf(parts[0]) + (parts[1] ? " — " + parts.slice(1).join(":") : "");
          }).join(" / ")}
        </div>
      ) : null}
      {mood ? <div style={{ color: "#555" }}>백일오의 기분: {mood}</div> : null}
      {dice ? <div style={{ marginTop: 4 }}>{dice}</div> : null}

      {bondList.length > 0 ? (
        <div>
          <div style={line} />
          <div style={{ display: "flex", color: "#666", fontSize: 12 }}>
            <span style={{ width: 64 }}></span>
            <span style={{ width: 40, textAlign: "center" }}>신뢰</span>
            <span style={{ width: 40, textAlign: "center" }}>필요</span>
            <span style={{ width: 40, textAlign: "center" }}>끌림</span>
          </div>
          {bondList.map((b, i) => {
            const parts = String(b).split(":");
            return (
              <div key={i} style={{ display: "flex" }}>
                <span style={{ width: 64, color: "#666" }}>{nameOf(parts[0])}</span>
                <span style={{ width: 40, textAlign: "center" }}>{parts[1] || "0"}</span>
                <span style={{ width: 40, textAlign: "center" }}>{parts[2] || "0"}</span>
                <span style={{ width: 40, textAlign: "center" }}>{parts[3] || "0"}</span>
              </div>
            );
          })}
        </div>
      ) : null}

      {greedV > 0 || pact ? (
        <div>
          <div style={line} />
          <div style={row}>
            <span style={label}>신의 탐욕</span>
            <span style={{ display: "inline-block", width: 100, height: 8, border: "1px solid #888" }}>
              <span style={{ display: "block", width: (greedV / 150 * 100) + "%", height: "100%", background: "#b8941f" }} />
            </span>
            <span style={{ color: "#666" }}>{greedV}/150</span>
          </div>
          {pact ? <div style={row}><span style={label}>거래</span><span>{pact}</span></div> : null}
        </div>
      ) : null}

      <div style={line} />
      <Clock name="균열" value={rift} />
      <Clock name="다툼" value={rivalry} />
      <Clock name="사고" value={trouble} />

      {isBattle ? (
        <div>
          <div style={line} />
          <div style={row}><span style={label}>적</span><span>{enemy}{enemyStage ? " (" + enemyStage + ")" : ""}</span></div>
          <div style={row}>
            <span style={label}>생기</span>
            <span style={{ display: "inline-block", width: 100, height: 8, border: "1px solid #888" }}>
              <span style={{ display: "block", width: vital + "%", height: "100%", background: "#4a7" }} />
            </span>
            <span style={{ color: "#666" }}>{vital}</span>
          </div>
          <div style={row}><span style={label}>오염</span><span>{pcTaint}</span></div>
        </div>
      ) : null}

      {list.length > 0 ? (
        <div>
          <div style={line} />
          {list.map((c, i) => (
            <button
              key={i}
              data-label={String(c)}
              onClick={(e) => copy(String(c), e)}
              style={{ display: "block", width: "100%", textAlign: "left", margin: "4px 0", padding: "6px 8px", fontSize: 13, background: "#fff", border: "1px solid #aaa", borderRadius: 4, cursor: "pointer" }}
            >
              {String(c)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
