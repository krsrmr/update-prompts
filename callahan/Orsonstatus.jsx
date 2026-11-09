// 필요 훅: useState, useRef, useEffect (react)
// 오손 상태창 v0.4 (가제작) — 바이닐 플레이어 · 긴 글자 흘러가기 · 넓은 창 버전 (mood 추가 · 훅 직접 연결 · 메뉴 3개 · 570px 대응)

function Orsonstatus(props = {}) {
  const p = props || {};
  const H = osHooks();
  const mkRef = H.r || ((v) => H.s(() => ({ current: v }))[0]);

  const date = osVal(p.date, "");
  const time = osVal(p.time, "");
  const weather = osVal(p.weather, "");
  const place = osVal(p.place, "");
  const song = osVal(p.song, "");
  const artist = osVal(p.artist, "");
  const source = osVal(p.source, "");
  const body = osVal(p.body, "");
  const sober = osNum(p.sober);
  const smokeFree = osNum(p.smokeFree);
  const cash = osVal(p.cash, "");
  const rent = osRent(osVal(p.rent, ""));
  const propane = osPropane(p.propane);
  const goal = osVal(p.goal, "");
  const mood = osVal(p.mood, "");
  const stage = Math.max(1, Math.min(4, Math.round(Number(p.stage) || 1)));
  const known = osList(p.known).map(osSplitName);
  const threads = osList(p.threads).map(osSplitName);
  const pending = osList(p.pending).map(osSplitDue);

  const silent = osSilent(song, source);
  const dur = 150 + (osHue(song + artist) % 151);

  const [open, setOpen] = H.s(false);
  const [more, setMore] = H.s(false);
  const [bodyH, setBodyH] = H.s(0);
  const [sec, setSec] = H.s(() => osHue(artist + song) % 120);
  const [rootW, setRootW] = H.s(0);
  const [tab, setTab] = H.s("all");
  const bodyRef = mkRef(null);
  const rootRef = mkRef(null);
  const scrollRef = mkRef(null);
  const wide = rootW >= OS_WIDE.min;

  H.e(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const check = () => {
      const w = el.clientWidth;
      setRootW((v) => (v === w ? v : w));
    };
    check();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  H.e(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [tab]);

  H.e(() => {
    if (silent) return undefined;
    const id = setInterval(() => setSec((s) => (s + 1) % dur), 1000);
    return () => clearInterval(id);
  }, [silent, dur]);

  H.e(() => {
    const update = () => {
      if (bodyRef.current) setBodyH(bodyRef.current.scrollHeight);
    };
    update();
    if (typeof ResizeObserver !== "undefined" && bodyRef.current) {
      const ro = new ResizeObserver(update);
      ro.observe(bodyRef.current);
      return () => ro.disconnect();
    }
    return undefined;
  }, [open, more, wide, known.length, threads.length, pending.length]);

  const tod = osTod(time);
  const T = OS_THEME[tod];
  const wxKey = osWxKey(weather, tod);
  const wx = OS_WX[wxKey];
  const bodyItems = body ? body.split(/[,，·\/]/).map((s) => s.trim()).filter(Boolean) : [];
  const songTitle = silent ? "조용함" : song;
  const pct = silent ? 0 : (sec / dur) * 100;

  const font = "Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', system-ui, sans-serif";
  const mono = "'Courier New', ui-monospace, Menlo, monospace";
  const sub = "#b3b3b3";

  const icon = (children, size, color, extra) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: "block", ...(extra || {}) }}>
      {children}
    </svg>
  );

  const eq = (h, color) => (
    <span className={"os-eq" + (silent ? " os-paused" : "")} style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, height: h, flexShrink: 0 }}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={{ width: 3, height: "100%", background: color, borderRadius: 1, transformOrigin: "bottom", animationDelay: i * 0.17 + "s", transform: silent ? "scaleY(.2)" : undefined }} />
      ))}
    </span>
  );

  const vinyl = (size, spin) => (
    <div style={{ position: "relative", width: size, height: size }}>
      <div
        className={spin ? "os-spin" : ""}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "repeating-radial-gradient(circle at 50% 50%, #111 0px, #111 1.4px, #1f1f1f 2px, #111 2.8px)",
          boxShadow: "0 " + Math.round(size * 0.04) + "px " + Math.round(size * 0.1) + "px rgba(0,0,0,.6)",
        }}
      >
        <div style={{ position: "absolute", left: "33%", top: "33%", width: "34%", height: "34%", borderRadius: "50%", background: "conic-gradient(" + T.accent + " 0deg 180deg, " + T.label2 + " 180deg 360deg)" }}>
          {size > 100 ? (
            <span style={{ position: "absolute", left: 0, right: 0, top: "20%", textAlign: "center", fontSize: Math.round(size * 0.045), fontWeight: 800, letterSpacing: 1, color: "rgba(0,0,0,.55)" }}>B-SIDE</span>
          ) : null}
          <span style={{ position: "absolute", left: "50%", top: "50%", width: Math.max(3, Math.round(size * 0.028)), height: Math.max(3, Math.round(size * 0.028)), borderRadius: "50%", background: "#0b0b0b", transform: "translate(-50%,-50%)" }} />
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none", background: "conic-gradient(from 20deg, transparent 0deg, rgba(255,255,255,.09) 28deg, transparent 58deg, transparent 182deg, rgba(255,255,255,.06) 208deg, transparent 238deg)" }} />
    </div>
  );

  const plinth = (size, big) => {
    const v = Math.round(size * (big ? 0.82 : 0.84));
    const off = Math.round((size - v) / 2);
    return (
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0, borderRadius: big ? 8 : 4, overflow: "hidden", background: "linear-gradient(150deg, " + T.plinth + " 0%, #141414 75%)", boxShadow: big ? "0 22px 44px rgba(0,0,0,.5)" : "0 2px 6px rgba(0,0,0,.4)" }}>
        <div style={{ position: "absolute", left: big ? Math.round(off * 0.55) : off, top: off }}>{vinyl(v, !silent && (big ? open : true))}</div>
        {big ? (
          <svg viewBox="0 0 272 272" width={size} height={size} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <g className={silent ? "os-arm-rest" : "os-arm"} style={{ transformOrigin: "236px 42px" }}>
              <path d="M236 42 L214 150 L188 186" stroke="#d6d6d6" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="176" y="180" width="22" height="11" rx="2" fill="#a9a9a9" transform="rotate(-36 187 186)" />
            </g>
            <circle cx="236" cy="42" r="13" fill="#2b2b2b" stroke="#4a4a4a" strokeWidth="2" />
            <circle cx="236" cy="42" r="4.5" fill="#9a9a9a" />
            <text x="22" y="254" fill="rgba(255,255,255,.45)" fontSize="10" fontWeight="700" letterSpacing="1.5" fontFamily="system-ui, sans-serif">33⅓</text>
            <circle cx="250" cy="250" r="3.5" fill={silent ? "#3a3a3a" : T.accent} className={silent ? "" : "os-glow"} />
          </svg>
        ) : null}
      </div>
    );
  };

  const heading = (kr, en) => (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.2 }}>{kr}</span>
      {en ? <span style={{ fontSize: 10, letterSpacing: 1.3, color: sub, fontWeight: 700 }}>{en}</span> : null}
    </div>
  );

  const card = (key, kr, en, children, delay, wide) => (
    <div key={key} className="os-rise" style={{ flex: wide ? "1 1 100%" : "1 1 200px", minWidth: 0, background: "rgba(255,255,255,.07)", borderRadius: 10, padding: "14px 14px 15px", boxSizing: "border-box", animationDelay: delay }}>
      {heading(kr, en)}
      {children}
    </div>
  );

  const bare = (key, kr, en, children, delay) => (
    <div key={key} className="os-rise" style={{ flex: "1 1 200px", minWidth: 0, animationDelay: delay }}>
      {heading(kr, en)}
      {children}
    </div>
  );

  const digits = (n, delay) => {
    const s = n === null ? "--" : String(Math.min(n, 999)).padStart(2, "0");
    const zero = n === 0;
    return (
      <div style={{ display: "flex", gap: 3 }}>
        {s.split("").map((d, i) => (
          <div key={i + d} className="os-flip" style={{ position: "relative", width: 26, height: 38, borderRadius: 4, background: "linear-gradient(#1f1f1f 50%, #171717 50%)", boxShadow: "inset 0 0 0 1px #2e2e2e, 0 2px 4px rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono, fontWeight: 700, fontSize: 24, color: zero ? "#ff5d5d" : "#ffb347", textShadow: zero ? "0 0 8px rgba(255,93,93,.6)" : "0 0 8px rgba(255,179,71,.5)", animationDelay: delay + i * 0.08 + "s" }}>
            {d}
            <span style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "#000" }} />
          </div>
        ))}
      </div>
    );
  };

  const scoreCol = (kr, en, n, delay) => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
      <div style={{ fontSize: 9.5, letterSpacing: 1.6, fontWeight: 800, color: "#ffb347", opacity: 0.85 }}>{en}</div>
      {digits(n, delay)}
      <div style={{ fontSize: 11, color: n === 0 ? "#ff5d5d" : "#9a9a9a" }}>
        {n === 0 ? <span className="os-blink" style={{ fontWeight: 800, letterSpacing: 1.5 }}>RESET</span> : kr + (n === null ? "" : " " + n + "일째")}
      </div>
    </div>
  );

  const leader = (label, value) => (
    <div style={{ display: "flex", alignItems: "baseline", margin: "4px 0" }}>
      <span>{label}</span>
      <span style={{ flex: 1, borderBottom: "1px dotted #a19b8f", margin: "0 6px", transform: "translateY(-3px)" }} />
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );

  const gauge =
    propane === null ? (
      "—"
    ) : (
      <span className={propane === 0 ? "os-blink" : ""} style={{ display: "inline-flex", gap: 2 }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ width: 9, height: 11, borderRadius: 1, border: "1px solid " + (propane === 0 ? "#c0392b" : "#2b2b2b"), background: i < propane ? "#2b2b2b" : "transparent" }} />
        ))}
      </span>
    );

  const cashText = cash === "" ? "—" : isFinite(Number(cash)) ? "$" + Number(cash).toFixed(2) : cash;

  const rentValue = rent ? (
    rent.sub ? (
      <span className="os-stamp" style={{ display: "inline-block", padding: "1px 6px", border: "2px solid " + rent.color, color: rent.color, borderRadius: 3, fontWeight: 800, fontSize: 11.5, letterSpacing: 1.5 }}>
        {rent.text}
      </span>
    ) : (
      rent.text
    )
  ) : (
    "—"
  );

  const receipt = (
    <div style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,.45))" }}>
      <div className="os-print" style={{ background: "#f3efe6", color: "#2b2b2b", fontFamily: mono, fontSize: 12, padding: "12px 13px 9px", borderRadius: "3px 3px 0 0" }}>
        <div style={{ textAlign: "center", fontWeight: 700, letterSpacing: 3, fontSize: 13 }}>WALLET</div>
        <div style={{ textAlign: "center", fontSize: 9.5, color: "#6d675c", marginBottom: 6 }}>O. CALLAHAN · BEACON NY</div>
        <div style={{ borderTop: "1px dashed #a19b8f", margin: "4px 0 6px" }} />
        {leader("CASH", cashText)}
        {leader("LOT RENT", rentValue)}
        {leader("PROPANE", gauge)}
        <div style={{ borderTop: "1px dashed #a19b8f", margin: "6px 0 4px" }} />
        <div style={{ textAlign: "center", fontSize: 9.5, color: "#6d675c", letterSpacing: 1 }}>*** NO REFUNDS ***</div>
      </div>
      <div style={{ height: 7, background: "linear-gradient(135deg, #f3efe6 50%, transparent 50%) 0 0 / 10px 10px repeat-x, linear-gradient(225deg, #f3efe6 50%, transparent 50%) 0 0 / 10px 10px repeat-x" }} />
    </div>
  );

  const progress = (
    <div style={{ position: "relative", height: 4, borderRadius: 2, background: "rgba(255,255,255,.25)" }}>
      <div style={{ position: "relative", height: "100%", width: pct + "%", borderRadius: 2, background: "#fff", transition: "width 1s linear" }}>
        <span style={{ position: "absolute", right: -6, top: -4, width: 12, height: 12, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.4)" }} />
      </div>
    </div>
  );

  const header = open ? (
    <div onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 6px", cursor: "pointer" }}>
      {icon(<path d="M6 9l6 6 6-6" />, 24, "#fff")}
      <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: 1.4, fontWeight: 700, color: "rgba(255,255,255,.75)" }}>PLAYING FROM</div>
        <OsMarquee style={{ fontSize: 12.5, fontWeight: 800, marginTop: 1 }}>{place || "B-Side Vinyl & Frets"}</OsMarquee>
      </div>
      {icon(
        <g fill="#fff" stroke="none">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </g>,
        22,
        "#fff"
      )}
    </div>
  ) : (
    <div onClick={() => setOpen(true)} style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, padding: "8px 12px 10px 8px", cursor: "pointer", background: T.mini, borderRadius: 8, overflow: "hidden" }}>
      {plinth(42, false)}
      <div style={{ flex: 1, minWidth: 0 }}>
        <OsMarquee style={{ fontSize: 13.5, fontWeight: 700 }}>
          {songTitle}
          {artist && !silent ? <span style={{ fontWeight: 500, color: "rgba(255,255,255,.7)" }}>{" · " + artist}</span> : null}
        </OsMarquee>
        <OsMarquee style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 2 }}>{[date, time].filter(Boolean).join(" · ")}</OsMarquee>
      </div>
      {eq(14, T.accent)}
      {icon(silent ? <path d="M7 4l13 8-13 8z" fill="#fff" stroke="none" /> : <g fill="#fff" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></g>, 24, "#fff")}
      <div style={{ position: "absolute", left: 8, right: 8, bottom: 0, height: 2, borderRadius: 1, background: "rgba(255,255,255,.2)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: "#fff", transition: "width 1s linear" }} />
      </div>
    </div>
  );

  const tag = (t, i) => (
    <div key={i} style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px 8px 24px", background: "#efe6d2", color: "#3b3326", fontSize: 13, clipPath: "polygon(13px 0, 100% 0, 100% 100%, 13px 100%, 0 50%)", wordBreak: "keep-all" }}>
      <span style={{ position: "absolute", left: 10, top: "50%", width: 6, height: 6, marginTop: -3, borderRadius: "50%", background: "#2a2a2a" }} />
      <span style={{ flex: 1, minWidth: 0, fontWeight: 600 }}>{t.what}</span>
      {t.due ? <span style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 800, color: "#b23a2e" }}>{t.due}</span> : null}
    </div>
  );

  const lyricLines = [
    [date, true],
    [time, true],
    [weather ? wx + "  " + weather : "", false],
    [place ? "📍 " + place : "", false],
  ].filter((l) => l[0]);

  const content = (
    <div key={open ? "open" : "closed"}>
      <div style={{ padding: "8px 22px 6px" }}>
        <div className="os-rise" style={{ display: "flex", justifyContent: "center", margin: "6px 0 26px" }}>
          {plinth(272, true)}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <OsMarquee style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.3 }}>{songTitle}</OsMarquee>
            <OsMarquee style={{ fontSize: 14, color: sub, marginTop: 3 }}>{silent ? "아무것도 흐르지 않는다" : artist}</OsMarquee>
          </div>
          {icon(<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />, 24, "#fff")}
        </div>

        <div style={{ marginTop: 16 }}>
          {progress}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: sub, marginTop: 7, fontVariantNumeric: "tabular-nums" }}>
            <span>{osClock(silent ? 0 : sec)}</span>
            <span>{"-" + osClock(silent ? dur : dur - sec)}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "6px 0 0" }}>
          {icon(
            <g>
              <path d="M16 3h5v5" />
              <path d="M4 20L21 3" />
              <path d="M21 16v5h-5" />
              <path d="M15 15l6 6" />
              <path d="M4 4l5 5" />
            </g>,
            22,
            "#fff"
          )}
          {icon(
            <g>
              <path d="M19 20L9 12l10-8z" fill="#fff" />
              <path d="M5 19V5" strokeWidth="2.6" />
            </g>,
            30,
            "#fff"
          )}
          <div className={silent ? "" : "os-pulse"} style={{ width: 62, height: 62, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon(silent ? <path d="M8 5l12 7-12 7z" fill="#000" stroke="none" /> : <g fill="#000" stroke="none"><rect x="6" y="4.5" width="4" height="15" rx="1" /><rect x="14" y="4.5" width="4" height="15" rx="1" /></g>, 28, "#000")}
          </div>
          {icon(
            <g>
              <path d="M5 4l10 8-10 8z" fill="#fff" />
              <path d="M19 5v14" strokeWidth="2.6" />
            </g>,
            30,
            "#fff"
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            {icon(
              <g>
                <path d="M17 1l4 4-4 4" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <path d="M7 23l-4-4 4-4" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </g>,
              22,
              T.accent
            )}
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: T.accent }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 0 4px" }}>
          {icon(
            <g>
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <circle cx="12" cy="14" r="4" />
              <path d="M12 6h.01" />
            </g>,
            16,
            T.accent
          )}
          <OsMarquee style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 700, color: T.accent }}>{source || "어디선가"}</OsMarquee>
          {icon(
            <g>
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <path d="M16 6l-4-4-4 4" />
              <path d="M12 2v13" />
            </g>,
            18,
            sub
          )}
          {icon(
            <g>
              <path d="M8 6h13M8 12h13M8 18h13" />
              <path d="M3 6h.01M3 12h.01M3 18h.01" />
            </g>,
            18,
            sub,
            { marginLeft: 14 }
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, padding: "14px 16px 18px" }}>
        {lyricLines.length ? (
          <div className="os-rise" style={{ flex: "1 1 100%", background: T.card, borderRadius: 10, padding: "16px 16px 18px", animationDelay: ".05s" }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>지금 여기</div>
            {lyricLines.map((l, i) => (
              <div key={i} style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.45, letterSpacing: -0.3, color: l[1] ? "#fff" : "rgba(0,0,0,.5)", wordBreak: "keep-all" }}>
                {l[0]}
              </div>
            ))}
          </div>
        ) : null}

        {bare(
          "score",
          "금주 · 금연",
          "SCOREBOARD",
          <div style={{ display: "flex", gap: 8, padding: "12px 6px 10px", borderRadius: 10, background: "#0b0b0b", boxShadow: "inset 0 0 0 1px #262626" }}>
            {scoreCol("금주", "DRY", sober, 0.15)}
            <div style={{ width: 1, background: "#262626" }} />
            {scoreCol("금연", "NO SMOKE", smokeFree, 0.3)}
          </div>,
          ".1s"
        )}
        {bare("wallet", "지갑", "RECEIPT", receipt, ".15s")}

        {card(
          "body",
          "몸 상태",
          "CONDITION",
          bodyItems.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {bodyItems.map((b, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 16, background: "rgba(255,255,255,.1)", fontSize: 13 }}>
                  <span>{osBodyIcon(b)}</span>
                  <span>{b}</span>
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: sub }}>그럭저럭 멀쩡하다.</div>
          ),
          ".2s"
        )}
        {card(
          "goal",
          "다음 곡",
          "NEXT UP",
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 4, flexShrink: 0, background: "linear-gradient(135deg, " + T.accent + ", " + T.card + ")", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {icon(<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />, 20, "rgba(0,0,0,.6)")}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4, wordBreak: "keep-all" }}>{goal || "딱히 없다. 조용히 있고 싶다."}</div>
              <div style={{ fontSize: 12.5, color: sub, marginTop: 2 }}>Orson Callahan</div>
            </div>
          </div>,
          ".25s"
        )}

        <div onClick={() => setMore(!more)} className="os-rise" style={{ flex: "1 1 100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 10, background: "rgba(255,255,255,.07)", cursor: "pointer", animationDelay: ".3s" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, wordBreak: "keep-all" }}>관계 · 크레딧 · 동네 사정 · 작업대 위</div>
            <OsMarquee style={{ fontSize: 12, color: sub, marginTop: 3 }}>{OS_STAGE[stage - 1].kr + " · 크레딧 " + known.length + " · 동네 " + threads.length + " · 작업대 " + pending.length}</OsMarquee>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0, padding: "6px 10px 6px 12px", borderRadius: 16, background: "rgba(255,255,255,.12)", fontSize: 12, fontWeight: 700 }}>
            {more ? "접기" : "더보기"}
            {icon(<path d={more ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} />, 14, "#fff")}
          </span>
        </div>

        {more ? (
          <div style={{ display: "contents" }}>
          <div className="os-rise" style={{ flex: "1 1 100%", animationDelay: ".05s" }}>
            {heading("관계", "SIDE A")}
            {OS_STAGE.map((s, i) => {
              const n = i + 1;
              const cur = n === stage;
              const locked = n > stage;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", opacity: locked ? 0.4 : 1 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: cur ? 700 : 500, color: cur ? T.accent : "#fff" }}>
                      {cur ? eq(12, T.accent) : null}
                      <span>{s.kr}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: sub, marginTop: 3 }}>{s.en + " · Orson Callahan"}</div>
                  </div>
                  <span style={{ fontSize: locked ? 13 : 18, color: sub, letterSpacing: 1 }}>{locked ? "🔒" : "···"}</span>
                </div>
              );
            })}
          </div>

          {card(
            "known",
            "크레딧",
            "WHAT ORSON KNOWS",
            known.length ? (
              <div style={{ display: "grid", gap: 11 }}>
                {known.map((k, i) => (
                  <div key={i} style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, wordBreak: "keep-all" }}>{k.text}</div>
                    {k.name ? <div style={{ fontSize: 12.5, color: sub, marginTop: 1 }}>{k.name}</div> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: sub }}>아직 아는 게 없다.</div>
            ),
            ".1s"
          )}
          {card(
            "town",
            "동네 사정",
            "AROUND TOWN",
            threads.length ? (
              <div style={{ display: "grid", gap: 12 }}>
                {threads.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, alignItems: "center" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: "hsl(" + osHue(t.name || t.text) + ", 35%, 40%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>{(t.name || "?").slice(0, 1)}</div>
                    <div style={{ minWidth: 0, wordBreak: "keep-all" }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name || "누군가"}</div>
                      <div style={{ fontSize: 12.5, color: sub, marginTop: 1, lineHeight: 1.4 }}>{t.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: sub }}>동네는 조용하다.</div>
            ),
            ".15s"
          )}
          {card(
            "bench",
            "작업대 위",
            "ON THE BENCH",
            pending.length ? (
              <div style={{ display: "grid", gap: 8 }}>{pending.map(tag)}</div>
            ) : (
              <div style={{ fontSize: 13, color: sub }}>작업대가 비었다. 드문 일이다.</div>
            ),
            ".2s",
            true
          )}
          </div>
        ) : null}
      </div>
    </div>
  );

  const narrowView = (
    <div style={{ maxWidth: 480, margin: "6px auto" }}>
      <div style={{ borderRadius: open ? 14 : 8, overflow: "hidden", background: open ? "linear-gradient(180deg, " + T.top + " 0px, " + T.top2 + " 300px, #121212 620px)" : "transparent", boxShadow: open ? "0 12px 30px rgba(0,0,0,.35)" : "0 4px 12px rgba(0,0,0,.25)" }}>
        {header}
        <div style={{ maxHeight: open ? bodyH : 0, opacity: open ? 1 : 0, overflow: "hidden", transition: "max-height .6s cubic-bezier(.2,.8,.2,1), opacity .35s ease" }}>
          <div ref={bodyRef}>{content}</div>
        </div>
      </div>
    </div>
  );

  // ───── 넓은 창 (스포티파이 PC풍) ─────
  const pic = (src, extra) =>
    src ? <div style={{ position: "absolute", inset: 0, backgroundImage: 'url("' + String(src).replace(/"/g, "%22") + '")', backgroundSize: "cover", backgroundPosition: "center", ...(extra || {}) }} /> : null;

  const show = (id) => tab === "all" || tab === id;
  const ink = "rgba(0,0,0,.6)";
  const plinthBg = "linear-gradient(150deg, " + T.plinth + " 0%, #141414 75%)";
  const compact = rootW < OS_WIDE.full;
  const side = compact ? OS_WIDE.sideS : OS_WIDE.side;
  const rightW = Math.min(rootW, OS_WIDE.max) - 16 - 8 - side - (compact ? 28 : 36);
  const two = rightW >= 460;
  const tileCols = rightW >= 540 ? 3 : 2;
  const spanAll = { gridColumn: "1 / -1" };

  // 왼쪽 메뉴 (누르면 오른쪽 내용을 골라 보여 줌)
  const navIcon = {
    all: <path d="M3 10.5L12 3l9 7.5V21h-6v-6H9v6H3z" />,
    now: (
      <g>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </g>
    ),
    town: (
      <g>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" />
        <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
        <path d="M18 14.8c1.9.6 3.1 2.4 3.5 5.2" />
      </g>
    ),
  };

  const wideNav = (
    <div style={{ background: "#121212", borderRadius: 8, padding: "8px 6px", flexShrink: 0 }}>
      {OS_TABS.map((t) => {
        const on = tab === t[0];
        return (
          <div key={t[0]} onClick={() => setTab(t[0])} className="os-nav" style={{ position: "relative", display: "flex", alignItems: "center", gap: compact ? 10 : 14, height: 34, padding: compact ? "0 10px" : "0 12px", borderRadius: 6, cursor: "pointer", color: on ? "#fff" : sub, fontSize: compact ? 13 : 13.5, fontWeight: on ? 800 : 600 }}>
            {on ? <span style={{ position: "absolute", left: 0, top: 9, bottom: 9, width: 3, borderRadius: 2, background: T.accent }} /> : null}
            {icon(navIcon[t[0]], compact ? 18 : 20, on ? "#fff" : sub)}
            <span>{t[1]}</span>
          </div>
        );
      })}
    </div>
  );

  const art = side - (compact ? 28 : 40);
  const wideSide = (
    <div style={{ width: side, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
      {wideNav}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "#121212", borderRadius: 8, padding: 14, boxSizing: "border-box", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>{plinth(art, true)}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <OsMarquee style={{ fontSize: compact ? 15.5 : 18, fontWeight: 800, letterSpacing: -0.3 }}>{songTitle}</OsMarquee>
            <OsMarquee style={{ fontSize: compact ? 12 : 13, color: sub, marginTop: 2 }}>{silent ? "아무것도 흐르지 않는다" : artist}</OsMarquee>
          </div>
          {icon(<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />, compact ? 18 : 22, "#fff")}
        </div>

        <div style={{ marginTop: 12 }}>
          {progress}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: sub, marginTop: 7, fontVariantNumeric: "tabular-nums" }}>
            <span>{osClock(silent ? 0 : sec)}</span>
            <span>{"-" + osClock(silent ? dur : dur - sec)}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: compact ? "0 2px" : "0 10px", marginTop: 6 }}>
          {icon(
            <g>
              <path d="M19 20L9 12l10-8z" fill="#fff" />
              <path d="M5 19V5" strokeWidth="2.6" />
            </g>,
            compact ? 22 : 26,
            "#fff"
          )}
          <div className={silent ? "" : "os-pulse"} style={{ width: compact ? 42 : 50, height: compact ? 42 : 50, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon(silent ? <path d="M8 5l12 7-12 7z" fill="#000" stroke="none" /> : <g fill="#000" stroke="none"><rect x="6" y="4.5" width="4" height="15" rx="1" /><rect x="14" y="4.5" width="4" height="15" rx="1" /></g>, compact ? 18 : 22, "#000")}
          </div>
          {icon(
            <g>
              <path d="M5 4l10 8-10 8z" fill="#fff" />
              <path d="M19 5v14" strokeWidth="2.6" />
            </g>,
            compact ? 22 : 26,
            "#fff"
          )}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon(
            <g>
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <circle cx="12" cy="14" r="4" />
              <path d="M12 6h.01" />
            </g>,
            16,
            T.accent
          )}
          <OsMarquee style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 700, color: T.accent }}>{source || "어디선가"}</OsMarquee>
        </div>
      </div>
    </div>
  );

  // 맨 위 요약 키워드 (누를 수 없음). 관계 단계 → 오손의 감정 → 몸 상태 첫 항목 → 날씨. 값이 비어 있으면 그 칸은 안 보임.
  const sumTags = [{ t: OS_STAGE[stage - 1].kr, main: true }];
  if (mood) sumTags.push({ t: mood });
  if (bodyItems.length) {
    const ic = osBodyIcon(bodyItems[0]);
    sumTags.push({ t: (ic === "•" ? "" : ic + " ") + bodyItems[0] });
  }
  if (weather) sumTags.push({ t: wx + " " + weather });

  const wideTop = (
    <div style={{ display: "flex", alignItems: "center", flexWrap: compact ? "wrap" : "nowrap", gap: 10, rowGap: 10, marginBottom: compact ? 14 : 16 }}>
      {compact ? null : <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: T.accent, color: ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>O</div>}
      <div style={{ order: compact ? 2 : 0, flex: compact ? "1 1 100%" : 1, minWidth: 0, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {sumTags.map((g, i) => (
          <span key={i} style={{ padding: "6px 12px", borderRadius: 16, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", cursor: "default", background: g.main ? T.accent : "rgba(255,255,255,.1)", color: g.main ? "#000" : "#fff" }}>
            {g.t}
          </span>
        ))}
      </div>
      <div style={{ flex: compact ? "1 1 0" : "0 1 auto", minWidth: 60, maxWidth: compact ? "none" : 200, textAlign: compact ? "left" : "right" }}>
        <div style={{ fontSize: 9.5, letterSpacing: 1.4, fontWeight: 700, color: "rgba(255,255,255,.7)" }}>PLAYING FROM</div>
        <OsMarquee style={{ fontSize: 12, fontWeight: 800, marginTop: 1, textAlign: compact ? "left" : "right" }}>{place || "B-Side Vinyl & Frets"}</OsMarquee>
      </div>
      <div onClick={() => setOpen(false)} title="접기" style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
        {icon(<path d="M6 9l6 6 6-6" />, 20, "#fff")}
      </div>
    </div>
  );

  const wBox = (key, kr, en, children, span, delay) => (
    <div key={key} className="os-rise" style={{ ...(span ? spanAll : {}), minWidth: 0, background: "rgba(255,255,255,.07)", borderRadius: 10, padding: "14px 14px 15px", boxSizing: "border-box", animationDelay: delay }}>
      {heading(kr, en)}
      {children}
    </div>
  );

  const wBare = (key, kr, en, children, span, delay) => (
    <div key={key} className="os-rise" style={{ ...(span ? spanAll : {}), minWidth: 0, display: "flex", flexDirection: "column", animationDelay: delay }}>
      {heading(kr, en)}
      {children}
    </div>
  );

  const tile = (k, label, value, fb, wideTile) => (
    <div key={k} className="os-tile" style={{ gridColumn: wideTile ? "span 2" : undefined, minWidth: 0, display: "flex", alignItems: "center", height: 56, borderRadius: 6, overflow: "hidden" }}>
      <div style={{ width: 56, height: 56, flexShrink: 0, background: "linear-gradient(135deg, " + T.accent + ", " + T.card + ")", display: "flex", alignItems: "center", justifyContent: "center" }}>{fb}</div>
      <div style={{ flex: 1, minWidth: 0, padding: "0 12px" }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: sub, letterSpacing: 0.3 }}>{label}</div>
        <OsMarquee style={{ fontSize: 13.5, fontWeight: 800, marginTop: 1 }}>{value}</OsMarquee>
      </div>
    </div>
  );

  const wideTiles = (
    <div key="tiles" className="os-rise" style={{ ...spanAll, display: "grid", gridTemplateColumns: "repeat(" + tileCols + ", minmax(0, 1fr))", gap: 8 }}>
      {date ? tile("date", "날짜", date, icon(<g><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></g>, 24, ink)) : null}
      {time ? tile("time", "시간", time, icon(<g><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></g>, 24, ink)) : null}
      {weather ? tile("weather", "날씨", weather, <span style={{ fontSize: 24 }}>{wx}</span>) : null}
      {place ? tile("place", "장소", place, <span style={{ fontSize: 24 }}>📍</span>) : null}
      {tile("body", "몸 상태", bodyItems.length ? bodyItems.map((b) => { const ic = osBodyIcon(b); return (ic === "•" ? "" : ic + " ") + b; }).join(" · ") : "그럭저럭 멀쩡하다.", icon(<path d="M3 12h4l2-5 4 10 2-5h6" />, 24, ink), true)}
    </div>
  );

  const album = (s, i) => {
    const n = i + 1;
    const cur = n === stage;
    const locked = n > stage;
    return (
      <div key={n} className="os-card" style={{ minWidth: 0, padding: 10, borderRadius: 8, boxSizing: "border-box", opacity: locked ? 0.5 : 1 }}>
        <div style={{ position: "relative", paddingTop: "100%", borderRadius: 6, overflow: "hidden", background: plinthBg, boxShadow: "0 8px 20px rgba(0,0,0,.45)" }}>
          <div style={{ position: "absolute", left: "12%", top: "12%", width: "76%", height: "76%" }}>
            <div className={cur && !silent ? "os-spin" : ""} style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "repeating-radial-gradient(circle at 50% 50%, #111 0px, #111 1.4px, #1f1f1f 2px, #111 2.8px)", boxShadow: "0 6px 14px rgba(0,0,0,.6)" }}>
              <div style={{ position: "absolute", left: "33%", top: "33%", width: "34%", height: "34%", borderRadius: "50%", background: "conic-gradient(" + T.accent + " 0deg 180deg, " + T.label2 + " 180deg 360deg)" }}>
                <span style={{ position: "absolute", left: "50%", top: "50%", width: 4, height: 4, borderRadius: "50%", background: "#0b0b0b", transform: "translate(-50%,-50%)" }} />
              </div>
            </div>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 20deg, transparent 0deg, rgba(255,255,255,.09) 28deg, transparent 58deg, transparent 182deg, rgba(255,255,255,.06) 208deg, transparent 238deg)" }} />
          </div>
          <span style={{ position: "absolute", left: 10, top: 8, fontSize: 11, fontWeight: 800, letterSpacing: 1, color: "rgba(255,255,255,.55)" }}>{"0" + n}</span>
          {pic(OS_IMG.stage[i], locked ? { filter: "blur(8px) grayscale(1) brightness(.5)", transform: "scale(1.15)" } : null)}
          {locked ? <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.35)", fontSize: 26 }}>🔒</div> : null}
          {cur ? (
            <div style={{ position: "absolute", right: 8, bottom: 8, width: 38, height: 38, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(0,0,0,.45)" }}>{eq(14, "#000")}</div>
          ) : null}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10, color: cur ? T.accent : "#fff", wordBreak: "keep-all" }}>{s.kr}</div>
        <div style={{ fontSize: 12.5, color: sub, marginTop: 3, lineHeight: 1.4, wordBreak: "keep-all" }}>{s.en + " · Orson Callahan"}</div>
      </div>
    );
  };

  const wideGrid = (
    <div key={tab} style={{ display: "grid", gridTemplateColumns: two ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)", gap: 14, alignItems: "stretch" }}>
      {show("now") ? wideTiles : null}

      {show("now")
        ? wBare(
            "score",
            "금주 · 금연",
            "SCOREBOARD",
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "12px 6px 10px", borderRadius: 10, background: "#0b0b0b", boxShadow: "inset 0 0 0 1px #262626" }}>
              {scoreCol("금주", "DRY", sober, 0.15)}
              <div style={{ width: 1, alignSelf: "stretch", background: "#262626" }} />
              {scoreCol("금연", "NO SMOKE", smokeFree, 0.3)}
            </div>,
            false,
            ".06s"
          )
        : null}
      {show("now") ? wBare("wallet", "지갑", "RECEIPT", receipt, false, ".1s") : null}

      {show("now")
        ? wBare(
            "rel",
            "관계",
            "SIDE A",
            <div style={{ display: "grid", gridTemplateColumns: "repeat(" + (two ? 4 : 2) + ", minmax(0, 1fr))", gap: 10 }}>{OS_STAGE.map(album)}</div>,
            true,
            ".12s"
          )
        : null}

      {show("town")
        ? wBox(
            "town",
            "동네 사정",
            "AROUND TOWN",
            threads.length ? (
              <div style={{ display: "grid", gap: 12 }}>
                {threads.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, alignItems: "center" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: "hsl(" + osHue(t.name || t.text) + ", 35%, 40%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>{(t.name || "?").slice(0, 1)}</div>
                    <div style={{ minWidth: 0, wordBreak: "keep-all" }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name || "누군가"}</div>
                      <div style={{ fontSize: 12.5, color: sub, marginTop: 1, lineHeight: 1.4 }}>{t.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: sub }}>동네는 조용하다.</div>
            ),
            false,
            ".16s"
          )
        : null}
      {show("town")
        ? wBox(
            "known",
            "크레딧",
            "WHAT ORSON KNOWS",
            known.length ? (
              <div style={{ display: "grid", gap: 11 }}>
                {known.map((k, i) => (
                  <div key={i} style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, wordBreak: "keep-all" }}>{k.text}</div>
                    {k.name ? <div style={{ fontSize: 12.5, color: sub, marginTop: 1 }}>{k.name}</div> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: sub }}>아직 아는 게 없다.</div>
            ),
            false,
            ".2s"
          )
        : null}
      {show("town")
        ? wBox(
            "bench",
            "작업대 위",
            "ON THE BENCH",
            pending.length ? (
              <div style={{ display: "grid", gridTemplateColumns: two ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)", gap: 8 }}>{pending.map(tag)}</div>
            ) : (
              <div style={{ fontSize: 13, color: sub }}>작업대가 비었다. 드문 일이다.</div>
            ),
            true,
            ".24s"
          )
        : null}
    </div>
  );

  const wideView = (
    <div className="os-rise" style={{ maxWidth: OS_WIDE.max, margin: "6px auto", height: compact ? OS_WIDE.hS : OS_WIDE.h, display: "flex", gap: 8, padding: 8, boxSizing: "border-box", background: "#000", borderRadius: 14, boxShadow: "0 12px 30px rgba(0,0,0,.35)" }}>
      {wideSide}
      <div ref={scrollRef} className="os-scroll" style={{ flex: 1, minWidth: 0, overflowY: "auto", overflowX: "hidden", borderRadius: 8, backgroundColor: "#121212", backgroundImage: "linear-gradient(180deg, " + T.top + "aa 0px, #121212 280px)", backgroundAttachment: "local", padding: compact ? "12px 14px 18px" : "14px 18px 22px", boxSizing: "border-box" }}>
        {wideTop}
        {wideGrid}
      </div>
    </div>
  );

  return (
    <div ref={rootRef} style={{ fontFamily: font, color: "#fff", width: "100%", paddingTop: 48, boxSizing: "border-box", WebkitFontSmoothing: "antialiased" }}>
      <style>{OS_CSS}</style>
      {open && wide ? wideView : narrowView}
    </div>
  );
}

// ───── 이미지 자리 ─────
// 관계 앨범 표지 4장만 이미지를 씁니다. "" 사이에 .webp 이미지 주소를 넣으면 그 자리에 그림이 들어갑니다.
// 비워 두면 바이닐 그림이 그대로 나옵니다. 정사각형(1:1) · 권장 400×400. 아직 잠긴 단계는 흐리게 가려서 보여 줍니다.
const OS_IMG = {
  stage: ["", "", "", ""], // 1 초면·탐색기 / 2 친밀기 / 3 전환기 / 4 해금
};

// 넓은 창 치수. 상태창 칸 너비가 min 이상이면 넓은 창, 그보다 좁으면 기존 모양(폰).
// min ~ full 사이는 '좁은 넓은 창'(왼쪽 열을 좁히고 오른쪽을 1열로 쌓음), full 이상은 2열.
// max: 넓은 창 최대 너비 · h / hS: 넓은 창 높이 (기본 / 좁을 때) · side / sideS: 왼쪽 메뉴·재생 카드 너비 (기본 / 좁을 때)
const OS_WIDE = { min: 540, full: 760, max: 980, h: 640, hS: 540, side: 280, sideS: 196 };

const OS_TABS = [
  ["all", "전체"],
  ["now", "지금"],
  ["town", "동네"],
];

// 긴 글자 한 줄. 칸에 다 들어가면 그대로 두고, 넘치면 음원 앱처럼 왼쪽으로 흘려 보여 준다.
// 처음 글자에서 잠깐 멈춤 → 왼쪽으로 흐름 → 뒤따라 들어온 처음 글자가 제자리에 오면 다시 멈춤.
const OS_MARQ = { fade: 8, gap: 36, speed: 30, hold: 2000 };

function OsMarquee(props = {}) {
  const p = props || {};
  const H = osHooks();
  const mkRef = H.r || ((v) => H.s(() => ({ current: v }))[0]);
  const boxRef = mkRef(null);
  const firstRef = mkRef(null);
  const [dist, setDist] = H.s(0);

  const measure = () => {
    const box = boxRef.current;
    const first = firstRef.current;
    if (!box || !first) return;
    const room = box.clientWidth - OS_MARQ.fade * 2;
    const w = first.offsetWidth;
    const next = room > 0 && w > room + 1 ? w + OS_MARQ.gap : 0;
    setDist((d) => (d === next ? d : next));
  };

  H.e(() => {
    measure();
  });

  H.e(() => {
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => measure());
    if (boxRef.current) ro.observe(boxRef.current);
    if (firstRef.current) ro.observe(firstRef.current);
    return () => ro.disconnect();
  }, []);

  const over = dist > 0;
  const f = OS_MARQ.fade;
  const mask = "linear-gradient(90deg, transparent 0, #000 " + f + "px, #000 calc(100% - " + f + "px), transparent 100%)";
  const total = over ? Math.round(OS_MARQ.hold + (dist / OS_MARQ.speed) * 1000) : 0;
  const holdPct = over ? ((OS_MARQ.hold / total) * 100).toFixed(2) : "0";
  const kf = "osMq" + dist;

  return (
    <div
      ref={boxRef}
      style={{
        ...(p.style || {}),
        overflow: "hidden",
        whiteSpace: "nowrap",
        marginLeft: -f,
        marginRight: -f,
        paddingLeft: f,
        paddingRight: f,
        textAlign: over ? "left" : (p.style || {}).textAlign,
        maskImage: over ? mask : undefined,
        WebkitMaskImage: over ? mask : undefined,
      }}
    >
      {over ? <style>{"@keyframes " + kf + " { 0%, " + holdPct + "% { transform: translateX(0); } 100% { transform: translateX(-" + dist + "px); } }"}</style> : null}
      <span className={over ? "os-mq" : ""} style={{ display: "inline-block", animation: over ? kf + " " + total + "ms linear infinite" : undefined }}>
        <span ref={firstRef} style={{ display: "inline-block" }}>{p.children}</span>
        {over ? (
          <span aria-hidden="true" style={{ display: "inline-block", paddingLeft: OS_MARQ.gap }}>
            {p.children}
          </span>
        ) : null}
      </span>
    </div>
  );
}

const OS_THEME = {
  dawn: { top: "#4a5a80", top2: "#26304a", mini: "#36415e", plinth: "#3a4664", card: "#56689a", accent: "#a9bdf0", label2: "#61719a" },
  morning: { top: "#8f6c3c", top2: "#4a3820", mini: "#6a5130", plinth: "#6b5332", card: "#a8824a", accent: "#f5c86e", label2: "#b98a3e" },
  day: { top: "#3f6f7e", top2: "#203a42", mini: "#30545f", plinth: "#33585f", card: "#4a8a92", accent: "#86dcc3", label2: "#4f8f84" },
  evening: { top: "#8e4a33", top2: "#4a261a", mini: "#6b3826", plinth: "#6a3a28", card: "#a85a3e", accent: "#f7a878", label2: "#b4613f" },
  night: { top: "#2d3870", top2: "#181e3c", mini: "#273060", plinth: "#283166", card: "#4252a0", accent: "#a3aef7", label2: "#5560a8" },
};

const OS_STAGE = [
  { kr: "초면 · 탐색기", en: "Stranger" },
  { kr: "친밀기", en: "Regular" },
  { kr: "전환기", en: "Turning Point" },
  { kr: "해금", en: "The B-Side" },
];

// React 기능(useState·useEffect·useRef)을 React에서 직접 꺼내 쓴다. 없으면 플랫폼이 넣어 준 것을 쓴다.
function osHooks() {
  const R = typeof React !== "undefined" && React ? React : {};
  return {
    s: R.useState || (typeof useState === "function" ? useState : null),
    e: R.useEffect || (typeof useEffect === "function" ? useEffect : null),
    r: R.useRef || (typeof useRef === "function" ? useRef : null),
  };
}

function osVal(v, d) {
  if (v === undefined || v === null) return d;
  const s = String(v).trim();
  return s === "" || s === "undefined" || s === "null" ? d : s;
}

function osNum(v) {
  if (v === undefined || v === null) return null;
  const raw = String(v).trim();
  if (raw === "") return null;
  const n = Number(raw.replace(/[^0-9.\-]/g, ""));
  return isFinite(n) ? Math.max(0, Math.round(n)) : null;
}

function osList(v) {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (v === undefined || v === null) return [];
  const s = String(v).trim();
  if (!s) return [];
  if (s.charAt(0) === "[") {
    try {
      const a = JSON.parse(s);
      if (Array.isArray(a)) return a.map((x) => String(x).trim()).filter(Boolean);
    } catch (e) {}
  }
  return s.split(/\n|\||;/).map((x) => x.trim()).filter(Boolean);
}

function osSplitName(s) {
  const m = s.match(/^([^:：]{1,12})[:：]\s*(.+)$/);
  return m ? { name: m[1].trim(), text: m[2].trim() } : { name: "", text: s };
}

function osSplitDue(s) {
  const i = s.lastIndexOf("·");
  return i > 0 ? { what: s.slice(0, i).trim(), due: s.slice(i + 1).trim() } : { what: s, due: "" };
}

function osPropane(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (!s) return null;
  if (/가득|full/i.test(s)) return 4;
  if (/바닥|없|empty/i.test(s)) return 0;
  if (/반|half/i.test(s)) return 2;
  const f = s.match(/(\d)\s*\/\s*4/);
  if (f) return Math.min(4, Number(f[1]));
  if (s.indexOf("¼") >= 0) return 1;
  if (s.indexOf("½") >= 0) return 2;
  if (s.indexOf("¾") >= 0) return 3;
  const n = Number(s);
  return isFinite(n) ? Math.max(0, Math.min(4, Math.round(n))) : null;
}

function osRent(r) {
  if (!r) return null;
  if (/미납|연체|밀림|unpaid/i.test(r)) return { text: "UNPAID", sub: r, color: "#c0392b" };
  if (/납부|완납|paid/i.test(r)) return { text: "PAID", sub: r, color: "#2e8b57" };
  return { text: r, sub: "", color: "#8a7a5a" };
}

function osTod(t) {
  const s = String(t || "");
  if (/새벽/.test(s)) return "dawn";
  if (/저녁|해 질|해질|노을/.test(s)) return "evening";
  if (/밤|자정|심야/.test(s)) return "night";
  if (/아침|오전/.test(s)) return "morning";
  return "day";
}

function osSilent(song, source) {
  if (!song) return true;
  return /무음|정적|조용/.test(song) || /무음|정적/.test(source || "");
}

const OS_WX = { storm: "⛈️", sleet: "🌨️", snow: "❄️", rain: "🌧️", fog: "🌫️", wind: "💨", cloud: "☁️", clear: "☀️", clearNight: "🌙", etc: "🌥️" };

function osWxKey(w, tod) {
  const s = String(w || "");
  if (/뇌우|천둥|번개/.test(s)) return "storm";
  if (/진눈깨비/.test(s)) return "sleet";
  if (/눈/.test(s)) return "snow";
  if (/비|소나기/.test(s)) return "rain";
  if (/안개/.test(s)) return "fog";
  if (/바람/.test(s)) return "wind";
  if (/흐림|흐리|구름/.test(s)) return "cloud";
  if (/맑/.test(s)) return tod === "night" || tod === "dawn" ? "clearNight" : "clear";
  return "etc";
}

function osBodyIcon(s) {
  if (/두통|편두통/.test(s)) return "🤕";
  if (/감기|콧물|기침|목/.test(s)) return "🤧";
  if (/위경련|복통|속|위/.test(s)) return "😖";
  if (/열|오한/.test(s)) return "🤒";
  if (/숙취|취/.test(s)) return "🥴";
  if (/피곤|피로|졸/.test(s)) return "😪";
  if (/금단|짜증|신경/.test(s)) return "😤";
  if (/상처|부상|베|멍|화상/.test(s)) return "🩹";
  if (/양호|멀쩡|괜찮/.test(s)) return "🙂";
  return "•";
}

function osHue(name) {
  let h = 0;
  const s = String(name || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

function osClock(sec) {
  const s = Math.max(0, Math.round(sec));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

const OS_CSS = `
@keyframes osSpin { to { transform: rotate(360deg); } }
.os-spin { animation: osSpin 1.8s linear infinite; }
@keyframes osEq { 0% { transform: scaleY(.2); } 100% { transform: scaleY(1); } }
.os-eq > span { animation: osEq .7s ease-in-out infinite alternate; }
.os-eq.os-paused > span { animation: none; }
@keyframes osRise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.os-rise { animation: osRise .55s cubic-bezier(.2,.8,.2,1) both; }
@keyframes osFlip { 0% { transform: perspective(200px) rotateX(-90deg); opacity: .2; } 60% { transform: perspective(200px) rotateX(12deg); opacity: 1; } 100% { transform: none; } }
.os-flip { animation: osFlip .55s ease-out both; }
@keyframes osPrint { from { transform: translateY(-14px); clip-path: inset(0 0 100% 0); } to { transform: none; clip-path: inset(0 0 0 0); } }
.os-print { animation: osPrint .9s cubic-bezier(.3,.7,.2,1) .2s both; }
@keyframes osStamp { 0% { opacity: 0; transform: rotate(-8deg) scale(2.2); } 70% { opacity: 1; transform: rotate(-8deg) scale(.92); } 100% { opacity: .9; transform: rotate(-8deg) scale(1); } }
.os-stamp { animation: osStamp .45s 1s both; }
@keyframes osBlink { 50% { opacity: .25; } }
.os-blink { animation: osBlink 1.1s step-end infinite; }
@keyframes osPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
.os-pulse { animation: osPulse 2.4s ease-in-out infinite; }
@keyframes osArm { from { transform: rotate(-24deg); } to { transform: rotate(0deg); } }
.os-arm { animation: osArm 1s .3s cubic-bezier(.3,.7,.2,1) both; }
.os-arm-rest { transform: rotate(-24deg); }
@keyframes osGlow { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }
.os-glow { animation: osGlow 2s ease-in-out infinite; }
.os-card { background: rgba(255,255,255,.04); transition: background .2s ease; }
.os-card:hover { background: rgba(255,255,255,.1); }
.os-tile { background: rgba(255,255,255,.08); transition: background .2s ease; }
.os-tile:hover { background: rgba(255,255,255,.16); }
.os-nav { transition: background .2s ease, color .2s ease; }
.os-nav:hover { background: rgba(255,255,255,.06); }
.os-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.22) transparent; }
.os-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.os-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.22); border-radius: 4px; }
.os-scroll::-webkit-scrollbar-track { background: transparent; }
@media (prefers-reduced-motion: reduce) {
  .os-spin, .os-eq > span, .os-rise, .os-flip, .os-print, .os-stamp, .os-blink, .os-pulse, .os-arm, .os-glow, .os-mq { animation: none !important; }
}
`;
