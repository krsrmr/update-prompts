// 필요 훅: useState, useEffect, useRef (react)
// 마시로 상태창. 접힘/펼침, PC(넓은 화면)·모바일(좁은 화면) 배치가 자동으로 바뀐다.
// 배경·마시로 이미지는 기본으로 사이트(mayumaro.vercel.app/img/status/)에서 불러온다.
// bgSrc, spriteDraw/Think/Sleep/Empty, effDraw/effSleep로 주소를 바꿀 수 있다.
// 단계별 그림: 시나리오=think, 취재=empty(빈 의자), 작화=draw, 마감·완료=sleep. 위치는 PSD(1268×1268) 배치 기준.
// 숨은 기능: 마시로를 5번 연속으로 누르면 비공개 창(관계 단계·취재 횟수·최근 취재 메모)이 열린다.
// userConfessed ~ married: 숨은 연애 상태. 화면에 표시하지 않는다. 대화 기록의 상태창 코드로만 확인한다.
// nextUpdate(다음 루넬 갱신일): 숨은 값. 화면에 표시하지 않는다. material(최근 취재 메모)은 비공개 창에만 보인다.
// researching: 본격 취재 중 표시. nsfw: NSFW 장면 표시. 둘 중 하나라도 true면 상태창이 투명 배경의 작은 시간·장소 칸으로 줄어든다.
//   오른쪽 끝 하트 단추를 누르면 평소 상태창이 펼쳐지고, '접기'를 누르면 다시 작은 칸으로 돌아간다.
// addedItems: 이야기 속에서 새로 들어온 자료(성인용품) 목록. 숨은 값. 화면에 표시하지 않는다. [리스트] 명령어가 읽는다.

function MashiroStatus(props = {}) {
  const {
    time = "23:41",
    date = "10/29",
    weekday = "목",
    weather = "비",
    location = "덴노지 맨션",
    stage = "작화",
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
    researching = false,
    nsfw = false,
    addedItems = [],
    bgSrc = MS_IMG + "bg.webp",
    spriteDraw = MS_IMG + "sprite-draw.webp",
    spriteThink = MS_IMG + "sprite-think.webp",
    spriteSleep = MS_IMG + "sprite-sleep.webp",
    spriteEmpty = MS_IMG + "sprite-empty.webp",
    effDraw = MS_IMG + "eff-draw.webp",
    effSleep = MS_IMG + "eff-sleep.webp",
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
  const status = stageIdx >= 4 ? "마감 끝" : steps[stageIdx] + "중";
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
  const oy = (ih - vb[3] * sc) / 2 - vb[1] * sc + (wide ? 0 : MS_SHIFT_SP);
  const night = clock.h24 >= 19 || clock.h24 < 5;
  const dusk = clock.h24 >= 16 && clock.h24 < 19;
  const overcast = ["흐", "비", "소나기", "눈"].some((w) => String(weather).includes(w));
  const sky = night ? "#1d2433" : dusk ? (overcast ? "#c9a99a" : "#f2a477") : overcast ? "#a9b9c9" : "#8fd0ea";

  // ── 취재 중·NSFW 장면: 투명 배경, 오른쪽 정렬 시간·장소 칸 + 하트(펼치기) ──
  const quiet = [researching, nsfw].some((v) => v === true || String(v) === "true");
  if (quiet && !open) {
    return (
      <div ref={rootRef} style={{ width: "100%" }}>
        <div className="ms-root" style={{ width: "100%", maxWidth: wide ? 720 : 420, margin: "10px auto", background: "transparent" }}>
          <style>{MS_CSS}</style>
          <div className="ms-nsfw">
            <span className="ms-date">
              <span className="ms-ap ms-dot ms-ol">{clock.ap}</span>
              <span className="ms-t ms-dot ms-ol">{clock.hm}</span>
            </span>
            <span className="ms-wchip" style={{ maxWidth: 200 }}>
              <MsMarquee className="ms-wtxt" text={String(location || "…")} />
            </span>
            <button type="button" className="ms-hbtn" onClick={() => { setOpen(true); setPopup(null); }} aria-label="상태창 펼치기" aria-expanded={false}>
              <MsPix d={MS_ICON.heart} w={10} h={9} s={2} />
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      <span className="ms-dot">{wx}</span><MsMarquee className="ms-wtxt" text={String(weather) + " · " + String(location)} />
    </span>
  );
  // vert: 이름표를 숫자 위에 얹은 세로형. 아주 좁은 모바일 펼침 화면에서 날짜 칸을 침범하지 않게 쓴다.
  const nbox = (k, v, color, vert) => (
    <span className={"ms-nbox" + (vert ? " ms-nbox-v" : "")}>
      <span className="ms-k">{k}</span>
      <span className="ms-v ms-dot" style={{ color }}>{v}</span>
    </span>
  );
  const ddaysOf = (vert) => (
    <>
      {dl !== null ? nbox("마감", dl, C.red, vert) : null}
      {rs !== null ? nbox("취재", rs, C.blue, vert) : null}
    </>
  );
  const ddays = ddaysOf(false);
  const narrow = width < MS_NARROW;
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
    <div className="ms-cbar" style={{ flexWrap: "nowrap" }}>
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
      <div className="ms-nm">{name}<MsMarquee className="ms-kao" lang="ja" text={String(kao)} /></div>
      <span className="ms-tags">
        <span className="ms-tg"><i style={{ background: "#f07aa0" }}>상태</i><MsMarquee text={st} /></span>
        <span className="ms-tg"><i style={{ background: "#5ca9e0" }}>복장</i><MsMarquee text={out} /></span>
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
      <div className="ms-sl">
        <span className="ms-sk">NEXT 취재</span>
        <MsMarquee className="ms-st ms-dot" text={String(nextDate || "미정")} />
      </div>
      <MsMarquee className="ms-sw" text={String(nextPlan || "할 일 미정")} />
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
  const spKey = away ? "empty" : sleep ? "sleep" : stageIdx === 0 ? "think" : "draw";
  const spSrc = { draw: spriteDraw, think: spriteThink, sleep: spriteSleep, empty: spriteEmpty }[spKey];
  const box = (b) => ({ left: ox + (b[0] / 4) * sc, top: oy + (b[1] / 4) * sc, width: (b[2] / 4) * sc, height: (b[3] / 4) * sc });
  const spBox = box(MS_SPRITE[spKey]);
  const effKey = spKey === "draw" ? "draw" : spKey === "sleep" ? "sleep" : null;
  const effSrc = effKey === "draw" ? effDraw : effKey === "sleep" ? effSleep : "";
  // 말풍선·이름표 기준점: 스프라이트 상자
  const cx = spBox.left + spBox.width / 2;
  const topY = spBox.top;
  const botY = spBox.top + spBox.height;
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
      {bgSrc ? <img src={bgSrc} alt="" className="ms-bg" style={wide ? null : { top: MS_SHIFT_SP }} /> : null}

      {/* 마시로 */}
      {away ? (
        <img src={spSrc} alt="" className="ms-spimg" style={spBox} />
      ) : (
        <button
          type="button"
          key={"hop" + hop}
          className={"ms-sprite" + (hop ? " ms-hop" : "")}
          onClick={tapMashiro}
          aria-label="마시로"
          style={spBox}
        >
          <img src={spSrc} alt="" className={"ms-anim-" + spKey} style={{ width: "100%", height: "100%", display: "block", "--sw": (Math.atan(MS_SWAY_PX / Math.max(1, spBox.height)) * 180 / Math.PI).toFixed(2) + "deg" }} />
        </button>
      )}
      {effSrc ? (
        <img src={effSrc} alt="" className={"ms-eff ms-eff-" + effKey} style={box(MS_SPRITE[effKey + "Eff"])} />
      ) : null}
      {!away && !sleep && bub[0] ? (
        <div className="ms-pop ms-bob" style={{ left: cx + 18, top: topY - 20 }}>
          {bub[0]}
          {bub[1] ? <><br /><b className="ms-dot">{bub[1]}</b></> : null}
          <span className="ms-tail"><MsPix d={MS_ICON.tail} w={10} h={6} s={1} /></span>
        </div>
      ) : null}
      <div className="ms-ntag" style={{ left: cx - 70, top: botY - spBox.height * MS_TAG_UP, width: 140 }}>
        <span>{away ? "취재 외출중" : status + " " + msKao(mashiroFace)}</span>
      </div>

      {/* 위 정보 */}
      {wide ? (
        <div className="ms-toprow ms-drop">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, maxWidth: 210 }}>
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
              <div style={{ display: "flex", gap: narrow ? 4 : 6 }}>{narrow ? ddaysOf(true) : ddays}</div>
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
            {popup === "memo" ? <div className="ms-memo">{msKao(memo || "…")}</div> : null}
            {popup === "secret" ? (
              <>
                <div className="ms-rows" style={{ margin: 8 }}>
                  <div className="ms-sec-h"><span>관계 단계</span><span>취재</span></div>
                  <div className="ms-sec-r">
                    <span className="ms-ph"><b className="ms-dot ms-ol">{String(phase)}</b>{MS_PHASE[Number(phase)] || ""}</span>
                    <span className="ms-hv"><MsPix d={MS_ICON.heart} w={10} h={9} s={2} /><b className="ms-dot ms-ol">{String(researchCount)}</b>회</span>
                  </div>
                </div>
                <div className="ms-memo ms-note"><small>최근 취재 메모</small>{String(material || "아직 아무것도…")}</div>
              </>
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
const MS_IMG = "https://mayumaro.vercel.app/img/status/";
/* 움직임 크기: 작화 통통 높이(px), 고민 흔들림 폭(px, 머리끝이 좌우로 움직이는 거리), 이름표를 스프라이트 위로 겹치는 비율 */
const MS_HOP_PX = 5;
const MS_SWAY_PX = 7;
const MS_TAG_UP = 0.3;
/* 모바일(좁은 화면)에서 배경·마시로·말풍선·이름표를 아래로 내리는 거리(px) */
const MS_SHIFT_SP = 12;
/* 이 폭(px)보다 좁은 모바일 펼침 화면에서는 마감·취재 칸을 세로형으로 줄인다 */
const MS_NARROW = 360;
/* 관계 단계 이름: 메인 프롬프트 ## 취재와 선의 흐름과 같다 */
const MS_PHASE = ["", "들킴", "그림 허락", "모델 승낙", "첫 취재", "자각"];
/* 스프라이트 위치: PSD(1268×1268) 레이어 상자 [x, y, 너비, 높이] (px). 화면에서는 1268px = 317단위로 환산한다 */
const MS_SPRITE = {
  draw: [464, 481, 272, 381],
  think: [481, 477, 227, 405],
  sleep: [455, 537, 367, 325],
  empty: [488, 628, 216, 224],
  drawEff: [707, 569, 38, 52],
  sleepEff: [752, 633, 45, 51]
};

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

/* 반각 탁점·반탁점(ﾞ ﾟ)은 앞 글자에 달라붙는 글자다. ✧ﾟ처럼 다른 폰트의 글자 뒤에 오면 둘을 한 폰트로 그리려다 네모로 깨진다.
   사이에 보이지 않는 글자(U+2060)를 끼워 따로 그리게 한다. */
// 카오모지가 기기마다 깨지지 않게 다듬는다.
// 1) 결합 기호(͡ ͜ ̀ ́ 등)와 태국·라오 문자의 얹는 모음(ຶ 등)은 앞 글자와 다른 글꼴로 그려지면 위치가 어긋나므로 지운다.
// 2) 분수 빗금(⁄)은 옆 글자와 겹쳐 그려지므로 보통 빗금(/)으로 바꾼다.
// 3) 반각 탁점·반탁점(ﾞﾟ)은 앞 글자에 붙어 버리지 않게 단어 잇기 문자를 넣는다.
function msKao(s) {
  return String(s == null ? "" : s)
    .replace(/[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECD]/g, "")
    .replace(/[\u2044\u2215]/g, "/")
    .replace(/[\uFF9E\uFF9F]/g, "\u2060$&");
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
.ms-nbox-v{flex-direction:column}
.ms-nbox-v .ms-k{margin:0 0 -4px;justify-content:center;font-size:10px;line-height:1.3}
.ms-nbox-v .ms-v{justify-content:center;font-size:16px;padding:0 5px}
.ms-step{display:inline-flex;align-items:center;justify-content:center;gap:3px;font-size:11px;font-weight:900;white-space:nowrap;line-height:1.5}
.ms-done{${MS_F.cyan}} .ms-now{${MS_F.orange}} .ms-yet{${MS_F.white}color:#b8ad9c}
.ms-yet svg{opacity:.35}
.ms-mini{display:inline-flex;${MS_F.white}background:#fff}
.ms-cbtn{display:inline-grid;place-items:center;width:36px;height:30px;${MS_F.cyan}padding:0;background:none}
.ms-cbtn:hover svg{transform:translateY(1px)}
.ms-wtxt{overflow:hidden;text-overflow:ellipsis;min-width:0}
.ms-nsfw{display:flex;justify-content:flex-end;align-items:center;gap:6px;flex-wrap:nowrap;white-space:nowrap;animation:ms-pop .25s ease-out both}
.ms-hbtn{display:inline-grid;place-items:center;width:34px;height:30px;${MS_F.pink}padding:0;background:none;flex:none}
.ms-hbtn:hover svg,.ms-hbtn:focus-visible svg{transform:scale(1.15)}
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
.ms-kao{display:block;font-size:13px;color:#d9688e;font-weight:500;line-height:1.3;font-family:"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic UI","Meiryo","Noto Sans JP","Noto Sans CJK JP","Noto Sans KR",sans-serif}
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
.ms-hop{animation:ms-hop .3s ease-out}
.ms-spimg{position:absolute;z-index:1;display:block;pointer-events:none}
.ms-anim-draw{animation:ms-bounce .7s ease-in-out infinite}
.ms-anim-think{transform-origin:50% 100%;animation:ms-sway 2.2s ease-in-out infinite}
.ms-eff{position:absolute;z-index:1;display:block;pointer-events:none}
.ms-eff-draw{animation:ms-blink .6s steps(1) infinite}
.ms-eff-sleep{animation:ms-zz 2.4s ease-in-out infinite}
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
.ms-sl{display:flex;align-items:center;gap:4px;padding-right:46px;min-width:0}
.ms-sl .ms-sk{flex:none}
.ms-st{font-size:14px}
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
.ms-sec-h,.ms-sec-r{display:grid;grid-template-columns:1fr 84px;align-items:center;padding:4px 10px}
.ms-sec-h{background:#eaf7fb;color:#2f80a8;font-weight:900;font-size:12px;border-bottom:2px solid #9fd0e2}
.ms-ph{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:900}
.ms-ph b,.ms-hv b{font-size:18px;font-weight:400;color:#ffe27a}
.ms-hv{display:flex;align-items:center;gap:3px;font-size:13px;font-weight:900}
.ms-note{background:#ffe1ea;transform:rotate(.6deg);margin-top:4px}
.ms-note small{display:block;font-size:10.5px;font-weight:900;color:#d9688e;margin-bottom:2px}
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
@keyframes ms-bounce{0%,55%,100%{transform:translateY(0)}25%{transform:translateY(-${MS_HOP_PX}px)}}
@keyframes ms-sway{0%,100%{transform:rotate(calc(var(--sw) * -1))}50%{transform:rotate(var(--sw))}}
@keyframes ms-blink{0%{opacity:1}50%{opacity:0}}
@keyframes ms-zz{0%,100%{transform:translateY(2px);opacity:.55}50%{transform:translateY(-4px);opacity:1}}
@keyframes ms-hop{0%{transform:translateY(0)}40%{transform:translateY(-8px)}100%{transform:translateY(0)}}
@keyframes ms-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes ms-nudge{0%,100%{opacity:1}50%{opacity:.55}}
@keyframes ms-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
@keyframes ms-fill{from{width:0}}
@keyframes ms-slide-l{from{transform:translateX(-14px);opacity:0}to{transform:none;opacity:1}}
@keyframes ms-slide-r{from{transform:translateX(14px);opacity:0}to{transform:none;opacity:1}}
.ms-mq{display:block;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:clip}
.ms-mq-in{display:inline-block;position:relative}
.ms-mq.on .ms-mq-in{animation:ms-mq var(--mqt) linear infinite}
.ms-mq-cp{position:absolute;top:0;left:100%}
@keyframes ms-mq{0%,22%{transform:translateX(0)}100%{transform:translateX(var(--mqx))}}
@media (prefers-reduced-motion: reduce){.ms-mq{text-overflow:ellipsis}.ms-mq-in{display:inline}.ms-mq-cp{display:none}}
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

/* 칸보다 긴 글: 음악 플레이어 제목처럼 옆으로 흘러간다. 칸에 다 들어가면 가만히 있는다. */
const MS_MQ_GAP = 32; /* 글 끝과 다음 반복 사이 간격(px) */
const MS_MQ_SPEED = 32; /* 흐르는 속도(px/초) */
function MsMarquee(p) {
  const boxRef = useRef(null);
  const txtRef = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const check = () => {
      const b = boxRef.current, t = txtRef.current;
      if (!b || !t) return;
      const tw = t.offsetWidth;
      setW(tw > b.clientWidth + 1 ? tw : 0);
    };
    check();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(check);
    ro.observe(boxRef.current);
    ro.observe(txtRef.current);
    return () => ro.disconnect();
  }, [p.text]);
  const run = w > 0;
  const dist = w + MS_MQ_GAP;
  return (
    <span ref={boxRef} lang={p.lang} className={"ms-mq" + (run ? " on" : "") + (p.className ? " " + p.className : "")}>
      <span ref={txtRef} className="ms-mq-in" style={run ? { "--mqx": -dist + "px", "--mqt": Math.max(4, dist / MS_MQ_SPEED / 0.78).toFixed(1) + "s" } : null}>
        {msKao(p.text)}
        {run ? <span className="ms-mq-cp" style={{ marginLeft: MS_MQ_GAP }} aria-hidden="true">{msKao(p.text)}</span> : null}
      </span>
    </span>
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
