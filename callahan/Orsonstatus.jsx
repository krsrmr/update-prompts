// 필요 훅: useState, useRef, useEffect (react)
// 오손 상태창 v0 (가제작) — 바이닐 플레이어

function Orsonstatus(props = {}) {
  const p = props || {};

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
  const stage = Math.max(1, Math.min(4, Math.round(Number(p.stage) || 1)));
  const known = osList(p.known);
  const threads = osList(p.threads).map(osSplitName);
  const pending = osList(p.pending).map(osSplitDue);

  const [open, setOpen] = useState(false);
  const [bodyH, setBodyH] = useState(0);
  const bodyRef = useRef(null);

  useEffect(() => {
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
  }, [open, known.length, threads.length, pending.length]);

  const tod = osTod(time);
  const T = OS_THEME[tod];
  const silent = osSilent(song, source);
  const wx = osWx(weather, tod);
  const bodyItems = body ? body.split(/[,，·\/]/).map((s) => s.trim()).filter(Boolean) : [];
  const songTitle = silent ? "조용함" : song;

  const font = "Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', system-ui, sans-serif";
  const mono = "'Courier New', ui-monospace, Menlo, monospace";
  const sub = "#a7a7a7";

  const chevron = (up) => (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d={up ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        className={spin ? "os-spin" : ""}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "repeating-radial-gradient(circle at 50% 50%, #141414 0px, #141414 1.6px, #242424 2.2px, #141414 3.2px)",
          boxShadow: "0 " + Math.round(size * 0.05) + "px " + Math.round(size * 0.12) + "px rgba(0,0,0,.55), inset 0 0 0 1px #000",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "32%",
            top: "32%",
            width: "36%",
            height: "36%",
            borderRadius: "50%",
            background: "conic-gradient(" + T.accent + " 0deg 180deg, " + T.label2 + " 180deg 360deg)",
            boxShadow: "inset 0 0 0 " + Math.max(1, Math.round(size * 0.012)) + "px rgba(0,0,0,.25)",
          }}
        >
          {size > 80 ? (
            <span style={{ position: "absolute", left: 0, right: 0, top: "18%", textAlign: "center", fontSize: Math.round(size * 0.05), fontWeight: 800, letterSpacing: 1, color: "rgba(0,0,0,.6)" }}>B-SIDE</span>
          ) : null}
          <span style={{ position: "absolute", left: "50%", top: "50%", width: Math.max(3, Math.round(size * 0.03)), height: Math.max(3, Math.round(size * 0.03)), borderRadius: "50%", background: "#0b0b0b", transform: "translate(-50%,-50%)" }} />
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none", background: "conic-gradient(from 20deg, transparent 0deg, rgba(255,255,255,.10) 28deg, transparent 58deg, transparent 182deg, rgba(255,255,255,.07) 208deg, transparent 238deg)" }} />
    </div>
  );

  const card = (key, title, en, children, extra) => (
    <div key={key} className="os-rise" style={{ flex: "1 1 200px", minWidth: 0, background: "#1e1e1e", borderRadius: 10, padding: "11px 12px 12px", boxSizing: "border-box", animationDelay: (extra && extra.delay) || "0s", ...((extra && extra.style) || {}) }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 9 }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.3, color: "#fff" }}>{en}</span>
        <span style={{ fontSize: 11, color: sub }}>{title}</span>
      </div>
      {children}
    </div>
  );

  const digits = (n, delay) => {
    const s = n === null ? "--" : String(Math.min(n, 999)).padStart(2, "0");
    const zero = n === 0;
    return (
      <div style={{ display: "flex", gap: 3 }}>
        {s.split("").map((d, i) => (
          <div
            key={i + d}
            className="os-flip"
            style={{
              position: "relative",
              width: 25,
              height: 36,
              borderRadius: 4,
              background: "linear-gradient(#1d1d1d 50%, #151515 50%)",
              boxShadow: "inset 0 0 0 1px #2c2c2c, 0 2px 4px rgba(0,0,0,.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 23,
              color: zero ? "#ff5d5d" : "#ffb347",
              textShadow: zero ? "0 0 8px rgba(255,93,93,.6)" : "0 0 8px rgba(255,179,71,.55)",
              animationDelay: delay + i * 0.08 + "s",
            }}
          >
            {d}
            <span style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "#000" }} />
          </div>
        ))}
      </div>
    );
  };

  const scoreCol = (kr, en, n, delay) => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ fontSize: 10, letterSpacing: 1.5, fontWeight: 800, color: "#ffb347", opacity: 0.85 }}>{en}</div>
      {digits(n, delay)}
      <div style={{ fontSize: 11, color: n === 0 ? "#ff5d5d" : sub }}>
        {n === 0 ? <span className="os-blink" style={{ fontWeight: 800, letterSpacing: 1 }}>RESET</span> : kr + (n === null ? "" : " " + n + "일째")}
      </div>
    </div>
  );

  const leader = (label, value) => (
    <div style={{ display: "flex", alignItems: "baseline", margin: "3px 0" }}>
      <span>{label}</span>
      <span style={{ flex: 1, borderBottom: "1px dotted #9a958a", margin: "0 6px", transform: "translateY(-3px)" }} />
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

  const receipt = (
    <div style={{ position: "relative", filter: "drop-shadow(0 4px 8px rgba(0,0,0,.45))" }}>
      <div className="os-print" style={{ background: "#f3efe6", color: "#2b2b2b", fontFamily: mono, fontSize: 12, padding: "11px 12px 8px", borderRadius: "3px 3px 0 0", position: "relative", overflow: "hidden" }}>
        <div style={{ textAlign: "center", fontWeight: 700, letterSpacing: 3, fontSize: 13 }}>WALLET</div>
        <div style={{ textAlign: "center", fontSize: 9.5, color: "#6d675c", marginBottom: 6 }}>O. CALLAHAN · BEACON NY</div>
        <div style={{ borderTop: "1px dashed #9a958a", margin: "4px 0 6px" }} />
        {leader("CASH", cashText)}
        {leader(
          "LOT RENT",
          rent ? (
            rent.sub ? (
              <span className="os-stamp" style={{ display: "inline-block", padding: "1px 6px", border: "2px solid " + rent.color, color: rent.color, borderRadius: 3, fontWeight: 800, fontSize: 11.5, letterSpacing: 1.5 }}>
                {rent.text}
              </span>
            ) : (
              rent.text
            )
          ) : (
            "—"
          )
        )}
        {leader("PROPANE", gauge)}
        <div style={{ borderTop: "1px dashed #9a958a", margin: "6px 0 4px" }} />
        <div style={{ textAlign: "center", fontSize: 9.5, color: "#6d675c", letterSpacing: 1 }}>*** NO REFUNDS ***</div>
      </div>
      <div style={{ height: 7, background: "linear-gradient(135deg, #f3efe6 50%, transparent 50%) 0 0 / 10px 10px repeat-x, linear-gradient(225deg, #f3efe6 50%, transparent 50%) 0 0 / 10px 10px repeat-x" }} />
    </div>
  );

  const header = open ? (
    <div onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px 4px", cursor: "pointer" }}>
      {chevron(false)}
      <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
        <div style={{ fontSize: 9.5, letterSpacing: 1.6, color: "#e6e6e6", opacity: 0.8 }}>PLAYING FROM</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{source || place || "B-Side Vinyl & Frets"}</div>
      </div>
      <span style={{ width: 20, textAlign: "center", fontSize: 16, letterSpacing: 1, color: "#e6e6e6" }}>···</span>
    </div>
  ) : (
    <div onClick={() => setOpen(true)} style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px 10px", cursor: "pointer", background: "linear-gradient(90deg, " + T.bar + ", #262626)", borderRadius: 10, overflow: "hidden" }}>
      {vinyl(40, !silent)}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {songTitle}
          {artist && !silent ? <span style={{ fontWeight: 400, color: "#cfcfcf" }}>{" · " + artist}</span> : null}
        </div>
        <div style={{ fontSize: 11.5, color: "#cfcfcf", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{[date, time].filter(Boolean).join(" · ")}</div>
      </div>
      {eq(14, T.accent)}
      {chevron(true)}
      <div style={{ position: "absolute", left: 10, right: 10, bottom: 3, height: 2, borderRadius: 1, background: "rgba(255,255,255,.18)", overflow: "hidden" }}>
        <div className={silent ? "" : "os-prog"} style={{ height: "100%", width: silent ? "0%" : undefined, background: "#fff" }} />
      </div>
    </div>
  );

  const metaChips = [
    ["📅", date],
    ["🕒", time],
    [wx, weather],
    ["📍", place],
  ].filter((m) => m[1]);

  const content = (
    <div key={open ? "open" : "closed"}>
      <div style={{ padding: "4px 18px 14px" }}>
        <div className="os-rise" style={{ position: "relative", width: 176, margin: "8px auto 18px" }}>
          {vinyl(176, open && !silent)}
          <svg className="os-arm" width="64" height="118" viewBox="0 0 64 118" style={{ position: "absolute", right: -30, top: -8, overflow: "visible" }}>
            <circle cx="48" cy="12" r="9" fill="#3a3a3a" stroke="#555" strokeWidth="1.5" />
            <circle cx="48" cy="12" r="3" fill="#888" />
            <path d="M48 12 L40 72 L22 100" stroke="#cfcfcf" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="12" y="96" width="16" height="9" rx="2" fill="#9a9a9a" transform="rotate(-32 20 100)" />
          </svg>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{songTitle}</div>
            <div style={{ fontSize: 13.5, color: sub, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{silent ? "아무것도 흐르지 않는다" : artist}</div>
          </div>
          <svg width="22" height="22" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path d="M12 20s-7-4.4-9.2-8.6C1.3 8.6 3 5 6.4 5c2 0 3.2 1.1 3.9 2.2.3.4.9.4 1.2 0C12.4 6.1 13.6 5 15.6 5 19 5 20.7 8.6 19.2 11.4 17 15.6 12 20 12 20z" fill={T.accent} />
          </svg>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ position: "relative", height: 4, borderRadius: 2, background: "rgba(255,255,255,.2)" }}>
            <div className={silent ? "" : "os-prog"} style={{ position: "relative", height: "100%", borderRadius: 2, background: "#fff", width: silent ? "0%" : undefined }}>
              <span style={{ position: "absolute", right: -5, top: -3, width: 10, height: 10, borderRadius: "50%", background: "#fff" }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: sub, marginTop: 6 }}>
            <span>SIDE B</span>
            <span>33⅓ RPM</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "8px 6px 0" }}>
          <span style={{ fontSize: 17, color: sub }}>⇄</span>
          <svg width="26" height="26" viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9 12z" fill="#fff" /></svg>
          <div className={silent ? "" : "os-pulse"} style={{ width: 50, height: 50, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d={silent ? "M8 5l12 7-12 7z" : "M7 5h4v14H7zM13 5h4v14h-4z"} fill="#000" />
            </svg>
          </div>
          <svg width="26" height="26" viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5l11 7-11 7z" fill="#fff" /></svg>
          <span style={{ fontSize: 17, color: T.accent }}>↻</span>
        </div>
      </div>

      {metaChips.length ? (
        <div className="os-rise" style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 12px 12px", animationDelay: ".05s" }}>
          {metaChips.map((m, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 14, background: "#2a2a2a", fontSize: 12, wordBreak: "keep-all" }}>
              <span>{m[0]}</span>
              <span>{m[1]}</span>
            </span>
          ))}
        </div>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "0 12px 14px" }}>
        {card(
          "score",
          "금주 · 금연",
          "SCOREBOARD",
          <div style={{ display: "flex", gap: 8, padding: "10px 4px 8px", borderRadius: 8, background: "#0c0c0c", boxShadow: "inset 0 0 0 1px #262626" }}>
            {scoreCol("금주", "DRY", sober, 0.15)}
            <div style={{ width: 1, background: "#262626" }} />
            {scoreCol("금연", "NO SMOKE", smokeFree, 0.3)}
          </div>,
          { delay: ".08s" }
        )}
        {card("wallet", "지갑", "RECEIPT", receipt, { delay: ".14s" })}
        {card(
          "body",
          "몸 상태",
          "CONDITION",
          bodyItems.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {bodyItems.map((b, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 14, background: "#2c2c2c", fontSize: 12.5 }}>
                  <span>{osBodyIcon(b)}</span>
                  <span>{b}</span>
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12.5, color: sub }}>그럭저럭 멀쩡하다.</div>
          ),
          { delay: ".2s" }
        )}
        {card(
          "goal",
          "오손이 원하는 것",
          "NEXT UP",
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 4, flexShrink: 0, background: "linear-gradient(135deg, " + T.accent + ", " + T.bar + ")", display: "flex", alignItems: "center", justifyContent: "center", color: "#111", fontWeight: 900, fontSize: 16 }}>≡</div>
            <div style={{ fontSize: 13, lineHeight: 1.45, wordBreak: "keep-all" }}>{goal || "딱히 없다. 조용히 있고 싶다."}</div>
          </div>,
          { delay: ".26s" }
        )}
        {card(
          "stage",
          "관계",
          "SIDE A",
          <div>
            {OS_STAGE.map((s, i) => {
              const n = i + 1;
              const cur = n === stage;
              const done = n < stage;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 4px", borderRadius: 6, background: cur ? "rgba(255,255,255,.06)" : "transparent", opacity: n > stage ? 0.4 : 1 }}>
                  <span style={{ width: 16, display: "inline-flex", justifyContent: "center", fontSize: 13, color: sub }}>{cur ? eq(12, T.accent) : done ? "✓" : n}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: cur ? 800 : 500, color: cur ? T.accent : "#fff" }}>{s.kr}</div>
                  </div>
                  <span style={{ fontSize: 11, color: sub }}>{n > stage ? "🔒" : s.en}</span>
                </div>
              );
            })}
          </div>,
          { delay: ".32s", style: { flexBasis: "100%" } }
        )}
        {card(
          "known",
          "오손이 아는 당신",
          "CREDITS",
          known.length ? (
            <div style={{ display: "grid", gap: 6 }}>
              {known.map((k, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 12.5, lineHeight: 1.45, wordBreak: "keep-all" }}>
                  <span style={{ color: T.accent, flexShrink: 0 }}>●</span>
                  <span>{k}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12.5, color: sub }}>아직 아는 게 없다.</div>
          ),
          { delay: ".38s" }
        )}
        {card(
          "town",
          "동네 사정",
          "AROUND TOWN",
          threads.length ? (
            <div style={{ display: "grid", gap: 8 }}>
              {threads.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "hsl(" + osHue(t.name || t.text) + ", 38%, 42%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, fontWeight: 800 }}>{(t.name || "?").slice(0, 1)}</div>
                  <div style={{ minWidth: 0, fontSize: 12.5, lineHeight: 1.45, wordBreak: "keep-all" }}>
                    {t.name ? <div style={{ fontWeight: 700 }}>{t.name}</div> : null}
                    <div style={{ color: "#d0d0d0" }}>{t.text}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12.5, color: sub }}>동네는 조용하다.</div>
          ),
          { delay: ".44s" }
        )}
        {card(
          "bench",
          "걸려 있는 일",
          "ON THE BENCH",
          pending.length ? (
            <div style={{ display: "grid", gap: 7 }}>
              {pending.map((t, i) => (
                <div key={i} style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "6px 10px 6px 22px", background: "#e9dcc0", color: "#3a3020", fontSize: 12.5, clipPath: "polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%)", wordBreak: "keep-all" }}>
                  <span style={{ position: "absolute", left: 9, top: "50%", width: 6, height: 6, marginTop: -3, borderRadius: "50%", background: "#1e1e1e" }} />
                  <span style={{ flex: 1, minWidth: 0 }}>{t.what}</span>
                  {t.due ? <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 800, color: "#a3281f" }}>{t.due}</span> : null}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12.5, color: sub }}>작업대가 비었다. 드문 일이다.</div>
          ),
          { delay: ".5s", style: { flexBasis: "100%" } }
        )}
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: font, color: "#fff", maxWidth: 480, margin: "6px auto", boxSizing: "border-box", WebkitFontSmoothing: "antialiased" }}>
      <style>{OS_CSS}</style>
      <div style={{ borderRadius: 12, overflow: "hidden", background: open ? "linear-gradient(180deg, " + T.top + " 0px, #121212 340px)" : "transparent", boxShadow: open ? "0 10px 26px rgba(0,0,0,.35)" : "0 4px 12px rgba(0,0,0,.25)", transition: "background .4s ease" }}>
        {header}
        <div style={{ maxHeight: open ? bodyH : 0, opacity: open ? 1 : 0, overflow: "hidden", transition: "max-height .55s cubic-bezier(.2,.8,.2,1), opacity .35s ease" }}>
          <div ref={bodyRef}>{content}</div>
        </div>
      </div>
    </div>
  );
}

const OS_THEME = {
  dawn: { top: "#33415f", bar: "#2b3650", accent: "#9fb4e0", label2: "#5f6f94" },
  morning: { top: "#7a5c34", bar: "#5e4628", accent: "#f2c46d", label2: "#b98a3e" },
  day: { top: "#36596a", bar: "#2c4855", accent: "#7fd1b9", label2: "#4f8f84" },
  evening: { top: "#7c3f2c", bar: "#5f3022", accent: "#f2a06d", label2: "#b4613f" },
  night: { top: "#232c52", bar: "#1d2445", accent: "#9aa6f2", label2: "#5560a8" },
};

const OS_STAGE = [
  { kr: "초면 · 탐색기", en: "Stranger" },
  { kr: "친밀기", en: "Regular" },
  { kr: "전환기", en: "Turning Point" },
  { kr: "해금", en: "The B-Side" },
];

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

function osWx(w, tod) {
  const s = String(w || "");
  if (/뇌우|천둥|번개/.test(s)) return "⛈️";
  if (/진눈깨비/.test(s)) return "🌨️";
  if (/눈/.test(s)) return "❄️";
  if (/비|소나기/.test(s)) return "🌧️";
  if (/안개/.test(s)) return "🌫️";
  if (/바람/.test(s)) return "💨";
  if (/흐림|흐리|구름/.test(s)) return "☁️";
  if (/맑/.test(s)) return tod === "night" || tod === "dawn" ? "🌙" : "☀️";
  return "🌥️";
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

const OS_CSS = `
@keyframes osSpin { to { transform: rotate(360deg); } }
.os-spin { animation: osSpin 1.8s linear infinite; }
@keyframes osEq { 0% { transform: scaleY(.2); } 100% { transform: scaleY(1); } }
.os-eq > span { animation: osEq .7s ease-in-out infinite alternate; }
.os-eq.os-paused > span { animation: none; }
@keyframes osProg { from { width: 0%; } to { width: 100%; } }
.os-prog { animation: osProg 48s linear infinite; }
@keyframes osRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.os-rise { animation: osRise .5s cubic-bezier(.2,.8,.2,1) both; }
@keyframes osFlip { 0% { transform: perspective(200px) rotateX(-90deg); opacity: .2; } 60% { transform: perspective(200px) rotateX(12deg); opacity: 1; } 100% { transform: none; } }
.os-flip { animation: osFlip .55s ease-out both; }
@keyframes osPrint { from { transform: translateY(-14px); clip-path: inset(0 0 100% 0); } to { transform: none; clip-path: inset(0 0 0 0); } }
.os-print { animation: osPrint .9s cubic-bezier(.3,.7,.2,1) .15s both; }
@keyframes osStamp { 0% { opacity: 0; transform: rotate(-8deg) scale(2.2); } 70% { opacity: 1; transform: rotate(-8deg) scale(.92); } 100% { opacity: .9; transform: rotate(-8deg) scale(1); } }
.os-stamp { animation: osStamp .45s .9s both; }
@keyframes osBlink { 50% { opacity: .25; } }
.os-blink { animation: osBlink 1.1s step-end infinite; }
@keyframes osPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
.os-pulse { animation: osPulse 2.4s ease-in-out infinite; }
@keyframes osArm { from { transform: rotate(-26deg); } to { transform: rotate(0deg); } }
.os-arm { transform-origin: 75% 10%; animation: osArm .9s .25s cubic-bezier(.3,.7,.2,1) both; }
@media (prefers-reduced-motion: reduce) {
  .os-spin, .os-eq > span, .os-prog, .os-rise, .os-flip, .os-print, .os-stamp, .os-blink, .os-pulse, .os-arm { animation: none !important; }
}
`;
