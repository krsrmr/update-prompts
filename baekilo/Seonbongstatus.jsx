// 필요 훅: useState, useRef, useEffect (react)
// 필요 기능: sendMessage (없으면 복사로 대신함)
// 선봉대 상태창 (약식) — 일상 화면 + 전투 화면
//
// [전투 화면]
//   5×5 맵(A~E열, 1~5행. 1행 적 방면 → 5행 아군 후방), 지형 6종, 장판(danger), 지형 변경(zones)
//   점을 누르면 인물 상세가 펼쳐진다. 행동 칸: 이동(선택) + 공격/수비/도움 → 대상 → 🎲 → 한 줄 덧붙이기 → 보내기
//
// [보내는 글] (로어북 키워드 ⚔ 문서가 이 글을 읽고 서술한다)
//   ⚔ 이동 C3 · 공격 · 신기 화살 → 설랑 무리 · 🎲12 · 보통이면 실패 / 쉬움이면 성공 · 덧붙임: 눈언덕에서 쏜다
//   - 주사위(1d20)는 이 컴포넌트가 굴린다. 기준: 쉬움 7 · 보통 11 · 어려움 15 이상 성공,
//     기준보다 1~5 모자라면 아슬아슬, 6 이상 모자라면 실패, 20은 대성공, 1은 실패.
//   - 한 단계 쉬운 난이도의 결과도 함께 보낸다. 덧붙임이 보정할 만하면 AI가 쉬운 쪽을 고른다.
//
// [이미지] SB_MAPS의 img, SB_PORTRAIT의 따옴표 안에 이미지 주소를 넣는다. 비워 두면 색과 글자로 대신한다.

const SB_MAPS = {
  m_snow: { name: "설원", img: "", cells: { A5: "high", E4: "high", B2: "fog", C2: "fog", D2: "fog", A3: "rough", B3: "rough", D4: "rough", E3: "rough", C3: "cover", B4: "cover", C5: "safe" } },
  m_forest: { name: "얼음숲", img: "", cells: { B2: "cover", D2: "cover", B4: "cover", D4: "cover", C2: "taint", A3: "taint", E3: "taint", A1: "fog", C1: "fog", E1: "fog", C3: "fog", B3: "rough", D3: "rough", C5: "safe" } },
  m_gate: { name: "버려진 관문", img: "", cells: { A2: "high", E2: "high", A4: "high", E4: "high", B3: "cover", D3: "cover", B2: "rough", D2: "rough", C4: "rough", C1: "fog", C5: "safe" } },
  m_wall: { name: "결계벽", img: "", cells: { A4: "high", E4: "high", B5: "safe", C5: "safe", D5: "safe", B4: "cover", D4: "cover", C1: "taint", B2: "taint", D2: "taint", A3: "rough", E3: "rough" } },
};

const SB_PORTRAIT = { baek: "", crow: "", yo: "", muk: "", cheon: "", ah: "", kang: "", yeon: "" };

const SB_TERRAIN = {
  high: { label: "고지대", mark: "▲", color: "rgba(150,170,205,0.6)" },
  cover: { label: "엄폐물", mark: "◆", color: "rgba(110,140,90,0.55)" },
  rough: { label: "험지", mark: "≋", color: "rgba(150,120,90,0.5)" },
  taint: { label: "탁기지대", mark: "☁", color: "rgba(110,60,140,0.55)" },
  fog: { label: "시야차단", mark: "░", color: "rgba(200,200,210,0.75)" },
  safe: { label: "안전", mark: "✚", color: "rgba(230,200,110,0.55)" },
};
const SB_TERRAIN_KR = { 고지대: "high", 엄폐물: "cover", 엄폐: "cover", 험지: "rough", 탁기지대: "taint", 탁기: "taint", 시야차단: "fog", 안전: "safe", 거점: "safe" };

const SB_NAME = { baek: "백일오", yo: "요현", muk: "하묵", cheon: "위천", ah: "주아령", kang: "강무열", yeon: "연사겸", crow: "까마귀 신" };
const SB_TH = { 쉬움: 7, 보통: 11, 어려움: 15 };
const SB_EASIER = { 어려움: "보통", 보통: "쉬움", 쉬움: "쉬움" };
const SB_COLS = ["A", "B", "C", "D", "E"];

function Seonbongstatus(props = {}) {
  const p = props || {};
  const H = sbHooks();
  const [tab, setTab] = H.s("공격");
  const [pick, setPick] = H.s(null);
  const [target, setTarget] = H.s("");
  const [moveMode, setMoveMode] = H.s(false);
  const [moveTo, setMoveTo] = H.s("");
  const [focus, setFocus] = H.s(null);
  const [roll, setRoll] = H.s(null);
  const [rolling, setRolling] = H.s(false);
  const [note, setNote] = H.s("");
  const [sent, setSent] = H.s("");
  const [warn, setWarn] = H.s("");
  const timer = H.r ? H.r(null) : { current: null };

  if (H.e) {
    H.e(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  }

  const date = sbStr(p.date);
  const time = sbStr(p.time);
  const place = sbStr(p.place);
  const scene = sbStr(p.scene);
  const phase = sbStr(p.phase);
  const mood = sbStr(p.mood);
  const dice = sbStr(p.dice);
  const pact = sbStr(p.pact);
  const greedV = Math.max(0, Math.min(150, Math.round(Number(p.greed) || 0)));
  const people = sbList(p.npcs);
  const bondList = sbList(p.bonds);
  // ties: NPC와의 우정. 화면에 표시하지 않는 숨은 값.
  const hiddenTies = sbList(p.ties);

  const isBattle = phase === "ph_battle" || p.battle === true || p.battle === "true";

  const PHASE_LABEL = {
    ph_d1: "첫날·입단식", ph_d2: "첫날·정화당", ph_d3: "첫날·연무장", ph_d4: "첫날·저녁",
    ph_daily: "일상", ph_mission: "임무", ph_battle: "전투", ph_purify: "정화", ph_nsfw: "정사", ph_event: "사건",
  };

  const box = { fontFamily: "sans-serif", fontSize: 13, color: "#222", background: "#f4f4f2", border: "1px solid #ccc", borderRadius: 6, padding: 10, lineHeight: 1.5 };
  const row = { display: "flex", alignItems: "center", gap: 6, margin: "2px 0" };
  const label = { width: 64, color: "#666", flexShrink: 0 };
  const line = { borderTop: "1px solid #ddd", margin: "8px 0" };
  const badge = { border: "1px solid #888", borderRadius: 3, padding: "0 4px", marginRight: 6, fontWeight: "normal", fontSize: 12 };
  const small = { color: "#666", fontSize: 12 };

  const Bar = ({ value, max, color }) => {
    const v = Math.max(0, Math.min(max, Number(value) || 0));
    return (
      <span style={{ display: "inline-block", width: 60, height: 7, border: "1px solid #888", verticalAlign: "middle", flexShrink: 0 }}>
        <span style={{ display: "block", width: (v / max * 100) + "%", height: "100%", background: color }} />
      </span>
    );
  };

  const Pips = ({ now, max }) => (
    <span style={{ letterSpacing: 1, fontSize: 11, color: "#b43a3a", flexShrink: 0 }}>
      {Array.from({ length: Math.max(0, Math.min(20, max)) }).map((_, i) => (i < now ? "■" : "□")).join("")}
    </span>
  );

  const Clock = ({ name, value }) => {
    const v = sbClamp(value, 0, 4);
    return (
      <div style={row}>
        <span style={label}>{name}</span>
        <span>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} style={{ display: "inline-block", width: 14, height: 10, marginRight: 2, border: "1px solid #888", background: i < v ? (v >= 4 ? "#b33" : "#555") : "transparent" }} />
          ))}
        </span>
        <span style={{ color: "#666" }}>{v}/4</span>
      </div>
    );
  };

  /* ───────── 전투 화면 ───────── */
  if (isBattle) {
    const mapKey = sbStr(p.map);
    const map = SB_MAPS[mapKey] || null;
    const turn = sbStr(p.turn || p.round);
    const raid = sbStr(p.raid);
    const omen = sbStr(p.omen);
    const heat = sbClamp(p.heat, 0, 3, 0);

    // 지형: 맵 고정값 + 바뀐 칸(zones)
    const cells = Object.assign({}, map ? map.cells : {});
    sbList(p.zones).forEach((z) => {
      const a = String(z).split(":");
      const k = sbPos(a[0]);
      if (!k) return;
      const t = SB_TERRAIN_KR[(a[1] || "").trim()] || (SB_TERRAIN[(a[1] || "").trim()] ? (a[1] || "").trim() : "");
      if (t) cells[k] = t; else delete cells[k];
    });
    const danger = sbDanger(sbList(p.danger));

    const pcName = sbStr(p.pcName) || "나";
    const pc = { key: "pc", name: pcName, pos: sbPos(p.pcPos), vital: sbClamp(p.pcVital, 0, 100, 100), taint: sbStr(p.pcTaint) || "없음", fx: sbFx(p.pcFx), side: "pc", code: "" };
    const allies = sbList(p.fighters).map((f, i) => {
      const a = String(f).split(":");
      const code = (a[0] || "").trim().replace(/^[bc]_/, "");
      return { key: "a" + i, name: SB_NAME[code] || code, pos: sbPos(a[1]), vital: sbClamp(a[2], 0, 100, 100), taint: (a[3] || "없음").trim(), fx: sbFx(a[4]), side: "ally", code: code };
    });
    const foes = sbList(p.enemies).map((f, i) => {
      const a = String(f).split(":");
      const hp = String(a[4] || "").split("/");
      const max = sbClamp(hp[1], 1, 20, 5);
      return { key: "f" + i, code: (a[0] || "").trim(), name: (a[1] || "이형").trim(), pos: sbPos(a[2]), grade: (a[3] || "").trim(), hp: sbClamp(hp[0], 0, max, max), max: max, fx: sbFx(a[5]), side: "foe" };
    });
    const units = [pc].concat(allies, foes);

    const atk = sbList(p.atk).map(sbAction);
    const def = sbList(p.def).map(sbAction);
    const aid = sbList(p.aid).map(sbAction);
    const lists = { 공격: atk, 수비: def, 도움: aid };
    const hasActions = atk.length + def.length + aid.length > 0;
    const curList = lists[tab] || [];
    const needTarget = (tab === "도움" && allies.length > 0) || (tab === "공격" && foes.length > 1);
    const autoTarget = tab === "공격" && foes.length === 1 ? foes[0].name : "";
    const tgt = target || autoTarget;
    const locked = rolling || !!sent;

    const maxMove = pc.fx.indexOf("둔화") >= 0 ? 0 : cells[pc.pos] === "rough" ? 1 : 2;

    const onCell = (key) => {
      const here = units.filter((u) => u.pos === key);
      if (moveMode && !locked) {
        const d = sbDist(pc.pos, key);
        if (key === pc.pos) { setMoveTo(""); setWarn(""); return; }
        if (!pc.pos) { setMoveTo(key); setWarn(""); return; }
        if (d > maxMove) { setWarn(maxMove === 0 ? "둔화 상태라 움직일 수 없습니다." : "한 번에 " + maxMove + "칸까지 움직일 수 있습니다."); return; }
        if (here.some((u) => u.side !== "pc")) { setWarn("다른 인물이 있는 칸입니다."); return; }
        setMoveTo(key); setWarn("");
        return;
      }
      setFocus(here.length ? (focus && focus.pos === key ? null : here[0]) : null);
    };

    const startRoll = () => {
      if (!pick || locked) return;
      if (needTarget && !tgt) { setWarn("대상을 고르세요."); return; }
      setWarn("");
      setRolling(true);
      let n = 0;
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(() => {
        n += 1;
        setRoll(1 + Math.floor(Math.random() * 20));
        if (n >= 12) {
          clearInterval(timer.current);
          timer.current = null;
          setRoll(1 + Math.floor(Math.random() * 20));
          setRolling(false);
        }
      }, 60);
    };

    const buildText = () => {
      const parts = ["⚔"];
      if (moveTo) parts.push("이동 " + moveTo + " ·");
      parts.push(tab + " · " + pick.name + (tgt ? " → " + tgt : ""));
      const base = sbJudge(roll, pick.diff);
      const easy = SB_EASIER[pick.diff];
      let res = "· 🎲" + roll + " · ";
      if (easy === pick.diff || sbJudge(roll, easy) === base) res += pick.diff + " " + base;
      else res += pick.diff + "이면 " + base + " / " + easy + "이면 " + sbJudge(roll, easy);
      parts.push(res);
      const extra = String(note || "").replace(/\s+/g, " ").trim().slice(0, 80);
      if (extra) parts.push("· 덧붙임: " + extra);
      return parts.join(" ");
    };

    const doSend = () => {
      if (!pick || roll === null || rolling || sent) return;
      const text = buildText();
      sbSend(text, (how) => setSent(how === "sent" ? "보냈습니다." : how === "copied" ? "복사됨 · 입력창에 붙여넣어 보내세요" : "직접 입력하세요: " + text));
    };

    const tabBtn = (name) => ({
      flex: 1, padding: "5px 0", fontSize: 13, cursor: "pointer",
      background: tab === name ? "#333" : "#fff", color: tab === name ? "#fff" : "#333", border: "1px solid #888",
    });
    const itemBtn = (on) => ({
      display: "block", width: "100%", textAlign: "left", margin: "4px 0", padding: "6px 8px", fontSize: 13, cursor: "pointer",
      background: on ? "#e6eef8" : "#fff", border: on ? "1px solid #4a6fa5" : "1px solid #aaa", borderRadius: 4,
    });
    const chip = (on, color) => ({ padding: "4px 8px", fontSize: 12, cursor: "pointer", borderRadius: 4, border: on ? "1px solid " + color : "1px solid #aaa", background: on ? "#eef3ee" : "#fff" });

    const unitColor = (u) => (u.side === "pc" ? "#3d6fb6" : u.side === "ally" ? (u.code === "crow" ? "#222" : "#3f8a55") : "#b43a3a");

    return (
      <div style={box}>
        <div style={{ fontWeight: "bold" }}>
          <span style={badge}>전투</span>
          {map ? map.name : place || "전투"}
          {turn ? <span style={{ fontWeight: "normal", color: "#666" }}> · {turn}턴</span> : null}
          {raid ? <span style={{ fontWeight: "normal", color: "#b43a3a" }}> · {raid}</span> : null}
        </div>
        {[date, time, map ? place : ""].filter(Boolean).length ? <div style={small}>{[date, time, map ? place : ""].filter(Boolean).join(" · ")}</div> : null}
        {scene ? <div>{scene}</div> : null}
        {dice ? <div style={{ marginTop: 2 }}>{dice}</div> : null}
        {omen ? <div style={{ marginTop: 2, color: "#b43a3a" }}>⚠ {omen}</div> : null}

        {map ? (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
            <div style={{ width: "100%", maxWidth: 300 }}>
              <div style={{ position: "relative", width: "100%", paddingTop: "100%", border: "1px solid #777", background: map.img ? "#ccc" : "#e9e7df", backgroundImage: map.img ? "url(" + map.img + ")" : "none", backgroundSize: "cover", backgroundPosition: "center" }}>
                {[1, 2, 3, 4, 5].map((r) =>
                  SB_COLS.map((c, ci) => {
                    const key = c + r;
                    const t = SB_TERRAIN[cells[key]];
                    const here = units.filter((u) => u.pos === key);
                    const isDanger = danger[key];
                    const isMove = moveTo === key;
                    return (
                      <div key={key} onClick={() => onCell(key)} style={{ position: "absolute", left: (ci * 20) + "%", top: ((r - 1) * 20) + "%", width: "20%", height: "20%", boxSizing: "border-box", cursor: "pointer", border: isMove ? "2px dashed #3d6fb6" : "1px solid rgba(0,0,0,0.15)", background: t ? (map.img ? t.color.replace(/0\.\d+\)$/, "0.25)") : t.color) : "transparent", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 2 }}>
                        {isDanger ? <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, rgba(200,40,40,0.35) 0 4px, transparent 4px 9px)", pointerEvents: "none" }} /> : null}
                        {t ? <span style={{ position: "absolute", top: 1, left: 3, fontSize: 9, color: "rgba(0,0,0,0.55)" }}>{t.mark}</span> : null}
                        <span style={{ position: "absolute", bottom: 1, right: 3, fontSize: 8, color: "rgba(0,0,0,0.35)" }}>{key}</span>
                        {here.map((u) => (
                          <span key={u.key} style={{ position: "relative", width: 20, height: 20, borderRadius: "50%", fontSize: 11, lineHeight: "20px", textAlign: "center", color: "#fff", background: unitColor(u), border: focus && focus.key === u.key ? "2px solid #f2c94c" : "1px solid rgba(0,0,0,0.4)" }}>
                            {u.name.slice(0, 1)}
                          </span>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
              <div style={{ fontSize: 10, color: "#888", marginTop: 2, textAlign: "center" }}>
                {Object.keys(SB_TERRAIN).map((k) => SB_TERRAIN[k].mark + SB_TERRAIN[k].label).join(" · ")} · ▨장판
              </div>
            </div>
          </div>
        ) : null}

        {focus ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, padding: 6, background: "#fff", border: "1px solid #ccc", borderRadius: 4 }}>
            {focus.side === "ally" && SB_PORTRAIT[focus.code] ? (
              <img src={SB_PORTRAIT[focus.code]} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
            ) : (
              <span style={{ width: 44, height: 44, borderRadius: 4, background: unitColor(focus), color: "#fff", fontSize: 18, lineHeight: "44px", textAlign: "center", flexShrink: 0 }}>{focus.name.slice(0, 1)}</span>
            )}
            <div style={{ fontSize: 12 }}>
              <div style={{ fontWeight: "bold", fontSize: 13 }}>{focus.name}{focus.pos ? " · " + focus.pos : ""}</div>
              {focus.side === "foe" ? (
                <div>{focus.grade ? focus.grade + " · " : ""}체력 {focus.hp}/{focus.max}</div>
              ) : (
                <div>생기 {focus.vital} · 오염 {focus.taint}{focus.code === "baek" ? " · 신기 과열 " + heat + "/3" : ""}</div>
              )}
              {focus.fx.length ? <div style={{ color: "#b43a3a" }}>{focus.fx.join(" · ")}</div> : null}
            </div>
          </div>
        ) : null}

        <div style={line} />
        {[pc].concat(allies).map((u) => (
          <div key={u.key} style={row} onClick={() => setFocus(focus && focus.key === u.key ? null : u)}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: unitColor(u), flexShrink: 0 }} />
            <span style={{ width: 58, flexShrink: 0 }}>{u.name}</span>
            <Bar value={u.vital} max={100} color="#4a7" />
            <span style={small}>{u.vital} · {u.taint}{u.code === "baek" ? " · 과열 " + heat + "/3" : ""}{u.fx.length ? " · " + u.fx.join(",") : ""}</span>
          </div>
        ))}
        {foes.map((u) => (
          <div key={u.key} style={row} onClick={() => setFocus(focus && focus.key === u.key ? null : u)}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#b43a3a", flexShrink: 0 }} />
            <span style={{ width: 58, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</span>
            <Pips now={u.hp} max={u.max} />
            <span style={small}>{u.grade}{u.fx.length ? " · " + u.fx.join(",") : ""}</span>
          </div>
        ))}

        {hasActions ? (
          <div>
            <div style={line} />
            {map ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <button type="button" onClick={() => { if (!locked) { setMoveMode(!moveMode); setWarn(""); } }} style={chip(moveMode, "#3d6fb6")}>
                  {moveMode ? "이동할 칸을 누르세요" : "이동"}
                </button>
                <span style={small}>{moveTo ? moveTo + "로 이동" : "이동 없음"}{moveTo && !locked ? "" : ""}</span>
                {moveTo && !locked ? <button type="button" onClick={() => setMoveTo("")} style={chip(false, "#888")}>취소</button> : null}
              </div>
            ) : null}
            <div style={{ display: "flex" }}>
              {["공격", "수비", "도움"].map((n) => (
                <button key={n} type="button" style={tabBtn(n)} onClick={() => { if (!locked) { setTab(n); setPick(null); setTarget(""); setRoll(null); setWarn(""); } }}>{n}</button>
              ))}
            </div>
            {curList.length === 0 ? <div style={{ ...small, marginTop: 6 }}>이 칸에는 고를 행동이 없습니다.</div> : null}
            {curList.map((a, i) => (
              <button key={i} type="button" style={itemBtn(pick && pick.name === a.name)} onClick={() => { if (!locked) { setPick(a); setRoll(null); } }}>
                {a.name} <span style={small}>({a.diff})</span>
              </button>
            ))}
            {pick && needTarget ? (
              <div style={{ marginTop: 4 }}>
                <div style={small}>{tab === "도움" ? "누구를 도울까요?" : "누구를 노릴까요?"}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                  {(tab === "도움" ? allies : foes).map((u) => (
                    <button key={u.key} type="button" onClick={() => { if (!locked) setTarget(u.name); }} style={chip(target === u.name, tab === "도움" ? "#3f8a55" : "#b43a3a")}>{u.name}</button>
                  ))}
                </div>
              </div>
            ) : null}
            {pick ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={startRoll} disabled={locked || roll !== null} style={{ padding: "6px 14px", fontSize: 14, cursor: "pointer", borderRadius: 4, border: "1px solid #555", background: roll !== null ? "#ddd" : "#333", color: roll !== null ? "#666" : "#fff" }}>
                  🎲 굴리기
                </button>
                {roll !== null ? <span style={{ fontSize: 20, fontWeight: "bold", minWidth: 30 }}>{roll}</span> : null}
                {roll !== null && !rolling ? (
                  <span style={{ fontSize: 12 }}>
                    {pick.diff} {sbJudge(roll, pick.diff)}
                    {SB_EASIER[pick.diff] !== pick.diff && sbJudge(roll, SB_EASIER[pick.diff]) !== sbJudge(roll, pick.diff) ? " / " + SB_EASIER[pick.diff] + " " + sbJudge(roll, SB_EASIER[pick.diff]) : ""}
                  </span>
                ) : null}
              </div>
            ) : null}
            {pick && roll !== null && !rolling ? (
              <div style={{ marginTop: 6 }}>
                <input
                  type="text"
                  value={note}
                  disabled={!!sent}
                  maxLength={80}
                  placeholder="한 줄 덧붙이기 (스킬·지형·약점, 비워도 됨)"
                  onChange={(e) => setNote(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "6px 8px", fontSize: 13, border: "1px solid #aaa", borderRadius: 4 }}
                />
                <button type="button" onClick={doSend} disabled={!!sent} style={{ marginTop: 6, width: "100%", padding: "7px 0", fontSize: 14, cursor: "pointer", borderRadius: 4, border: "1px solid #3d6fb6", background: sent ? "#ddd" : "#3d6fb6", color: sent ? "#666" : "#fff" }}>
                  보내기
                </button>
              </div>
            ) : null}
            {warn ? <div style={{ marginTop: 6, fontSize: 12, color: "#b43a3a" }}>{warn}</div> : null}
            {sent ? <div style={{ marginTop: 6, fontSize: 12, color: "#555" }}>{sent}</div> : null}
          </div>
        ) : null}
      </div>
    );
  }

  /* ───────── 일상 화면 ───────── */
  const list = sbList(p.choices);

  return (
    <div style={box}>
      <div style={{ fontWeight: "bold" }}>
        {phase ? <span style={badge}>{PHASE_LABEL[phase] || phase}</span> : null}
        {[date, time, place].filter(Boolean).join(" · ")}
      </div>
      {scene ? <div>{scene}</div> : null}
      {people.length > 0 ? (
        <div style={{ color: "#555" }}>
          {people.map((x) => {
            const parts = String(x).split(":");
            const k = (parts[0] || "").trim().replace(/^[bc]_/, "");
            return (SB_NAME[k] || k) + (parts[1] ? " — " + parts.slice(1).join(":") : "");
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
            const k = (parts[0] || "").trim();
            return (
              <div key={i} style={{ display: "flex" }}>
                <span style={{ width: 64, color: "#666" }}>{SB_NAME[k] || k}</span>
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
      <Clock name="균열" value={p.rift} />
      <Clock name="다툼" value={p.rivalry} />
      <Clock name="사고" value={p.trouble} />

      {list.length > 0 ? (
        <div>
          <div style={line} />
          {list.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => sbSend(String(c), () => {})}
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

// React 기능을 React에서 직접 꺼내 쓴다. 없으면 플랫폼이 넣어 준 것을 쓴다.
function sbHooks() {
  const R = typeof React !== "undefined" && React ? React : {};
  const s = R.useState || (typeof useState === "function" ? useState : null);
  return {
    s: s || ((v) => [v, () => {}]),
    e: R.useEffect || (typeof useEffect === "function" ? useEffect : null),
    r: R.useRef || (typeof useRef === "function" ? useRef : null),
  };
}

function sbStr(v) {
  if (v === undefined || v === null) return "";
  const s = String(v).trim();
  return s === "undefined" || s === "null" ? "" : s;
}

function sbClamp(v, lo, hi, d) {
  const n = Number(v);
  if (v === undefined || v === null || String(v).trim() === "" || isNaN(n)) return d === undefined ? lo : d;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function sbList(v) {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (v === undefined || v === null) return [];
  const s = String(v).trim();
  if (!s) return [];
  try {
    const j = JSON.parse(s);
    if (Array.isArray(j)) return j.map((x) => String(x).trim()).filter(Boolean);
  } catch (e) {}
  return [s];
}

function sbFx(v) {
  const s = sbStr(v);
  if (!s || s === "없음") return [];
  return s.split(/[+,·\s]+/).map((x) => x.trim()).filter(Boolean);
}

function sbPos(v) {
  const s = sbStr(v).toUpperCase().replace(/\s/g, "");
  return /^[A-E][1-5]$/.test(s) ? s : "";
}

function sbDist(a, b) {
  if (!a || !b) return 99;
  const dc = Math.abs(a.charCodeAt(0) - b.charCodeAt(0));
  const dr = Math.abs(Number(a[1]) - Number(b[1]));
  return Math.max(dc, dr);
}

// 장판: "2행"(가로 한 줄) · "C열"(세로 한 줄) · "C3+"(십자) · "B2,C2"(칸 지목)
function sbDanger(list) {
  const out = {};
  list.forEach((raw) => {
    String(raw).split(/[,\s]+/).forEach((tok) => {
      const s = tok.trim().toUpperCase();
      let m;
      if ((m = s.match(/^([1-5])행$/))) SB_COLS.forEach((c) => { out[c + m[1]] = true; });
      else if ((m = s.match(/^([A-E])열$/))) [1, 2, 3, 4, 5].forEach((r) => { out[m[1] + r] = true; });
      else if ((m = s.match(/^([A-E])([1-5])\+$/))) {
        const ci = SB_COLS.indexOf(m[1]); const r = Number(m[2]);
        [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dr]) => {
          const c = SB_COLS[ci + dc]; const rr = r + dr;
          if (c && rr >= 1 && rr <= 5) out[c + rr] = true;
        });
      } else if (/^[A-E][1-5]$/.test(s)) out[s] = true;
    });
  });
  return out;
}

function sbAction(v) {
  const a = String(v).split("|");
  const diff = (a[1] || "보통").trim();
  return { name: (a[0] || "").trim(), diff: SB_TH[diff] ? diff : "보통" };
}

function sbJudge(n, diff) {
  const th = SB_TH[diff] || 11;
  if (n === 20) return "대성공";
  if (n === 1) return "실패";
  if (n >= th) return "성공";
  if (th - n <= 5) return "아슬아슬";
  return "실패";
}

function sbSend(text, done) {
  try {
    if (typeof sendMessage === "function") {
      sendMessage(text);
      done("sent");
      return;
    }
  } catch (e) {}
  const fallback = () => {
    let ok = false;
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      ok = document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (e) {
      ok = false;
    }
    done(ok ? "copied" : "fail");
  };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => done("copied"), fallback);
    } else {
      fallback();
    }
  } catch (e) {
    fallback();
  }
}
