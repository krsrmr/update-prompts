// 필요 훅: useState, useRef, useEffect (react)
// [포키] 명령어 전용. 포키데이 포키 게임.
//   mode="play"   : 직접 하는 미니게임. 꾹 누르면 먹어 들어가고, 떼면 멈춘다.
//                   끝나면 '!포키결과 …' 문구가 나오고, 유저가 그 문구를 보내면 AI가 그 결과대로 장면을 쓴다.
//                   값: date, flavor, phase(1~5), dating(true/false), userName
//   mode="result" : 결과 기록 카드(재생). AI가 장면을 쓴 뒤에 낸다. (mode를 안 쓰면 이쪽)
//                   값: date, flavor, left(남은 mm), result(기권/부러짐/닿음), by, bpm, mashiroFace, userFace, userName, memo
// 결과 그림: 그림을 올린 뒤 아래 PG_IMG의 따옴표 안에 주소를 넣으면 결과 화면에 뜬다. 비워 두면 그림 없이 나온다.
//   예) 기권: "https://krsrmr.github.io/mayumaro/img/pocky-giveup.webp"

const PG_IMG = {
  기권: "",
  부러짐: "",
  닿음: ""
};

function PockyGame(props = {}) {
  const p = props || {};
  return p.mode === "play" ? <PgPlay {...p} /> : <PgResult {...p} />;
}

/* ───────── 결과 카드 (mode="result") ───────── */

function PgResult(props) {
  const {
    title = "ポッキーの日",
    date = "11/11",
    flavor = "초코",
    left = 12,
    result = "기권",
    by = "마시로",
    bpm = 158,
    mashiroFace = "(>﹏<)💦",
    userFace = "(・ω・)",
    userName = "당신",
    memo = "12mm. 안경이 먼저 닿는다. 콘티 수정 필요"
  } = props;

  const [play, setPlay] = useState(0);
  const c = PG_C;

  const res = result === "부러짐" || result === "닿음" ? result : "기권";
  const mm = Math.max(0, Math.min(PG_FULL_MM, Math.round(Number(left) || 0)));
  const heart = Math.max(60, Math.min(220, Math.round(Number(bpm) || 120)));
  const fl = pgFlavor(flavor);
  const stickH = fl.thin ? 4 : 7;
  const endPx = res === "닿음" ? 0 : Math.max(6, Math.round((mm / PG_FULL_MM) * PG_STICK_PX));
  const img = PG_IMG[res];
  const stamp = PG_STAMP[res];
  const who = String(by || "").trim();
  const sub = res === "닿음" ? "닿음" : res === "부러짐" ? (who ? who + " 쪽에서 부러짐" : "부러짐") : (who ? who + " 기권" : "기권");
  const anim = "pg-shrink-" + endPx;
  const css = PG_CSS + "@keyframes " + anim + " { from { width: " + PG_STICK_PX + "px; } to { width: " + endPx + "px; } }";
  const T = 2.4; // 다가가는 시간(초)

  return (
    <div style={{ width: "100%", maxWidth: 360, margin: "10px auto", fontFamily: PG_FONT, color: c.ink }}>
      <style>{css}</style>
      <div style={{ background: c.card, border: "2px solid " + c.ink, borderRadius: 14, boxShadow: "3px 3px 0 " + c.ink, overflow: "hidden" }}>

        {/* 결과 그림 (파일이 있을 때만) */}
        {img ? (
          <img src={img} alt="" style={{ display: "block", width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderBottom: "2px solid " + c.ink }} />
        ) : null}

        {/* 제목 줄 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 12px", background: c.pink, borderBottom: "2px solid " + c.ink }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: ".02em" }}>{String(date).replace("/", ".")}</span>
            <span style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{String(title)}</span>
          </div>
          <span style={{ flex: "none", fontSize: 11.5, fontWeight: 700, background: "#fff", border: "2px solid " + c.ink, borderRadius: 999, padding: "1px 8px" }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: fl.coat, marginRight: 5, verticalAlign: "0px" }} />
            {String(flavor)}
          </span>
        </div>

        {/* 무대: 두 사람 + 포키 */}
        <div key={play} style={{ position: "relative", padding: "26px 10px 14px", background: c.stage }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 64 }}>
            <PgFace face={userFace} name={userName} c={c} />
            <div style={{ position: "relative", height: stickH, width: endPx, flex: "none", animation: anim + " " + T + "s steps(9, end) .3s both", marginLeft: res === "닿음" ? -2 : 0, marginRight: res === "닿음" ? -2 : 0 }}>
              <div className={res === "부러짐" ? "pg-half-l" : ""} style={{ position: "absolute", left: 0, top: 0, width: "50%", height: "100%", background: "linear-gradient(90deg," + c.biscuit + " 0 22%," + fl.coat + " 22% 100%)", borderRadius: "3px 0 0 3px", animationDelay: T + 0.35 + "s" }}>
                {fl.dots ? <div style={{ position: "absolute", inset: 0, backgroundImage: PG_DOTS, opacity: .9 }} /> : null}
              </div>
              <div className={res === "부러짐" ? "pg-half-r" : ""} style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", background: fl.coat, borderRadius: "0 3px 3px 0", animationDelay: T + 0.35 + "s" }}>
                {fl.dots ? <div style={{ position: "absolute", inset: 0, backgroundImage: PG_DOTS, opacity: .9 }} /> : null}
              </div>
            </div>
            <div className={res === "기권" ? "pg-flee" : ""} style={{ animationDelay: T + 0.35 + "s" }}>
              <PgFace face={mashiroFace} name="真白" c={c} dark />
            </div>
          </div>

          {/* 판정 순간의 효과 */}
          {res === "부러짐" ? <div className="pg-pop" style={{ position: "absolute", left: 0, right: 0, top: 6, textAlign: "center", fontWeight: 900, fontSize: 15, color: c.red, animationDelay: T + 0.35 + "s" }}>ポキッ！</div> : null}
          {res === "닿음" ? <div className="pg-pop" style={{ position: "absolute", left: 0, right: 0, top: 2, textAlign: "center", fontSize: 22, color: c.red, animationDelay: T + 0.35 + "s" }}>♡</div> : null}

          {/* 도장 */}
          <div className="pg-stamp" style={{ position: "absolute", right: 12, bottom: 8, transform: "rotate(-10deg)", border: "2.5px solid " + stamp.color, color: stamp.color, borderRadius: 8, padding: "1px 7px", fontWeight: 900, fontSize: 15, background: "rgba(255,255,255,.75)", animationDelay: T + 0.6 + "s" }}>
            {stamp.label}
          </div>
        </div>

        {/* 자: 남은 거리 */}
        <div style={{ padding: "10px 14px 4px", borderTop: "2px dashed " + c.line }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: c.sub, fontWeight: 700 }}>남은 거리</span>
            <span style={{ fontSize: 20, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
              {mm}<span style={{ fontSize: 12, fontWeight: 700, marginLeft: 2 }}>mm</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: stamp.color, marginLeft: 8 }}>{sub}</span>
            </span>
          </div>
          <div style={{ position: "relative", height: 30 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 14, background: c.ruler, border: "1.5px solid " + c.ink, borderRadius: 3 }} />
            <div style={{ position: "absolute", left: 0, top: 3, height: 8, width: (mm / PG_FULL_MM) * 100 + "%", background: fl.coat, borderRadius: 2, marginLeft: 2 }} />
            {PG_TICKS.map((t) => (
              <div key={t} style={{ position: "absolute", left: (t / PG_FULL_MM) * 100 + "%", top: 0, width: 1, height: t % 50 === 0 ? 14 : 7, background: c.ink }} />
            ))}
            {[0, 50, 100].map((t) => (
              <div key={"n" + t} style={{ position: "absolute", left: (t / PG_FULL_MM) * 100 + "%", top: 16, fontSize: 9.5, color: c.sub, transform: t ? "translateX(-50%)" : "none" }}>{t}</div>
            ))}
            <div style={{ position: "absolute", left: "calc(" + (mm / PG_FULL_MM) * 100 + "% - 5px)", top: 14, width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "7px solid " + c.red }} />
          </div>
        </div>

        {/* 심박 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 8px" }}>
          <span style={{ fontSize: 12, color: c.sub, fontWeight: 700, flex: "none" }}>마시로 심박</span>
          <div style={{ flex: 1, minWidth: 0, height: 24 }}>
          <svg viewBox="0 0 120 24" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 24 }}>
            <polyline points="0,14 14,14 18,10 22,14 30,14 33,3 37,22 41,14 52,14 56,10 60,14 68,14 71,2 75,23 79,14 90,14 94,10 98,14 106,14 109,3 113,22 117,14 120,14" fill="none" stroke={c.red} strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          </div>
          <span style={{ flex: "none", fontWeight: 900, fontSize: 15, color: c.red, fontVariantNumeric: "tabular-nums" }}>
            <span className="pg-beat" style={{ display: "inline-block", marginRight: 3 }}>♥</span>{heart}
            <span style={{ fontSize: 10.5, fontWeight: 700, marginLeft: 2 }}>bpm</span>
          </span>
        </div>

        {/* 메모 */}
        {memo ? (
          <div style={{ padding: "4px 14px 14px" }}>
            <div style={{ background: c.note, border: "1.5px solid " + c.noteLine, borderRadius: 4, padding: "8px 10px", transform: "rotate(-1deg)", boxShadow: "2px 2px 0 rgba(0,0,0,.08)" }}>
              <div style={{ fontSize: 10.5, color: c.sub, fontWeight: 700, marginBottom: 2 }}>마시로 메모</div>
              <div style={{ fontSize: 13, lineHeight: 1.5, wordBreak: "keep-all" }}>{String(memo)}</div>
            </div>
          </div>
        ) : null}

        {/* 다시 보기 */}
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 12px 10px" }}>
          <button
            type="button"
            onClick={() => setPlay((n) => n + 1)}
            style={{ border: "2px solid " + c.ink, background: "#fff", color: c.ink, fontFamily: "inherit", fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 999, cursor: "pointer" }}
          >
            ↻ 다시 보기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── 미니게임 (mode="play") ───────── */

function PgPlay(p) {
  const c = PG_C;
  const flavor = p.flavor == null || p.flavor === "" ? "초코" : String(p.flavor);
  const date = p.date == null ? "11/11" : String(p.date);
  const title = p.title == null ? "ポッキーの日" : String(p.title);
  const userName = p.userName == null || p.userName === "" ? "당신" : String(p.userName);
  const phase = Math.max(1, Math.min(5, Math.round(Number(p.phase) || 3)));
  const dating = p.dating === true || p.dating === "true";
  const fl = pgFlavor(flavor);
  const wcap = fl.thin ? 75 : 100;

  const g = useRef(null);
  const hold = useRef(false);
  const timer = useRef(null);
  const lineRef = useRef(null);
  const [view, setView] = useState(null);
  const [round, setRound] = useState(1);
  const [best, setBest] = useState(null);
  const [copied, setCopied] = useState(0);
  const [pressing, setPressing] = useState(false);

  if (!g.current) g.current = pgFresh(phase, dating);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function finish(s, res, by, why) {
    s.st = "done"; s.res = res; s.by = by; s.why = why || "";
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    hold.current = false; setPressing(false);
    setBest((b) => (b == null ? Math.round(s.d) : Math.min(b, Math.round(s.d))));
    setView(pgSnap(s));
  }

  function step() {
    const s = g.current;
    if (!s || s.st !== "run") return;
    const K = PG_K, dt = 0.05, h = hold.current;
    if (h && !s.prev) { s.d -= K.tapBite; s.w += K.wTap; s.shock += K.tapShock / s.nerve; }
    s.prev = h;
    s.idle = h ? 0 : s.idle + dt;
    if (s.idle > K.idleAfter) s.awk += (K.idleRise / s.nerve) * dt;
    if (h) { s.d -= K.speed * dt; s.w += K.wUp * dt; s.shock += (K.shockUp / s.nerve) * dt; }
    else { s.w = Math.max(0, s.w - K.wDown * dt); s.shock = Math.max(0, s.shock - K.shockDown * dt); }
    s.nibFx = Math.max(0, s.nibFx - dt);
    s.nn -= dt;
    let nibbled = false;
    if (s.nn <= 0) {
      s.d -= 1.5 + Math.random() * 2; s.w += K.wNib; s.shock += K.nibShock / s.nerve;
      s.nn = s.nib[0] + Math.random() * (s.nib[1] - s.nib[0]); s.nibFx = 0.35; nibbled = true;
    }
    s.t += dt;
    s.heart = pgHeart(s);
    s.peak = Math.max(s.peak, s.heart);
    s.tilt = (Math.random() - 0.5) * s.w * 0.14;
    if (s.w >= wcap) return finish(s, "부러짐", nibbled || !h ? "마시로" : "나");
    if (!dating && s.d <= s.floor) { s.d = s.floor; return finish(s, "기권", "마시로", "한계"); }
    if (s.d <= 0) { s.d = 0; return finish(s, "닿음", ""); }
    if (s.heart >= K.cap) return finish(s, "기권", "마시로", "심박");
    setView(pgSnap(s));
  }

  function press(on) {
    const s = g.current;
    if (s.st === "done") return;
    hold.current = on; setPressing(on);
    if (on && s.st === "ready") {
      s.st = "run";
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(step, 50);
    }
  }

  function letGo() {
    const s = g.current;
    if (s.st === "run") finish(s, "기권", "나");
  }

  function retry() {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    hold.current = false; setPressing(false);
    g.current = pgFresh(phase, dating);
    setRound((r) => r + 1); setCopied(0);
    setView(pgSnap(g.current));
  }

  const v = view || pgSnap(g.current);
  const mm = Math.max(0, Math.round(v.d));
  const hRatio = Math.max(0, Math.min(1, (v.heart - PG_K.h0) / (PG_K.cap - PG_K.h0)));
  const wRatio = Math.max(0, Math.min(1, v.w / wcap));
  const done = v.st === "done";
  const stickPx = Math.max(0, Math.round((v.d / PG_K.d0) * PG_PLAY_PX));
  const verdict = !done ? "" : v.res === "닿음" ? "닿음" : v.res === "부러짐" ? (v.by === "나" ? "내 쪽에서 부러짐" : "마시로 쪽에서 부러짐") : (v.by === "나" ? "내가 놓음" : "마시로 기권");
  const line = done ? "!포키결과 남은 " + mm + "mm · " + verdict + " · " + flavor + " · " + round + "판째 · " + Math.max(1, Math.round(v.t)) + "초 · 심박 " + Math.round(v.peak) : "";
  const stamp = done ? PG_STAMP[v.res] : null;
  const img = done ? PG_IMG[v.res] : "";

  const mFace = done
    ? (v.res === "닿음" ? "(⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)" : v.res === "부러짐" ? "(゜ロ゜)" : v.by === "나" ? "(・_・;)" : "(>﹏<)💦")
    : hRatio < 0.3 ? "(・_・;)" : hRatio < 0.55 ? "(°ー°;)" : hRatio < 0.8 ? "(>_<;)" : "(⁄⁄>⁄﹏⁄<⁄⁄)";
  const uFace = done ? (v.res === "닿음" ? "(˶ᵔ ᵕ ᵔ˶)" : "(・ω・)") : pressing ? "(˘ε˘)" : "(・ω・)";
  const copy = () => {
    const fallback = () => {
      const el = lineRef.current;
      if (el) { el.focus(); el.select(); }
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      setCopied(ok ? 1 : 2);
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(line).then(() => setCopied(1), fallback);
      } else fallback();
    } catch (e) { fallback(); }
  };

  return (
    <div style={{ width: "100%", maxWidth: 360, margin: "10px auto", fontFamily: PG_FONT, color: c.ink, userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}>
      <style>{PG_CSS}</style>
      <div style={{ background: c.card, border: "2px solid " + c.ink, borderRadius: 14, boxShadow: "3px 3px 0 " + c.ink, overflow: "hidden" }}>

        {img ? <img src={img} alt="" style={{ display: "block", width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderBottom: "2px solid " + c.ink }} /> : null}

        {/* 제목 줄 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 12px", background: c.pink, borderBottom: "2px solid " + c.ink }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>{date.replace("/", ".")}</span>
            <span style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
          </div>
          <div style={{ display: "flex", gap: 5, flex: "none" }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, background: c.ink, color: "#fff", borderRadius: 999, padding: "2px 8px" }}>{round}판째</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, background: "#fff", border: "2px solid " + c.ink, borderRadius: 999, padding: "0 8px" }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: fl.coat, marginRight: 5 }} />{flavor}
            </span>
          </div>
        </div>

        {/* 무대 */}
        <div key={"r" + round} style={{ position: "relative", padding: "26px 10px 24px", background: c.stage }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 64 }}>
            <PgFace face={uFace} name={userName} c={c} />
            <div style={{ position: "relative", flex: "none", width: stickPx, height: fl.thin ? 4 : 7, marginLeft: v.res === "닿음" ? -2 : 0, marginRight: v.res === "닿음" ? -2 : 0, transform: done ? "none" : "rotate(" + v.tilt.toFixed(2) + "deg) translateY(" + (v.tilt * 0.4).toFixed(1) + "px)", transition: "width .05s linear" }}>
              <div className={done && v.res === "부러짐" ? "pg-half-l" : ""} style={{ position: "absolute", left: 0, top: 0, width: "50%", height: "100%", background: "linear-gradient(90deg," + c.biscuit + " 0 20%," + fl.coat + " 20% 100%)", borderRadius: "3px 0 0 3px" }}>
                {fl.dots ? <div style={{ position: "absolute", inset: 0, backgroundImage: PG_DOTS }} /> : null}
              </div>
              <div className={done && v.res === "부러짐" ? "pg-half-r" : ""} style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", background: fl.coat, borderRadius: "0 3px 3px 0" }}>
                {fl.dots ? <div style={{ position: "absolute", inset: 0, backgroundImage: PG_DOTS }} /> : null}
              </div>
            </div>
            <div className={done && v.res === "기권" && v.by !== "나" ? "pg-flee" : ""} style={{ position: "relative" }}>
              <PgFace face={mFace} name="真白" c={c} dark />
              {v.nibFx > 0 ? <span className="pg-pop" style={{ position: "absolute", left: -6, top: -18, fontSize: 11, fontWeight: 800, color: c.sub }}>ぽりっ</span> : null}
            </div>
          </div>
          {done && v.res === "부러짐" ? <div className="pg-pop" style={{ position: "absolute", left: 0, right: 0, top: 6, textAlign: "center", fontWeight: 900, fontSize: 15, color: c.red }}>ポキッ！</div> : null}
          {done && v.res === "닿음" ? <div className="pg-pop" style={{ position: "absolute", left: 0, right: 0, top: 2, textAlign: "center", fontSize: 22, color: c.red }}>♡</div> : null}
          {done ? (
            <div className="pg-stamp" style={{ position: "absolute", right: 12, bottom: 6, transform: "rotate(-10deg)", border: "2.5px solid " + stamp.color, color: stamp.color, borderRadius: 8, padding: "1px 7px", fontWeight: 900, fontSize: 15, background: "rgba(255,255,255,.75)" }}>{v.by === "나" && v.res === "기권" ? "放棄" : stamp.label}</div>
          ) : null}
        </div>

        {/* 거리 + 게이지 */}
        <div style={{ padding: "10px 14px 6px", borderTop: "2px dashed " + c.line }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: c.sub, fontWeight: 700 }}>남은 거리</span>
            <span style={{ fontSize: 22, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
              {mm}<span style={{ fontSize: 12, fontWeight: 700, marginLeft: 2 }}>mm</span>
              {done ? <span style={{ fontSize: 12, fontWeight: 700, color: stamp.color, marginLeft: 8 }}>{verdict}</span> : null}
            </span>
          </div>
          <PgBar label="포키 흔들림" ratio={wRatio} color={wRatio > 0.7 ? c.red : "#e3a548"} c={c} />
          <PgBar label={"마시로 심박 " + Math.round(v.heart)} ratio={hRatio} color={hRatio > 0.8 ? c.red : "#e98aa3"} c={c} beat={!done && v.st === "run"} />
        </div>

        {/* 조작 / 결과 */}
        {!done ? (
          <div style={{ padding: "6px 14px 14px" }}>
            <div style={{ fontSize: 11.5, color: c.sub, lineHeight: 1.5, marginBottom: 8, wordBreak: "keep-all" }}>
              {v.st === "ready" ? "꾹 누르면 먹어 들어가고, 떼면 멈춰요. 오래 누르면 포키가 흔들리다 부러지고, 서두르거나 머뭇거리면 마시로가 먼저 입을 떼요." : "흔들림이 차면 손을 떼고, 마시로 심박도 보면서."}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {} press(true); }}
                onPointerUp={() => press(false)}
                onPointerCancel={() => press(false)}
                onLostPointerCapture={() => press(false)}
                onContextMenu={(e) => e.preventDefault()}
                style={{ flex: 1, height: 54, border: "2px solid " + c.ink, borderRadius: 999, background: pressing ? c.red : c.pink, color: pressing ? "#fff" : c.ink, fontFamily: "inherit", fontSize: 15, fontWeight: 900, cursor: "pointer", touchAction: "none", boxShadow: pressing ? "none" : "0 3px 0 " + c.ink, transform: pressing ? "translateY(3px)" : "none" }}
              >
                {v.st === "ready" ? "꾹 눌러서 시작" : pressing ? "냠…" : "꾹 눌러서 먹기"}
              </button>
              <button type="button" onClick={letGo} disabled={v.st !== "run"} style={{ flex: "none", width: 64, border: "2px solid " + c.ink, borderRadius: 999, background: "#fff", color: c.ink, fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: v.st === "run" ? "pointer" : "default", opacity: v.st === "run" ? 1 : 0.4 }}>놓기</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "6px 14px 14px" }}>
            <div style={{ fontSize: 11.5, color: c.sub, marginBottom: 5, wordBreak: "keep-all" }}>이 문구를 그대로 보내면 이야기가 이어져요{best != null ? " · 이번 최고 " + best + "mm" : ""}</div>
            <textarea ref={lineRef} readOnly value={line} rows={2} onFocus={(e) => e.target.select()} style={{ width: "100%", boxSizing: "border-box", resize: "none", border: "2px solid " + c.ink, borderRadius: 8, background: c.note, color: c.ink, fontFamily: "inherit", fontSize: 13, lineHeight: 1.45, padding: "6px 8px", userSelect: "text", WebkitUserSelect: "text" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
              <button type="button" onClick={copy} style={{ border: "2px solid " + c.ink, background: c.ink, color: "#fff", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, padding: "4px 14px", borderRadius: 999, cursor: "pointer" }}>복사</button>
              <button type="button" onClick={retry} style={{ border: "2px solid " + c.ink, background: "#fff", color: c.ink, fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, padding: "4px 12px", borderRadius: 999, cursor: "pointer" }}>↻ 다시 하기</button>
              <span style={{ fontSize: 11.5, color: copied === 1 ? c.red : c.sub, fontWeight: 700 }}>{copied === 1 ? "복사됨" : copied === 2 ? "길게 눌러 복사해 주세요" : ""}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PgBar({ label, ratio, color, c, beat }) {
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: c.sub, marginBottom: 3 }}>
        <span>{label}</span>
        {beat ? <span className="pg-beat" style={{ color: c.red, display: "inline-block" }}>♥</span> : null}
      </div>
      <div style={{ height: 9, border: "1.5px solid " + c.ink, borderRadius: 999, background: "#fff", overflow: "hidden" }}>
        <div style={{ height: "100%", width: Math.round(ratio * 100) + "%", background: color, transition: "width .05s linear" }} />
      </div>
    </div>
  );
}

function pgFresh(phase, dating) {
  const r = Math.random;
  const nib = PG_NIB[dating ? 5 : phase];
  return {
    st: "ready", d: PG_K.d0, w: 0, shock: 0, awk: 0, t: 0, idle: 0, prev: false,
    floor: dating ? 0 : PG_FLOOR[phase] + r() * (phase <= 2 ? 15 : 10),
    nerve: (dating ? 1.6 : PG_NERVE[phase]) * (0.92 + r() * 0.16),
    nib: nib, nn: nib[0] + r() * (nib[1] - nib[0]),
    heart: PG_K.h0, peak: PG_K.h0, tilt: 0, nibFx: 0, res: null, by: "", why: ""
  };
}

function pgHeart(s) {
  const near = Math.max(0, 1 - s.d / PG_K.d0);
  return PG_K.h0 + (PG_K.bMax / s.nerve) * near * near + s.shock + (PG_K.tRise / s.nerve) * s.t + s.awk;
}

function pgSnap(s) {
  return { st: s.st, d: s.d, w: s.w, heart: s.heart, peak: s.peak, t: s.t, tilt: s.tilt, nibFx: s.nibFx, res: s.res, by: s.by, why: s.why };
}

// 게임 수치 (시뮬레이션으로 맞춤: 신중하게 하면 마시로의 한계 근처, 서두르면 60mm대에서 부러짐, 머뭇거리면 100mm대에서 기권)
const PG_K = {
  d0: 120, speed: 18, tapBite: 0.8,
  wUp: 32, wDown: 40, wTap: 4, wNib: 5,
  h0: 92, cap: 175, bMax: 70, shockUp: 24, shockDown: 24, tapShock: 2, nibShock: 3, tRise: 2.4,
  idleAfter: 1.2, idleRise: 7
};
// 관계 단계별 마시로가 버티는 가장 가까운 거리(mm). 판마다 0~10mm(단계 1~2는 0~15mm) 더 멀어질 수 있다. 연인이면 0.
const PG_FLOOR = { 1: 70, 2: 50, 3: 15, 4: 8, 5: 3 };
const PG_NERVE = { 1: 0.8, 2: 0.95, 3: 1.1, 4: 1.25, 5: 1.4 };
const PG_NIB = { 1: [1.6, 2.6], 2: [1.4, 2.3], 3: [1.1, 2.0], 4: [1.0, 1.8], 5: [0.9, 1.6] };
const PG_PLAY_PX = 160;

/* ───────── 보조 요소 ───────── */

function PgFace({ face, name, c, dark }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: "none", width: 86 }}>
      <div style={{ background: dark ? c.ink : "#fff", color: dark ? "#fff" : c.ink, border: "2px solid " + c.ink, borderRadius: 999, padding: "4px 7px", fontSize: 12, whiteSpace: "nowrap", maxWidth: 86, overflow: "hidden", textOverflow: "clip", textAlign: "center" }}>
        {String(face || "")}
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: c.sub, maxWidth: 86, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{String(name || "")}</div>
    </div>
  );
}

function pgFlavor(name) {
  const s = String(name || "");
  if (s.indexOf("딸기") >= 0 || s.indexOf("いちご") >= 0) return { coat: "#f2a3b8" };
  if (s.indexOf("말차") >= 0 || s.indexOf("抹茶") >= 0) return { coat: "#9dbe86" };
  if (s.indexOf("아몬드") >= 0) return { coat: "#6b4632", dots: true };
  if (s.indexOf("극세") >= 0) return { coat: "#4e3128", thin: true };
  if (s.indexOf("화이트") >= 0) return { coat: "#f3eadb" };
  return { coat: "#5b3a2c" };
}

const PG_FULL_MM = 135;
const PG_STICK_PX = 140;
const PG_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130];
const PG_DOTS = "radial-gradient(circle at 30% 40%, #e8cfa6 0 1.2px, transparent 1.5px), radial-gradient(circle at 75% 60%, #e8cfa6 0 1.2px, transparent 1.5px)";

const PG_STAMP = {
  기권: { label: "棄権", color: "#5a6fa8" },
  부러짐: { label: "ポキッ", color: "#d9566e" },
  닿음: { label: "♡ 成功", color: "#e0577f" }
};

const PG_FONT = '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans JP", sans-serif';

const PG_C = {
  ink: "#3b3236",
  card: "#fffaf5",
  stage: "#fdeef0",
  pink: "#f9c9d4",
  red: "#d9566e",
  sub: "#8a7c78",
  line: "#ead9d4",
  ruler: "#fff3d6",
  biscuit: "#e9c48c",
  note: "#fff7c7",
  noteLine: "#efe0a0"
};

const PG_CSS = `
.pg-half-l { animation: pg-break-l .5s ease-out both; transform-origin: right center; }
.pg-half-r { animation: pg-break-r .5s ease-out both; transform-origin: left center; }
.pg-flee { animation: pg-flee .45s ease-out both; }
.pg-pop { animation: pg-pop .6s ease-out both; }
.pg-stamp { animation: pg-stamp .35s cubic-bezier(.2,1.6,.4,1) both; }
.pg-beat { animation: pg-beat .7s ease-in-out infinite; }
@keyframes pg-break-l { from { transform: none; } to { transform: translate(-4px, 5px) rotate(-14deg); } }
@keyframes pg-break-r { from { transform: none; } to { transform: translate(4px, 5px) rotate(14deg); } }
@keyframes pg-flee { from { transform: none; } to { transform: translateX(18px) rotate(10deg); } }
@keyframes pg-pop { from { opacity: 0; transform: translateY(6px) scale(.7); } to { opacity: 1; transform: none; } }
@keyframes pg-stamp { from { opacity: 0; transform: rotate(-10deg) scale(1.8); } to { opacity: 1; transform: rotate(-10deg) scale(1); } }
@keyframes pg-beat { 0%, 100% { transform: scale(1); } 40% { transform: scale(1.25); } }
@media (prefers-reduced-motion: reduce) { .pg-beat { animation: none; } }
`;
