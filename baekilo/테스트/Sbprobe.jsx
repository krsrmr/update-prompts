// 시험용 2차: 위아래 컴포넌트가 값을 주고받을 길이 있는지 여러 방법으로 한 번에 확인한다. 확인이 끝나면 지운다.
// 필요 훅: useState, useEffect (react)
// 쓰는 법
//   맨 위:  <Sbprobe data="백일오 4:6:1" />
//   맨 아래: <Sbprobe view="1" />
// 결과: 아래 칸 첫 줄이 "받은 값: …"이면 성공. 둘째 줄의 진단 문구도 함께 알려 주면 된다.

function Sbprobe(props = {}) {
  const p = props || {};
  const R = typeof React !== "undefined" && React ? React : {};
  const useS = R.useState || (typeof useState === "function" ? useState : null);
  const useE = R.useEffect || (typeof useEffect === "function" ? useEffect : null);
  const isView = (p.view !== undefined && p.view !== null && p.view !== false && p.view !== "false") || p.data === undefined;
  const data = p.data === undefined || p.data === null ? "" : String(p.data);
  const [msg, setMsg] = useS ? useS(isView ? "찾는 중…" : "") : ["훅 없음", () => {}];
  const [diag, setDiag] = useS ? useS("") : ["", () => {}];

  if (useE) {
    useE(() => {
      const g = typeof globalThis !== "undefined" ? globalThis : (typeof self !== "undefined" ? self : {});
      const t = (f) => { try { const v = f(); return v === undefined ? "없음" : v === null ? "null" : typeof v; } catch (e) { return "막힘"; } };
      let origin = "?";
      try { origin = String(g.location && g.location.origin); } catch (e) { origin = "막힘"; }
      const d =
        "parent:" + t(() => g.parent) +
        " top:" + t(() => g.top) +
        " BC:" + t(() => g.BroadcastChannel) +
        " doc:" + t(() => g.document) +
        " origin:" + origin +
        " 같은창:" + t(() => g.__sbProbe2);
      setDiag(d);

      let bc = null;
      try { if (typeof BroadcastChannel === "function") bc = new BroadcastChannel("sbprobe"); } catch (e) { bc = null; }

      // 위 칸: 같은 창 보관 + 물어 오면 답한다(postMessage · BroadcastChannel)
      if (!isView) {
        try { g.__sbProbe2 = data; } catch (e) {}
        const onAsk = (e) => {
          try {
            if (e && e.data && e.data.sbq === "ask" && e.source) e.source.postMessage({ sbq: "ans", id: e.data.id, data: data }, "*");
          } catch (err) {}
        };
        try { g.addEventListener("message", onAsk); } catch (e) {}
        if (bc) bc.onmessage = (e) => {
          try { if (e.data && e.data.sbq === "ask") bc.postMessage({ sbq: "ans", id: e.data.id, data: data }); } catch (err) {}
        };
        setMsg("값 보관 중");
        return () => {
          try { g.removeEventListener("message", onAsk); } catch (e) {}
          try { if (bc) bc.close(); } catch (e) {}
        };
      }

      // 아래 칸
      let done = false;
      let tries = 0;
      let timer = null;
      const id = String(Math.random()).slice(2);
      const win = (how, v) => { if (done) return; done = true; setMsg("받은 값: " + v + " (" + how + ")"); };

      const onAns = (e) => { try { if (e && e.data && e.data.sbq === "ans" && e.data.id === id) win("창 통신", e.data.data); } catch (err) {} };
      try { g.addEventListener("message", onAns); } catch (e) {}
      if (bc) bc.onmessage = (e) => { try { if (e.data && e.data.sbq === "ans" && e.data.id === id) win("방송 채널", e.data.data); } catch (err) {} };

      const ask = () => {
        if (done) return;
        tries += 1;
        try { if (g.__sbProbe2 !== undefined) { win("같은 창", g.__sbProbe2); return; } } catch (e) {}
        try { if (bc) bc.postMessage({ sbq: "ask", id: id }); } catch (e) {}
        try {
          const hosts = [];
          try { if (g.parent && g.parent !== g) hosts.push(g.parent); } catch (e) {}
          try { if (g.top && g.top !== g && hosts.indexOf(g.top) < 0) hosts.push(g.top); } catch (e) {}
          hosts.forEach((h) => {
            let n = 0;
            try { n = h.length; } catch (e) {}
            for (let j = 0; j < n; j++) {
              try { if (h[j] !== g) h[j].postMessage({ sbq: "ask", id: id }, "*"); } catch (e) {}
            }
          });
        } catch (e) {}
        if (tries >= 10) {
          if (timer) clearInterval(timer);
          if (!done) setMsg("못 받음: 모든 길이 막힘");
        }
      };
      ask();
      timer = setInterval(ask, 400);
      return () => {
        if (timer) clearInterval(timer);
        try { g.removeEventListener("message", onAns); } catch (e) {}
        try { if (bc) bc.close(); } catch (e) {}
      };
    }, []);
  }

  return (
    <div style={{ fontSize: 12, padding: "6px 8px", border: "1px dashed #999", borderRadius: 4, color: "#444", margin: "4px 0" }}>
      <div>🧪 {isView ? "아래 칸" : "위 칸"} — {msg}</div>
      {diag ? <div style={{ color: "#888" }}>{diag}</div> : null}
    </div>
  );
}
