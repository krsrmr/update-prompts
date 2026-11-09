// 필요 훅: useState, useEffect (react)
// 오손의 검색 기록 v1.0 — !뭐봤어 위젯 · 가게 카운터의 낡은 LCD 모니터, 검색 사이트 '내 기록' 화면

function OrsonHistory(props = {}) {
  const p = props || {};
  const H = ohHooks();

  const date = ohVal(p.date, "오늘");
  const handle = ohVal(p.handle, "bench_oz");
  // 포스트잇은 " / "로 줄을 나눈다
  const sticky = ohVal(p.sticky, "MY COMPUTER. / NOT YOURS. / — BEN").split(/\s\/\s|\\n|\n/).join("\n");
  const cashRaw = ohVal(p.cash, "");
  const cash = cashRaw === "" || !isFinite(Number(cashRaw)) ? null : Number(cashRaw);
  const rows = ohList(p.searches).map(ohSearch);
  const shop = ohList(p.shop).map(ohShop);
  const wish = ohList(p.wish).map(ohWish);
  const posts = ohList(p.posts).map(ohPost);

  const [tab, setTab] = H.s("all");
  const [openRow, setOpenRow] = H.s(-1);

  const ui = "Tahoma, Verdana, 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";
  const hand = "'Segoe Print', 'Bradley Hand', 'Comic Neue', 'Nanum Pen Script', cursive";
  const blue = "#1f4fb4";
  const gray = "#6b6f76";
  const line = "#e3e6ea";
  const teal = "#156b74";
  const orange = "#ef8a17";

  const cartTotal = shop.filter((c) => c.kind === "cart").reduce((a, c) => a + c.price, 0);
  const short = cash !== null && cartTotal > cash;
  const lastQuery = rows.length ? rows[rows.length - 1].query : "";

  const icon = (d, size, color) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: "block" }}>
      {d}
    </svg>
  );
  const glassD = (
    <g>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </g>
  );
  const cartD = (
    <g>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2 3h3l2.6 12.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
    </g>
  );
  const chatD = <path d="M4 5h16v11H9l-5 4z" />;
  const heartD = <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />;

  // ── 브라우저 틀
  const titleBar = (
    <div style={{ display: "flex", alignItems: "center", height: 22, padding: "0 6px 0 8px", background: "linear-gradient(#e4ebf3, #c7d2df)", borderBottom: "1px solid #9aa8b8", fontSize: 11, color: "#1d2733" }}>
      <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden" }}>내 기록 — lookr</span>
      {["–", "□", "×"].map((c, i) => (
        <span key={i} style={{ width: 20, height: 15, marginLeft: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, borderRadius: 2, border: "1px solid #8d9bad", background: i === 2 ? "linear-gradient(#e9a397, #c7543f)" : "linear-gradient(#f4f7fa, #d4dde7)", color: i === 2 ? "#fff" : "#2b3644" }}>{c}</span>
      ))}
    </div>
  );

  const tabBar = (
    <div style={{ display: "flex", alignItems: "flex-end", height: 24, padding: "0 6px", background: "#cfd6de", borderBottom: "1px solid #a9b4c0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, height: 20, padding: "0 12px", background: "#f6f8fa", border: "1px solid #a9b4c0", borderBottom: "none", borderRadius: "5px 5px 0 0", fontSize: 11, color: "#222" }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: teal, boxShadow: "inset 0 0 0 2px " + orange }} />
        <span>lookr · 내 기록</span>
        <span style={{ marginLeft: 6, color: "#8a929c" }}>×</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, height: 19, padding: "0 10px", marginLeft: 2, background: "#dfe4ea", border: "1px solid #b7c0ca", borderBottom: "none", borderRadius: "5px 5px 0 0", fontSize: 11, color: "#6a7480" }}>
        <span>Beacon 벼룩 게시판</span>
      </div>
      <span style={{ marginLeft: 6, marginBottom: 3, fontSize: 12, color: "#6d7884" }}>+</span>
    </div>
  );

  const toolBar = (
    <div style={{ display: "flex", alignItems: "center", gap: 6, height: 28, padding: "0 8px", background: "#f6f8fa", borderBottom: "1px solid #d3d9e0", fontSize: 12, color: "#5a6470" }}>
      <span>◀</span>
      <span style={{ color: "#b4bcc6" }}>▶</span>
      <span>⟳</span>
      <div style={{ flex: 1, minWidth: 0, height: 18, display: "flex", alignItems: "center", padding: "0 6px", border: "1px solid #b9c2cc", borderRadius: 2, background: "#fff", fontSize: 11, color: "#333", whiteSpace: "nowrap", overflow: "hidden" }}>
        <span style={{ color: "#8a929c" }}>http://www.</span>lookr.com/history/{handle}
      </div>
      <span>☆</span>
    </div>
  );

  // ── 페이지 머리
  const logo = (
    <div style={{ display: "flex", alignItems: "center", fontFamily: "'Trebuchet MS', Verdana, sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: -0.5, color: teal, lineHeight: 1 }}>
      <span>l</span>
      {[0, 1].map((i) => (
        <span key={i} style={{ position: "relative", width: 15, height: 15, margin: "3px 0.5px 0", borderRadius: "50%", border: "3px solid " + orange, boxSizing: "border-box", background: "#fff" }}>
          <span style={{ position: "absolute", right: 1, top: 2, width: 4, height: 4, borderRadius: "50%", background: "#1d1d1d" }} />
        </span>
      ))}
      <span>kr</span>
    </div>
  );

  const head = (
    <div style={{ padding: "12px 16px 0", background: "linear-gradient(#f3f8f8, #fff)", borderBottom: "1px solid " + line }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {logo}
        <div style={{ flex: 1, minWidth: 0, display: "flex", height: 24, border: "1px solid #b9c7cc", borderRadius: 2, background: "#fff", boxShadow: "inset 0 1px 2px rgba(0,0,0,.08)" }}>
          <span style={{ flex: 1, minWidth: 0, padding: "0 7px", display: "flex", alignItems: "center", fontSize: 12, color: "#333", whiteSpace: "nowrap", overflow: "hidden" }}>{lastQuery}</span>
          <span style={{ display: "flex", alignItems: "center", padding: "0 9px", background: "linear-gradient(#2a8a94, " + teal + ")", color: "#fff", fontSize: 11, fontWeight: 700 }}>검색</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#333" }}>
          <span style={{ width: 18, height: 18, borderRadius: 2, background: "#c9b79a", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>O</span>
          <span>{handle} ▾</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 2, marginTop: 10 }}>
        {[
          ["all", "전체", rows.length + shop.length + wish.length + posts.length],
          ["q", "검색", rows.length],
          ["shop", "쇼핑", shop.length],
          ["wish", "갖고 싶은 것", wish.length],
          ["post", "글·댓글", posts.length],
        ].map((t) => {
          const on = tab === t[0];
          return (
            <span key={t[0]} onClick={() => setTab(t[0])} style={{ padding: "6px 9px 7px", whiteSpace: "nowrap", fontSize: 12, cursor: "pointer", color: on ? "#1d2733" : gray, fontWeight: on ? 700 : 400, borderBottom: "3px solid " + (on ? orange : "transparent") }}>
              {t[1]} <span style={{ fontSize: 10.5, color: on ? orange : "#a3a9b0" }}>{t[2]}</span>
            </span>
          );
        })}
      </div>
    </div>
  );

  const secHead = (d, label, count) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "14px 0 6px", fontSize: 12, fontWeight: 700, color: "#2a2d31" }}>
      {icon(d, 14, teal)}
      {label}
      <span style={{ fontWeight: 400, color: "#a3a9b0" }}>{count}</span>
    </div>
  );

  // ── 검색
  const searchList = rows.length ? (
    <div style={{ border: "1px solid " + line, borderRadius: 3, background: "#fff" }}>
      {rows.map((r, i) => {
        const on = openRow === i;
        return (
          <div key={i} style={{ borderTop: i ? "1px solid " + line : "none" }}>
            <div onClick={() => setOpenRow(on ? -1 : i)} className="oh-row" style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "8px 10px", cursor: "pointer", background: on ? "#eef5f6" : undefined }}>
              <span style={{ flexShrink: 0, fontSize: 10.5, color: gray, padding: "1px 5px", background: "#f0f2f4", borderRadius: 2, fontVariantNumeric: "tabular-nums" }}>{r.time}</span>
              <span style={{ paddingTop: 1 }}>{icon(glassD, 13, "#9aa1a9")}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: blue, wordBreak: "break-word" }}>{r.query}</div>
                {r.ko ? <div style={{ fontSize: 11.5, color: gray, marginTop: 1, wordBreak: "keep-all" }}>{r.ko}</div> : null}
              </div>
              <span style={{ fontSize: 11, color: "#9aa1a9", paddingTop: 2, transform: on ? "rotate(90deg)" : "none", transition: "transform .15s ease" }}>▸</span>
            </div>
            {on ? (
              <div className="oh-open" style={{ margin: "0 10px 10px 58px", padding: "7px 10px", background: "#fafbfc", borderLeft: "3px solid " + orange, display: "grid", gap: 3 }}>
                {r.fix ? (
                  <div style={{ fontSize: 11.5 }}>
                    <span style={{ color: "#c0392b" }}>이것을 찾으셨나요? </span>
                    <span style={{ color: blue, fontWeight: 700, fontStyle: "italic" }}>{r.fix}</span>
                  </div>
                ) : null}
                {r.site ? (
                  <div style={{ fontSize: 11.5, color: "#2a2d31" }}>
                    <span style={{ color: gray }}>들어간 곳 · </span>
                    {r.site}
                  </div>
                ) : null}
                {r.then ? (
                  <div style={{ fontSize: 11.5, color: "#2a2d31", wordBreak: "keep-all" }}>
                    <span style={{ color: gray }}>그다음 · </span>
                    {r.then}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  ) : (
    <div style={{ fontSize: 12, color: gray, padding: "6px 2px" }}>검색 기록이 없습니다.</div>
  );

  // ── 쇼핑
  const chip = (c) => {
    const map = {
      cart: ["#e8f0fe", "#1f4fb4"],
      bid: ["#fff3e0", "#b45f00"],
      watch: ["#fde8ef", "#a52a55"],
      done: ["#e6f4ea", "#2e7d4f"],
      out: ["#f1f2f4", "#9aa1a9"],
    };
    const m = map[c.kind] || map.cart;
    return <span style={{ display: "inline-block", fontSize: 10.5, padding: "1px 6px", borderRadius: 2, background: m[0], color: m[1], whiteSpace: "nowrap" }}>{c.status || "장바구니"}</span>;
  };

  const shopList = shop.length ? (
    <div style={{ display: "grid", gap: 6 }}>
      {shop.map((c, i) => {
        const out = c.kind === "out";
        return (
          <div key={i} className="oh-card" style={{ display: "flex", gap: 10, padding: 9, border: "1px solid " + line, borderRadius: 3, background: "#fff", opacity: out ? 0.6 : 1 }}>
            <div style={{ width: 50, height: 50, flexShrink: 0, borderRadius: 3, background: "linear-gradient(#f6f7f9, #e9ecef)", border: "1px solid #e1e5ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{ohThumb(c.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#2a2d31", wordBreak: "keep-all", textDecoration: out ? "line-through" : "none" }}>{c.name}</div>
              {c.seller ? <div style={{ fontSize: 11, color: gray, marginTop: 1 }}>{c.seller}</div> : null}
              {c.memo ? <div style={{ fontSize: 12, color: "#5b4a2e", marginTop: 3, fontFamily: hand, wordBreak: "keep-all" }}>{"✎ " + c.memo}</div> : null}
            </div>
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#2a2d31", fontVariantNumeric: "tabular-nums", textDecoration: out ? "line-through" : "none" }}>{"$" + c.price.toFixed(2)}</span>
              {chip(c)}
            </div>
          </div>
        );
      })}
      {cartTotal > 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, padding: "7px 10px", border: "1px solid " + line, borderRadius: 3, background: short ? "#fdf1ef" : "#f3faf5", fontSize: 12 }}>
          <span style={{ color: gray }}>{"장바구니 합계 $" + cartTotal.toFixed(2)}</span>
          {cash !== null ? <span style={{ color: gray }}>{"지갑 $" + cash.toFixed(2)}</span> : null}
          {cash !== null ? <span style={{ fontWeight: 700, color: short ? "#c0392b" : "#2e7d4f" }}>{short ? "잔액 부족" : "결제 가능"}</span> : null}
        </div>
      ) : null}
    </div>
  ) : (
    <div style={{ fontSize: 12, color: gray, padding: "6px 2px" }}>쇼핑 기록이 없습니다.</div>
  );

  // ── 갖고 싶은 것 (위시리스트)
  const wishList = wish.length ? (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 11, color: gray }}>
        <span>🔒</span>
        <span>{handle + "의 위시리스트 · 나만 보기"}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6 }}>
        {wish.map((w, i) => {
          const pct = w.price && cash !== null ? Math.min(100, (cash / w.price) * 100) : null;
          return (
            <div key={i} className="oh-card" style={{ position: "relative", padding: 9, border: "1px solid " + line, borderRadius: 3, background: "#fff" }}>
              <span style={{ position: "absolute", right: 9, top: 8, color: "#d64a6b", fontSize: 13 }}>♥</span>
              <div style={{ display: "flex", gap: 9, alignItems: "flex-start", paddingRight: 14 }}>
                <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 3, background: "linear-gradient(#fdf5f7, #f3e6ea)", border: "1px solid #f0dfe4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{ohThumb(w.name)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#2a2d31", wordBreak: "keep-all" }}>{w.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2a2d31", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{w.price ? "$" + w.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : w.priceRaw || "가격 미정"}</div>
                  {w.since ? <div style={{ fontSize: 10.5, color: "#a3a9b0", marginTop: 1 }}>{"담은 날 · " + w.since}</div> : null}
                </div>
              </div>
              {w.memo ? <div style={{ fontSize: 12, color: "#5b4a2e", marginTop: 6, fontFamily: hand, wordBreak: "keep-all" }}>{"✎ " + w.memo}</div> : null}
              {pct !== null ? (
                <div style={{ marginTop: 7 }}>
                  <div style={{ height: 4, borderRadius: 2, background: "#f0f2f4", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: Math.max(1.5, pct) + "%", background: pct >= 100 ? "#2e7d4f" : "#d64a6b" }} />
                  </div>
                  <div style={{ fontSize: 10, color: gray, marginTop: 2 }}>{"지갑으로 " + (pct >= 100 ? "살 수 있음" : (pct < 1 ? pct.toFixed(1) : Math.round(pct)) + "%")}</div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  ) : (
    <div style={{ fontSize: 12, color: gray, padding: "6px 2px" }}>담아 둔 물건이 없습니다.</div>
  );

  // ── 글·댓글
  const postList = posts.length ? (
    <div style={{ display: "grid", gap: 6 }}>
      {posts.map((t, i) => (
        <div key={i} className="oh-card" style={{ padding: "9px 11px", border: "1px solid " + line, borderRadius: 3, background: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <span style={{ width: 14, height: 14, borderRadius: 2, background: "hsl(" + ohHue(t.site) + ",45%,42%)", color: "#fff", fontSize: 9, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{(t.site || "?").slice(0, 1)}</span>
            <span style={{ fontWeight: 700, color: "#2a2d31" }}>{t.site}</span>
            <span style={{ color: "#a3a9b0" }}>{t.time}</span>
            <span style={{ marginLeft: "auto", color: gray }}>{"by " + handle}</span>
          </div>
          {t.title ? <div style={{ fontSize: 13, fontWeight: 700, color: blue, marginTop: 5, wordBreak: "break-word" }}>{t.title}</div> : null}
          {t.body ? <div style={{ fontSize: 12, color: "#333", marginTop: 3, lineHeight: 1.45, wordBreak: "break-word" }}>{t.body}</div> : null}
          {t.ko ? <div style={{ fontSize: 11.5, color: gray, marginTop: 3, lineHeight: 1.45, wordBreak: "keep-all" }}>{t.ko}</div> : null}
          {t.react ? (
            <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginTop: 7, padding: "5px 8px", background: "#f5f7f9", borderRadius: 2, fontSize: 11.5, color: "#4a4f56", wordBreak: "break-word" }}>
              {icon(chatD, 12, "#8a929c")}
              <span>{t.react}</span>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  ) : (
    <div style={{ fontSize: 12, color: gray, padding: "6px 2px" }}>남긴 글이 없습니다.</div>
  );

  const body = (
    <div key={tab} className="oh-tab" style={{ padding: "4px 16px 18px" }}>
      <div style={{ fontSize: 11.5, color: gray, marginTop: 10 }}>
        <b style={{ color: "#2a2d31" }}>오늘</b> — {date}
      </div>
      {tab === "all" || tab === "q" ? secHead(glassD, "검색", rows.length) : null}
      {tab === "all" || tab === "q" ? searchList : null}
      {tab === "all" || tab === "shop" ? secHead(cartD, "쇼핑", shop.length) : null}
      {tab === "all" || tab === "shop" ? shopList : null}
      {tab === "all" || tab === "wish" ? secHead(heartD, "갖고 싶은 것", wish.length) : null}
      {tab === "all" || tab === "wish" ? wishList : null}
      {tab === "all" || tab === "post" ? secHead(chatD, "글·댓글", posts.length) : null}
      {tab === "all" || tab === "post" ? postList : null}
    </div>
  );

  const screen = (
    <div style={{ position: "relative", height: 400, display: "flex", flexDirection: "column", overflow: "hidden", background: "#fff", fontFamily: ui, boxShadow: "inset 0 0 0 1px #000" }}>
      {titleBar}
      {tabBar}
      {toolBar}
      <div className="oh-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", background: "#f7f8fa" }}>
        {head}
        {body}
      </div>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(115deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0) 35%), radial-gradient(ellipse at 50% 120%, rgba(0,0,0,.06), transparent 60%)" }} />
    </div>
  );

  const note = sticky ? (
    <div style={{ position: "absolute", right: -10, top: -14, zIndex: 3, width: 96, minHeight: 74, padding: "10px 9px 9px", boxSizing: "border-box", transform: "rotate(5deg)", background: "linear-gradient(#fff6a0, #fbe96a)", boxShadow: "0 6px 10px rgba(0,0,0,.35)", fontFamily: hand, fontSize: 11.5, lineHeight: 1.25, color: "#3b3320", whiteSpace: "pre-line", pointerEvents: "none" }}>
      <span style={{ position: "absolute", left: "50%", top: -6, width: 34, height: 12, marginLeft: -17, background: "rgba(255,255,255,.55)", transform: "rotate(-3deg)" }} />
      {sticky}
    </div>
  ) : null;

  return (
    <div style={{ width: "100%", boxSizing: "border-box", padding: "16px 10px 4px" }}>
      <style>{OH_CSS}</style>
      <div style={{ position: "relative", maxWidth: 540, margin: "0 auto" }}>
        {note}
        <div style={{ padding: "14px 14px 0", borderRadius: "10px 10px 6px 6px", background: "linear-gradient(#2e2e2e, #1b1b1b)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.08), 0 14px 28px rgba(0,0,0,.45)" }}>
          {screen}
          <div style={{ position: "relative", height: 30, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, padding: "0 6px" }}>
            <span style={{ position: "absolute", left: "50%", top: 9, width: 46, height: 10, marginLeft: -23, borderRadius: 2, background: "linear-gradient(#3a3a3a, #262626)", boxShadow: "inset 0 1px 1px rgba(0,0,0,.6)" }} />
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{ width: 9, height: 4, borderRadius: 1, background: "#3a3a3a", boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)" }} />
            ))}
            <span style={{ width: 6, height: 6, marginLeft: 6, borderRadius: "50%", background: "#8fe08a", boxShadow: "0 0 6px rgba(143,224,138,.8)" }} />
          </div>
        </div>
        <div style={{ width: 54, height: 30, margin: "0 auto", background: "linear-gradient(90deg, #1a1a1a, #333 50%, #1a1a1a)" }} />
        <div style={{ width: 230, height: 12, margin: "0 auto", borderRadius: "50% / 100% 100% 0 0", background: "linear-gradient(#333, #161616)", boxShadow: "0 8px 14px rgba(0,0,0,.4)" }} />
      </div>
    </div>
  );
}

function ohHooks() {
  const R = typeof React !== "undefined" && React ? React : {};
  return {
    s: R.useState || (typeof useState === "function" ? useState : null),
    e: R.useEffect || (typeof useEffect === "function" ? useEffect : null),
  };
}

function ohVal(v, d) {
  if (v === undefined || v === null) return d;
  const s = String(v).trim();
  return s === "" || s === "undefined" || s === "null" ? d : s;
}

function ohList(v) {
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
  return s.split(/\n|;/).map((x) => x.trim()).filter(Boolean);
}

// searches: "시간|검색어(영어 그대로)|정정(없으면 비움)|한국어 뜻|들어간 곳|그다음"
function ohSearch(s) {
  const a = String(s).split("|").map((x) => x.trim());
  return { time: a[0] || "", query: a[1] || "", fix: a[2] || "", ko: a[3] || "", site: a[4] || "", then: a[5] || "" };
}

// shop: "상품|가격|판매처|상태|메모"  상태: 장바구니 / 입찰 중 … / 관심 / 주문함 / 뺌
function ohShop(s) {
  const a = String(s).split("|").map((x) => x.trim());
  const price = Number(String(a[1] || "").replace(/[^0-9.]/g, "")) || 0;
  const st = a[3] || "장바구니";
  const kind = /입찰|경매|bid/i.test(st) ? "bid" : /관심|찜|♡/.test(st) ? "watch" : /주문|구매|샀/.test(st) ? "done" : /뺌|삭제|취소/.test(st) ? "out" : "cart";
  return { name: a[0] || "", price, seller: a[2] || "", status: st, kind, memo: a[4] || "" };
}

// wish: "물건|가격|담은 날|메모"  가격은 숫자(달러). 모르면 "가격 미정"
function ohWish(s) {
  const a = String(s).split("|").map((x) => x.trim());
  const raw = a[1] || "";
  const num = Number(raw.replace(/[^0-9.]/g, ""));
  return { name: a[0] || "", price: /[0-9]/.test(raw) && isFinite(num) && num > 0 ? num : null, priceRaw: raw, since: a[2] || "", memo: a[3] || "" };
}

// posts: "시간|사이트|제목|본문(영어)|한국어 뜻|반응"
function ohPost(s) {
  const a = String(s).split("|").map((x) => x.trim());
  return { time: a[0] || "", site: a[1] || "", title: a[2] || "", body: a[3] || "", ko: a[4] || "", react: a[5] || "" };
}

function ohThumb(name) {
  const s = String(name || "");
  if (/진공관|tube/i.test(s)) return "💡";
  if (/프로판|가스|propane/i.test(s)) return "🔥";
  if (/패치|약|patch/i.test(s)) return "🩹";
  if (/줄|스트링|string/i.test(s)) return "🧵";
  if (/기타|넥|바디|깁슨|마틴|펜더|길드|텔레캐스터|guitar|gibson|martin|fender/i.test(s)) return "🎸";
  if (/앰프|amp|스피커/i.test(s)) return "🔊";
  if (/LP|레코드|음반|CD|카세트/i.test(s)) return "💿";
  if (/고양이|사료|cat|dog/i.test(s)) return "🐾";
  if (/부츠|워커|신발|boots/i.test(s)) return "🥾";
  if (/재킷|코트|셔츠|옷|jacket/i.test(s)) return "🧥";
  if (/담배|타바코|tobacco/i.test(s)) return "🚬";
  if (/공구|인두|납|드라이버/i.test(s)) return "🔧";
  return "📦";
}

function ohHue(name) {
  let h = 0;
  const s = String(name || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

const OH_CSS = `
.oh-row:hover { background: #f3f7f8; }
.oh-card { transition: box-shadow .15s ease; }
.oh-card:hover { box-shadow: 0 2px 6px rgba(0,0,0,.08); }
@keyframes ohOpen { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.oh-open, .oh-tab { animation: ohOpen .18s ease-out both; }
.oh-scroll { scrollbar-width: thin; scrollbar-color: #b9c2cc #eef1f4; }
.oh-scroll::-webkit-scrollbar { width: 10px; }
.oh-scroll::-webkit-scrollbar-track { background: #eef1f4; }
.oh-scroll::-webkit-scrollbar-thumb { background: #b9c2cc; border: 2px solid #eef1f4; border-radius: 5px; }
@media (prefers-reduced-motion: reduce) { .oh-open, .oh-tab { animation: none !important; } }
`;
