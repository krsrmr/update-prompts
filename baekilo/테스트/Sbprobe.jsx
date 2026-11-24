// 시험용: 맨 위 태그의 값을 맨 아래 태그가 받아 오는지 확인한다. 확인이 끝나면 지운다.
// 필요 훅: useState, useEffect (react)
// 쓰는 법
//   맨 위:  <Sbprobe data="백일오 4:6:1" />
//   맨 아래: <Sbprobe view />
// 결과: 아래 칸에 "받은 값: 백일오 4:6:1"이 뜨면 성공. 실패하면 이유가 뜬다.

function Sbprobe(props = {}) {
  const p = props || {};
  const R = typeof React !== "undefined" && React ? React : {};
  const useS = R.useState || (typeof useState === "function" ? useState : null);
  const useE = R.useEffect || (typeof useEffect === "function" ? useEffect : null);
  const isView = p.view !== undefined && p.view !== false && p.view !== "false";
  const data = p.data === undefined || p.data === null ? "" : String(p.data);
  const [msg, setMsg] = useS ? useS(isView ? "찾는 중…" : "") : ["훅 없음", () => {}];

  if (useE) {
    useE(() => {
      // 위 칸: 같은 창 보관 + 물어 오면 답한다
      if (!isView) {
        try {
          window.__sbProbe = window.__sbProbe || [];
          window.__sbProbe.push(data);
        } catch (e) {}
        const onAsk = (e) => {
          try {
            if (e && e.data && e.data.sbq === "ask" && e.source) {
              e.source.postMessage({ sbq: "ans", id: e.data.id, data: data }, "*");
            }
          } catch (err) {}
        };
        try { window.addEventListener("message", onAsk); } catch (e) {}
        let where = "?";
        try { where = window.parent === window ? "iframe 아님" : "iframe 안"; } catch (e) { where = "확인 불가"; }
        setMsg("값 보관 중 (" + where + ")");
        return () => { try { window.removeEventListener("message", onAsk); } catch (e) {} };
      }

      // 아래 칸: 1) 같은 창에서 찾기 2) 앞쪽 창들에 묻기
      let done = false;
      let tries = 0;
      let timer = null;
      const id = String(Math.random()).slice(2);
      let par = null;
      let idx = -1;
      let total = -1;
      try {
        par = window.parent;
        total = par.length;
        for (let i = 0; i < total; i++) {
          try { if (par[i] === window) { idx = i; break; } } catch (e) {}
        }
      } catch (e) {}

      const onAns = (e) => {
        try {
          if (done || !e || !e.data || e.data.sbq !== "ans" || e.data.id !== id) return;
          done = true;
          setMsg("받은 값: " + e.data.data + " (옆 창 통신 · " + (idx + 1) + "/" + total + "번 창)");
        } catch (err) {}
      };
      try { window.addEventListener("message", onAns); } catch (e) {}

      const ask = () => {
        if (done) return;
        tries += 1;
        try {
          const list = window.__sbProbe;
          if (list && list.length) {
            done = true;
            setMsg("받은 값: " + list[list.length - 1] + " (같은 창)");
            return;
          }
        } catch (e) {}
        try {
          if (par && par !== window && idx > 0) {
            for (let j = idx - 1; j >= 0; j--) {
              try { par[j].postMessage({ sbq: "ask", id: id }, "*"); } catch (e) {}
            }
          }
        } catch (e) {}
        if (tries >= 10) {
          if (timer) clearInterval(timer);
          if (!done) {
            let why = "응답 없음";
            if (!par || par === window) why = "iframe 아님 · 같은 창에도 값 없음";
            else if (idx < 0) why = "내 창 번호를 못 찾음 (창 수 " + total + ")";
            else if (idx === 0) why = "내 앞에 창이 없음";
            setMsg("못 받음: " + why);
          }
        }
      };
      ask();
      timer = setInterval(ask, 400);
      return () => {
        if (timer) clearInterval(timer);
        try { window.removeEventListener("message", onAns); } catch (e) {}
      };
    }, []);
  }

  return (
    <div style={{ fontSize: 12, padding: "6px 8px", border: "1px dashed #999", borderRadius: 4, color: "#444", margin: "4px 0" }}>
      🧪 {isView ? "아래 칸" : "위 칸"} — {msg}
    </div>
  );
}
