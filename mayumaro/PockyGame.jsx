// 필요 훅: useState, useRef, useEffect (react)
// [포키] 포키데이 포키 게임 위젯 — 빈티지 발렌타인 엽서판 (게임 규칙·수치는 앞 판과 같음)
//   mode="play"   : 직접 하는 미니게임. 꾹 누르면 먹어 들어가고, 떼면 멈춘다.
//                   끝나면 '!포키결과 …' 문구가 나오고, 유저가 그 문구를 보내면 AI가 그 결과대로 장면을 쓴다.
//                   값: date, flavor, phase(1~5), dating(true/false), userName
//   mode="result" : 결과 카드. 다가가는 장면을 다시 재생한 뒤 결과를 보여 준다. (mode를 안 쓰면 이쪽)
//                   값: date, flavor, left(남은 mm), result(기권/부러짐/닿음), by, bpm, userName, memo
// 결과 연출: SD가 먼저 튀어나오고 → 소인 도장(成功·失敗·棄権)이 쿵 찍힌다.
// SD 그림: 정사각 투명 SD 3장. 그림을 올린 뒤 아래 PG_SD의 따옴표 안에 주소를 넣는다.
//   비워 두면 코드로 그린 SD가 대신 나온다.  성공 = 닿음 / 실패 = 부러짐 / 기권 = 마시로 기권·내가 놓음
//   예) 성공: "https://krsrmr.github.io/mayumaro/img/pocky-sd-success.webp"

const PG_SD = {
  성공: "https://krsrmr.github.io/mayumaro/img/pocky-sd-success.webp",
  실패: "https://krsrmr.github.io/mayumaro/img/pocky-sd-fail.webp",
  기권: "https://krsrmr.github.io/mayumaro/img/pocky-sd-giveup.webp"
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
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!done) { setArmed(false); return undefined; }
    const id = setTimeout(() => setArmed(true), 1600);
    return () => clearTimeout(id);
  }, [done, round]);

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
          <div style={{ height: 34, overflow: "hidden", fontSize: 11.5, color: c.sub, lineHeight: 1.5, margin: "4px 2px 10px", wordBreak: "keep-all", textAlign: "center" }}>
            {v.st === "ready"
              ? "꾹 누르면 먹고, 떼면 멈춰요. 오래 누르면 부러지고, 서두르거나 머뭇거리면 마시로가 먼저 입을 떼요."
              : wRatio > 0.7 ? "흔들려요! 손을 떼요!" : hRatio > 0.8 ? "마시로가 한계예요… 살살." : "♡ 흔들림이 차기 전에 떼고, 마시로 심박도 같이 보면서 ♡"}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
            <button
              type="button"
              className={v.st === "ready" ? "pg-ready" : pressing ? "pg-press" : ""}
              onPointerDown={(e) => { e.preventDefault(); try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {} press(true); }}
              onPointerUp={() => press(false)}
              onPointerCancel={() => press(false)}
              onLostPointerCapture={() => press(false)}
              onContextMenu={(e) => e.preventDefault()}
              style={{ flex: 1, height: 58, border: "2px solid " + c.deep, borderRadius: 999, backgroundColor: c.red, color: c.paper, fontFamily: "inherit", fontSize: 16, fontWeight: 900, letterSpacing: ".04em", cursor: "pointer", touchAction: "none", outline: "1.5px dashed rgba(255,246,234,.75)", outlineOffset: -7, boxShadow: pressing ? "0 0 0 " + c.deep : "0 5px 0 " + c.deep, transform: pressing ? "translateY(5px) scale(.985)" : "none", transition: "transform .06s, box-shadow .06s" }}
            >
              {v.st === "ready" ? "♡ 꾹 눌러서 시작 ♡" : pressing ? "もぐもぐ…" : "꾹 눌러서 먹기"}
            </button>
            <button type="button" onClick={letGo} disabled={v.st !== "run"} style={{ flex: "none", width: 66, border: "2px solid " + c.red, borderRadius: 999, background: c.paper, color: c.red, fontFamily: "inherit", fontSize: 12.5, fontWeight: 900, cursor: v.st === "run" ? "pointer" : "default", opacity: v.st === "run" ? 1 : 0.35, boxShadow: v.st === "run" ? "0 4px 0 " + c.pink : "none" }}>놓기</button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "12px 14px 14px" }}>
          <PgVerdict mm={mm} verdict={verdict} kind={kind} extra={
            <button type="button" onClick={retry} disabled={!armed} style={{ pointerEvents: armed ? "auto" : "none", border: "2px solid " + c.red, background: c.paper, color: c.red, fontFamily: "inherit", fontSize: 12, fontWeight: 900, padding: "4px 11px", borderRadius: 999, cursor: "pointer", boxShadow: "0 3px 0 " + c.pink, whiteSpace: "nowrap" }}>↻ 한 판 더</button>
          } />
          <div className="pg-up" style={{ animationDelay: "1.3s", position: "relative", border: "1.5px solid " + c.red, borderRadius: 10, background: c.note, padding: "7px 10px 8px", marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ flex: 1, fontSize: 11, color: c.red, fontWeight: 900, letterSpacing: ".04em" }}>✉ この結果を送る</span>
              <span className={copied ? "pg-pop-in" : ""} key={"cp" + copied} style={{ fontSize: 11, color: copied === 1 ? c.red : c.sub, fontWeight: 900 }}>{copied === 1 ? "복사됨 ♡" : copied === 2 ? "길게 눌러 복사" : ""}</span>
              <button type="button" onClick={copy} disabled={!armed} style={{ pointerEvents: armed ? "auto" : "none", border: "2px solid " + c.deep, background: c.red, color: c.paper, fontFamily: "inherit", fontSize: 12, fontWeight: 900, padding: "4px 13px", borderRadius: 999, cursor: "pointer", boxShadow: "0 3px 0 " + c.deep }}>✉ 복사</button>
            </div>
            <textarea ref={lineRef} readOnly value={line} rows={2} onFocus={(e) => e.target.select()} style={{ width: "100%", boxSizing: "border-box", resize: "none", border: 0, background: "repeating-linear-gradient(transparent 0 20px, " + c.pink2 + " 20px 21px)", color: c.ink, fontFamily: "inherit", fontSize: 13, lineHeight: "21px", padding: 0, userSelect: "text", WebkitUserSelect: "text", outline: "none" }} />
            <div style={{ fontSize: 11, color: c.sub, fontWeight: 700, marginTop: 2 }}>이 문구를 그대로 보내면 이야기가 이어져요{best != null && round > 1 ? " · ♡ 최고 " + best + "mm" : ""}</div>
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
          <PgVerdict mm={mm} verdict={verdict} kind={kind} label="남은 거리" />

          <div className="pg-up" style={{ animationDelay: "1.3s", position: "relative", height: 30, margin: "2px 0 6px" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 14, background: c.note, border: "1.5px solid " + c.red, borderRadius: 4 }} />
            <div className="pg-grow" style={{ position: "absolute", left: 2, top: 3, height: 8, width: "calc(" + markerTo + "% - 2px)", background: "repeating-linear-gradient(-45deg," + fl.coat + " 0 5px, " + c.pink + " 5px 8px)", borderRadius: 3, transformOrigin: "left center" }} />
            {PG_TICKS.map((t) => (
              <div key={t} style={{ position: "absolute", left: (t / PG_K.d0) * 100 + "%", top: 0, width: 1, height: t % 50 === 0 ? 14 : 7, background: c.red }} />
            ))}
            {[0, 50, 100].map((t) => (
              <div key={"n" + t} style={{ position: "absolute", left: (t / PG_K.d0) * 100 + "%", top: 16, fontSize: 9.5, fontWeight: 700, color: c.sub, transform: t ? "translateX(-50%)" : "none" }}>{t}</div>
            ))}
            <svg className="pg-marker" viewBox="0 0 12 11" width="12" height="11" style={{ position: "absolute", "--to": "calc(" + markerTo + "% - 6px)", left: "calc(" + markerTo + "% - 6px)", top: 15 }}><path d={PG_HEART} fill={c.red} /></svg>
          </div>

          <div className="pg-up" style={{ animationDelay: "1.4s", display: "flex", alignItems: "center", gap: 10, margin: "4px 0 10px" }}>
            <span style={{ fontSize: 11.5, color: c.sub, fontWeight: 800, flex: "none", width: 54 }}>최고 심박</span>
            <PgEcgBox bpm={bpm} ratio={hRatio} run />
            <PgBpm bpm={bpm} />
          </div>

          {memo ? (
            <div className="pg-note" style={{ position: "relative", background: c.note, backgroundImage: "repeating-linear-gradient(transparent 0 21px, " + c.pink2 + " 21px 22px)", border: "1px solid " + c.pink, borderRadius: 3, padding: "10px 12px 8px 14px", boxShadow: "2px 4px 0 rgba(216,52,74,.12)", marginTop: 6 }}>
              <div style={{ position: "absolute", left: "50%", top: -8, width: 52, height: 14, marginLeft: -26, background: "repeating-linear-gradient(45deg," + c.pink + " 0 5px, " + c.pink2 + " 5px 10px)", opacity: 0.9, transform: "rotate(-3deg)" }} />
              <svg viewBox="0 0 12 11" width="16" height="15" style={{ position: "absolute", right: 8, top: -6, transform: "rotate(14deg)" }}><path d={PG_HEART} fill={c.red} stroke={c.deep} strokeWidth="1" /></svg>
              <div style={{ fontSize: 10.5, color: c.red, fontWeight: 900, letterSpacing: ".06em" }}>真白のメモ</div>
              <div style={{ fontFamily: PG_SERIF, fontStyle: "italic", fontSize: 13.5, lineHeight: "22px", color: c.ink, wordBreak: "keep-all" }}>{memo}</div>
            </div>
          ) : null}

          <div className="pg-up" style={{ animationDelay: "1.6s", display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button type="button" onClick={() => setRep((n) => n + 1)} style={{ border: "2px solid " + c.red, background: c.paper, color: c.red, fontFamily: "inherit", fontSize: 12, fontWeight: 900, padding: "4px 12px", borderRadius: 999, cursor: "pointer", boxShadow: "0 3px 0 " + c.pink }}>↻ 다시 보기</button>
          </div>
        </div>
      )}
    </PgShell>
  );
}

/* ───────── 공통 틀 (빈티지 엽서) ───────── */

function PgShell({ title, date, flavor, fl, shake, children }) {
  const c = PG_C;
  return (
    <div className="pg-in" style={{ width: "100%", maxWidth: 360, margin: "14px auto 10px", fontFamily: PG_FONT, color: c.ink, userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}>
      <style>{PG_CSS}</style>
      <div className={shake ? "pg-shake" : ""} style={{ padding: 7, borderRadius: 16, background: "repeating-linear-gradient(-45deg," + c.red + " 0 9px," + c.paper + " 9px 14px," + c.pink + " 14px 23px," + c.paper + " 23px 28px)", boxShadow: "0 12px 26px -14px rgba(163,24,44,.6), 0 2px 0 " + c.deep }}>
        <div style={{ position: "relative", background: c.paper, backgroundImage: PG_GRAIN, backgroundSize: "5px 5px, 7px 7px", borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 12px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontFamily: PG_SERIF, fontWeight: 900, fontSize: 21, color: c.red, letterSpacing: ".03em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
                <PgSpark size={11} color={c.hot} cls="pg-tw" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <span style={{ fontFamily: PG_SERIF, fontStyle: "italic", fontSize: 13, color: c.hot, whiteSpace: "nowrap" }}>Pocky Day</span>
                <span style={{ flex: 1, borderTop: "1.5px dashed " + c.pink }} />
                <span style={{ fontFamily: PG_COND, fontWeight: 900, fontSize: 19, color: c.red, lineHeight: 1 }}>{String(date).replace("/", "\\")}</span>
              </div>
            </div>
            <PgPostage flavor={flavor} fl={fl} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function PgPostage({ flavor, fl }) {
  const c = PG_C;
  return (
    <div className="pg-sway2" style={{ flex: "none", padding: 4, background: "radial-gradient(circle, transparent 2.2px, " + c.pink + " 2.6px) -4px -4px / 8px 8px", filter: "drop-shadow(0 2px 0 rgba(163,24,44,.22))" }}>
      <div style={{ width: 46, height: 54, boxSizing: "border-box", border: "1.5px solid " + c.red, backgroundColor: c.pink2, backgroundImage: "repeating-conic-gradient(from 0deg at 50% 48%, rgba(255,255,255,.65) 0deg 10deg, transparent 10deg 20deg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "3px 2px" }}>
        <span style={{ fontSize: 6.5, fontWeight: 900, color: c.red, letterSpacing: ".1em" }}>POCKY</span>
        <svg viewBox="0 0 20 20" width="22" height="22"><g transform="rotate(-50 10 10)"><rect x="1" y="8.2" width="5" height="3.6" fill={c.biscuit} stroke={c.red} strokeWidth="1" /><rect x="6" y="7.6" width="13" height="4.8" rx="1.2" fill={fl.coat} stroke={c.red} strokeWidth="1" /></g></svg>
        <span style={{ fontSize: 8.5, fontWeight: 900, color: c.red, maxWidth: 42, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{flavor}</span>
      </div>
    </div>
  );
}

function PgBow() {
  const c = PG_C;
  return (
    <svg className="pg-sway" viewBox="0 0 60 42" width="58" height="41" style={{ position: "absolute", left: "50%", top: -18, marginLeft: -29, overflow: "visible", transformOrigin: "50% 35%", filter: "drop-shadow(0 2px 0 rgba(163,24,44,.25))", zIndex: 2 }}>
      <g fill={c.pink} stroke={c.red} strokeWidth="1.8" strokeLinejoin="round">
        <path d="M28 19 C24 27 20 33 15 40 L20.5 38 L22 42 C26 33 29 27 31 21 Z" />
        <path d="M32 19 C36 27 40 33 45 40 L39.5 38 L38 42 C34 33 31 27 29 21 Z" />
        <path d="M30 16 C22 3 5 3 7 14 C9 23 22 21 30 16 Z" />
        <path d="M30 16 C38 3 55 3 53 14 C51 23 38 21 30 16 Z" />
      </g>
      <g fill="none" stroke={c.red} strokeWidth="1.3" strokeLinecap="round"><path d="M28 15 C22 9 13 8 12 12" /><path d="M32 15 C38 9 47 8 48 12" /></g>
      <ellipse cx="30" cy="16.5" rx="4.6" ry="5" fill={c.hot} stroke={c.red} strokeWidth="1.8" />
    </svg>
  );
}

function PgSpark({ size, color, cls, delay, style }) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} className={cls} style={{ display: "block", flex: "none", animationDelay: (delay || 0) + "s", ...(style || {}) }}>
      <path d={PG_STAR} fill={color} />
    </svg>
  );
}

/* ───────── 무대 (우표 + 만화 컷) ───────── */

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
  const tint = pgMix([255, 236, 241], [255, 199, 214], hRatio * 0.9 + (kiss ? 0.3 : 0));
  const focus = done ? 0 : Math.min(1, near * near * 1.15) * 0.8;
  const zoom = done ? 1 : 1 + near * 0.07;
  const beatDur = (60 / Math.max(60, v.heart)).toFixed(2) + "s";

  return (
    <div style={{ position: "relative", margin: "6px 12px 0" }}>
      <div style={{ padding: 5, background: "radial-gradient(circle, transparent 2.4px, " + c.pink + " 2.8px) -4.5px -4.5px / 9px 9px" }}>
        <div style={{ position: "relative", height: 166, overflow: "hidden", background: "rgb(" + tint.join(",") + ")", border: "1.5px solid " + c.red, transition: "background .2s" }}>
          <div className="pg-spin" style={{ position: "absolute", left: "50%", top: "55%", width: 560, height: 560, marginLeft: -280, marginTop: -280, backgroundImage: "repeating-conic-gradient(rgba(255,255,255,.55) 0deg 8deg, transparent 8deg 16deg)", opacity: 0.5 + hRatio * 0.5 }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(216,52,74,.13) 1px, transparent 1.4px)", backgroundSize: "6px 6px" }} />
          <div className={running ? "pg-focus" : ""} style={{ position: "absolute", left: -60, right: -60, top: -40, height: 250, opacity: focus, backgroundImage: "repeating-conic-gradient(from 0deg at 50% 50%, rgba(216,52,74,.24) 0deg 1.5deg, transparent 1.5deg 7deg)", WebkitMaskImage: "radial-gradient(ellipse 50% 45% at 50% 50%, transparent 45%, #000 85%)", maskImage: "radial-gradient(ellipse 50% 45% at 50% 50%, transparent 45%, #000 85%)", transition: "opacity .2s" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 55%, transparent 48%, rgba(216,52,74,.3) 100%)", opacity: done ? 0 : near, transition: "opacity .2s" }} />
          {PG_SPARKS.map((q, i) => <PgSpark key={i} size={q[2]} color="#fff" cls="pg-tw" delay={q[3]} style={{ position: "absolute", left: q[0] + "%", top: q[1], filter: "drop-shadow(0 0 1.5px rgba(216,52,74,.7))" }} />)}
          <div style={{ position: "absolute", inset: 0, opacity: running ? Math.min(1, near * 1.5) : 0, transition: "opacity .3s" }}>
            {PG_RISE.map((q, i) => (
              <svg key={i} className="pg-rise" viewBox="0 0 12 11" width={q[2]} height={q[2]} style={{ position: "absolute", left: q[0] + "%", bottom: 10, animationDelay: q[1] + "s" }}><path d={PG_HEART} fill={i % 2 ? c.red : c.hot} /></svg>
            ))}
          </div>

          <div style={{ position: "absolute", left: 0, top: 10, background: c.red, color: c.paper, fontSize: 11, fontWeight: 900, padding: "2px 14px 2px 9px", letterSpacing: ".08em", clipPath: "polygon(0 0,100% 0,calc(100% - 7px) 50%,100% 100%,0 100%)" }}>{caption}</div>
          <div style={{ position: "absolute", right: 8, top: 8, background: c.paper, border: "1.5px solid " + c.red, color: c.red, borderRadius: 5, padding: "0 7px", fontSize: 10.5, fontWeight: 800 }}>
            残り <span style={{ fontFamily: PG_COND, fontSize: 16, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{mm}</span>mm
          </div>

          <div style={{ position: "absolute", left: 0, right: 0, top: 50, display: "flex", justifyContent: "center", alignItems: "flex-start", transform: "scale(" + zoom.toFixed(3) + ")", transformOrigin: "50% 40%", transition: "transform .25s ease-out" }}>
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

          {pressing && !done ? <div className="pg-bobtext" style={{ position: "absolute", left: 10, top: 42, writingMode: "vertical-rl", fontSize: 13, fontWeight: 900, color: c.deep, letterSpacing: "-.05em", textShadow: "0 0 3px #fff" }}>もぐもぐ</div> : null}
          {v.nibFx > 0 && !done ? <div className="pg-sfx" style={{ position: "absolute", left: "calc(50% + 64px)", top: 42, fontSize: 12.5, fontWeight: 900, color: c.sub, textShadow: "0 0 3px #fff" }}>ぽりっ</div> : null}
          {!done && hRatio > 0.6 ? <div className="pg-doki" style={{ position: "absolute", right: 9, top: 42, writingMode: "vertical-rl", fontSize: hRatio > 0.85 ? 15 : 13, fontWeight: 900, color: c.red, letterSpacing: "-.05em", textShadow: "0 0 3px #fff", animationDuration: beatDur }}>ドキドキ</div> : null}
          {!done && wRatio > 0.7 ? <div className="pg-wob" style={{ position: "absolute", left: "calc(50% - 18px)", top: 108, fontSize: 13, fontWeight: 900, color: c.red, textShadow: "0 0 3px #fff" }}>ぐらっ</div> : null}

          {done ? <PgReveal res={v.res} date={date} /> : null}
        </div>
      </div>
      <PgBow />
    </div>
  );
}

/* ───────── 결과 연출: SD → 소인 도장 쿵 ───────── */

function PgReveal({ res, date }) {
  const c = PG_C;
  const kind = pgKind(res);
  const st = PG_STAMP[kind];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="pg-dim" style={{ position: "absolute", inset: 0, background: "rgba(255,246,234,.8)" }} />
      <div className="pg-rays" style={{ position: "absolute", left: "50%", top: "50%", width: 380, height: 380, marginLeft: -230, marginTop: -190, backgroundImage: "repeating-conic-gradient(from 0deg, " + st.glow + " 0deg 8deg, transparent 8deg 20deg)", WebkitMaskImage: "radial-gradient(circle, #000 18%, transparent 62%)", maskImage: "radial-gradient(circle, #000 18%, transparent 62%)" }} />

      <div className="pg-sd" style={{ position: "absolute", left: "50%", top: 18, width: 112, height: 112, marginLeft: -106 }}>
        <PgSD kind={kind} />
      </div>
      <div className="pg-shadow" style={{ position: "absolute", left: "50%", top: 130, width: 70, height: 9, marginLeft: -85, borderRadius: "50%", background: "rgba(163,24,44,.16)" }} />
      {PG_BURST.map((q, i) => <PgSpark key={i} size={q[2]} color={i % 2 ? c.gold : "#fff"} cls="pg-sparkpop" style={{ position: "absolute", left: "calc(50% - 56px)", top: 66, "--dx": q[0] + "px", "--dy": q[1] + "px", animationDelay: 0.2 + q[3] + "s", filter: "drop-shadow(0 0 2px rgba(216,52,74,.7))" }} />)}

      {kind === "기권" ? PG_DROPS.map((q, i) => (
        <svg key={i} className="pg-drip" viewBox="0 0 10 14" width="9" height="13" style={{ position: "absolute", left: "calc(50% - 50px)", top: 30, "--dx": q[0] + "px", "--dy": q[1] + "px", animationDelay: 0.25 + i * 0.08 + "s" }}>
          <path d="M5 1 Q9.5 8 5 13 Q0.5 8 5 1 Z" fill="#a8dcf5" stroke="#3b3236" strokeWidth="1.1" />
        </svg>
      )) : null}

      <svg viewBox="0 0 90 36" width="90" height="36" style={{ position: "absolute", left: "calc(50% + 76px)", top: 64, overflow: "visible" }}>
        <g fill="none" stroke={st.color} strokeWidth="2.2" strokeLinecap="round" opacity=".85">
          {[6, 18, 30].map((y, i) => <path key={i} className="pg-draw" d={"M0 " + y + " q7.5 -6 15 0 t15 0 t15 0 t15 0 t15 0 t15 0"} style={{ animationDelay: 1 + i * 0.07 + "s" }} />)}
        </g>
      </svg>
      <div style={{ position: "absolute", left: "50%", top: 32, marginLeft: 2 }}>
        <div className="pg-slam" style={{ position: "relative", width: 96, height: 96 }}>
          <div className="pg-burst" style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "3px solid " + st.color }} />
          <PgPostmark label={st.label} color={st.color} sub={String(date).replace("/", ".")} />
        </div>
        {kind === "성공" ? PG_HEARTS.map((q, i) => (
          <svg key={i} className="pg-heartp" viewBox="0 0 12 11" width={q[3]} height={q[3]} style={{ position: "absolute", left: 42, top: 40, "--dx": q[0] + "px", "--dy": q[1] + "px", "--r": q[2] + "deg", animationDelay: 0.95 + i * 0.04 + "s" }}><path d={PG_HEART} fill={i % 2 ? c.red : c.hot} /></svg>
        )) : null}
      </div>
      <div className="pg-flash" style={{ position: "absolute", inset: 0, background: "#fff", pointerEvents: "none" }} />
    </div>
  );
}

function PgSD({ kind }) {
  const src = PG_SD[kind];
  if (src) return <img src={src} alt="" draggable={false} style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }} />;
  return <PgChibi kind={kind} />;
}

function PgPostmark({ label, color, sub }) {
  return (
    <svg viewBox="0 0 100 100" width="96" height="96" style={{ display: "block", overflow: "visible" }}>
      <defs><path id="pgArc" d="M14 50 A36 36 0 1 1 86 50 A36 36 0 1 1 14 50" /></defs>
      <circle cx="50" cy="50" r="46" fill="rgba(255,246,234,.75)" stroke={color} strokeWidth="3.4" />
      <circle cx="50" cy="50" r="40.5" fill="none" stroke={color} strokeWidth="1.2" />
      <circle cx="50" cy="50" r="26" fill="none" stroke={color} strokeWidth="1.2" />
      <text fill={color} fontSize="8" fontWeight="900" letterSpacing="1"><textPath href="#pgArc" textLength="222" lengthAdjust="spacing">POCKY GAME ✦ SPECIAL DELIVERY ✦</textPath></text>
      <text x="50" y="55" textAnchor="middle" fill={color} fontFamily={PG_SERIF} fontSize="18" fontWeight="900">{label}</text>
      <text x="50" y="68" textAnchor="middle" fill={color} fontSize="7.5" fontWeight="900" letterSpacing="1.2">{sub}</text>
      <g fill="#fff" opacity=".8"><circle cx="24" cy="30" r="1.6" /><circle cx="70" cy="22" r="1.2" /><circle cx="78" cy="66" r="2" /><circle cx="34" cy="78" r="1.3" /><circle cx="57" cy="42" r=".9" /><circle cx="43" cy="62" r="1.1" /></g>
    </svg>
  );
}

/* ───────── 결과 숫자·게이지 ───────── */

function PgVerdict({ mm, verdict, kind, extra, label }) {
  const c = PG_C;
  return (
    <div className="pg-up" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      {label ? <span style={{ fontSize: 11.5, color: c.sub, fontWeight: 800 }}>{label}</span> : null}
      <span style={{ fontFamily: PG_COND, fontSize: 30, fontWeight: 900, color: c.red, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}><PgCount to={mm} /><span style={{ fontSize: 13, marginLeft: 2 }}>mm</span></span>
      <span className="pg-pill" style={{ fontSize: 12, fontWeight: 900, color: "#fff", background: PG_STAMP[kind].color, borderRadius: 999, padding: "3px 10px" }}>{verdict}</span>
      <span style={{ flex: 1 }} />
      {extra || null}
    </div>
  );
}

function PgCount({ to }) {
  const [n, setN] = useState(PG_K.d0);
  useEffect(() => {
    let iv = null;
    const wait = setTimeout(() => {
      const t0 = Date.now();
      iv = setInterval(() => {
        const k = Math.min(1, (Date.now() - t0) / 700);
        setN(Math.round(PG_K.d0 + (to - PG_K.d0) * (1 - Math.pow(1 - k, 3))));
        if (k >= 1) clearInterval(iv);
      }, 30);
    }, 1150);
    return () => { clearTimeout(wait); if (iv) clearInterval(iv); };
  }, [to]);
  return <span>{n}</span>;
}

function PgMeters({ wRatio, heart, hRatio, run }) {
  const c = PG_C;
  const on = Math.round(wRatio * 10);
  const lbl = { fontSize: 11.5, fontWeight: 900, color: c.red };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "62px 1fr", columnGap: 8, rowGap: 9, alignItems: "center" }}>
      <span style={lbl}>흔들림</span>
      <div style={{ display: "flex", gap: 2 }}>
        {PG_TEN.map((i) => (
          <svg key={i} viewBox="0 0 12 11" className={i < on ? (on >= 8 ? "pg-hf pg-blink" : "pg-hf") : ""} style={{ flex: "1 1 0", minWidth: 0, maxWidth: 22, height: 20, overflow: "visible" }}>
            <path d={PG_HEART} fill={i < on ? (i >= 7 ? c.red : i >= 4 ? c.hot : c.pink) : "#fff"} stroke={c.red} strokeWidth="1.1" />
          </svg>
        ))}
      </div>
      <span style={lbl}>마시로 심박</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <PgEcgBox bpm={heart} ratio={hRatio} run={run} />
        <PgBpm bpm={heart} />
      </div>
    </div>
  );
}

function PgEcgBox({ bpm, ratio, run }) {
  const c = PG_C;
  return (
    <div style={{ flex: 1, minWidth: 0, border: "1.5px solid " + c.red, borderRadius: 6, overflow: "hidden", padding: "1px 0", backgroundColor: "rgb(" + pgMix([255, 251, 244], [255, 220, 229], ratio).join(",") + ")", backgroundImage: "linear-gradient(" + c.pink2 + " 1px, transparent 1px), linear-gradient(90deg, " + c.pink2 + " 1px, transparent 1px)", backgroundSize: "6px 6px" }}>
      <PgEcg bpm={bpm} ratio={ratio} run={run} />
    </div>
  );
}

function PgEcg({ bpm, ratio, run }) {
  const c = PG_C;
  const dur = Math.max(0.5, Math.round((120 / Math.max(60, bpm)) * 10) / 10);
  const col = ratio > 0.8 ? c.red : c.hot;
  return (
    <svg viewBox="0 0 120 22" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 22 }}>
      <g className={run ? "pg-ecg" : ""} style={{ animationDuration: dur + "s" }}>
        <polyline points={PG_ECG} fill="none" stroke={col} strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <polyline points={PG_ECG} transform="translate(120 0)" fill="none" stroke={col} strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

function PgBpm({ bpm }) {
  const c = PG_C;
  const b = Math.round(bpm);
  return (
    <span style={{ flex: "none", fontFamily: PG_COND, fontWeight: 900, fontSize: 19, color: c.red, fontVariantNumeric: "tabular-nums", minWidth: 60, textAlign: "right", lineHeight: 1 }}>
      <span className="pg-beat" style={{ display: "inline-block", marginRight: 3, fontSize: 15, animationDuration: (60 / Math.max(60, b)).toFixed(2) + "s" }}>♥</span>{b}
      <span style={{ fontSize: 10, marginLeft: 2, fontFamily: PG_FONT }}>bpm</span>
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
const PG_TEN = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const PG_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
const PG_ECG = "0,13 18,13 22,9.5 26,13 32,13 35,2.5 39,20.5 43,13 60,13 78,13 82,9.5 86,13 92,13 95,2.5 99,20.5 103,13 120,13";
const PG_HEART = "M6 10.2 C2.2 7.4 .6 5.3 .6 3.4 C.6 1.8 1.9 .6 3.4 .6 C4.5 .6 5.4 1.2 6 2.1 C6.6 1.2 7.5 .6 8.6 .6 C10.1 .6 11.4 1.8 11.4 3.4 C11.4 5.3 9.8 7.4 6 10.2 Z";
const PG_STAR = "M5 0 C5.6 3.4 6.6 4.4 10 5 C6.6 5.6 5.6 6.6 5 10 C4.4 6.6 3.4 5.6 0 5 C3.4 4.4 4.4 3.4 5 0 Z";
const PG_DOTS = "radial-gradient(circle at 30% 40%, #e8cfa6 0 1.2px, transparent 1.5px), radial-gradient(circle at 75% 60%, #e8cfa6 0 1.2px, transparent 1.5px)";
const PG_GRAIN = "radial-gradient(rgba(216,52,74,.07) .8px, transparent 1px), radial-gradient(rgba(140,80,60,.06) .7px, transparent 1px)";
const PG_SPARKS = [[6, 38, 10, 0], [88, 40, 12, 0.7], [12, 128, 8, 1.2], [86, 124, 9, 0.35], [30, 22, 7, 1.6], [66, 136, 7, 0.9]];
const PG_RISE = [[44, 0, 11], [52, 0.8, 8], [48, 1.5, 13], [56, 0.4, 9], [40, 1.1, 8], [60, 1.8, 10]];
const PG_BURST = [[-50, -42, 13, 0], [46, -46, 11, 0.05], [-62, 8, 10, 0.1], [40, 26, 12, 0.08], [0, -60, 10, 0.03], [-26, 44, 9, 0.12]];
const PG_CRUMBS = [[-18, -14, 4], [-10, -22, 3], [-4, 16, 3], [8, -20, 4], [16, -10, 3], [12, 18, 3], [-14, 12, 2.5], [2, -26, 2.5]];
const PG_HEARTS = [[-46, -42, -20, 15], [42, -48, 18, 13], [-58, 6, -30, 12], [56, 0, 26, 16], [-20, -62, -8, 11], [22, -64, 12, 12], [-34, 34, -14, 10], [36, 36, 20, 11]];
const PG_DROPS = [[-26, -14], [-34, 4], [22, -20], [30, -2], [-6, -26]];

const PG_STAMP = {
  성공: { label: "成功", color: "#d8344a", glow: "rgba(239,125,155,.28)" },
  실패: { label: "失敗", color: "#4b5aa8", glow: "rgba(75,90,168,.16)" },
  기권: { label: "棄権", color: "#8b6f88", glow: "rgba(139,111,136,.18)" }
};

const PG_FONT = '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans JP", sans-serif';
const PG_SERIF = '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif KR", Georgia, serif';
const PG_COND = '"DIN Condensed", "Oswald", "Arial Narrow", "Roboto Condensed", sans-serif';

const PG_C = {
  ink: "#3b3236",
  red: "#d8344a",
  deep: "#a3182c",
  hot: "#ef7d9b",
  pink: "#f7b6c6",
  pink2: "#fcdde5",
  paper: "#fff6ea",
  note: "#fffbf3",
  sub: "#9a6e72",
  biscuit: "#e9c48c",
  gold: "#f6c560"
};

const PG_CSS = `
.pg-in { animation: pg-in .6s cubic-bezier(.2,1.3,.4,1) both; }
.pg-shake { animation: pg-shake .42s ease-out .95s both; }
.pg-sway { animation: pg-sway 2.6s ease-in-out infinite; }
.pg-sway2 { animation: pg-sway2 3.4s ease-in-out infinite; }
.pg-tw { animation: pg-tw 2.2s ease-in-out infinite; }
.pg-spin { animation: pg-spin 40s linear infinite; }
.pg-rise { animation: pg-rise 2.2s ease-out infinite; }
.pg-focus { animation: pg-jit .14s steps(2) infinite; }
.pg-ready { animation: pg-ring 1.4s ease-out infinite; }
.pg-press { background-image: repeating-linear-gradient(-45deg, rgba(255,255,255,.18) 0 8px, transparent 8px 16px); background-size: 22.6px 22.6px; animation: pg-stripe .4s linear infinite; }
.pg-hf { animation: pg-hpop .28s cubic-bezier(.2,1.6,.4,1); }
.pg-hf.pg-blink { animation: pg-hpop .28s cubic-bezier(.2,1.6,.4,1), pg-blink .3s steps(2) infinite; }
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
.pg-sd { animation: pg-sd .6s cubic-bezier(.2,1.5,.4,1) .15s both, pg-bob 2.2s ease-in-out 1.2s infinite; }
.pg-shadow { animation: pg-shadow .55s cubic-bezier(.2,1.5,.4,1) .15s both; }
.pg-sparkpop { animation: pg-sparkpop .8s ease-out both; }
.pg-drip { animation: pg-fly .8s ease-out both; }
.pg-slam { animation: pg-slam .4s cubic-bezier(.55,0,.35,1) .7s both; }
.pg-burst { animation: pg-burst .55s ease-out .95s both; }
.pg-draw { stroke-dasharray: 100; animation: pg-draw .45s ease-out both; }
.pg-flash { animation: pg-flash .5s ease-out .93s both; }
.pg-heartp { animation: pg-heart 1s ease-out both; }
.pg-up { animation: pg-up .45s cubic-bezier(.2,1.3,.4,1) 1.15s both; }
.pg-pill { animation: pg-pill .4s cubic-bezier(.2,1.8,.4,1) 1.5s both; }
.pg-grow { animation: pg-grow .5s cubic-bezier(.2,1.2,.4,1) 1.4s both; }
.pg-marker { animation: pg-marker .6s cubic-bezier(.2,1.3,.4,1) 1.4s both; }
.pg-note { animation: pg-note .55s cubic-bezier(.2,1.4,.4,1) 1.55s both; }
.pg-pop-in { animation: pg-sfx-in .3s ease-out both; }
@keyframes pg-in { 0% { opacity: 0; transform: translateY(18px) rotate(-3deg) scale(.94); } 70% { opacity: 1; transform: translateY(-2px) rotate(.6deg) scale(1.01); } 100% { opacity: 1; transform: none; } }
@keyframes pg-shake { 0%, 100% { transform: none; } 15% { transform: translate(-5px, 3px) rotate(-.8deg); } 35% { transform: translate(5px, -2px) rotate(.7deg); } 55% { transform: translate(-3px, 1px); } 75% { transform: translate(2px, 0); } }
@keyframes pg-sway { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
@keyframes pg-sway2 { 0%, 100% { transform: rotate(4deg); } 50% { transform: rotate(7deg) translateY(-1px); } }
@keyframes pg-tw { 0%, 100% { opacity: .35; transform: scale(.55) rotate(0deg); } 50% { opacity: 1; transform: scale(1.15) rotate(25deg); } }
@keyframes pg-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes pg-rise { 0% { opacity: 0; transform: translateY(0) scale(.5); } 25% { opacity: 1; } 100% { opacity: 0; transform: translateY(-96px) scale(1.1) rotate(14deg); } }
@keyframes pg-jit { 0% { transform: rotate(0deg); } 100% { transform: rotate(1.4deg); } }
@keyframes pg-ring { 0% { box-shadow: 0 5px 0 #a3182c, 0 0 0 0 rgba(216,52,74,.5); } 100% { box-shadow: 0 5px 0 #a3182c, 0 0 0 16px rgba(216,52,74,0); } }
@keyframes pg-stripe { from { background-position: 0 0; } to { background-position: 22.6px 0; } }
@keyframes pg-hpop { 0% { transform: scale(.4); } 60% { transform: scale(1.35); } 100% { transform: scale(1); } }
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
@keyframes pg-sd { 0% { opacity: 0; transform: translateY(28px) scale(.3) rotate(-8deg); } 55% { opacity: 1; transform: translateY(-8px) scale(1.12) rotate(3deg); } 78% { transform: translateY(2px) scale(.96) rotate(-1deg); } 100% { opacity: 1; transform: none; } }
@keyframes pg-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes pg-shadow { 0% { opacity: 0; transform: scale(.2); } 100% { opacity: 1; transform: none; } }
@keyframes pg-sparkpop { 0% { opacity: 0; transform: translate(0, 0) scale(0) rotate(0deg); } 35% { opacity: 1; transform: translate(calc(var(--dx) * .6), calc(var(--dy) * .6)) scale(1.25) rotate(45deg); } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(.3) rotate(120deg); } }
@keyframes pg-slam { 0% { opacity: 0; transform: scale(3) rotate(-34deg); } 62% { opacity: 1; transform: scale(.82) rotate(-9deg); } 80% { transform: scale(1.08) rotate(-13deg); } 100% { opacity: 1; transform: scale(1) rotate(-12deg); } }
@keyframes pg-burst { 0% { opacity: .85; transform: scale(.75); } 100% { opacity: 0; transform: scale(2); } }
@keyframes pg-draw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
@keyframes pg-flash { 0% { opacity: 0; } 18% { opacity: .75; } 100% { opacity: 0; } }
@keyframes pg-heart { 0% { opacity: 0; transform: translate(0, 0) scale(.3); } 20% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1.15) rotate(var(--r)); } }
@keyframes pg-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes pg-pill { 0% { transform: scale(0) rotate(-10deg); } 100% { transform: none; } }
@keyframes pg-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes pg-marker { from { left: calc(100% - 6px); opacity: 0; } to { left: var(--to); opacity: 1; } }
@keyframes pg-note { from { opacity: 0; transform: translateY(-14px) rotate(-6deg); } to { opacity: 1; transform: rotate(-1deg); } }
@media (prefers-reduced-motion: reduce) {
  .pg-shake, .pg-focus, .pg-bobtext, .pg-wob, .pg-ecg, .pg-rays, .pg-eat, .pg-doki, .pg-spin, .pg-rise, .pg-tw, .pg-sway, .pg-sway2 { animation: none !important; }
}
`;
