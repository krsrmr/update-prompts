// 필요 훅: useState, useEffect, useRef (react)
// 마시로 상태창. 접힘/펼침, PC(넓은 화면)·모바일(좁은 화면) 배치가 자동으로 바뀐다.
// 배경·마시로 이미지는 bgSrc, spriteSrc에 주소를 넣으면 교체된다. 비워두면 코드로 그린 임시 도트가 나온다.
// 숨은 기능: 마시로를 5번 연속으로 누르면 비공개 스탯 창이 열린다.
// userConfessed ~ married: 숨은 연애 상태. 화면에 표시하지 않는다. 대화 기록의 상태창 코드로만 확인한다.
// nextUpdate(다음 루넬 갱신일), material(원고 재료 메모): 숨은 값. 화면에 표시하지 않는다.

function MashiroStatus(props = {}) {
  const {
    time = "23:41",
    date = "10/29",
    weekday = "목",
    weather = "비",
    location = "덴노지 맨션",
    stage = "작화",
    statusText = "",
    episode = 26,
    progress = 62,
    deadline = 3,
    research = 2,
    bubble = "펜선|+3P",
    mashiroFace = "(╥﹏╥)φ",
    mashiroStatus = "마감 3일 전, 수면 부족",
    mashiroOutfit = "목 늘어난 회색 후드",
    userName = "당신",
    userFace = "٩(ˊᗜˋ*)و ♡",
    userStatus = "평소대로",
    userOutfit = "니트 카디건",
    nextDate = "10/31(土) 15:00",
    nextPlan = "콘티 p.3 재현 — 손 잡고 걷기",
    todos = ["26화 밑그림 끝내기|done", "펜선 10p까지", "그분께 답장하기 (…보낼 수 있을까)"],
    memo = "손 크기 비교 자료 필요한데… 직접…? 아니 무리무리",
    summary = "마감 3일 전, 비 오는 밤. 마시로는 작업실에서 26화 펜선을 넣는 중이다. 이틀 뒤 취재를 앞두고 콘티를 볼 때마다 손이 멈춘다.",
    trust = 46,
    affection = 52,
    phase = 4,
    researchCount = 4,
    userConfessed = false,
    mashiroConfessed = false,
    rejected = false,
    dating = false,
    brokeUp = false,
    married = false,
    nextUpdate = "11/2",
    material = "우산 속에서 닿은 어깨, 빨개진 귀",
    bgSrc = "",
    spriteSrc = "",
    defaultOpen = false
  } = props;

  const rootRef = useRef(null);
  const tapRef = useRef({ n: 0, t: 0 });
  const [width, setWidth] = useState(380);
  const [open, setOpen] = useState(!!defaultOpen);
  const [popup, setPopup] = useState(null);
  const [hop, setHop] = useState(0);
  const [checks, setChecks] = useState({});
  const [page, setPage] = useState(0);
  const [flip, setFlip] = useState({ n: 0, dir: "r" });

  useEffect(() => {
    const update = () => {
      if (rootRef.current) setWidth(rootRef.current.clientWidth || 380);
    };
    update();
    if (typeof ResizeObserver !== "undefined" && rootRef.current) {
      const ro = new ResizeObserver(update);
      ro.observe(rootRef.current);
      return () => ro.disconnect();
    }
    return undefined;
  }, []);

  // 560px 이상이면 PC 배치. PC 배치는 720px 기준으로 그린 뒤 화면 폭에 맞춰 통째로 축소한다(가변형).
  const wide = width >= 560;
  const zoom = wide ? Math.min(1, width / 720) : 1;
  const C = MS_C;
  const steps = ["시나리오", "취재", "작화", "마감"];
  const stageIdx = String(stage) === "완료" ? 4 : Math.max(0, steps.indexOf(String(stage)));
  const status = statusText || (stageIdx >= 4 ? "마감 끝" : steps[stageIdx] + "중");
  const pct = Math.max(0, Math.min(100, Number(progress) || 0));
  const dl = msDday(deadline);
  const rs = msDday(research);
  const showNext = rs !== null && String(nextDate || nextPlan).trim() !== "";
  const todoList = (Array.isArray(todos) ? todos : []).filter(Boolean).map((t, i) => {
    const parts = String(t).split("|");
    const done = checks[i] !== undefined ? checks[i] : (parts[1] || "").trim() === "done";
    return { text: parts[0].trim(), done };
  });
  const remain = todoList.filter((t) => !t.done).length;
  const clock = msClock(time);
  const dt = msDate(date, weekday);
  const wx = msWeather(weather);
  const bub = String(bubble || "").split("|");

  // 화면 크기와 배경 잘림 계산 (배경은 정사각, PC는 위아래 약 11%, 모바일은 좌우가 잘린다)
  const H = wide ? 560 : 714;
  const vb = wide ? [0, 35.2, 317, 246.6] : [0, 0, 317, 317];
  // 실제 무대 크기(최대폭 제한과 테두리 3px 반영)로 계산해야 마시로가 책상 위치에 맞는다.
  const iw = (wide ? 720 : Math.min(width, 420)) - 6;
  const ih = H - 6;
  const sc = Math.max(iw / vb[2], ih / vb[3]);
  const ox = (iw - vb[2] * sc) / 2 - vb[0] * sc;
  const oy = (ih - vb[3] * sc) / 2 - vb[1] * sc;
  const sx = ox + MS_ANCHOR[0] * sc;
  const sy = oy + MS_ANCHOR[1] * sc;
  const night = clock.h24 >= 19 || clock.h24 < 5;
  const dusk = clock.h24 >= 16 && clock.h24 < 19;
  const overcast = ["흐", "비", "소나기", "눈"].some((w) => String(weather).includes(w));
  const sky = night ? "#1d2433" : dusk ? (overcast ? "#c9a99a" : "#f2a477") : overcast ? "#a9b9c9" : "#8fd0ea";

  const tapMashiro = () => {
    const now = Date.now();
    const r = tapRef.current;
    r.n = now - r.t < 1200 ? r.n + 1 : 1;
    r.t = now;
    setHop((h) => h + 1);
    if (r.n >= 5) {
      r.n = 0;
      setPopup("secret");
    }
  };

  const dateChip = (stacked, withClock) => (
    <div className={"ms-date" + (stacked ? " ms-stack" : "")}>
      {withClock ? <MsPix d={MS_ICON.clock} w={12} h={12} s={2} /> : null}
      <span className="ms-ap ms-dot ms-ol">{clock.ap}</span>
      <span className="ms-t ms-dot ms-ol">{clock.hm}</span>
      <span className="ms-t ms-dot ms-ol">
        {dt.m}<small>月</small>{dt.d}<small>日</small><small style={{ marginLeft: 3 }}>{dt.w}</small>
      </span>
    </div>
  );
  const weatherChip = (grow) => (
    <span className="ms-wchip" style={grow ? { flex: 1, justifyContent: "center", alignSelf: "stretch" } : null}>
      <span className="ms-dot">{wx}</span><span className="ms-wtxt">{String(weather)} · {String(location)}</span>
    </span>
  );
  const nbox = (k, v, color) => (
    <span className="ms-nbox">
      <span className="ms-k">{k}</span>
      <span className="ms-v ms-dot" style={{ color }}>{v}</span>
    </span>
  );
  const ddays = (
    <>
      {dl !== null ? nbox("마감", dl, C.red) : null}
      {rs !== null ? nbox("취재", rs, C.blue) : null}
    </>
  );
  const stageChipOf = (withText) => (
    <span className="ms-step ms-now" style={{ padding: withText ? "1px 7px" : "1px 5px", fontSize: 12, flex: "none" }} title={status} aria-label={status}>
      <MsPix d={MS_ICON[["script", "camera", "pen", "flag", "flag"][stageIdx]]} w={8} h={9} s={1.5} />
      {withText ? status : null}
    </span>
  );
  const stageChip = stageChipOf(true);
  const toggleBtn = (
    <button type="button" className="ms-cbtn" onClick={() => { setOpen(!open); setPopup(null); }} aria-label={open ? "접기" : "펼치기"} aria-expanded={open}>
      <span style={{ display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>
        <MsPix d={MS_ICON.arrow} w={10} h={7} s={2} />
      </span>
    </button>
  );

  // ── 접힘 바 ──
  const collapsed = wide ? (
    <div className="ms-cbar">
      <span className="ms-mini"><MsPix d={MS_ICON.face} w={16} h={16} s={2} /></span>
      {dateChip(false, true)}
      {stageChip}
      {weatherChip(false)}
      {ddays}
      <span style={{ marginLeft: "auto" }}>{toggleBtn}</span>
    </div>
  ) : (
    <div className="ms-cbar" style={{ display: "block" }}>
      {/* 좁은 화면: 폭에 따라 1줄을 줄인다. 380px 이상 = 얼굴·날짜·단계·펼치기 / 345px 이상 = 얼굴 빼기 / 그보다 좁으면 단계는 아이콘만. */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {width >= 380 ? <span className="ms-mini"><MsPix d={MS_ICON.face} w={16} h={16} s={2} /></span> : null}
        {dateChip(false, false)}
        {stageChipOf(width >= 345)}
        <span style={{ marginLeft: "auto" }}>{toggleBtn}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 5 }}>
        {weatherChip(true)}
        {ddays}
      </div>
    </div>
  );

  // ── 펼침: 지금 두 사람 창 ──
  const person = (face, name, kao, st, out) => (
    <div className="ms-p">
      <span className="ms-face">{face}</span>
      <div className="ms-nm">{name}<span className="ms-kao">{kao}</span></div>
      <span className="ms-tags">
        <span className="ms-tg"><i style={{ background: "#f07aa0" }}>상태</i>{st}</span>
        <span className="ms-tg"><i style={{ background: "#5ca9e0" }}>복장</i>{out}</span>
      </span>
    </div>
  );
  // 좌우 화살표로 1페이지(지금 두 사람) ↔ 2페이지(지금 상황)를 넘긴다.
  const turn = (dir) => {
    setPage((p) => (p + 1) % 2);
    setFlip((f) => ({ n: f.n + 1, dir }));
  };
  const slide = flip.n ? (flip.dir === "l" ? " ms-in-l" : " ms-in-r") : "";
  const duo = (
    <div className="ms-win ms-drop">
      <div className="ms-tbar">
        <button type="button" className="ms-arr ms-l" onClick={() => turn("l")} aria-label="이전 페이지">
          <MsPix d={MS_ICON.arrow} w={10} h={7} s={2} />
        </button>
        {page === 0 ? "지금 두 사람" : "지금 상황"}
        <span className="ms-dots" aria-hidden="true">
          <i className={page === 0 ? "on" : ""} />
          <i className={page === 1 ? "on" : ""} />
        </span>
        <button type="button" className="ms-arr ms-r" onClick={() => turn("r")} aria-label="다음 페이지">
          <MsPix d={MS_ICON.arrow} w={10} h={7} s={2} />
        </button>
      </div>
      <div className="ms-rows">
        <div className="ms-pages">
          <div
            key={"p0-" + flip.n}
            className={"ms-duo" + (page === 0 ? slide : "")}
            style={{ visibility: page === 0 ? "visible" : "hidden" }}
            aria-hidden={page !== 0}
          >
            {person(<MsPix d={MS_ICON.face} w={16} h={16} s={2} />, "마시로", mashiroFace, mashiroStatus, mashiroOutfit)}
            {person(<span className="ms-you ms-dot">YOU</span>, String(userName), userFace, userStatus, userOutfit)}
          </div>
          {page === 1 ? (
            <div key={"p1-" + flip.n} className={"ms-sum" + slide}>
              <p>{String(summary || "…")}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  // ── 펼침: 하단 판 ──
  const nextCard = showNext ? (
    <div className="ms-scroll">
      <span className="ms-tab">{rs === "미정" ? "미정" : "예정"}</span>
      <span className="ms-sk">NEXT 취재</span>
      <span className="ms-st ms-dot">{String(nextDate || "미정")}</span>
      <div className="ms-sw">{String(nextPlan || "할 일 미정")}</div>
    </div>
  ) : null;
  const workCard = (
    <div className="ms-work">
      <div className="ms-hd">
        <span style={{ color: C.blue }}>
          제{String(episode)}화 원고 <span className="ms-dot" style={{ color: C.ink, fontSize: 14, marginLeft: 4 }}>{pct}%</span>
        </span>
        <span>{status}</span>
      </div>
      <div className="ms-gauge"><i style={{ width: pct + "%" }} /></div>
      <div className="ms-steps">
        {steps.map((s, i) => (
          <span key={s} className={"ms-step " + (i < stageIdx ? "ms-done" : i === stageIdx ? "ms-now" : "ms-yet")}>
            {wide ? <MsPix d={MS_ICON[["script", "camera", "pen", "flag"][i]]} w={8} h={9} s={1.5} /> : null}
            {s}
          </span>
        ))}
      </div>
    </div>
  );

  // ── 펼침: 장면 ──
  const away = stageIdx === 1;
  const sleep = stageIdx >= 3;
  const pose = away ? "" : sleep ? " ms-sleep" : stageIdx === 0 ? " ms-think" : " ms-draw";
  const spriteW = 28 * sc;
  const spriteH = 36 * sc;
  const scene = (
    <div className="ms-stage ms-in" style={{ height: H, background: sky }}>
      {String(weather).includes("비") || String(weather).includes("소나기") ? <div className="ms-rain" /> : null}
      {String(weather).includes("눈") ? <div className="ms-snow" /> : null}
      {String(weather).includes("맑") || String(weather).includes("흐") ? (
        <div className="ms-clouds" aria-hidden="true" style={{ opacity: night ? 0.35 : 1 }}>
          {(String(weather).includes("흐") ? MS_CLOUDS_GRAY : MS_CLOUDS_CLEAR).map((c, i) => (
            <span key={i} className="ms-cloud" style={{ top: c.top + "%", animationDuration: c.dur + "s", animationDelay: -c.delay + "s" }}>
              <MsCloud shape={c.shape} s={Math.max(2, Math.round(sc * c.scale))} fill={String(weather).includes("흐") ? "#d9dde6" : dusk ? "#ffe9d6" : "#ffffff"} shade={String(weather).includes("흐") ? "#aeb5c3" : dusk ? "#f3c3a4" : "#d6ecf6"} />
            </span>
          ))}
        </div>
      ) : null}
      {bgSrc ? (
        <img src={bgSrc} alt="" className="ms-bg" />
      ) : (
        <svg viewBox={vb.join(" ")} preserveAspectRatio="xMidYMid slice" className="ms-bg" aria-hidden="true">
          <MsRoom />
        </svg>
      )}

      {/* 마시로 */}
      {!away ? (
        <button
          type="button"
          key={"hop" + hop}
          className={"ms-sprite" + pose + (hop ? " ms-hop" : "")}
          onClick={tapMashiro}
          aria-label="마시로"
          style={{ left: sx - spriteW / 2, top: sy - spriteH, width: spriteW, height: spriteH }}
        >
          {spriteSrc ? (
            <img src={spriteSrc} alt="" style={{ width: "100%", height: "100%", imageRendering: "pixelated" }} />
          ) : (
            <MsMashiro />
          )}
        </button>
      ) : null}
      {!away && bub[0] ? (
        <div className="ms-pop ms-bob" style={{ left: sx + 18, top: sy - spriteH - 20 }}>
          {sleep ? "Zzz…" : bub[0]}
          {!sleep && bub[1] ? <><br /><b className="ms-dot">{bub[1]}</b></> : null}
          <span className="ms-tail"><MsPix d={MS_ICON.tail} w={10} h={6} s={1} /></span>
        </div>
      ) : null}
      <div className="ms-ntag" style={{ left: sx - 70, top: sy + 4, width: 140 }}>
        <span>{away ? "취재 외출중" : status + " " + mashiroFace}</span>
      </div>

      {/* 위 정보 */}
      {wide ? (
        <div className="ms-toprow ms-drop">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
            {dateChip(false, true)}
            {weatherChip(false)}
          </div>
          {duo}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>{ddays}</div>
        </div>
      ) : (
        <>
          <div className="ms-toprow-sp ms-drop">
            {dateChip(true, false)}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, minWidth: 0, marginLeft: 8 }}>
              {weatherChip(false)}
              <div style={{ display: "flex", gap: 6 }}>{ddays}</div>
            </div>
          </div>
          <div className="ms-duo-sp">{duo}</div>
        </>
      )}

      {/* 아이콘 버튼 */}
      <div className="ms-icons" style={{ top: wide ? 122 : 262 }}>
        <button type="button" className="ms-ib" onClick={() => setPopup("todo")} aria-label="오늘 할 일">
          <MsPix d={MS_ICON.todo} w={8} h={12} s={2} />
          {remain > 0 ? <span className="ms-badge ms-dot">{remain}</span> : null}
          <small>할 일</small>
        </button>
        <button type="button" className="ms-ib" style={{ marginTop: 20 }} onClick={() => setPopup("memo")} aria-label="마시로의 메모">
          <MsPix d={MS_ICON.memo} w={10} h={10} s={2} />
          <small>메모</small>
        </button>
      </div>

      {/* 아래 판 */}
      <div className="ms-tray ms-rise">
        <div className="ms-tray-in" style={{ gridTemplateColumns: wide && nextCard ? "minmax(0,1fr) minmax(0,1.15fr)" : "minmax(0,1fr)" }}>
          {nextCard}
          {workCard}
          <span className="ms-fl" style={{ left: -2, top: -4 }}><MsPix d={MS_ICON.flower} w={6} h={6} s={2} /></span>
          <span className="ms-fl" style={{ right: -2, bottom: -4 }}><MsPix d={MS_ICON.flower2} w={6} h={6} s={2} /></span>
        </div>
      </div>

      {/* 팝업 창 */}
      {popup ? (
        <div className="ms-dim" onClick={() => setPopup(null)}>
          <div className="ms-win ms-popwin" onClick={(e) => e.stopPropagation()}>
            <div className="ms-tbar">
              {popup === "todo" ? "오늘 할 일" : popup === "memo" ? "마시로의 메모" : "마시로의 마음"}
              <button type="button" className="ms-x" onClick={() => setPopup(null)} aria-label="닫기">✕</button>
            </div>
            {popup === "todo" ? (
              <ul className="ms-todo">
                {todoList.length ? todoList.map((t, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className={"ms-cb" + (t.done ? " on" : "")}
                      onClick={() => setChecks(Object.assign({}, checks, { [i]: !t.done }))}
                      aria-pressed={t.done}
                      aria-label={t.text}
                    >
                      {t.done ? "✓" : ""}
                    </button>
                    <span className={t.done ? "ms-x-done" : ""}>{t.text}</span>
                  </li>
                )) : <li>오늘은 할 일이 없어요.</li>}
              </ul>
            ) : null}
            {popup === "memo" ? <div className="ms-memo">{String(memo || "…")}</div> : null}
            {popup === "secret" ? (
              <div className="ms-rows" style={{ margin: 8 }}>
                <div className="ms-sec-h"><span>단계 {String(phase)} · 취재 {String(researchCount)}회</span><span>신뢰</span><span>호감</span></div>
                <div className="ms-sec-r">
                  <span style={{ fontSize: 12 }}>{["", "들킴", "연재 허락", "모델 허락", "취재 협력", "자각"][Number(phase)] || ""}</span>
                  <span className="ms-hv"><MsPix d={MS_ICON.heart} w={10} h={9} s={2} /><b className="ms-dot ms-ol" style={{ color: "#ffe27a" }}>{Number(trust) >= 100 ? "MAX" : String(trust)}</b></span>
                  <span className="ms-hv"><MsPix d={MS_ICON.heart} w={10} h={9} s={2} /><b className="ms-dot ms-ol" style={{ color: "#ffe27a" }}>{Number(affection) >= 100 ? "MAX" : String(affection)}</b></span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div ref={rootRef} style={{ width: "100%" }}>
    <div className="ms-root" style={wide ? { width: 720, margin: "12px auto", zoom: zoom } : { width: "100%", maxWidth: 420, margin: "12px auto" }}>
      <style>{MS_CSS}</style>
      {open ? (
        <>
          {scene}
          <div className="ms-fold">
            <button type="button" className="ms-fb" onClick={() => { setOpen(false); setPopup(null); }}>
              <span>접기</span>
              <span className="ms-cbtn" style={{ width: 30, height: 24 }}>
                <span style={{ display: "inline-block", transform: "rotate(180deg)" }}><MsPix d={MS_ICON.arrow} w={10} h={7} s={2} /></span>
              </span>
            </button>
          </div>
        </>
      ) : collapsed}
    </div>
    </div>
  );
}

/* ───────── 보조 요소 ───────── */

const MS_INK = "#2b2420";
const MS_C = { ink: MS_INK, red: "#e0442e", blue: "#2f80a8" };
const MS_ANCHOR = [165.1, 179.9];

function msDday(v) {
  if (v === null || v === undefined || v === "" || v === false) return null;
  const s = String(v).trim();
  if (s === "미정" || s === "?") return "미정";
  const n = Number(s.replace(/^D-?/i, ""));
  if (!isFinite(n)) return s;
  return n <= 0 ? "D-DAY" : "D-" + n;
}

function msClock(t) {
  const m = String(t || "").match(/(\d{1,2}):(\d{2})/);
  let h = m ? Number(m[1]) : 0;
  const mm = m ? m[2] : "00";
  if (/PM|오후/i.test(String(t)) && h < 12) h += 12;
  if (/AM|오전/i.test(String(t)) && h === 12) h = 0;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { h24: h, ap: h >= 12 ? "PM" : "AM", hm: (h12 < 10 ? "0" : "") + h12 + ":" + mm };
}

function msDate(d, w) {
  const m = String(d || "").match(/(\d{1,2})\D+(\d{1,2})/);
  const map = { 월: "月", 화: "火", 수: "水", 목: "木", 금: "金", 토: "土", 일: "日" };
  const ws = String(w || "").trim().charAt(0);
  return { m: m ? m[1] : "", d: m ? m[2] : "", w: map[ws] || ws };
}

function msWeather(w) {
  const s = String(w || "");
  if (s.includes("눈")) return "❄";
  if (s.includes("비")) return "☂";
  if (s.includes("흐")) return "☁";
  if (s.includes("천둥") || s.includes("번개")) return "⚡";
  return "☀";
}

function msFrame(fill, hi, sh) {
  const r = (x, y, w, h, c) => `<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='${c}'/>`;
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8' shape-rendering='crispEdges'>" +
    r(1, 1, 6, 6, fill) + r(1, 0, 6, 1, MS_INK) + r(1, 7, 6, 1, MS_INK) + r(0, 1, 1, 6, MS_INK) + r(7, 1, 1, 6, MS_INK) +
    r(2, 1, 4, 1, hi) + r(1, 2, 1, 4, hi) + r(2, 6, 4, 1, sh) + r(6, 2, 1, 4, sh) +
    "</svg>";
  return `border:6px solid transparent;border-image:url("data:image/svg+xml,${encodeURIComponent(svg)}") 3 fill / 6px stretch;`;
}

const MS_F = {
  cream: msFrame("#fbf7ec", "#ffffff", "#e7dcc4"),
  white: msFrame("#ffffff", "#ffffff", "#dfe7ee"),
  paper: msFrame("#f6ecd3", "#fffaf0", "#dccba3"),
  cyan: msFrame("#6fd3e8", "#c6f4fb", "#2f9fbd"),
  orange: msFrame("#ffb35c", "#ffe0b0", "#d9822f"),
  pink: msFrame("#ff9fbe", "#ffe1ea", "#d9688e"),
  navy: msFrame("#2f4a8a", "#6f8fd0", "#1d2f5c"),
  red: msFrame("#ef5a45", "#ffb0a3", "#b8321f"),
  yellow: msFrame("#ffe27a", "#fff6c8", "#d9b43c"),
  dark: msFrame("#3b3331", "#6b5e58", "#221c1a")
};

const MS_CHECK = "repeating-conic-gradient(#ffd9cf 0 25%, #fff1ea 0 50%) 0 0/16px 16px";
const MS_RAIN = `url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M8 2 L6 11 M29 21 L27 30' stroke='#5d6f9a' stroke-width='1.2' stroke-linecap='round'/></svg>")}")`;
const MS_SNOW = `url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect x='7' y='5' width='3' height='3' fill='#ffffff'/><rect x='27' y='25' width='2' height='2' fill='#ffffff'/></svg>")}")`;

const MS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DotGothic16&family=Noto+Sans+KR:wght@400;700;900&display=swap');
.ms-root{font-family:"Noto Sans KR","Noto Sans CJK KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif;color:${MS_INK};line-height:1.45;box-sizing:border-box}
.ms-root *{box-sizing:border-box}
.ms-root button{font-family:inherit;font-size:inherit;color:inherit;cursor:pointer}
.ms-dot{font-family:"DotGothic16","Noto Sans JP",monospace}
.ms-ol{text-shadow:1.5px 0 ${MS_INK},-1.5px 0 ${MS_INK},0 1.5px ${MS_INK},0 -1.5px ${MS_INK},1.5px 1.5px ${MS_INK},-1.5px -1.5px ${MS_INK},1.5px -1.5px ${MS_INK},-1.5px 1.5px ${MS_INK},0 3px ${MS_INK}}
.ms-date{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;${MS_F.pink}padding:0 7px 0 2px}
.ms-date.ms-stack{flex-direction:column;align-items:flex-start;gap:0;padding:2px 8px}
.ms-date .ms-t{font-size:19px;color:#ffe27a;line-height:1.15}
.ms-date .ms-t small{font-size:13px;color:#fff;margin:0 1px}
.ms-date .ms-ap{font-size:12px;color:#fff;margin-right:-2px}
.ms-wchip{display:inline-flex;align-items:center;gap:4px;white-space:nowrap;min-width:0;max-width:100%;${MS_F.white}padding:0 6px;font-size:12px;font-weight:700}
.ms-nbox{display:inline-flex;align-items:stretch;white-space:nowrap}
.ms-nbox .ms-k{${MS_F.dark}padding:0 4px;color:#fff;font-size:11.5px;font-weight:900;display:flex;align-items:center;margin-right:-4px;position:relative;z-index:1}
.ms-nbox .ms-v{${MS_F.white}padding:0 6px;font-size:18px;line-height:1.1;display:flex;align-items:center}
.ms-step{display:inline-flex;align-items:center;justify-content:center;gap:3px;font-size:11px;font-weight:900;white-space:nowrap;line-height:1.5}
.ms-done{${MS_F.cyan}} .ms-now{${MS_F.orange}} .ms-yet{${MS_F.white}color:#b8ad9c}
.ms-yet svg{opacity:.35}
.ms-mini{display:inline-flex;${MS_F.white}background:#fff}
.ms-cbtn{display:inline-grid;place-items:center;width:36px;height:30px;${MS_F.cyan}padding:0;background:none}
.ms-cbtn:hover svg{transform:translateY(1px)}
.ms-wtxt{overflow:hidden;text-overflow:ellipsis;min-width:0}
.ms-cbar{display:flex;flex-wrap:wrap;align-items:center;gap:5px 6px;white-space:nowrap;${MS_F.orange}padding:3px;background:${MS_CHECK};background-clip:padding-box;animation:ms-pop .25s ease-out both}
.ms-stage{position:relative;overflow:hidden;border:3px solid ${MS_INK};border-radius:6px;box-shadow:0 4px 0 #b7aa96}
.ms-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;display:block}
.ms-rain,.ms-snow{position:absolute;inset:0;animation:ms-fall .5s linear infinite}
.ms-clouds{position:absolute;inset:0;overflow:hidden}
.ms-cloud{position:absolute;animation:ms-drift 60s linear infinite}
.ms-rain{background-image:${MS_RAIN}} .ms-snow{background-image:${MS_SNOW};animation-duration:3s}
.ms-toprow{position:absolute;left:8px;right:8px;top:8px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:start;z-index:3}
.ms-toprow-sp{position:absolute;left:8px;right:8px;top:8px;display:flex;justify-content:space-between;align-items:flex-start;z-index:3}
.ms-toprow,.ms-toprow-sp{pointer-events:none}
.ms-toprow>*,.ms-toprow-sp>*{pointer-events:auto}
.ms-duo-sp{position:absolute;left:8px;right:8px;top:94px;z-index:3;animation:ms-drop .45s .05s ease-out both}
.ms-win{${MS_F.cream}padding:0;overflow:hidden}
.ms-tbar{position:relative;margin:-2px -2px 0;padding:4px 30px;text-align:center;font-size:14px;font-weight:900;background:linear-gradient(#c6f4fb 0 18%,#8fe3f2 18% 52%,#5ccbe3 52% 100%);border-bottom:3px solid #f08a3c;box-shadow:0 2px 0 #fff}
.ms-arr{position:absolute;top:50%;width:26px;height:26px;padding:0;border:0;background:none;display:grid;place-items:center;animation:ms-nudge 1.2s ease-in-out infinite}
.ms-arr.ms-l{left:2px;transform:translateY(-50%) rotate(90deg)} .ms-arr.ms-r{right:2px;transform:translateY(-50%) rotate(-90deg)}
.ms-arr:hover{animation:none;opacity:1} .ms-arr:active svg{transform:translateY(2px)}
.ms-dots{display:inline-flex;gap:3px;margin-left:7px;vertical-align:middle;position:relative;top:-1px}
.ms-dots i{width:7px;height:7px;border:1.5px solid ${MS_INK};background:#fff}
.ms-dots i.on{background:#f08a3c}
.ms-rows{margin:6px;${MS_F.white}padding:0}
.ms-pages{position:relative}
.ms-sum{position:absolute;inset:0;overflow-y:auto;padding:4px 10px 0;background:repeating-linear-gradient(#fff 0 21px,#d6edf5 21px 22px) 0 4px;background-attachment:local}
.ms-sum p{margin:0;font-size:13px;line-height:22px;word-break:keep-all;overflow-wrap:anywhere}
.ms-in-l{animation:ms-slide-l .25s ease-out both} .ms-in-r{animation:ms-slide-r .25s ease-out both}
.ms-duo{display:grid;grid-template-columns:1fr 1fr}
.ms-p{display:grid;grid-template-columns:40px minmax(0,1fr);gap:4px 8px;align-items:center;padding:5px 8px}
.ms-p + .ms-p{border-left:2px solid #bfe7f2}
.ms-nm{font-weight:900;font-size:14px;line-height:1.25;min-width:0}
.ms-kao{display:block;font-size:13px;color:#d9688e;font-weight:700;line-height:1.3}
.ms-tags{grid-column:1/-1;display:flex;flex-direction:column;gap:3px;min-width:0}
.ms-tg{display:flex;align-items:center;gap:5px;font-size:11px;line-height:1.35;color:#5a5048;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ms-tg i{font-style:normal;font-size:9px;font-weight:900;color:#fff;border-radius:3px;padding:0 3px;flex:none}
.ms-face{width:40px;height:40px;display:grid;place-items:center;background:#ffe9f0;border:2px solid ${MS_INK};border-radius:4px;box-shadow:inset 2px 2px 0 #fff}
.ms-you{font-size:12px;color:#d9688e}
.ms-icons{position:absolute;left:10px;z-index:2;display:flex;flex-direction:column;animation:ms-pop .4s .15s ease-out both}
.ms-ib{position:relative;width:38px;height:38px;display:grid;place-items:center;padding:0;background:linear-gradient(#a6ecf7,#5cc5df);border:2px solid ${MS_INK};border-radius:8px;box-shadow:0 3px 0 #2f80a8}
.ms-ib:active{transform:translateY(2px);box-shadow:0 1px 0 #2f80a8}
.ms-ib small{position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:9.5px;font-weight:900;color:#fff;text-shadow:0 0 2px ${MS_INK},0 0 2px ${MS_INK}}
.ms-badge{position:absolute;top:-5px;right:-5px;width:15px;height:15px;border-radius:50%;background:#e0442e;border:2px solid ${MS_INK};color:#fff;font-size:9px;display:grid;place-items:center;line-height:1;animation:ms-pulse 1.6s ease-in-out infinite}
.ms-sprite{position:absolute;padding:0;border:0;background:none;z-index:1;transform-origin:50% 100%}
.ms-sprite svg{width:100%;height:100%;display:block;overflow:visible}
.ms-hop{animation:ms-hop .3s ease-out}
.ms-draw .ms-arm{animation:ms-arm .35s steps(2) infinite}
.ms-draw .ms-head{animation:ms-head 1.4s steps(2) infinite}
.ms-think .ms-head{animation:ms-tilt 1.8s steps(2) infinite}
.ms-sleep .ms-head{transform:translate(1px,3px)}
.ms-sleep .ms-body{animation:ms-breathe 2.4s ease-in-out infinite;transform-origin:50% 100%}
.ms-pop{position:absolute;z-index:2;${MS_F.white}padding:0 6px;text-align:center;font-size:12px;font-weight:900;line-height:1.25;white-space:nowrap}
.ms-pop b{color:#2f80a8;font-size:13px}
.ms-bob{animation:ms-bob 1.6s ease-in-out infinite}
.ms-tail{position:absolute;left:50%;bottom:-8px;margin-left:-5px}
.ms-ntag{position:absolute;z-index:2;display:flex;justify-content:center}
.ms-ntag span{${MS_F.navy}padding:0 8px;color:#fff;font-size:12.5px;font-weight:900;white-space:nowrap;line-height:1.5}
.ms-tray{position:absolute;left:6px;right:6px;bottom:6px;z-index:3;${MS_F.orange}padding:4px;background:${MS_CHECK};background-clip:padding-box}
.ms-tray-in{background:${MS_CHECK};padding:9px;display:grid;gap:8px;position:relative;align-items:stretch}
.ms-fl{position:absolute}
.ms-scroll{position:relative;${MS_F.paper}padding:4px 10px 4px 14px;min-width:0}
.ms-scroll:before{content:"";position:absolute;left:2px;top:0;bottom:0;width:4px;background:#e2cf9f;border-right:1px solid #c9b07a}
.ms-sk{display:inline-block;${MS_F.red}padding:0 4px;color:#fff;font-size:11px;font-weight:900;vertical-align:middle}
.ms-st{font-size:14px;vertical-align:middle;margin-left:4px}
.ms-sw{font-size:12.5px;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ms-tab{position:absolute;right:10px;top:-14px;${MS_F.yellow}padding:0 6px;font-size:11px;font-weight:900}
.ms-work{${MS_F.white}padding:3px 8px 5px;min-width:0}
.ms-hd{display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:900;margin-bottom:3px}
.ms-gauge{position:relative;height:16px;border:2px solid ${MS_INK};background:#fff;box-shadow:inset 0 -2px 0 #dfe7ee;overflow:hidden}
.ms-gauge i{position:absolute;left:0;top:0;bottom:0;background:repeating-linear-gradient(90deg,#5ccbe3 0 5px,#8fe3f2 5px 6px,#2f9fbd 6px 7px);animation:ms-fill 1s .3s ease-out both}
.ms-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;margin-top:4px}
.ms-dim{position:absolute;inset:0;z-index:10;background:rgba(20,24,36,.5);display:grid;place-items:center;padding:16px;animation:ms-fade .2s ease-out both}
.ms-popwin{width:100%;max-width:340px;animation:ms-pop .28s cubic-bezier(.2,1.4,.4,1) both}
.ms-x{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:22px;height:22px;padding:0;border:2px solid ${MS_INK};border-radius:5px;background:#fff;font-size:11px;line-height:1}
.ms-todo{list-style:none;margin:8px;padding:8px 10px;display:flex;flex-direction:column;gap:7px;font-size:13px;${MS_F.white}}
.ms-todo li{display:flex;gap:8px;align-items:flex-start}
.ms-cb{width:18px;height:18px;flex:none;padding:0;border:2px solid ${MS_INK};background:#fff;color:#e0442e;font-size:12px;font-weight:900;line-height:1;display:grid;place-items:center;margin-top:1px}
.ms-x-done{color:#b8ad9c;text-decoration:line-through}
.ms-memo{position:relative;margin:10px;background:#fff3a6;border:2px solid ${MS_INK};border-radius:4px;padding:10px 12px;font-size:13px;line-height:1.6;transform:rotate(-.6deg);box-shadow:3px 3px 0 rgba(0,0,0,.15)}
.ms-sec-h,.ms-sec-r{display:grid;grid-template-columns:1fr 74px 74px;align-items:center;padding:4px 10px}
.ms-sec-h{background:#eaf7fb;color:#2f80a8;font-weight:900;font-size:12px;border-bottom:2px solid #9fd0e2}
.ms-hv{display:flex;align-items:center;gap:3px;font-size:16px}
.ms-fold{display:flex;justify-content:center;margin-top:10px}
.ms-fb{display:inline-flex;align-items:center;gap:8px;${MS_F.orange}padding:4px 18px;font-weight:900;font-size:14px;background:none}
.ms-drop{animation:ms-drop .45s ease-out both}
.ms-rise{animation:ms-rise .45s .1s ease-out both}
.ms-in{animation:ms-open .35s ease-out both}
@keyframes ms-open{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes ms-drop{from{transform:translateY(-24px);opacity:0}to{transform:none;opacity:1}}
@keyframes ms-rise{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
@keyframes ms-pop{from{transform:scale(.85);opacity:0}to{transform:none;opacity:1}}
@keyframes ms-fade{from{opacity:0}to{opacity:1}}
@keyframes ms-fall{from{background-position:0 0}to{background-position:-9px 40px}}
@keyframes ms-drift{from{left:-30%}to{left:105%}}
@keyframes ms-arm{0%{transform:translate(0,0)}100%{transform:translate(0,-1px)}}
@keyframes ms-head{0%{transform:translate(0,0)}100%{transform:translate(0,1px)}}
@keyframes ms-tilt{0%{transform:translate(0,0)}100%{transform:translate(-1px,0)}}
@keyframes ms-breathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.95)}}
@keyframes ms-hop{0%{transform:translateY(0)}40%{transform:translateY(-8px)}100%{transform:translateY(0)}}
@keyframes ms-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes ms-nudge{0%,100%{opacity:1}50%{opacity:.55}}
@keyframes ms-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
@keyframes ms-fill{from{width:0}}
@keyframes ms-slide-l{from{transform:translateX(-14px);opacity:0}to{transform:none;opacity:1}}
@keyframes ms-slide-r{from{transform:translateX(14px);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion: reduce){.ms-root *{animation:none!important}}
`;

/* 도트 아이콘: [x, y, w, h, 색] 목록 */
const MS_ICON = {
  arrow: [[0,0,10,1,MS_INK],[0,1,1,1,MS_INK],[9,1,1,1,MS_INK],[1,1,8,1,"#fff6c2"],[1,2,1,1,MS_INK],[8,2,1,1,MS_INK],[2,2,6,1,"#f7c843"],[2,3,1,1,MS_INK],[7,3,1,1,MS_INK],[3,3,4,1,"#f7c843"],[3,4,1,1,MS_INK],[6,4,1,1,MS_INK],[4,4,2,1,"#f7c843"],[4,5,2,1,MS_INK]],
  tail: [[0,0,10,1,"#ffffff"],[1,1,8,1,"#ffffff"],[2,2,6,1,"#ffffff"],[3,3,4,1,"#ffffff"],[4,4,2,1,"#ffffff"],[0,0,1,2,MS_INK],[9,0,1,2,MS_INK],[1,2,1,1,MS_INK],[8,2,1,1,MS_INK],[2,3,1,1,MS_INK],[7,3,1,1,MS_INK],[3,4,1,1,MS_INK],[6,4,1,1,MS_INK],[4,5,2,1,MS_INK]],
  clock: [[3,0,6,1,MS_INK],[1,1,2,1,MS_INK],[9,1,2,1,MS_INK],[0,3,1,6,MS_INK],[11,3,1,6,MS_INK],[1,9,2,1,MS_INK],[9,9,2,1,MS_INK],[3,11,6,1,MS_INK],[1,2,1,1,MS_INK],[10,2,1,1,MS_INK],[1,10,1,1,MS_INK],[10,10,1,1,MS_INK],[3,1,6,1,"#ffd0de"],[2,2,8,8,"#ffffff"],[1,3,10,6,"#ffffff"],[3,10,6,1,"#ffd0de"],[6,3,1,3,MS_INK],[6,6,3,1,MS_INK]],
  face: [[2,1,12,3,"#8a8f99"],[1,3,14,10,"#8a8f99"],[3,5,10,8,"#f1d2c0"],[3,5,10,3,"#2b2b33"],[4,10,2,1,"#e7a9a0"],[10,10,2,1,"#e7a9a0"],[7,11,2,1,"#b0675a"],[1,13,14,3,"#8a8f99"]],
  heart: [[2,0,2,1,MS_INK],[6,0,2,1,MS_INK],[1,1,1,1,MS_INK],[4,1,2,1,MS_INK],[8,1,1,1,MS_INK],[0,2,1,3,MS_INK],[9,2,1,3,MS_INK],[1,5,1,1,MS_INK],[8,5,1,1,MS_INK],[2,6,1,1,MS_INK],[7,6,1,1,MS_INK],[3,7,1,1,MS_INK],[6,7,1,1,MS_INK],[4,8,2,1,MS_INK],[2,1,2,1,"#f07aa0"],[6,1,2,1,"#f07aa0"],[1,2,8,3,"#f07aa0"],[2,5,6,1,"#f07aa0"],[3,6,4,1,"#f07aa0"],[4,7,2,1,"#f07aa0"],[2,2,1,1,"#ffffff"],[3,2,1,1,"#ffd0de"]],
  flower: [[2,0,2,1,MS_INK],[1,1,1,1,MS_INK],[4,1,1,1,MS_INK],[0,2,1,2,MS_INK],[5,2,1,2,MS_INK],[1,4,1,1,MS_INK],[4,4,1,1,MS_INK],[2,5,2,1,MS_INK],[2,1,2,1,"#f6a4b8"],[1,2,4,2,"#f6a4b8"],[2,4,2,1,"#f6a4b8"],[2,2,2,2,"#f7c843"]],
  flower2: [[2,0,2,1,MS_INK],[1,1,1,1,MS_INK],[4,1,1,1,MS_INK],[0,2,1,2,MS_INK],[5,2,1,2,MS_INK],[1,4,1,1,MS_INK],[4,4,1,1,MS_INK],[2,5,2,1,MS_INK],[2,1,2,1,"#ffcf6b"],[1,2,4,2,"#ffcf6b"],[2,4,2,1,"#ffcf6b"],[2,2,2,2,"#f07aa0"]],
  script: [[1,0,6,1,MS_INK],[0,1,1,7,MS_INK],[7,1,1,7,MS_INK],[1,8,6,1,MS_INK],[1,1,6,7,"#fffbe8"],[2,3,4,1,"#c79a6b"],[2,5,3,1,"#c79a6b"]],
  camera: [[2,1,3,1,MS_INK],[0,2,8,1,MS_INK],[0,3,1,5,MS_INK],[7,3,1,5,MS_INK],[0,8,8,1,MS_INK],[1,3,6,5,"#8fb3d9"],[3,4,2,2,MS_INK],[3,4,1,1,"#ffffff"],[5,3,1,1,"#f7c843"]],
  pen: [[6,0,2,1,MS_INK],[5,1,1,1,MS_INK],[7,1,1,1,MS_INK],[4,2,1,1,MS_INK],[6,2,1,1,MS_INK],[3,3,1,1,MS_INK],[5,3,1,1,MS_INK],[2,4,1,1,MS_INK],[4,4,1,1,MS_INK],[1,5,1,1,MS_INK],[3,5,1,1,MS_INK],[0,6,1,2,MS_INK],[1,7,2,1,MS_INK],[6,1,1,1,"#f07aa0"],[5,2,1,1,"#f07aa0"],[4,3,1,1,"#ffd36b"],[3,4,1,1,"#ffd36b"],[2,5,1,1,"#ffd36b"],[1,6,1,1,"#ffffff"]],
  flag: [[0,0,1,9,MS_INK],[1,0,6,1,MS_INK],[1,4,6,1,MS_INK],[7,1,1,3,MS_INK],[1,1,6,3,"#e0442e"],[2,1,2,1,"#ff9b8a"]],
  todo: [[2,0,4,2,MS_INK],[3,0,2,1,"#f7c843"],[0,1,1,10,MS_INK],[7,1,1,10,MS_INK],[1,1,1,1,MS_INK],[6,1,1,1,MS_INK],[0,11,8,1,MS_INK],[1,2,6,9,"#ffffff"],[2,4,1,1,"#5cc5df"],[4,4,2,1,MS_INK],[2,6,1,1,"#5cc5df"],[4,6,2,1,MS_INK],[2,8,1,1,"#f07aa0"],[4,8,2,1,MS_INK]],
  memo: [[0,0,10,1,MS_INK],[0,0,1,10,MS_INK],[9,0,1,7,MS_INK],[0,9,7,1,MS_INK],[7,7,1,2,MS_INK],[8,6,1,1,MS_INK],[1,1,8,8,"#fff3a6"],[7,7,1,1,"#e3c95a"],[2,3,6,1,"#c79a6b"],[2,5,6,1,"#c79a6b"],[2,7,3,1,"#c79a6b"],[7,0,2,2,"#f07aa0"]]
};

// 픽셀 구름: '#' 몸통, '-' 아래쪽 그림자
const MS_CLOUD_SHAPES = [
  [
    "......#####.......",
    "....#########.....",
    "...###########.##.",
    ".################.",
    "##################",
    "##################",
    ".----------------."
  ],
  [
    "....####......",
    "..########.##.",
    ".#############",
    "##############",
    "##############",
    ".------------."
  ],
  [
    "...#####........###...",
    ".#########...#######..",
    "######################",
    "######################",
    ".--------------------."
  ]
];
// 구름 높이(top %)는 창문(상태창 높이의 약 30~50%)과 방 양옆 하늘을 지나가도록 잡았다.
const MS_CLOUDS_CLEAR = [
  { shape: 0, top: 33, dur: 90, delay: 0, scale: 1.8 },
  { shape: 1, top: 40, dur: 110, delay: 45, scale: 1.6 },
  { shape: 2, top: 36, dur: 100, delay: 72, scale: 1.4 },
  { shape: 1, top: 43, dur: 95, delay: 25, scale: 1.4 },
  { shape: 2, top: 21, dur: 120, delay: 60, scale: 1.3 },
  { shape: 0, top: 57, dur: 130, delay: 95, scale: 1.4 }
];
const MS_CLOUDS_GRAY = [
  { shape: 0, top: 31, dur: 70, delay: 0, scale: 2 },
  { shape: 2, top: 36, dur: 80, delay: 20, scale: 1.8 },
  { shape: 0, top: 41, dur: 75, delay: 38, scale: 1.8 },
  { shape: 1, top: 34, dur: 85, delay: 55, scale: 1.6 },
  { shape: 2, top: 44, dur: 78, delay: 66, scale: 1.6 },
  { shape: 0, top: 21, dur: 90, delay: 30, scale: 1.6 },
  { shape: 1, top: 57, dur: 95, delay: 75, scale: 1.5 }
];

function MsCloud(p) {
  const rows = MS_CLOUD_SHAPES[p.shape] || MS_CLOUD_SHAPES[0];
  const s = p.s || 2;
  const w = rows[0].length, h = rows.length;
  const rects = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      const ch = row[x];
      if (ch === "#" || ch === "-") {
        let e = x;
        while (e < w && row[e] === ch) e++;
        rects.push(<rect key={y + "-" + x} x={x} y={y} width={e - x} height={1} fill={ch === "#" ? p.fill : p.shade} />);
        x = e;
      } else x++;
    }
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w * s} height={h * s} shapeRendering="crispEdges" aria-hidden="true" style={{ display: "block" }}>
      {rects}
    </svg>
  );
}

function MsPix(p) {
  const d = p.d, w = p.w, h = p.h, s = p.s || 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w * s} height={h * s} shapeRendering="crispEdges" aria-hidden="true" style={{ display: "block", flex: "none" }}>
      {d.map((r, i) => <rect key={i} x={r[0]} y={r[1]} width={r[2]} height={r[3]} fill={r[4]} />)}
    </svg>
  );
}

/* 임시 도트 마시로 (14×18): 머리·몸·팔을 나눠 움직인다 */
function MsMashiro() {
  const g = "#8a8f99";
  const head = [[3,0,8,2,MS_INK],[2,2,10,7,g],[3,1,8,1,g],[2,2,1,7,MS_INK],[12,2,1,7,MS_INK],[4,6,6,3,"#2b2b33"]];
  const body = [[1,9,12,7,g],[0,10,1,6,MS_INK],[13,10,1,6,MS_INK],[1,15,12,1,"#6b707a"],[5,10,4,4,"#7d828c"],[1,16,12,2,"#3d4250"]];
  const arm = [[11,9,3,3,g],[13,8,1,2,"#f1d2c0"]];
  const rects = (a) => a.map((r, i) => <rect key={i} x={r[0]} y={r[1]} width={r[2]} height={r[3]} fill={r[4]} />);
  return (
    <svg viewBox="0 0 14 18" shapeRendering="crispEdges" aria-hidden="true">
      <g className="ms-body">{rects(body)}</g>
      <g className="ms-arm">{rects(arm)}</g>
      <g className="ms-head">{rects(head)}</g>
    </svg>
  );
}

/* 임시 배경 방 (정사각 317 단위). 실제 그림이 생기면 bgSrc로 교체한다 */
function MsRoom() {
  const OX = 158.5, OY = 156, N = 12, H = 110;
  const iso = (x, y, z = 0) => [OX + (x - y) * 11, OY + (x + y) * 5.5 - z];
  const out = [];
  let k = 0;
  const poly = (pts, fill, sw = 0.6, stroke = MS_INK) =>
    out.push(<polygon key={k++} points={pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ")} fill={fill} stroke={stroke} strokeWidth={sw} />);
  const line = (a, b, c, w) => out.push(<line key={k++} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} />);
  const box = (x, y, w, d, h, top, left, right, z = 0) => {
    poly([iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)], left);
    poly([iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)], right);
    poly([iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)], top);
  };
  const wallR = (x0, x1, z0, z1, c) => poly([iso(x0, 0, z0), iso(x1, 0, z0), iso(x1, 0, z1), iso(x0, 0, z1)], c);
  const wallL = (y0, y1, z0, z1, c) => poly([iso(0, y0, z0), iso(0, y1, z0), iso(0, y1, z1), iso(0, y0, z1)], c);

  poly([iso(0, 0), iso(0, N), iso(0, N, H), iso(0, 0, H)], "#f3e4c8");
  // 오른쪽 벽: 창문 자리에 구멍을 뚫어, 뒤에 있는 하늘·구름·비가 창밖으로 보이게 한다.
  const pts = (a) => a.map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" L");
  const wallOuter = [iso(0, 0), iso(N, 0), iso(N, 0, H), iso(0, 0, H)];
  const winHole = [iso(6.4, 0, 43), iso(9.2, 0, 43), iso(9.2, 0, 79), iso(6.4, 0, 79)];
  out.push(<path key={k++} d={"M" + pts(wallOuter) + " Z M" + pts(winHole) + " Z"} fill="#e9d6b2" fillRule="evenodd" stroke={MS_INK} strokeWidth={0.6} />);
  for (let i = 1; i < N; i++) {
    line(iso(0, i), iso(0, i, H), "#ead8b6", 1.2);
    if (i >= 7 && i <= 9) {
      line(iso(i, 0), iso(i, 0, 40), "#dfc89e", 1.2);
      line(iso(i, 0, 82), iso(i, 0, H), "#dfc89e", 1.2);
    } else line(iso(i, 0), iso(i, 0, H), "#dfc89e", 1.2);
  }
  poly([iso(0, 0), iso(0, N), iso(0, N, 6), iso(0, 0, 6)], "#c79a6b");
  poly([iso(0, 0), iso(N, 0), iso(N, 0, 6), iso(0, 0, 6)], "#b8875a");
  // 창틀(테두리만) + 반투명 유리
  wallR(6.2, 9.4, 40, 43, "#5b6f8f"); wallR(6.2, 6.4, 43, 79, "#5b6f8f"); wallR(9.2, 9.4, 43, 79, "#5b6f8f");
  wallR(6.4, 9.2, 43, 79, "rgba(210,235,250,0.18)"); wallR(7.75, 7.85, 43, 79, "#5b6f8f");
  wallR(6.2, 9.4, 79, 86, "#d63c72");
  box(1.4, 0, 2.6, 0.6, 2, "#a8744a", "#8a5d3a", "#9b6a42", 62);
  ["#d63c72", "#3f5f99", "#e8c547", "#6fa36a"].forEach((c, j) => box(1.5 + j * 0.5, 0.05, 0.35, 0.45, 9, c, c, c, 64));
  wallR(10.2, 11.4, 48, 66, "#ffffff"); wallR(10.2, 11.4, 63, 66, "#e0442e");
  wallL(1.4, 3.4, 46, 78, "#c9a06c");
  [[1.6, 66, "#fff"], [2.3, 58, "#f6c9d6"], [1.7, 50, "#fff3a6"], [2.6, 68, "#cfe3f5"]].forEach((n) => wallL(n[0], n[0] + 0.5, n[1], n[1] + 8, n[2]));
  wallL(5.0, 6.8, 44, 76, "#f6c9d6"); wallL(5.3, 6.5, 49, 71, "#ffffff");
  wallL(9.0, 10.2, 56, 70, "#3f5f99"); wallL(9.2, 10.0, 58, 68, "#cfe3f5");
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) poly([iso(x, y), iso(x + 1, y), iso(x + 1, y + 1), iso(x, y + 1)], (x + y) % 2 ? "#d7b48a" : "#cda77c", 0.4, "#b48d63");
  poly([iso(4, 5), iso(8, 5), iso(8, 8.4), iso(4, 8.4)], "#f2b8c6", 0.6, "#d98ca0");
  box(0.1, 6.4, 1, 3.2, 46, "#a8744a", "#8a5d3a", "#9b6a42");
  [8, 19, 30].forEach((zz) => ["#d63c72", "#3f5f99", "#e8c547", "#6fa36a", "#c7a3d9", "#e3b98f"].forEach((c, j) => box(0.15, 6.55 + j * 0.48, 0.85, 0.34, 8, c, c, c, zz)));
  box(0.1, 10.0, 1.1, 1.6, 16, "#c8ced8", "#a9b0bc", "#b9c0cb");
  box(2.0, 9.4, 0.9, 0.7, 7, "#fbfaf5", "#e8e3d6", "#efeadf"); box(2.1, 9.5, 0.7, 0.5, 4, "#fbfaf5", "#e8e3d6", "#efeadf", 7);
  box(1.9, 10.6, 0.8, 0.6, 5, "#fbfaf5", "#e8e3d6", "#efeadf");
  box(1.4, 0.3, 3.4, 1.7, 15, "#c08a5a", "#9a6a40", "#ab7a4e");
  box(2.0, 0.45, 1.8, 0.25, 13, "#3a3f4a", "#2c3038", "#3a3f4a", 15);
  poly([iso(2.15, 0.7, 17), iso(3.65, 0.7, 17), iso(3.65, 0.7, 27), iso(2.15, 0.7, 27)], "#bfe3f5");
  box(2.3, 1.0, 1.3, 0.8, 0.8, "#2c3038", "#22252c", "#2c3038", 15);
  box(4.1, 0.5, 0.2, 0.2, 12, "#555a63", "#444", "#555", 15); box(3.8, 0.4, 0.6, 0.5, 2, "#e8c547", "#c9a832", "#d8b83d", 26);
  box(1.6, 1.3, 0.3, 0.3, 3, "#ffffff", "#e4e4e4", "#f0f0f0", 15);
  box(2.5, 2.4, 1.3, 1.1, 8, "#6b707a", "#555a63", "#60656f");
  box(8.8, 5.4, 2.4, 3.8, 8, "#ffffff", "#d6dbe3", "#e3e7ee"); box(8.8, 5.4, 2.4, 1.0, 11, "#c9d3e6", "#aeb9cf", "#bcc6da");
  box(9.6, 3.6, 1.0, 1.0, 9, "#c08a5a", "#9a6a40", "#ab7a4e"); box(9.9, 3.9, 0.4, 0.4, 3, "#f6c9d6", "#e3a9bd", "#eab3c5", 9);
  box(10.8, 0.3, 0.8, 0.8, 7, "#c8743f", "#a85f32", "#b86a38"); box(10.75, 0.25, 0.9, 0.9, 10, "#6fa36a", "#5a8a56", "#64965f", 7);
  box(7.2, 0.2, 1.8, 1.0, 40, "#e3d2b6", "#c9b494", "#d6c3a3");
  box(5.2, 1.0, 0.6, 0.6, 6, "#9aa3b2", "#7d8696", "#8b94a3");
  return <g>{out}</g>;
}
