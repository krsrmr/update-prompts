// 필요 훅: useState, useRef, useEffect (react)
// [포키] 포키데이 포키 게임 위젯 — UI 개편판 (게임 규칙·수치는 앞 판과 같음)
//   mode="play"   : 직접 하는 미니게임. 꾹 누르면 먹어 들어가고, 떼면 멈춘다.
//                   끝나면 '!포키결과 …' 문구가 나오고, 유저가 그 문구를 보내면 AI가 그 결과대로 장면을 쓴다.
//                   값: date, flavor, phase(1~5), dating(true/false), userName
//   mode="result" : 결과 카드. 다가가는 장면을 다시 재생한 뒤 결과를 보여 준다. (mode를 안 쓰면 이쪽)
//                   값: date, flavor, left(남은 mm), result(기권/부러짐/닿음), by, bpm, userName, memo
// 결과 연출: SD가 먼저 튀어나오고 → 도장(成功·失敗·棄権)이 쿵 찍힌다.
// SD 그림: 정사각 투명 SD 3장. 그림을 올린 뒤 아래 PG_SD의 따옴표 안에 주소를 넣는다.
//   비워 두면 코드로 그린 SD가 대신 나온다.  성공 = 닿음 / 실패 = 부러짐 / 기권 = 마시로 기권·내가 놓음
//   예) 성공: "https://krsrmr.github.io/mayumaro/img/pocky-sd-success.webp"

const PG_SD = {
  성공: "",
  실패: "",
  기권: ""
};

function PockyGame(props = {}) {
  const p = props || {};
  return p.mode === "play" ? <PgPlay {...p} /> : <PgResult {...p} />;
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
  const done = v.st === "done";
  const mm = Math.max(0, Math.round(v.d));
  const hRatio = pgClamp((v.heart - PG_K.h0) / (PG_K.cap - PG_K.h0));
  const wRatio = pgClamp(v.w / wcap);
  const verdict = !done ? "" : v.res === "닿음" ? "닿음" : v.res === "부러짐" ? (v.by === "나" ? "내 쪽에서 부러짐" : "마시로 쪽에서 부러짐") : (v.by === "나" ? "내가 놓음" : "마시로 기권");
  const line = done ? "!포키결과 남은 " + mm + "mm · " + verdict + " · " + flavor + " · " + round + "판째 · " + Math.max(1, Math.round(v.t)) + "초 · 심박 " + Math.round(v.peak) : "";
  const kind = done ? pgKind(v.res) : "";

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
    <PgShell title={title} date={date} flavor={flavor} fl={fl} shake={done}>
      <PgStage key={"r" + round} v={v} fl={fl} date={date} userName={userName} pressing={pressing} hRatio={hRatio} wRatio={wRatio} caption={round + "本目"} />

      {!done ? (
        <div style={{ padding: "12px 14px 14px" }}>
          <PgMeters wRatio={wRatio} heart={v.heart} hRatio={hRatio} run={v.st === "run"} />
          <div style={{ height: 36, overflow: "hidden", fontSize: 11.5, color: c.sub, lineHeight: 1.5, margin: "2px 2px 10px", wordBreak: "keep-all" }}>
            {v.st === "ready"
              ? "꾹 누르면 먹어 들어가고, 떼면 멈춰요. 오래 누르면 포키가 흔들리다 부러지고, 서두르거나 머뭇거리면 마시로가 먼저 입을 떼요."
              : wRatio > 0.7 ? "흔들려요! 손을 떼요!" : hRatio > 0.8 ? "마시로가 한계예요… 살살." : "흔들림이 차기 전에 떼고, 마시로 심박도 같이 보면서."}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
            <button
              type="button"
              className={v.st === "ready" ? "pg-ready" : ""}
              onPointerDown={(e) => { e.preventDefault(); try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {} press(true); }}
              onPointerUp={() => press(false)}
              onPointerCancel={() => press(false)}
              onLostPointerCapture={() => press(false)}
              onContextMenu={(e) => e.preventDefault()}
              style={{ flex: 1, height: 56, border: "2px solid " + c.ink, borderRadius: 999, background: pressing ? c.red : c.pink, color: pressing ? "#fff" : c.ink, fontFamily: "inherit", fontSize: 15.5, fontWeight: 900, letterSpacing: ".02em", cursor: "pointer", touchAction: "none", boxShadow: pressing ? "0 0 0 " + c.ink : "0 4px 0 " + c.ink, transform: pressing ? "translateY(4px) scale(.98)" : "none", transition: "transform .06s, box-shadow .06s, background .1s" }}
            >
              {v.st === "ready" ? "꾹 눌러서 시작" : pressing ? "もぐもぐ…" : "꾹 눌러서 먹기"}
            </button>
            <button type="button" onClick={letGo} disabled={v.st !== "run"} style={{ flex: "none", width: 66, border: "2px solid " + c.ink, borderRadius: 999, background: "#fff", color: c.ink, fontFamily: "inherit", fontSize: 12.5, fontWeight: 800, cursor: v.st === "run" ? "pointer" : "default", opacity: v.st === "run" ? 1 : 0.35, boxShadow: v.st === "run" ? "0 3px 0 " + c.ink : "none" }}>놓기</button>
          </div>
        </div>
      ) : (
        <div className="pg-up" style={{ padding: "12px 14px 14px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
              {mm}<span style={{ fontSize: 13, fontWeight: 800, marginLeft: 2 }}>mm</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: PG_STAMP[kind].color, marginLeft: 8 }}>{verdict}</span>
            </span>
            {best != null && round > 1 ? <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: c.ink, borderRadius: 999, padding: "2px 8px" }}>최고 {best}mm</span> : null}
          </div>
          <div style={{ fontSize: 11.5, color: c.sub, marginBottom: 5, wordBreak: "keep-all" }}>이 문구를 그대로 보내면 이야기가 이어져요</div>
          <textarea ref={lineRef} readOnly value={line} rows={2} onFocus={(e) => e.target.select()} style={{ width: "100%", boxSizing: "border-box", resize: "none", border: "2px dashed " + c.ink, borderRadius: 10, background: c.note, color: c.ink, fontFamily: "inherit", fontSize: 13, lineHeight: 1.45, padding: "7px 9px", userSelect: "text", WebkitUserSelect: "text", outline: "none" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 9, alignItems: "center" }}>
            <button type="button" onClick={copy} style={{ border: "2px solid " + c.ink, background: c.ink, color: "#fff", fontFamily: "inherit", fontSize: 12.5, fontWeight: 800, padding: "5px 16px", borderRadius: 999, cursor: "pointer", boxShadow: "0 3px 0 " + c.red }}>복사</button>
            <button type="button" onClick={retry} style={{ border: "2px solid " + c.ink, background: "#fff", color: c.ink, fontFamily: "inherit", fontSize: 12.5, fontWeight: 800, padding: "5px 13px", borderRadius: 999, cursor: "pointer", boxShadow: "0 3px 0 " + c.ink }}>↻ 다시 하기</button>
            <span className={copied ? "pg-pop-in" : ""} key={"cp" + copied} style={{ fontSize: 11.5, color: copied === 1 ? c.red : c.sub, fontWeight: 800 }}>{copied === 1 ? "복사됨 ✓" : copied === 2 ? "길게 눌러 복사해 주세요" : ""}</span>
          </div>
        </div>
      )}
    </PgShell>
  );
}

/* ───────── 결과 카드 (mode="result") ───────── */

function PgResult(p) {
  const c = PG_C;
  const flavor = p.flavor == null || p.flavor === "" ? "초코" : String(p.flavor);
  const date = p.date == null ? "11/11" : String(p.date);
  const title = p.title == null ? "ポッキーの日" : String(p.title);
  const userName = p.userName == null || p.userName === "" ? "당신" : String(p.userName);
  const res = p.result === "부러짐" || p.result === "닿음" ? p.result : "기권";
  const byRaw = String(p.by == null ? "마시로" : p.by).trim();
  const by = res === "닿음" ? "" : (byRaw && byRaw !== "마시로" && byRaw !== "真白" ? "나" : "마시로");
  const mm = res === "닿음" ? 0 : Math.max(0, Math.min(PG_K.d0, Math.round(Number(p.left) || 0)));
  const bpm = Math.max(90, Math.min(220, Math.round(Number(p.bpm) || 150)));
  const memo = p.memo == null ? "" : String(p.memo);
  const fl = pgFlavor(flavor);
  const wcap = fl.thin ? 75 : 100;

  const [rep, setRep] = useState(0);
  const [v, setV] = useState(null);

  useEffect(() => {
    const T = 2.6;
    let t = 0, nibT = 0.45;
    const s = { st: "run", d: PG_K.d0, w: 0, heart: PG_K.h0, peak: PG_K.h0, t: 0, tilt: 0, nibFx: 0, res: null, by: "", eat: false };
    setV({ ...s });
    const id = setInterval(() => {
      t += 0.05;
      const k = Math.min(1, t / T);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const raw = PG_K.d0 - (PG_K.d0 - mm) * e;
      s.d = k >= 1 ? mm : Math.max(mm, Math.ceil(raw / 3) * 3);
      s.heart = PG_K.h0 + (bpm - PG_K.h0) * Math.pow(k, 1.4);
      s.peak = s.heart;
      s.w = res === "부러짐" ? wcap * Math.pow(k, 2.2) : Math.max(0, 22 + 18 * Math.sin(t * 5)) * k;
      s.tilt = (Math.random() - 0.5) * s.w * 0.14;
      s.eat = Math.sin(t * 7) > 0.2;
      s.nibFx = Math.max(0, s.nibFx - 0.05);
      nibT -= 0.05;
      if (nibT <= 0) { s.nibFx = 0.35; nibT = 0.5 + Math.random() * 0.4; }
      s.t = t;
      if (k >= 1) { s.st = "done"; s.res = res; s.by = by; s.tilt = 0; clearInterval(id); }
      setV({ ...s });
    }, 50);
    return () => clearInterval(id);
  }, [rep, mm, res, by, bpm, wcap]);

  const vv = v || { st: "run", d: PG_K.d0, w: 0, heart: PG_K.h0, t: 0, tilt: 0, nibFx: 0, res: null, by: "" };
  const done = vv.st === "done";
  const hRatio = pgClamp((vv.heart - PG_K.h0) / (PG_K.cap - PG_K.h0));
  const wRatio = pgClamp(vv.w / wcap);
  const kind = pgKind(res);
  const verdict = res === "닿음" ? "닿음" : res === "부러짐" ? (by === "나" ? userName + " 쪽에서 부러짐" : "마시로 쪽에서 부러짐") : (by === "나" ? userName + " 놓음" : "마시로 기권");
  const markerTo = (mm / PG_K.d0) * 100;

  return (
    <PgShell title={title} date={date} flavor={flavor} fl={fl} shake={done}>
      <PgStage key={"p" + rep} v={vv} fl={fl} date={date} userName={userName} pressing={!done && vv.eat} hRatio={hRatio} wRatio={wRatio} caption="取材記録" />

      {!done ? (
        <div style={{ padding: "12px 14px 14px" }}>
          <PgMeters wRatio={wRatio} heart={vv.heart} hRatio={hRatio} run />
        </div>
      ) : (
        <div style={{ padding: "12px 14px 12px" }}>
          <div className="pg-up" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: c.sub, fontWeight: 800 }}>남은 거리</span>
            <span style={{ fontSize: 24, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
              {mm}<span style={{ fontSize: 13, fontWeight: 800, marginLeft: 2 }}>mm</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: PG_STAMP[kind].color, marginLeft: 8 }}>{verdict}</span>
            </span>
          </div>

          {/* 자 */}
          <div className="pg-up" style={{ position: "relative", height: 30, marginBottom: 6 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 14, background: c.ruler, border: "1.5px solid " + c.ink, borderRadius: 3 }} />
            <div className="pg-grow" style={{ position: "absolute", left: 2, top: 3, height: 8, width: "calc(" + markerTo + "% - 2px)", background: fl.coat, borderRadius: 2, transformOrigin: "left center" }} />
            {PG_TICKS.map((t) => (
              <div key={t} style={{ position: "absolute", left: (t / PG_K.d0) * 100 + "%", top: 0, width: 1, height: t % 50 === 0 ? 14 : 7, background: c.ink }} />
            ))}
            {[0, 50, 100].map((t) => (
              <div key={"n" + t} style={{ position: "absolute", left: (t / PG_K.d0) * 100 + "%", top: 16, fontSize: 9.5, color: c.sub, transform: t ? "translateX(-50%)" : "none" }}>{t}</div>
            ))}
            <div className="pg-marker" style={{ position: "absolute", "--to": "calc(" + markerTo + "% - 5px)", left: "calc(" + markerTo + "% - 5px)", top: 14, width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "7px solid " + c.red }} />
          </div>

          {/* 심박 */}
          <div className="pg-up" style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 10px" }}>
            <span style={{ fontSize: 11.5, color: c.sub, fontWeight: 800, flex: "none", width: 54 }}>최고 심박</span>
            <div style={{ flex: 1, minWidth: 0 }}><PgEcg bpm={bpm} ratio={hRatio} run /></div>
            <PgBpm bpm={bpm} />
          </div>

          {memo ? (
            <div className="pg-note" style={{ background: c.note, border: "1.5px solid " + c.noteLine, borderRadius: 4, padding: "9px 11px 10px", boxShadow: "2px 3px 0 rgba(59,50,54,.12)", position: "relative", marginTop: 4 }}>
              <div style={{ position: "absolute", left: "50%", top: -7, width: 46, height: 13, marginLeft: -23, background: "rgba(249,201,212,.85)", transform: "rotate(-3deg)" }} />
              <div style={{ fontSize: 10.5, color: c.sub, fontWeight: 800, marginBottom: 2 }}>마시로 메모</div>
              <div style={{ fontSize: 13, lineHeight: 1.5, wordBreak: "keep-all" }}>{memo}</div>
            </div>
          ) : null}

          <div className="pg-up" style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button type="button" onClick={() => setRep((n) => n + 1)} style={{ border: "2px solid " + c.ink, background: "#fff", color: c.ink, fontFamily: "inherit", fontSize: 12, fontWeight: 800, padding: "3px 12px", borderRadius: 999, cursor: "pointer", boxShadow: "0 3px 0 " + c.ink }}>↻ 다시 보기</button>
          </div>
        </div>
      )}
    </PgShell>
  );
}

/* ───────── 공통 틀 ───────── */

function PgShell({ title, date, flavor, fl, shake, children }) {
  const c = PG_C;
  return (
    <div className="pg-in" style={{ width: "100%", maxWidth: 360, margin: "10px auto", fontFamily: PG_FONT, color: c.ink, userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}>
      <style>{PG_CSS}</style>
      <div className={shake ? "pg-shake" : ""} style={{ background: c.card, border: "2px solid " + c.ink, borderRadius: 16, boxShadow: "4px 4px 0 " + c.ink, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 12px", background: c.pink, borderBottom: "2px solid " + c.ink, backgroundImage: "radial-gradient(rgba(255,255,255,.55) 1.2px, transparent 1.6px)", backgroundSize: "9px 9px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
            <PgStickIcon coat={fl.coat} />
            <span style={{ fontWeight: 900, fontSize: 15, background: "#fff", border: "2px solid " + c.ink, borderRadius: 7, padding: "0 6px", lineHeight: "20px", flex: "none" }}>{String(date).replace("/", ".")}</span>
            <span style={{ fontWeight: 900, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
          </div>
          <span style={{ flex: "none", fontSize: 11.5, fontWeight: 800, background: "#fff", border: "2px solid " + c.ink, borderRadius: 999, padding: "0 9px", lineHeight: "19px" }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: fl.coat, marginRight: 5, border: "1px solid " + c.ink }} />{flavor}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ───────── 무대 (만화 컷) ───────── */

function PgStage({ v, fl, date, userName, pressing, hRatio, wRatio, caption }) {
  const c = PG_C;
  const done = v.st === "done";
  const running = v.st === "run";
  const mm = Math.max(0, Math.round(v.d));
  const near = pgClamp(1 - v.d / PG_K.d0);
  const sh = fl.thin ? 4 : 7;
  const headPx = 64;
  const thick = (sh * 100) / headPx;
  const stickPx = Math.max(0, Math.round((v.d / PG_K.d0) * PG_STAGE_PX));
  const kiss = done && v.res === "닿음";
  const broke = done && v.res === "부러짐";
  const mFled = done && v.res === "기권" && v.by !== "나";
  const uLeft = done && v.res === "기권" && v.by === "나";

  const mMood = done
    ? (kiss ? "love" : broke ? "shock" : mFled ? "flinch" : "nervous")
    : hRatio < 0.3 ? "calm" : hRatio < 0.6 ? "nervous" : hRatio < 0.85 ? "panic" : "steam";
  const uMood = done ? (kiss ? "love" : broke ? "shock" : "idle") : pressing ? "eat" : "idle";
  const tint = pgMix([253, 243, 245], [255, 208, 220], hRatio * 0.9 + (kiss ? 0.3 : 0));
  const focus = done ? 0 : Math.min(1, near * near * 1.15) * 0.85;
  const beatDur = (60 / Math.max(60, v.heart)).toFixed(2) + "s";

  return (
    <div style={{ position: "relative", height: 162, overflow: "hidden", background: "rgb(" + tint.join(",") + ")", borderBottom: "2px solid " + c.ink, transition: "background .2s" }}>
      {/* 스크린톤 */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(59,50,54,.11) 1px, transparent 1.4px)", backgroundSize: "6px 6px" }} />
      {/* 집중선 */}
      <div className={running ? "pg-focus" : ""} style={{ position: "absolute", left: -60, right: -60, top: -40, height: 250, opacity: focus, backgroundImage: "repeating-conic-gradient(from 0deg at 50% 50%, rgba(59,50,54,.2) 0deg 1.5deg, transparent 1.5deg 7deg)", WebkitMaskImage: "radial-gradient(ellipse 50% 45% at 50% 50%, transparent 45%, #000 85%)", maskImage: "radial-gradient(ellipse 50% 45% at 50% 50%, transparent 45%, #000 85%)", transition: "opacity .2s" }} />

      {/* 말칸 */}
      <div style={{ position: "absolute", left: 10, top: 9, fontSize: 11, fontWeight: 900, background: "#fff", border: "2px solid " + c.ink, padding: "1px 7px", letterSpacing: ".04em" }}>{caption}</div>
      <div style={{ position: "absolute", right: 10, top: 9, fontSize: 11, fontWeight: 800, background: c.ink, color: "#fff", padding: "2px 8px", borderRadius: 3, fontVariantNumeric: "tabular-nums" }}>
        残り <span style={{ fontSize: 14, fontWeight: 900 }}>{mm}</span>mm
      </div>

      {/* 두 사람 + 포키 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 50, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <div className={uLeft ? "pg-back-l" : pressing && !done ? "pg-eat" : ""} style={{ width: headPx, flex: "none", textAlign: "center", transformOrigin: "50% 80%" }}>
          <PgUserHead mood={uMood} stick={!done || broke} coat={fl.coat} thick={thick} size={headPx} />
          <div style={{ fontSize: 10.5, fontWeight: 800, color: c.sub, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
        </div>

        <div style={{ position: "relative", flex: "none", width: stickPx, height: sh, marginTop: headPx * 0.74 - sh / 2, marginLeft: kiss ? -8 : 0, marginRight: kiss ? -8 : 0, transform: done ? "none" : "rotate(" + (v.tilt || 0).toFixed(2) + "deg) translateY(" + ((v.tilt || 0) * 0.4).toFixed(1) + "px)", transition: "width .05s linear" }}>
          <div className={broke ? "pg-half-l" : ""} style={{ position: "absolute", left: 0, top: 0, width: "50%", height: "100%", background: fl.coat, border: "1.2px solid " + c.ink, borderRight: 0, boxSizing: "border-box" }}>
            {fl.dots ? <div style={{ position: "absolute", inset: 0, backgroundImage: PG_DOTS }} /> : null}
          </div>
          <div className={broke ? "pg-half-r" : ""} style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", background: fl.coat, border: "1.2px solid " + c.ink, borderLeft: 0, boxSizing: "border-box" }}>
            {fl.dots ? <div style={{ position: "absolute", inset: 0, backgroundImage: PG_DOTS }} /> : null}
          </div>
          {broke ? PG_CRUMBS.map((q, i) => (
            <span key={i} className="pg-crumb" style={{ position: "absolute", left: "50%", top: 0, width: q[2], height: q[2], marginLeft: -q[2] / 2, borderRadius: "50%", background: i % 2 ? fl.coat : c.biscuit, border: "1px solid " + c.ink, "--dx": q[0] + "px", "--dy": q[1] + "px" }} />
          )) : null}
        </div>

        <div className={mFled ? "pg-flee" : v.nibFx > 0 && !done ? "pg-nib" : ""} style={{ width: headPx, flex: "none", textAlign: "center", position: "relative", transformOrigin: "50% 80%" }}>
          <PgMashiroHead mood={mMood} stick={!done || broke} coat={fl.coat} thick={thick} size={headPx} />
          <div style={{ fontSize: 10.5, fontWeight: 800, color: c.sub, marginTop: 2 }}>真白</div>
        </div>
      </div>

      {/* 효과음 */}
      {pressing && !done ? <div className="pg-bobtext" style={{ position: "absolute", left: 10, top: 42, writingMode: "vertical-rl", fontSize: 13, fontWeight: 900, color: c.ink, letterSpacing: "-.05em" }}>もぐもぐ</div> : null}
      {v.nibFx > 0 && !done ? <div className="pg-sfx" style={{ position: "absolute", left: "calc(50% + 62px)", top: 38, fontSize: 12.5, fontWeight: 900, color: c.sub }}>ぽりっ</div> : null}
      {!done && hRatio > 0.6 ? <div className="pg-doki" style={{ position: "absolute", right: 9, top: 42, writingMode: "vertical-rl", fontSize: hRatio > 0.85 ? 15 : 13, fontWeight: 900, color: c.red, letterSpacing: "-.05em", animationDuration: beatDur }}>ドキドキ</div> : null}
      {!done && wRatio > 0.7 ? <div className="pg-wob" style={{ position: "absolute", left: "calc(50% - 18px)", top: 104, fontSize: 13, fontWeight: 900, color: c.red }}>ぐらっ</div> : null}

      {done ? <PgReveal res={v.res} by={v.by} date={date} /> : null}
    </div>
  );
}

/* ───────── 결과 연출: SD → 도장 ───────── */

function PgReveal({ res, by, date }) {
  const kind = pgKind(res);
  const st = PG_STAMP[kind];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="pg-dim" style={{ position: "absolute", inset: 0, background: "rgba(255,250,246,.74)" }} />
      <div className="pg-rays" style={{ position: "absolute", left: "50%", top: "50%", width: 360, height: 360, marginLeft: -220, marginTop: -180, backgroundImage: "repeating-conic-gradient(from 0deg, " + st.glow + " 0deg 8deg, transparent 8deg 20deg)", WebkitMaskImage: "radial-gradient(circle, #000 18%, transparent 62%)", maskImage: "radial-gradient(circle, #000 18%, transparent 62%)" }} />

      {/* SD */}
      <div className="pg-sd" style={{ position: "absolute", left: "50%", top: 16, width: 112, height: 112, marginLeft: -100 }}>
        <PgSD kind={kind} />
      </div>
      <div className="pg-shadow" style={{ position: "absolute", left: "50%", top: 128, width: 70, height: 9, marginLeft: -79, borderRadius: "50%", background: "rgba(59,50,54,.16)" }} />

      {/* 기권: 땀방울 / 성공: 하트 */}
      {kind === "기권" ? PG_DROPS.map((q, i) => (
        <svg key={i} className="pg-drip" viewBox="0 0 10 14" width="9" height="13" style={{ position: "absolute", left: "calc(50% - 44px)", top: 30, "--dx": q[0] + "px", "--dy": q[1] + "px", animationDelay: 0.25 + i * 0.08 + "s" }}>
          <path d="M5 1 Q9.5 8 5 13 Q0.5 8 5 1 Z" fill="#a8dcf5" stroke="#3b3236" strokeWidth="1.1" />
        </svg>
      )) : null}

      {/* 도장 */}
      <div style={{ position: "absolute", left: "50%", top: 36, marginLeft: 14 }}>
        <div className="pg-slam" style={{ position: "relative", width: 88, height: 88 }}>
          <div className="pg-burst" style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "3px solid " + st.color }} />
          <PgStamp label={st.label} color={st.color} sub={String(date).replace("/", ".")} />
        </div>
        {kind === "성공" ? PG_HEARTS.map((q, i) => (
          <span key={i} className="pg-heartp" style={{ position: "absolute", left: 38, top: 36, fontSize: q[3], color: i % 2 ? "#f0607a" : "#f6a0b6", "--dx": q[0] + "px", "--dy": q[1] + "px", "--r": q[2] + "deg", animationDelay: 0.95 + i * 0.04 + "s" }}>♥</span>
        )) : null}
      </div>
    </div>
  );
}

function PgSD({ kind }) {
  const src = PG_SD[kind];
  if (src) return <img src={src} alt="" draggable={false} style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }} />;
  return <PgChibi kind={kind} />;
}

function PgStamp({ label, color, sub }) {
  return (
    <div style={{ position: "relative", width: 88, height: 88, borderRadius: "50%", border: "3.5px solid " + color, color: color, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.55)", boxShadow: "inset 0 0 0 4px rgba(255,255,255,.6), inset 0 0 0 5.5px " + color, boxSizing: "border-box" }}>
      <span style={{ fontFamily: PG_SERIF, fontWeight: 900, fontSize: 27, lineHeight: 1, letterSpacing: "-.02em" }}>{label}</span>
      <span style={{ fontSize: 9.5, fontWeight: 900, marginTop: 4, paddingTop: 2, borderTop: "1.5px solid " + color, letterSpacing: ".1em", fontVariantNumeric: "tabular-nums" }}>{sub}</span>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", backgroundImage: PG_INK }} />
    </div>
  );
}

/* ───────── 게이지 ───────── */

function PgMeters({ wRatio, heart, hRatio, run }) {
  const c = PG_C;
  const n = 10;
  const on = Math.round(wRatio * n);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "58px 1fr", columnGap: 8, rowGap: 9, alignItems: "center", marginBottom: 6 }}>
      <span style={{ fontSize: 11.5, fontWeight: 800, color: c.sub }}>흔들림</span>
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: n }).map((_, i) => (
          <div key={i} className={on >= 8 && i < on ? "pg-blink" : ""} style={{ flex: 1, height: 11, borderRadius: 3, border: "1.5px solid " + c.ink, background: i < on ? (i >= 7 ? c.red : i >= 4 ? "#f0a24b" : "#f6cd6e") : "#fff", transform: i < on ? "translateY(-1px)" : "none", transition: "background .08s" }} />
        ))}
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 800, color: c.sub }}>마시로 심박</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0, border: "1.5px solid " + c.ink, borderRadius: 6, background: "rgb(" + pgMix([255, 255, 255], [255, 222, 230], hRatio).join(",") + ")", overflow: "hidden", padding: "1px 0" }}>
          <PgEcg bpm={heart} ratio={hRatio} run={run} />
        </div>
        <PgBpm bpm={heart} />
      </div>
    </div>
  );
}

function PgEcg({ bpm, ratio, run }) {
  const c = PG_C;
  const dur = Math.max(0.5, Math.round((120 / Math.max(60, bpm)) * 10) / 10);
  const col = ratio > 0.8 ? c.red : "#e57d98";
  return (
    <svg viewBox="0 0 120 22" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 22 }}>
      <g className={run ? "pg-ecg" : ""} style={{ animationDuration: dur + "s" }}>
        <polyline points={PG_ECG} fill="none" stroke={col} strokeWidth="1.8" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <polyline points={PG_ECG} transform="translate(120 0)" fill="none" stroke={col} strokeWidth="1.8" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

function PgBpm({ bpm }) {
  const c = PG_C;
  const b = Math.round(bpm);
  return (
    <span style={{ flex: "none", fontWeight: 900, fontSize: 15, color: c.red, fontVariantNumeric: "tabular-nums", minWidth: 58, textAlign: "right" }}>
      <span className="pg-beat" style={{ display: "inline-block", marginRight: 3, animationDuration: (60 / Math.max(60, b)).toFixed(2) + "s" }}>♥</span>{b}
      <span style={{ fontSize: 10, fontWeight: 800, marginLeft: 2 }}>bpm</span>
    </span>
  );
}

/* ───────── 그림 (코드로 그린 마시로·유저·SD) ───────── */

function PgMashiroHead({ mood, stick, coat, thick, size }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", overflow: "visible", margin: "0 auto" }}>
      {pgMashiroG(mood, stick ? 50 : 0, coat, thick)}
    </svg>
  );
}

function pgMashiroG(mood, stickLen, coat, thick) {
  const ink = "#2f292c", hair = "#2a2427", skin = "#fde5d6";
  const blush = { calm: 0.25, nervous: 0.5, panic: 0.85, steam: 0.95, flinch: 0.95, shock: 0.45, love: 0.95 }[mood] || 0.4;
  const hot = mood === "panic" || mood === "steam" || mood === "flinch" || mood === "love";
  const eyes = mood === "panic" || mood === "steam" || mood === "flinch"
    ? <g fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M34.5 61 L40.5 64.5 L34.5 68" /><path d="M65.5 61 L59.5 64.5 L65.5 68" /></g>
    : mood === "shock"
      ? <g fill="#fff" stroke={ink} strokeWidth="1.6"><circle cx="38" cy="64.5" r="3" /><circle cx="62" cy="64.5" r="3" /></g>
      : mood === "love"
        ? <g fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round"><path d="M34 66.5 Q38 61 42 66.5" /><path d="M58 66.5 Q62 61 66 66.5" /></g>
        : <g fill={ink}><ellipse cx="38" cy="64.5" rx="2" ry="2.7" /><ellipse cx="62" cy="64.5" rx="2" ry="2.7" /></g>;
  const mouth = stickLen > 0
    ? <ellipse cx="50" cy="74" rx="3.2" ry="2.6" fill="#8c4150" stroke={ink} strokeWidth="1.2" />
    : mood === "love" ? <path d="M45.5 73.5 Q50 78 54.5 73.5" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      : mood === "shock" ? <path d="M44.5 75 Q47 72 49.5 75 Q52 78 54.5 75" fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" />
        : mood === "flinch" ? <ellipse cx="50" cy="75" rx="2.6" ry="3.2" fill="#8c4150" stroke={ink} strokeWidth="1.2" />
          : <path d="M46.5 75 L53.5 74" fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" />;
  return (
    <g>
      <path d="M19 54 C17 70 18 82 23 90 L27 83 L31 91 L35 84 L40 88 L60 88 L65 84 L69 91 L73 83 L77 90 C82 82 83 70 81 54 Z" fill={hair} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="50" cy="56" r="27" fill={skin} stroke={ink} strokeWidth="2.2" />
      <g opacity={blush}>
        <ellipse cx="30.5" cy="71" rx="5.5" ry="2.8" fill="#f28aa3" />
        <ellipse cx="69.5" cy="71" rx="5.5" ry="2.8" fill="#f28aa3" />
      </g>
      {hot ? <g stroke="#e0607d" strokeWidth="1.2" strokeLinecap="round"><path d="M27 69 l-1.6 4 M30 69 l-1.6 4 M33 69 l-1.6 4" /><path d="M67 69 l-1.6 4 M70 69 l-1.6 4 M73 69 l-1.6 4" /></g> : null}
      {eyes}
      <g fill="rgba(255,255,255,.28)" stroke="#1f1b1d" strokeWidth="3">
        <circle cx="38" cy="63" r="9.4" />
        <circle cx="62" cy="63" r="9.4" />
      </g>
      <path d="M47.4 62 Q50 60.2 52.6 62" fill="none" stroke="#1f1b1d" strokeWidth="2.4" />
      <path d="M21 58 C17 34 32 20 50 20 C68 20 83 34 79 58 L75 50 L71 60 L66 48 L61 58 L56 47 L50 57 L44 47 L39 58 L34 48 L29 60 L25 50 Z" fill={hair} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M35 27 Q42 23 48 24" fill="none" stroke="#5a5256" strokeWidth="1.6" strokeLinecap="round" />
      {mouth}
      {stickLen > 0 ? <rect x={50 - stickLen} y={74 - thick / 2} width={stickLen} height={thick} fill={coat} stroke={ink} strokeWidth="1.2" /> : null}
      {mood !== "calm" && mood !== "love" ? <path d="M84 38 Q89.5 47 84 50.5 Q78.5 47 84 38 Z" fill="#a8dcf5" stroke={ink} strokeWidth="1.3" /> : null}
      {mood === "steam" || mood === "flinch" ? (
        <g className="pg-steam" fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round">
          <path d="M26 17 q4 -4 0 -8 q-4 -4 0 -8" />
          <path d="M74 15 q-4 -4 0 -8 q4 -4 0 -8" />
        </g>
      ) : null}
      {mood === "love" ? <path className="pg-float" d="M82 31 c-3 -5 -10 -2 -7 4 l7 7 l7 -7 c3 -6 -4 -9 -7 -4 z" fill="#f0607a" stroke={ink} strokeWidth="1.2" /> : null}
    </g>
  );
}

function PgUserHead({ mood, stick, coat, thick, size }) {
  const ink = "#2f292c";
  const eyes = mood === "eat"
    ? <g fill="none" stroke={ink} strokeWidth="2.3" strokeLinecap="round"><path d="M35.5 62 Q39.5 65 43.5 62" /><path d="M56.5 62 Q60.5 65 64.5 62" /></g>
    : mood === "love"
      ? <g fill="none" stroke={ink} strokeWidth="2.3" strokeLinecap="round"><path d="M35.5 63.5 Q39.5 58.5 43.5 63.5" /><path d="M56.5 63.5 Q60.5 58.5 64.5 63.5" /></g>
      : mood === "shock"
        ? <g fill="#fff" stroke={ink} strokeWidth="1.6"><circle cx="39.5" cy="62" r="2.8" /><circle cx="60.5" cy="62" r="2.8" /></g>
        : <g fill={ink}><ellipse cx="39.5" cy="62" rx="2.1" ry="2.8" /><ellipse cx="60.5" cy="62" rx="2.1" ry="2.8" /></g>;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", overflow: "visible", margin: "0 auto" }}>
      <circle cx="50" cy="56" r="27" fill="#fffaf2" stroke={ink} strokeWidth="2.2" />
      <path d="M47 31 Q43 20 52 17 Q47 24 54 30" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <g opacity={mood === "love" ? 0.95 : 0.55}>
        <ellipse cx="31.5" cy="69" rx="5" ry="2.6" fill="#f6a8bb" />
        <ellipse cx="68.5" cy="69" rx="5" ry="2.6" fill="#f6a8bb" />
      </g>
      {eyes}
      {stick ? <ellipse cx="50" cy="74" rx="3.2" ry="2.6" fill="#8c4150" stroke={ink} strokeWidth="1.2" /> : <path d="M46 73.5 Q50 77 54 73.5" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />}
      {stick ? <rect x="50" y={74 - thick / 2} width="50" height={thick} fill={coat} stroke={ink} strokeWidth="1.2" /> : null}
    </svg>
  );
}

function PgChibi({ kind }) {
  const ink = "#2f292c", skin = "#fde5d6";
  const mood = kind === "성공" ? "love" : kind === "실패" ? "shock" : "flinch";
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
      <rect x="45" y="54" width="10" height="12" fill={skin} stroke={ink} strokeWidth="1.6" />
      <path d="M20 100 C20 76 31 63 50 63 C69 63 80 76 80 100 Z" fill="#4b4549" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M37 65 Q50 74 63 65" fill="none" stroke="#6d666a" strokeWidth="2" strokeLinecap="round" />
      <path d="M46 71 L45 82 M54 71 L55 82" stroke="#ece6e0" strokeWidth="1.8" strokeLinecap="round" />
      <g transform="translate(14,-4) scale(.72)">
        {pgMashiroG(mood, kind === "실패" ? 16 : 0, "#5b3a2c", 9)}
      </g>
      {kind === "성공" ? <g fill={skin} stroke={ink} strokeWidth="1.6"><circle cx="45" cy="84" r="5.6" /><circle cx="55" cy="84" r="5.6" /></g> : null}
      {kind === "기권" ? <g fill={skin} stroke={ink} strokeWidth="1.6"><ellipse cx="30" cy="44" rx="6" ry="7" /><ellipse cx="70" cy="44" rx="6" ry="7" /></g> : null}
      {kind === "실패" ? <rect x="66" y="80" width="18" height="5" fill="#5b3a2c" stroke={ink} strokeWidth="1.2" transform="rotate(38 75 82)" /> : null}
    </svg>
  );
}

function PgStickIcon({ coat }) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" style={{ display: "block", flex: "none" }}>
      <g transform="rotate(-38 10 10)">
        <rect x="1" y="8" width="5" height="4" fill="#e9c48c" stroke="#3b3236" strokeWidth="1.2" />
        <rect x="6" y="7.5" width="13" height="5" rx="1" fill={coat} stroke="#3b3236" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

/* ───────── 계산 ───────── */

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

function pgKind(res) { return res === "닿음" ? "성공" : res === "부러짐" ? "실패" : "기권"; }
function pgClamp(x) { return Math.max(0, Math.min(1, x || 0)); }
function pgMix(a, b, t) { const k = pgClamp(t); return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * k)); }

function pgFlavor(name) {
  const s = String(name || "");
  if (s.indexOf("딸기") >= 0 || s.indexOf("いちご") >= 0) return { coat: "#f2a3b8" };
  if (s.indexOf("말차") >= 0 || s.indexOf("抹茶") >= 0) return { coat: "#9dbe86" };
  if (s.indexOf("아몬드") >= 0) return { coat: "#6b4632", dots: true };
  if (s.indexOf("극세") >= 0) return { coat: "#4e3128", thin: true };
  if (s.indexOf("화이트") >= 0) return { coat: "#f3eadb" };
  return { coat: "#5b3a2c" };
}

// 게임 수치 (시뮬레이션으로 맞춤: 신중하게 하면 마시로의 한계 근처, 서두르면 60mm대에서 부러짐, 머뭇거리면 100mm 안팎에서 기권)
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

/* ───────── 모양 값 ───────── */

const PG_STAGE_PX = 150;
const PG_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
const PG_ECG = "0,13 18,13 22,9.5 26,13 32,13 35,2.5 39,20.5 43,13 60,13 78,13 82,9.5 86,13 92,13 95,2.5 99,20.5 103,13 120,13";
const PG_DOTS = "radial-gradient(circle at 30% 40%, #e8cfa6 0 1.2px, transparent 1.5px), radial-gradient(circle at 75% 60%, #e8cfa6 0 1.2px, transparent 1.5px)";
const PG_INK = "radial-gradient(circle at 22% 30%, rgba(255,255,255,.75) 0 1.6px, transparent 2.2px), radial-gradient(circle at 70% 18%, rgba(255,255,255,.6) 0 1.2px, transparent 1.8px), radial-gradient(circle at 80% 66%, rgba(255,255,255,.7) 0 2px, transparent 2.6px), radial-gradient(circle at 34% 78%, rgba(255,255,255,.55) 0 1.3px, transparent 1.9px), radial-gradient(circle at 55% 45%, rgba(255,255,255,.35) 0 1px, transparent 1.6px)";
const PG_CRUMBS = [[-18, -14, 4], [-10, -22, 3], [-4, 16, 3], [8, -20, 4], [16, -10, 3], [12, 18, 3], [-14, 12, 2.5], [2, -26, 2.5]];
const PG_HEARTS = [[-44, -40, -20, 15], [40, -46, 18, 13], [-54, 6, -30, 12], [54, 0, 26, 16], [-20, -58, -8, 11], [22, -60, 12, 12]];
const PG_DROPS = [[-26, -14], [-34, 4], [22, -20], [30, -2], [-6, -26]];

const PG_STAMP = {
  성공: { label: "成功", color: "#e0485a", glow: "rgba(240,96,122,.22)" },
  실패: { label: "失敗", color: "#4b5fa6", glow: "rgba(75,95,166,.16)" },
  기권: { label: "棄権", color: "#7a6a8a", glow: "rgba(122,106,138,.16)" }
};

const PG_FONT = '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans JP", sans-serif';
const PG_SERIF = '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif KR", serif';

const PG_C = {
  ink: "#3b3236",
  card: "#fffaf5",
  pink: "#f9c9d4",
  red: "#d9566e",
  sub: "#8a7c78",
  ruler: "#fff3d6",
  biscuit: "#e9c48c",
  note: "#fff7c7",
  noteLine: "#efe0a0"
};

const PG_CSS = `
.pg-in { animation: pg-in .45s cubic-bezier(.2,1.2,.4,1) both; }
.pg-shake { animation: pg-shake .4s ease-out .95s both; }
.pg-focus { animation: pg-jit .14s steps(2) infinite; }
.pg-ready { animation: pg-ring 1.4s ease-out infinite; }
.pg-eat { animation: pg-eat .22s ease-in-out infinite alternate; }
.pg-nib { animation: pg-nib .3s ease-out; }
.pg-flee { animation: pg-flee .45s cubic-bezier(.2,1.5,.4,1) both; }
.pg-back-l { animation: pg-back-l .45s cubic-bezier(.2,1.5,.4,1) both; }
.pg-bobtext { animation: pg-bobt .3s ease-in-out infinite alternate; }
.pg-sfx { animation: pg-sfx .5s ease-out both; }
.pg-doki { animation: pg-doki .6s ease-in-out infinite; }
.pg-wob { animation: pg-wob .1s linear infinite alternate; }
.pg-blink { animation: pg-blink .3s steps(2) infinite; }
.pg-ecg { animation: pg-ecg 1s linear infinite; }
.pg-beat { animation: pg-beat .7s ease-in-out infinite; }
.pg-steam { animation: pg-steam 1.1s ease-in-out infinite; }
.pg-float { animation: pg-float 1.4s ease-in-out infinite; }
.pg-half-l { animation: pg-break-l .55s cubic-bezier(.3,1.3,.5,1) both; transform-origin: right center; }
.pg-half-r { animation: pg-break-r .55s cubic-bezier(.3,1.3,.5,1) both; transform-origin: left center; }
.pg-crumb { animation: pg-fly .65s ease-out both; }
.pg-dim { animation: pg-fade .3s ease-out .05s both; }
.pg-rays { animation: pg-rays .5s ease-out .95s both, pg-spin 14s linear 1.4s infinite; }
.pg-sd { animation: pg-sd .55s cubic-bezier(.2,1.5,.4,1) .15s both, pg-bob 2.2s ease-in-out 1.2s infinite; }
.pg-shadow { animation: pg-shadow .55s cubic-bezier(.2,1.5,.4,1) .15s both; }
.pg-drip { animation: pg-fly .8s ease-out both; }
.pg-slam { animation: pg-slam .4s cubic-bezier(.55,0,.35,1) .7s both; }
.pg-burst { animation: pg-burst .55s ease-out .95s both; }
.pg-heartp { animation: pg-heart .9s ease-out both; }
.pg-up { animation: pg-up .4s cubic-bezier(.2,1.2,.4,1) 1.15s both; }
.pg-grow { animation: pg-grow .5s cubic-bezier(.2,1.2,.4,1) 1.25s both; }
.pg-marker { animation: pg-marker .6s cubic-bezier(.2,1.3,.4,1) 1.25s both; }
.pg-note { animation: pg-note .5s cubic-bezier(.2,1.4,.4,1) 1.4s both; }
.pg-pop-in { animation: pg-sfx-in .3s ease-out both; }
@keyframes pg-in { from { opacity: 0; transform: translateY(10px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes pg-shake { 0%, 100% { transform: none; } 15% { transform: translate(-5px, 3px) rotate(-.7deg); } 35% { transform: translate(5px, -2px) rotate(.6deg); } 55% { transform: translate(-3px, 1px); } 75% { transform: translate(2px, 0); } }
@keyframes pg-jit { 0% { transform: rotate(0deg); } 100% { transform: rotate(1.4deg); } }
@keyframes pg-ring { 0% { box-shadow: 0 4px 0 #3b3236, 0 0 0 0 rgba(217,86,110,.5); } 100% { box-shadow: 0 4px 0 #3b3236, 0 0 0 14px rgba(217,86,110,0); } }
@keyframes pg-eat { from { transform: translateX(0) scale(1); } to { transform: translateX(3px) scale(1.04, .96); } }
@keyframes pg-nib { 0% { transform: none; } 40% { transform: translateX(-4px) rotate(-3deg); } 100% { transform: none; } }
@keyframes pg-flee { to { transform: translate(24px, -6px) rotate(16deg); } }
@keyframes pg-back-l { to { transform: translate(-20px, -2px) rotate(-12deg); } }
@keyframes pg-bobt { from { transform: translateY(0); } to { transform: translateY(-3px); } }
@keyframes pg-sfx { 0% { opacity: 0; transform: translateY(5px) scale(.5) rotate(8deg); } 35% { opacity: 1; transform: translateY(-2px) scale(1.2) rotate(8deg); } 100% { opacity: 0; transform: translateY(-10px) scale(1) rotate(8deg); } }
@keyframes pg-sfx-in { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: none; } }
@keyframes pg-doki { 0%, 100% { transform: scale(1); } 25% { transform: scale(1.25); } }
@keyframes pg-wob { from { transform: translateX(-2px) rotate(-4deg); } to { transform: translateX(2px) rotate(4deg); } }
@keyframes pg-blink { 50% { opacity: .35; } }
@keyframes pg-ecg { from { transform: translateX(0); } to { transform: translateX(-120px); } }
@keyframes pg-beat { 0%, 100% { transform: scale(1); } 30% { transform: scale(1.35); } }
@keyframes pg-steam { 0% { opacity: .1; transform: translateY(3px); } 50% { opacity: 1; } 100% { opacity: 0; transform: translateY(-7px); } }
@keyframes pg-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes pg-break-l { to { transform: translate(-8px, 16px) rotate(-40deg); } }
@keyframes pg-break-r { to { transform: translate(8px, 16px) rotate(34deg); } }
@keyframes pg-fly { 0% { opacity: 0; transform: translate(0, 0) scale(.6); } 20% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1); } }
@keyframes pg-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes pg-rays { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: scale(1); } }
@keyframes pg-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes pg-sd { 0% { opacity: 0; transform: translateY(26px) scale(.3); } 60% { opacity: 1; transform: translateY(-6px) scale(1.1); } 80% { transform: translateY(1px) scale(.97); } 100% { opacity: 1; transform: none; } }
@keyframes pg-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes pg-shadow { 0% { opacity: 0; transform: scale(.2); } 100% { opacity: 1; transform: none; } }
@keyframes pg-slam { 0% { opacity: 0; transform: scale(2.8) rotate(-32deg); } 62% { opacity: 1; transform: scale(.84) rotate(-9deg); } 80% { transform: scale(1.07) rotate(-13deg); } 100% { opacity: 1; transform: scale(1) rotate(-12deg); } }
@keyframes pg-burst { 0% { opacity: .8; transform: scale(.75); } 100% { opacity: 0; transform: scale(1.9); } }
@keyframes pg-heart { 0% { opacity: 0; transform: translate(0, 0) scale(.3); } 20% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1.1) rotate(var(--r)); } }
@keyframes pg-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@keyframes pg-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes pg-marker { from { left: calc(100% - 5px); opacity: 0; } to { left: var(--to); opacity: 1; } }
@keyframes pg-note { from { opacity: 0; transform: translateY(-14px) rotate(-7deg); } to { opacity: 1; transform: rotate(-1.2deg); } }
@media (prefers-reduced-motion: reduce) {
  .pg-shake, .pg-focus, .pg-bobtext, .pg-wob, .pg-ecg, .pg-rays, .pg-eat, .pg-doki { animation: none !important; }
}
`;
