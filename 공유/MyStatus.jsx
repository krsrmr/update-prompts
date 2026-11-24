// [위아래 분리 상태창 템플릿] 유니챗용
// 필요 훅: useState, useRef, useEffect (react)
//
// 쓰는 법
//   응답 첫 줄:  <MyStatus core="1" place="연무장" time="밤" hp={80} mood="평온" />
//                → 값만 담는다. 화면에는 아무것도 안 보인다.
//   응답 맨 끝:  <MyStatus view="1" />
//                → 바로 위 core의 값을 받아 와서 상태창을 그린다.
//
// 고칠 곳은 아래 MS_LABELS 하나뿐이다.
//   ["값 이름", "화면에 보일 이름"]을 보여 줄 순서대로 적는다.
//   여기에 없는 값은 화면에 안 보이는 '숨은 값'이 된다(AI는 계속 읽는다).
// 이름을 바꾸려면 function MyStatus와 프롬프트의 태그 이름을 같이 바꾼다.

const MS_LABELS = [
  ["place", "장소"],
  ["time", "시간"],
  ["hp", "체력"],
  ["mood", "기분"],
];

function MyStatus(props = {}) {
  const raw = props || {};
  const R = typeof React !== "undefined" && React ? React : {};
  const useS = R.useState || (typeof useState === "function" ? useState : null);
  const useR = R.useRef || (typeof useRef === "function" ? useRef : null);
  const useE = R.useEffect || (typeof useEffect === "function" ? useEffect : null);

  // core="1" 위 태그 / view="1" 아래 태그 / 둘 다 없으면 그 자리에서 바로 그림
  const mode = msFlag(raw.core) ? "core" : msFlag(raw.view) ? "view" : "self";
  const live = useR ? useR(raw) : { current: raw };
  live.current = raw;
  const [got, setGot] = useS ? useS(null) : [null, () => {}];
  const [lost, setLost] = useS ? useS(false) : [false, () => {}];

  if (useE) {
    useE(() => {
      if (mode === "core") return msServe(live);
      if (mode === "view") return msFind(setGot, setLost);
      return undefined;
    }, []);
  }

  if (mode === "core") return <div style={{ height: 0, overflow: "hidden" }} />;
  if (mode === "view" && !got) {
    return (
      <div style={{ fontFamily: "sans-serif", fontSize: 12, color: "#888", padding: "4px 2px" }}>
        {lost ? "상태창 값을 찾지 못했습니다." : "상태창 불러오는 중…"}
      </div>
    );
  }
  const p = mode === "view" ? got : raw;

  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 13, color: "#222", background: "#f4f4f2", border: "1px solid #ccc", borderRadius: 6, padding: 10, lineHeight: 1.6 }}>
      {MS_LABELS.filter(([k]) => p[k] !== undefined && p[k] !== null && String(p[k]) !== "").map(([k, name]) => (
        <div key={k} style={{ display: "flex", gap: 8 }}>
          <span style={{ width: 64, color: "#666", flexShrink: 0 }}>{name}</span>
          <span>{Array.isArray(p[k]) ? p[k].join(" / ") : String(p[k])}</span>
        </div>
      ))}
    </div>
  );
}

// ───────── 아래는 고치지 않아도 된다 ─────────

// 유니챗은 값 없는 속성(view)을 넘기지 않는다. core="1" · view="1"처럼 값을 붙여 쓴다.
function msFlag(v) {
  if (v === undefined || v === null || v === false) return false;
  const s = String(v).trim().toLowerCase();
  return s !== "" && s !== "false" && s !== "0";
}

// 컴포넌트는 태그마다 따로 된 창(iframe)이다. window는 막혀 있고 globalThis로 바깥 창이 보인다.
function msGlobal() {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  return {};
}

function msHosts(g) {
  const hosts = [];
  try { if (g.parent && g.parent !== g) hosts.push(g.parent); } catch (e) {}
  try { if (g.top && g.top !== g && hosts.indexOf(g.top) < 0) hosts.push(g.top); } catch (e) {}
  return hosts;
}

function msPack(raw) {
  const out = {};
  Object.keys(raw || {}).forEach((k) => {
    if (k === "core" || k === "view") return;
    try {
      const v = raw[k];
      if (typeof v === "function" || v === undefined) return;
      out[k] = JSON.parse(JSON.stringify(v));
    } catch (e) {}
  });
  return out;
}

// 위 태그: 아래 태그가 물어 오면 값을 건넨다.
function msServe(live) {
  const g = msGlobal();
  const onAsk = (e) => {
    try {
      if (!e || !e.data || e.data.msq !== "ask" || !e.source) return;
      e.source.postMessage({ msq: "ans", id: e.data.id, j: e.data.j, data: msPack(live.current) }, "*");
    } catch (err) {}
  };
  try { g.addEventListener("message", onAsk); } catch (e) {}
  return () => { try { g.removeEventListener("message", onAsk); } catch (e) {} };
}

// 아래 태그: 제 앞쪽 창들에 묻고, 가장 가까운 위 태그의 값을 쓴다.
function msFind(setGot, setLost) {
  const g = msGlobal();
  const all = msHosts(g);
  const id = String(Math.random()).slice(2);
  const indexIn = (h) => {
    let n = 0;
    try { n = h.length; } catch (e) {}
    for (let j = 0; j < n; j++) {
      try { if (h[j] === g) return j; } catch (e) {}
    }
    return -1;
  };
  let host = all.length ? all[0] : null;
  let me = host ? indexIn(host) : -1;
  for (let i = 1; i < all.length && me < 0; i++) {
    const m = indexIn(all[i]);
    if (m >= 0) { host = all[i]; me = m; }
  }
  let best = null;
  let settle = null;
  let tries = 0;
  let timer = null;
  let done = false;

  const finish = () => {
    if (done || !best) return;
    done = true;
    if (timer) clearInterval(timer);
    setGot(best.data);
  };
  const onAns = (e) => {
    try {
      const d = e && e.data;
      if (done || !d || d.msq !== "ans" || d.id !== id || !d.data) return;
      if (me >= 0 && !(d.j < me)) return;
      if (!best || d.j > best.j) best = { j: d.j, data: d.data };
      if (!settle) settle = setTimeout(finish, 250);
    } catch (err) {}
  };
  try { g.addEventListener("message", onAns); } catch (e) {}

  const ask = () => {
    if (done || !host) return;
    tries += 1;
    let n = 0;
    try { n = host.length; } catch (e) {}
    const end = me >= 0 ? me : n;
    for (let j = end - 1; j >= 0; j--) {
      try { host[j].postMessage({ msq: "ask", id: id, j: j }, "*"); } catch (e) {}
    }
    if (tries >= 12 && !best) {
      if (timer) clearInterval(timer);
      setLost(true);
    }
  };
  ask();
  timer = setInterval(ask, 400);
  return () => {
    done = true;
    if (timer) clearInterval(timer);
    if (settle) clearTimeout(settle);
    try { g.removeEventListener("message", onAns); } catch (e) {}
  };
}
