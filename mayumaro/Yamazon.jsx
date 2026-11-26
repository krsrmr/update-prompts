// 필요 훅: useState, useRef
// 필요 기능: sendMessage (없으면 복사로 대신함)
// !야마존: 통판 사이트 'ヤマゾン'. 상품을 장바구니에 담고 결제하면 주문 내용을 {{user}}의 메시지로 보낸다.
// props (봇이 채우는 칸)
//   theme : 트렌드 코너 제목 "日本語|한국어"
//   trend : 트렌드 상품 목록. 항목 하나 = "이모지|상품명JA|상품명KO|가격|한 줄 소개KO"
//   wish  : 마시로의 위시리스트. 항목 하나 = "이모지|상품명JA|상품명KO|가격|메모JA|메모KO"
//   date  : 상태창 날짜. 장기기억 인풋용 줄에 들어간다
// 추천 코너·성인 코너 상품은 맨 아래 YZ_PICKS · YZ_ADULT에서 고친다. 끝 칸은 포장 모양(box·kraft·pouch·bottle·jar·card·tag·hanger·book·plain).
// 브랜드·할인·옵션·리뷰는 코드가 상품 이름으로 정한다(봇 부담 없음). 리뷰는 YZ_REV_* 목록.
// 장바구니는 이 화면 안에만 임시로 남는다(다시 열면 비어 있다).
// 주문 뒤 완료 화면에 '장기기억 인풋용' 한 줄과 복사 버튼이 나온다.

function Yamazon(props = {}) {
  const { theme = "", trend = [], wish = [], date = "" } = props;
  const [tab, setTab] = useState(props._tab || "pick");
  const [adultOk, setAdultOk] = useState(!!props._age);
  const [gate, setGate] = useState(false);
  const [view, setView] = useState(props._view || "shop");
  const [cart, setCart] = useState(props._cart || {});
  const [itemId, setItemId] = useState(props._item || null);
  const [bought, setBought] = useState([]);
  const [query, setQuery] = useState("");
  const [ship, setShip] = useState("normal");
  const [named, setNamed] = useState(true);
  const [card, setCard] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(null);
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef(null);
  const toastTimer = useRef(null);
  const savedScroll = useRef(0);

  const c = YZ_COLORS;
  const items = yzBuild(trend, wish);
  const byId = {};
  items.forEach((it) => { byId[it.id] = it; });
  const themeP = String(theme || "").split("|");
  const themeJa = themeP[0] || "いま売れているギフト";
  const themeKo = themeP[1] || "지금 잘 팔리는 선물";

  const lines = Object.keys(cart)
    .map((key) => { const p = key.split("~"); return { key, it: byId[p[0]], opt: p[1] || "", n: cart[key] }; })
    .filter((l) => l.it && l.n > 0);
  const count = lines.reduce((s, l) => s + l.n, 0);
  const subtotal = lines.reduce((s, l) => s + l.it.price * l.n, 0);
  const shipFee = ship === "fast" ? YZ_FAST_FEE : 0;
  const total = subtotal + shipFee;
  const inCart = (id) => lines.filter((l) => l.it.id === id).reduce((s, l) => s + l.n, 0);

  const toTop = () => { try { if (scrollRef.current) scrollRef.current.scrollTop = 0; } catch (e) {} };
  const go = (v) => { setView(v); setToast(""); toTop(); };
  const pickTab = (t) => {
    setQuery("");
    if (t === "adult" && !adultOk) { setGate(true); return; }
    setTab(t);
    go("shop");
  };
  const showToast = (msg) => {
    setToast(msg);
    try { clearTimeout(toastTimer.current); } catch (e) {}
    toastTimer.current = setTimeout(() => setToast(""), 1600);
  };
  const openItem = (id) => {
    try { if (view === "shop" && scrollRef.current) savedScroll.current = scrollRef.current.scrollTop; } catch (e) {}
    setItemId(id);
    go("item");
  };
  const backToShop = () => {
    setView("shop");
    setTimeout(() => { try { scrollRef.current.scrollTop = savedScroll.current; } catch (e) {} }, 0);
  };
  const putCart = (key, n) => {
    const next = { ...cart };
    if (n > 0) next[key] = Math.min(YZ_MAX_QTY, n); else delete next[key];
    setCart(next);
  };
  const addCart = (id, opt, n, now) => {
    const key = opt ? id + "~" + opt : id;
    setCart({ ...cart, [key]: Math.min(YZ_MAX_QTY, (cart[key] || 0) + n) });
    if (now) go("checkout"); else showToast("カートに入れました");
  };

  const q = query.trim().toLowerCase();
  const shown = q
    ? items.filter((it) => (it.cat !== "adult" || adultOk) && (it.ja + " " + it.ko + " " + it.desc).toLowerCase().indexOf(q) >= 0)
    : items.filter((it) => it.cat === tab);

  const place = () => {
    if (!lines.length) return;
    const text = yzOrderText(lines, ship, named, card, note, total);
    const how = yzSend(text);
    setSent({ no: "YZ-" + String(Math.floor(100000 + Math.random() * 900000)), text, how, ship, named, memo: yzMemoText(lines, named, date) });
    setBought(bought.concat(lines.map((l) => l.it.id)));
    setCopied(false);
    setCart({});
    setCard("");
    setNote("");
    go("done");
  };

  const cur = itemId ? byId[itemId] : null;

  return (
    <div style={{ width: "100%", margin: "8px 0", fontFamily: YZ_FONT, color: c.ink }}>
      <div style={{ position: "relative", height: YZ_HEIGHT, display: "flex", flexDirection: "column", background: c.page, borderRadius: 14, overflow: "hidden", boxShadow: "0 6px 22px -10px rgba(0,0,0,.45)", border: "1px solid " + c.line }}>
        {/* 머리 */}
        <div style={{ flex: "none", background: c.navy, color: "#fff", padding: "10px 12px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button type="button" onClick={() => pickTab("pick")} style={yzBare({ display: "flex", alignItems: "flex-end", gap: 2, color: "#fff" })} aria-label="トップへ">
              <YzLogo />
            </button>
            <div style={{ flex: 1 }} />
            <button type="button" onClick={() => go("cart")} style={yzBare({ position: "relative", display: "flex", alignItems: "center", gap: 4, color: "#fff", padding: "4px 2px" })} aria-label="カート">
              <YzCartIcon />
              <span style={{ position: "absolute", top: -2, left: 13, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8, background: c.amber, color: c.navy, fontSize: 11, fontWeight: 800, lineHeight: "16px", textAlign: "center" }}>{count}</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>カート</span>
            </button>
          </div>
          <div style={{ display: "flex", marginTop: 8, borderRadius: 8, overflow: "hidden", background: "#fff" }}>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); if (view !== "shop") go("shop"); }}
              placeholder="ヤマゾンで検索 · 상품 검색"
              style={{ flex: 1, minWidth: 0, border: 0, outline: "none", padding: "8px 10px", fontSize: 14, fontFamily: "inherit", color: c.ink, background: "#fff" }}
            />
            <span style={{ flex: "none", width: 40, display: "flex", alignItems: "center", justifyContent: "center", background: c.amber }}><YzSearchIcon /></span>
          </div>
        </div>
        <div style={{ flex: "none", background: c.navy2, color: "#dfe6ee", fontSize: 11.5, padding: "5px 12px", display: "flex", gap: 6, alignItems: "center" }}>
          <span aria-hidden="true">📍</span>
          <span>お届け先: <b style={{ color: "#fff" }}>真白 様</b> — 大阪市阿倍野区</span>
        </div>
        {/* 탭 */}
        <div style={{ flex: "none", display: "flex", gap: 6, padding: "8px 10px", background: "#fff", borderBottom: "1px solid " + c.line, overflowX: "auto" }}>
          {YZ_TABS.map((t) => {
            const on = (view === "shop" && !q && tab === t.id) || (view === "item" && cur && cur.cat === t.id);
            const adult = t.id === "adult";
            return (
              <button key={t.id} type="button" onClick={() => pickTab(t.id)}
                style={yzBare({ flex: "none", padding: "5px 11px 4px", borderRadius: 999, border: "1px solid " + (on ? (adult ? c.plum : c.navy) : c.line), background: on ? (adult ? c.plum : c.navy) : "#fff", color: on ? "#fff" : c.ink, textAlign: "center", lineHeight: 1.15 })}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 700 }}>{t.ja}</span>
                <span style={{ display: "block", fontSize: 10, opacity: 0.75 }}>{t.ko}</span>
              </button>
            );
          })}
        </div>

        {/* 본문 (스크롤) */}
        <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          {view === "shop" ? (
            <div style={{ padding: "10px 10px 16px" }}>
              {q ? (
                <YzHead ja={"「" + query.trim() + "」の検索結果"} ko={"검색 결과 " + shown.length + "개"} />
              ) : tab === "trend" ? (
                <div style={{ borderRadius: 12, padding: "14px 14px 12px", marginBottom: 10, background: "linear-gradient(120deg,#ffe3b3,#ffd0d6 55%,#d9d6ff)", color: c.ink }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".08em", color: "#9a5a12" }}>TREND · いま話題</div>
                  <div lang="ja" style={{ fontSize: 18, fontWeight: 800, marginTop: 3, lineHeight: 1.3 }}>{themeJa}</div>
                  <div lang="ko" style={{ fontSize: 12, color: c.sub, marginTop: 2 }}>{themeKo}</div>
                </div>
              ) : tab === "wish" ? (
                <div style={{ borderRadius: 12, padding: "12px 14px", marginBottom: 10, background: "#fff", border: "1px solid " + c.line }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 22 }} aria-hidden="true">🐰</span>
                    <div>
                      <div lang="ja" style={{ fontSize: 15, fontWeight: 800 }}>真白さんのほしい物リスト</div>
                      <div lang="ko" style={{ fontSize: 11, color: c.sub }}>마시로의 위시리스트 · 마시로는 당신이 이걸 보는 줄 몰라요</div>
                    </div>
                  </div>
                </div>
              ) : tab === "adult" ? (
                <div style={{ borderRadius: 12, padding: "12px 14px", marginBottom: 10, background: "linear-gradient(120deg,#3b1830,#5a2346)", color: "#fff" }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>🔞 大人のコーナー <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>성인용품</span></div>
                  <div lang="ja" style={{ fontSize: 11.5, marginTop: 4, opacity: 0.9 }}>中身がわからない梱包でお届けします</div>
                  <div lang="ko" style={{ fontSize: 10.5, opacity: 0.7 }}>내용물이 보이지 않게 포장해 보내 드려요</div>
                </div>
              ) : (
                <YzHead ja="あなたへのおすすめギフト" ko="당신을 위한 추천 선물" />
              )}

              {shown.length ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 8 }}>
                  {shown.map((it, i) => (
                    <YzCard key={it.id} it={it} idx={i} inCart={inCart(it.id)} bought={bought.indexOf(it.id) >= 0} onOpen={() => openItem(it.id)} />
                  ))}
                </div>
              ) : (
                <div style={{ padding: "40px 10px", textAlign: "center", color: c.sub, fontSize: 13 }}>
                  {q ? "見つかりませんでした · 검색 결과가 없어요" : "ただいま準備中です · 준비 중이에요"}
                </div>
              )}
              <div style={{ textAlign: "center", fontSize: 10, color: c.faint, marginTop: 18 }}>yamazon.co.jp · この世界だけの架空のサイトです</div>
            </div>
          ) : view === "item" && cur ? (
            <YzItemPage key={cur.id} it={cur} items={items} bought={bought.indexOf(cur.id) >= 0}
              onBack={backToShop} onAdd={addCart} onOpen={openItem} />
          ) : view === "cart" ? (
            <div style={{ padding: "10px 10px 16px" }}>
              <YzBack label="買い物を続ける" onClick={backToShop} />
              <YzHead ja="ショッピングカート" ko="장바구니" />
              {lines.length ? (
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid " + c.line }}>
                  {lines.map((l, i) => (
                    <div key={l.key} style={{ display: "flex", gap: 10, padding: 10, borderTop: i ? "1px solid " + c.line : "none" }}>
                      <button type="button" onClick={() => openItem(l.it.id)} style={yzBare({ flex: "none" })}><YzThumb it={l.it} size={68} /></button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div lang="ja" style={yzClamp(2, { fontSize: 13, lineHeight: 1.35 })}>{yzMark(l.it)}{l.it.ja}</div>
                        <div lang="ko" style={yzClamp(1, { fontSize: 11, color: c.sub })}>{l.it.ko}</div>
                        {l.opt ? <div style={{ fontSize: 11, color: c.sub }}>{yzOptName(l.opt)}: {l.opt}</div> : null}
                        <div style={{ fontSize: 14, fontWeight: 700, color: c.price, marginTop: 2 }}>¥{yzYen(l.it.price)}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                          <YzStepper n={l.n} onChange={(n) => putCart(l.key, n)} min={0} />
                          <button type="button" onClick={() => putCart(l.key, 0)} style={yzBare({ fontSize: 12, color: c.link })}>削除</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: "10px 12px", borderTop: "1px solid " + c.line, textAlign: "right", fontSize: 14 }}>
                    小計 ({count}点): <b style={{ color: c.price, fontSize: 16 }}>¥{yzYen(subtotal)}</b>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "40px 10px", textAlign: "center", color: c.sub, fontSize: 13 }}>
                  カートは空です<br /><span style={{ fontSize: 11 }}>장바구니가 비어 있어요</span>
                </div>
              )}
              {lines.length ? <YzBigBtn onClick={() => go("checkout")} ja="レジに進む" ko="결제하기" /> : null}
            </div>
          ) : view === "checkout" ? (
            <div style={{ padding: "10px 10px 18px" }}>
              <YzBack label="カートに戻る" onClick={() => go("cart")} />
              <YzHead ja="ご注文内容の確認" ko="주문 확인" />

              <YzBox title="お届け先" ko="받는 곳">
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>真白 様</div>
                <div style={{ fontSize: 12, color: c.sub }}>大阪府大阪市阿倍野区 · 真白さんのお宅</div>
              </YzBox>

              <YzBox title="配送方法" ko="배송 방법">
                {YZ_SHIP.map((s) => (
                  <YzRadio key={s.id} on={ship === s.id} onClick={() => setShip(s.id)}
                    ja={s.ja} fee={s.id === "fast" ? "¥" + yzYen(YZ_FAST_FEE) : "無料"} sub={s.sub} ko={s.ko} />
                ))}
              </YzBox>

              <YzBox title="送り主" ko="보내는 사람">
                <div style={{ display: "flex", gap: 6 }}>
                  <YzSeg on={named} onClick={() => setNamed(true)} ja="名前を表示" ko="내 이름 표시" />
                  <YzSeg on={!named} onClick={() => setNamed(false)} ja="匿名で送る" ko="익명" />
                </div>
                <div style={{ fontSize: 11, color: c.sub, marginTop: 6 }}>
                  {named ? "마시로가 당신이 보낸 걸 알아요." : "마시로는 누가 보냈는지 몰라요."}
                </div>
              </YzBox>

              <YzBox title="ギフトメッセージ" ko="선물 카드 (선택)">
                <input value={card} maxLength={60} onChange={(e) => setCard(e.target.value.replace(/["|]/g, ""))}
                  placeholder="カードに書く一言 · 카드에 적을 한마디"
                  style={yzField()} />
              </YzBox>

              <YzBox title="一緒に送る文" ko="덧붙이기 (선택)">
                <textarea value={note} rows={2} onChange={(e) => setNote(e.target.value)}
                  placeholder="주문 글 뒤에 붙어 같이 보내질 내 행동·대사"
                  style={yzField({ resize: "vertical", minHeight: 52 })} />
              </YzBox>

              <YzBox title="ご注文商品" ko="주문 상품">
                {lines.map((l) => (
                  <div key={l.key} style={{ display: "flex", gap: 8, alignItems: "baseline", fontSize: 12.5, padding: "3px 0" }}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      {yzMark(l.it)}{l.it.ja}{l.opt ? "〈" + l.opt + "〉" : ""} <span style={{ color: c.sub, fontSize: 11 }}>{l.it.ko}</span>
                    </span>
                    <span style={{ flex: "none", color: c.sub }}>×{l.n}</span>
                    <span style={{ flex: "none", width: 72, textAlign: "right" }}>¥{yzYen(l.it.price * l.n)}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px dashed " + c.line, marginTop: 6, paddingTop: 6, fontSize: 12.5 }}>
                  <YzRow k="商品の小計" v={"¥" + yzYen(subtotal)} />
                  <YzRow k="配送料" v={shipFee ? "¥" + yzYen(shipFee) : "¥0"} />
                  <YzRow k={<b>ご請求額</b>} v={<b style={{ color: c.price, fontSize: 16 }}>¥{yzYen(total)}</b>} />
                </div>
              </YzBox>

              <YzBigBtn onClick={place} ja="注文を確定する" ko="주문 확정 · 메시지로 보내기" disabled={!lines.length} />
            </div>
          ) : (
            <div style={{ padding: "26px 16px 20px", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, margin: "0 auto", borderRadius: "50%", background: c.ok, color: "#fff", fontSize: 30, lineHeight: "56px" }}>✓</div>
              <div lang="ja" style={{ fontSize: 18, fontWeight: 800, marginTop: 12 }}>ご注文ありがとうございました</div>
              <div lang="ko" style={{ fontSize: 12, color: c.sub }}>주문이 완료됐어요</div>
              {sent ? (
                <div style={{ marginTop: 14, background: "#fff", border: "1px solid " + c.line, borderRadius: 12, padding: 12, textAlign: "left", fontSize: 12.5 }}>
                  <YzRow k="注文番号" v={sent.no} />
                  <YzRow k="配送" v={sent.ship === "fast" ? "お急ぎ便 · 今すぐ" : "通常配送 · 本日中"} />
                  <YzRow k="送り主" v={sent.named ? "名前を表示" : "匿名"} />
                  <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 8, background: sent.how === "sent" ? "#e8f6ec" : "#fff6e0", color: c.ink, fontSize: 12 }}>
                    {sent.how === "sent" ? "주문 내용을 메시지로 보냈어요." : sent.how === "copied" ? "주문 내용을 복사했어요. 입력창에 붙여넣어 보내세요." : "아래 글을 복사해 입력창에 붙여넣어 보내세요."}
                  </div>
                  {sent.how !== "sent" ? (
                    <textarea readOnly value={sent.text} rows={5} onFocus={(e) => { try { e.target.select(); } catch (x) {} }} style={yzField({ marginTop: 8, fontSize: 12 })} />
                  ) : null}
                </div>
              ) : null}
              {sent ? (
                <div style={{ marginTop: 10, background: "#fff", border: "1px solid " + c.line, borderRadius: 12, padding: 12, textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>📌 장기기억 인풋용 <span style={{ fontSize: 10.5, fontWeight: 400, color: c.sub }}>유저노트 · 기억란</span></div>
                  <div style={{ fontSize: 11, color: c.sub, marginTop: 2 }}>{"마시로가 상자를 연 뒤에 유저노트 혹은 기억 > 기억 추가에 붙여 넣으면, 받은 물건을 계속 기억해요."}</div>
                  <textarea readOnly value={sent.memo} rows={3} onFocus={(e) => { try { e.target.select(); } catch (x) {} }} style={yzField({ marginTop: 8, fontSize: 12 })} />
                  <button type="button" onClick={() => { if (yzCopy(sent.memo)) setCopied(true); }}
                    style={yzBare({ marginTop: 8, width: "100%", padding: "8px 0", borderRadius: 999, border: "1px solid " + (copied ? c.ok : c.line), background: copied ? "#e8f6ec" : "#fff", color: copied ? c.ok : c.ink, fontSize: 13, fontWeight: 700, textAlign: "center" })}>
                    {copied ? "✓ 복사됐어요" : "복사하기"}
                  </button>
                </div>
              ) : null}
              <YzBigBtn onClick={() => { setTab("pick"); go("shop"); }} ja="トップへ戻る" ko="처음으로" light={true} />
            </div>
          )}
        </div>

        {/* 아래 장바구니 줄 */}
        {view === "shop" && count > 0 ? (
          <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#fff", borderTop: "1px solid " + c.line }}>
            <span style={{ fontSize: 13 }}>🛒 <b>{count}</b>点 · <b style={{ color: c.price }}>¥{yzYen(subtotal)}</b></span>
            <div style={{ flex: 1 }} />
            <button type="button" onClick={() => go("cart")} style={yzBare({ padding: "7px 14px", borderRadius: 999, background: c.yellow, border: "1px solid " + c.yellowEdge, fontSize: 13, fontWeight: 700, color: c.ink })}>
              カートを見る ›
            </button>
          </div>
        ) : null}

        {/* 연령 확인 */}
        {gate ? (
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,20,28,.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ width: "100%", maxWidth: 300, background: "#fff", borderRadius: 14, padding: "18px 16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 30 }} aria-hidden="true">🔞</div>
              <div lang="ja" style={{ fontSize: 15, fontWeight: 800, marginTop: 4 }}>年齢確認</div>
              <div lang="ja" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>このコーナーは18歳以上の方専用です。<br />あなたは18歳以上ですか？</div>
              <div lang="ko" style={{ fontSize: 11, color: c.sub, marginTop: 4 }}>18세 이상만 들어갈 수 있어요. 18세 이상입니까?</div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button type="button" onClick={() => setGate(false)} style={yzBare({ flex: 1, padding: "9px 0", borderRadius: 999, border: "1px solid " + c.line, fontSize: 13, color: c.ink })}>いいえ</button>
                <button type="button" onClick={() => { setGate(false); setAdultOk(true); setTab("adult"); go("shop"); }} style={yzBare({ flex: 1, padding: "9px 0", borderRadius: 999, background: c.plum, color: "#fff", fontSize: 13, fontWeight: 700 })}>はい (OK)</button>
              </div>
            </div>
          </div>
        ) : null}

        {toast ? (
          <div style={{ position: "absolute", left: "50%", bottom: 64, transform: "translateX(-50%)", background: "rgba(22,28,38,.92)", color: "#fff", fontSize: 12.5, padding: "7px 14px", borderRadius: 999, whiteSpace: "nowrap" }}>✓ {toast}</div>
        ) : null}
      </div>
    </div>
  );
}

/* ───────── 상품 상세 페이지 ───────── */

function YzItemPage({ it, items, bought, onBack, onAdd, onOpen }) {
  const c = YZ_COLORS;
  const f = yzInfo(it);
  const [qty, setQty] = useState(1);
  const [opt, setOpt] = useState(f.opts ? f.opts.def : 0);
  const [slide, setSlide] = useState(0);
  const gal = useRef(null);
  const adult = it.cat === "adult";
  const optLabel = f.opts ? f.opts.list[opt] : "";
  const slides = [["pack", "パッケージ"], ["item", "商品イメージ"], ["ship", adult ? "お届け時の梱包" : "ギフト包装"]];
  const goSlide = (i) => {
    setSlide(i);
    try { gal.current.scrollTo({ left: i * gal.current.clientWidth, behavior: "smooth" }); } catch (e) {}
  };
  const rel = items.filter((x) => x.cat === it.cat && x.id !== it.id)
    .sort((a, b) => yzHash(it.id + a.id) - yzHash(it.id + b.id)).slice(0, 6);
  const revs = yzReviews(it, f.h);
  const dist = yzDist(it.rating);
  const idx = items.filter((x) => x.cat === it.cat).indexOf(it);

  return (
    <div style={{ padding: "8px 12px 20px" }}>
      <YzBack label="戻る" onClick={onBack} />
      <div style={{ fontSize: 12, color: c.link }}>ブランド: {f.brand}</div>
      <div lang="ja" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, marginTop: 2 }}>{yzMark(it)}{it.ja}</div>
      <div lang="ko" style={{ fontSize: 12, color: c.sub }}>{it.ko}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12.5 }}>{it.rating.toFixed(1)}</span>
        <YzStars r={it.rating} n={it.reviews} />
        <YzBadge it={it} idx={idx} />
      </div>
      <div style={{ fontSize: 11, color: c.sub, marginTop: 2 }}>過去1か月で{f.monthly}点以上購入されました</div>

      {/* 사진 */}
      <div style={{ position: "relative", marginTop: 10, borderRadius: 12, overflow: "hidden", border: "1px solid " + c.line }}>
        <div ref={gal} onScroll={(e) => { const el = e.currentTarget; const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth)); if (i !== slide) setSlide(i); }}
          style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>
          {slides.map((s) => (
            <div key={s[0]} style={{ position: "relative", flex: "0 0 100%", height: 250, scrollSnapAlign: "start", background: yzTileBg(it) }}>
              <YzPack it={it} mode={s[0]} />
              <span style={{ position: "absolute", left: 8, bottom: 8, fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "rgba(0,0,0,.45)", color: "#fff" }}>{s[1]}</span>
            </div>
          ))}
        </div>
        {bought ? <YzStamp big={true} /> : null}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>
        {slides.map((s, i) => (
          <button key={s[0]} type="button" aria-label={s[1]} onClick={() => goSlide(i)}
            style={yzBare({ width: i === slide ? 18 : 7, height: 7, borderRadius: 4, background: i === slide ? c.navy : "#c9ced4", transition: "width .2s" })} />
        ))}
      </div>

      {/* 가격 */}
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid " + c.line }}>
        {f.off ? <span style={{ display: "inline-block", background: "#cc0c39", color: "#fff", fontSize: 11, fontWeight: 800, borderRadius: 4, padding: "2px 6px", marginBottom: 4 }}>タイムセール</span> : null}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          {f.off ? <span style={{ color: "#cc0c39", fontSize: 22, fontWeight: 300 }}>-{f.off}%</span> : null}
          <span style={{ fontSize: 26, fontWeight: 800 }}><span style={{ fontSize: 13, verticalAlign: "top", marginRight: 1 }}>¥</span>{yzYen(it.price)}</span>
          <span style={{ fontSize: 11, color: c.sub }}>税込</span>
        </div>
        {f.off ? <div style={{ fontSize: 11.5, color: c.sub }}>参考価格: <s>¥{yzYen(f.ref)}</s></div> : null}
        <div style={{ fontSize: 11.5, color: "#c45500", marginTop: 2 }}>{yzYen(Math.max(1, Math.floor(it.price / 100)))}ポイント(1%)</div>
      </div>

      {/* 옵션 */}
      {f.opts ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12.5 }}>{f.opts.name}: <b>{optLabel}</b></div>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            {f.opts.list.map((o, i) => (
              <button key={o} type="button" onClick={() => setOpt(i)}
                style={yzBare({ minWidth: 44, padding: "6px 10px", borderRadius: 8, border: (i === opt ? "2px solid " + c.link : "1px solid " + c.line), background: "#fff", fontSize: 12.5, color: c.ink, textAlign: "center" })}>
                {f.opts.name === "カラー" ? <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: YZ_SWATCH[o] || "#ccc", marginRight: 5, verticalAlign: "-1px" }} /> : null}{o}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* 구매 상자 */}
      <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid " + c.line, background: "#fff" }}>
        <div style={{ fontSize: 12.5 }}><b style={{ color: c.ok }}>✓やまプライム</b> お急ぎ便なら <b>今すぐ</b> お届け</div>
        <div style={{ fontSize: 11, color: c.sub, marginTop: 1 }}>通常配送なら本日中 · お届け先: 真白 様</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 8, color: f.left ? "#cc0c39" : c.ok }}>
          {f.left ? "残り" + f.left + "点 ご注文はお早めに" : "在庫あり"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <span style={{ fontSize: 12, color: c.sub }}>数量</span>
          <YzStepper n={qty} onChange={setQty} min={1} />
        </div>
        <YzBigBtn onClick={() => onAdd(it.id, optLabel, qty, false)} ja="カートに入れる" ko="장바구니에 담기" />
        <button type="button" onClick={() => onAdd(it.id, optLabel, qty, true)}
          style={yzBare({ display: "block", width: "100%", marginTop: 8, padding: "10px 0 8px", borderRadius: 999, background: "#ffa41c", border: "1px solid #f08804", color: c.ink, textAlign: "center", lineHeight: 1.2 })}>
          <span style={{ display: "block", fontSize: 14.5, fontWeight: 800 }}>今すぐ買う</span>
          <span style={{ display: "block", fontSize: 10.5, color: "#5a3b00", marginTop: 1 }}>바로 결제하기</span>
        </button>
        {adult ? <div style={{ fontSize: 10.5, color: c.sub, marginTop: 8 }}>🔒 品名は「雑貨」と表記して発送します · 품명은 '잡화'로 적어 보내요</div> : null}
      </div>

      {/* 설명 */}
      {it.desc ? (
        <YzSec ja="商品の説明" ko="상품 설명">
          <div lang="ko" style={{ fontSize: 13, lineHeight: 1.6 }}>{it.desc}</div>
        </YzSec>
      ) : null}
      {it.cat === "wish" && (it.memoJa || it.memoKo) ? (
        <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, background: "#fff4f6", border: "1px dashed #f2b8c6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#c0607a", fontWeight: 700 }}>
            <span>真白さんのメモ</span>
            <span>ほしい度 {"♥♥♥".slice(0, f.want)}{"♡♡♡".slice(f.want)}</span>
          </div>
          {it.memoJa ? <div lang="ja" style={{ fontSize: 13, marginTop: 4 }}>{it.memoJa}</div> : null}
          {it.memoKo ? <div lang="ko" style={{ fontSize: 11.5, color: c.sub, marginTop: 2 }}>{it.memoKo}</div> : null}
        </div>
      ) : null}

      {/* 함께 산 상품 */}
      {rel.length ? (
        <YzSec ja="よく一緒に購入されている商品" ko="함께 많이 산 상품">
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            {rel.map((x) => (
              <button key={x.id} type="button" onClick={() => onOpen(x.id)}
                style={yzBare({ flex: "0 0 112px", textAlign: "left", background: "#fff", border: "1px solid " + c.line, borderRadius: 10, overflow: "hidden", color: c.ink })}>
                <div style={{ height: 84, background: yzTileBg(x) }}><YzPack it={x} mode="pack" /></div>
                <div style={{ padding: "5px 7px 7px" }}>
                  <div lang="ja" style={yzClamp(2, { fontSize: 11, lineHeight: 1.3 })}>{x.ja}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: c.price, marginTop: 2 }}>¥{yzYen(x.price)}</div>
                </div>
              </button>
            ))}
          </div>
        </YzSec>
      ) : null}

      {/* 리뷰 */}
      <YzSec ja="カスタマーレビュー" ko="고객 리뷰">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <YzStars r={it.rating} />
          <b style={{ fontSize: 14 }}>5つ星のうち{it.rating.toFixed(1)}</b>
        </div>
        <div style={{ fontSize: 11.5, color: c.sub, marginTop: 2 }}>{yzYen(it.reviews)}件のグローバル評価</div>
        <div style={{ marginTop: 8 }}>
          {dist.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: c.link, margin: "3px 0" }}>
              <span style={{ width: 34, flex: "none" }}>星{5 - i}つ</span>
              <span style={{ flex: 1, height: 14, borderRadius: 4, background: "#f0f2f2", border: "1px solid #e3e6e6", overflow: "hidden" }}>
                <span style={{ display: "block", width: p + "%", height: "100%", background: "#f2a33a" }} />
              </span>
              <span style={{ width: 30, flex: "none", textAlign: "right" }}>{p}%</span>
            </div>
          ))}
        </div>
        {revs.map((r, i) => (
          <div key={i} style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + c.line }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: r[1] === "まろ" ? "#fde3ea" : "#e3e6ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: r[1] === "まろ" ? 14 : 11, color: c.sub }}>{r[1] === "まろ" ? "🐰" : r[1].slice(0, 1)}</span>
              <span>{r[1]}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <YzStars r={r[0]} small={true} />
              <b lang="ja" style={{ fontSize: 12.5 }}>{r[2]}</b>
            </div>
            <div style={{ fontSize: 10.5, color: c.sub, marginTop: 2 }}>2026年{1 + ((f.h >>> (i * 3)) % 10)}月{1 + ((f.h >>> (i * 4 + 2)) % 27)}日に日本でレビュー済み · <span style={{ color: "#c45500" }}>ヤマゾンで購入</span></div>
            <div lang="ja" style={{ fontSize: 13, lineHeight: 1.55, marginTop: 5 }}>{r[3]}</div>
            <div lang="ko" style={{ fontSize: 11.5, lineHeight: 1.5, color: c.sub, marginTop: 2 }}>{r[4]}</div>
            <div style={{ fontSize: 11, color: c.sub, marginTop: 5 }}>{r[5]}人のお客様がこれが役に立ったと考えています</div>
          </div>
        ))}
      </YzSec>
    </div>
  );
}

/* ───────── 화면 조각 ───────── */

function YzCard({ it, idx, inCart, bought, onOpen }) {
  const c = YZ_COLORS;
  const f = yzInfo(it);
  return (
    <button type="button" onClick={onOpen}
      style={yzBare({ display: "flex", flexDirection: "column", textAlign: "left", background: "#fff", borderRadius: 12, border: "1px solid " + (inCart ? c.amber : c.line), overflow: "hidden", color: c.ink })}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", background: yzTileBg(it) }}>
        <YzPack it={it} mode="pack" />
        <div style={{ position: "absolute", top: 6, left: 6 }}><YzBadge it={it} idx={idx} /></div>
        {bought ? <YzStamp /> : null}
        {inCart ? <span style={{ position: "absolute", right: 6, bottom: 6, background: c.amber, color: c.navy, fontSize: 10.5, fontWeight: 800, borderRadius: 999, padding: "2px 7px" }}>カート ×{inCart}</span> : null}
      </div>
      <div style={{ padding: "7px 9px 9px", display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
        <div lang="ja" style={yzClamp(2, { fontSize: 12.5, lineHeight: 1.35, fontWeight: 600 })}>{it.ja}</div>
        <div lang="ko" style={yzClamp(1, { fontSize: 10.5, color: c.sub })}>{it.ko}</div>
        <YzStars r={it.rating} n={it.reviews} small={true} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 5, flexWrap: "wrap" }}>
          {f.off ? <span style={{ fontSize: 11, color: "#cc0c39", fontWeight: 700 }}>-{f.off}%</span> : null}
          <span style={{ fontSize: 15, fontWeight: 800, color: c.price }}>¥{yzYen(it.price)}</span>
          {f.off ? <s style={{ fontSize: 10, color: c.faint }}>¥{yzYen(f.ref)}</s> : null}
        </div>
        <div style={{ fontSize: 10, color: c.ok }}>✓やまプライム</div>
      </div>
    </button>
  );
}

function YzThumb({ it, size }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 10, overflow: "hidden", background: yzTileBg(it) }}>
      <YzPack it={it} mode="pack" />
    </div>
  );
}

function YzStamp({ big }) {
  return (
    <span style={{ position: "absolute", top: big ? 12 : 6, right: big ? 12 : 6, transform: "rotate(-12deg)", border: "2px solid #d0342c", color: "#d0342c", background: "rgba(255,255,255,.85)", borderRadius: 6, padding: big ? "3px 9px" : "1px 5px", fontSize: big ? 14 : 10, fontWeight: 800, letterSpacing: ".05em" }}>購入済み</span>
  );
}

/* 포장된 상품 그림. mode: pack(포장) · item(내용물) · ship(배송 포장) */
function YzPack({ it, mode }) {
  const f = yzInfo(it);
  const adult = it.cat === "adult";
  const EF = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
  const col = f.pack === "kraft" ? "#cf9d62" : (adult ? YZ_PACK_ADULT : YZ_PACK)[(f.h >>> 3) % (adult ? YZ_PACK_ADULT : YZ_PACK).length];
  const dark = yzShade(col, -0.25);
  const light = yzShade(col, 0.35);
  const lab = adult ? "#e0559b" : "#ffffff";
  const ink = adult ? "#ffffff" : dark;
  const em = (x, y, s) => <text x={x} y={y} fontSize={s} textAnchor="middle" dominantBaseline="central" style={{ fontFamily: EF }}>{it.e}</text>;
  const brand = (x, y, s, fill) => <text x={x} y={y} fontSize={s} textAnchor="middle" dominantBaseline="central" fill={fill || ink} fontWeight="700" style={{ fontFamily: "Arial,sans-serif", letterSpacing: ".04em" }}>{f.brand}</text>;
  let body = null;
  if (mode === "item") {
    body = <g><circle cx="80" cy="60" r="40" fill="#fff" />{em(80, 60, 52)}</g>;
  } else if (mode === "ship") {
    body = adult ? (
      <g>
        <rect x="30" y="26" width="100" height="76" rx="6" fill="#aeb3bb" />
        <path d="M30 40 L130 40" stroke="#9aa0a8" strokeWidth="2" />
        <rect x="48" y="50" width="64" height="40" rx="2" fill="#fff" />
        <text x="54" y="60" fontSize="6" fill="#333" style={{ fontFamily: "sans-serif" }}>品名: 雑貨</text>
        <text x="54" y="70" fontSize="5" fill="#666" style={{ fontFamily: "sans-serif" }}>ご依頼主: ヤマゾン</text>
        {[0, 2, 3, 5, 7, 8, 10, 12, 13, 15, 17, 18, 20].map((b) => <rect key={b} x={56 + b * 2.2} y="76" width={b % 3 ? 1 : 1.8} height="9" fill="#333" />)}
      </g>
    ) : (
      <g>
        <rect x="42" y="34" width="76" height="66" rx="4" fill={col} />
        <rect x="42" y="28" width="76" height="12" rx="3" fill={light} />
        <rect x="75" y="28" width="10" height="72" fill="#f6d36b" />
        <rect x="42" y="58" width="76" height="9" fill="#f6d36b" />
        <ellipse cx="70" cy="24" rx="11" ry="6" fill="#f2c443" transform="rotate(-20 70 24)" />
        <ellipse cx="90" cy="24" rx="11" ry="6" fill="#f2c443" transform="rotate(20 90 24)" />
        <circle cx="80" cy="27" r="4.5" fill="#e8b430" />
        <text x="100" y="88" fontSize="7" fill="#fff" fontWeight="700" textAnchor="middle" style={{ fontFamily: "Georgia,serif", fontStyle: "italic" }}>Gift</text>
      </g>
    );
  } else if (f.pack === "pouch") {
    body = (
      <g>
        <path d="M52 26 H108 L110 34 Q114 70 116 100 Q116 106 110 106 H50 Q44 106 44 100 Q46 70 50 34 Z" fill={col} />
        <rect x="52" y="26" width="56" height="6" fill={dark} opacity=".35" />
        <path d="M54 38 H106" stroke={dark} strokeDasharray="2 2" opacity=".5" />
        <ellipse cx="80" cy="66" rx="20" ry="18" fill="#fff" opacity=".85" />
        {em(80, 66, 24)}
        <rect x="58" y="88" width="44" height="10" rx="2" fill={lab} opacity=".92" />
        {brand(80, 93, 5.5)}
        <path d="M51 44 Q49 70 49 96" stroke="#fff" strokeWidth="3" opacity=".3" fill="none" strokeLinecap="round" />
      </g>
    );
  } else if (f.pack === "bottle") {
    body = (
      <g>
        <rect x="70" y="14" width="20" height="13" rx="2" fill={dark} />
        <rect x="72" y="26" width="16" height="9" fill={light} />
        <rect x="54" y="33" width="52" height="73" rx="13" fill={col} />
        <rect x="58" y="54" width="44" height="38" rx="4" fill={lab} opacity=".92" />
        {em(80, 70, 20)}
        {brand(80, 86, 5)}
        <rect x="60" y="40" width="5" height="58" rx="2.5" fill="#fff" opacity=".35" />
      </g>
    );
  } else if (f.pack === "jar") {
    body = (
      <g>
        <rect x="50" y="48" width="60" height="58" rx="11" fill={light} opacity=".75" stroke={col} strokeWidth="2" />
        <rect x="52" y="38" width="56" height="13" rx="3" fill={dark} />
        {em(80, 74, 30)}
        <rect x="58" y="92" width="44" height="9" rx="2" fill={lab} opacity=".92" />
        {brand(80, 96.5, 5)}
        <rect x="56" y="56" width="4" height="40" rx="2" fill="#fff" opacity=".5" />
      </g>
    );
  } else if (f.pack === "card") {
    body = (
      <g>
        <rect x="50" y="12" width="60" height="96" rx="4" fill={col} />
        <rect x="72" y="17" width="16" height="4.5" rx="2.2" fill="rgba(255,255,255,.9)" />
        <rect x="56" y="32" width="48" height="52" rx="10" fill="#fff" opacity=".55" stroke="#fff" strokeOpacity=".9" />
        {em(80, 58, 28)}
        {brand(80, 97, 6, "#fff")}
      </g>
    );
  } else if (f.pack === "tag") {
    body = (
      <g>
        {em(78, 66, 58)}
        <path d="M100 42 L112 32" stroke="#999" strokeWidth="1" />
        <g transform="rotate(14 120 38)">
          <rect x="108" y="28" width="26" height="17" rx="2.5" fill={col} />
          <circle cx="111.5" cy="36.5" r="1.6" fill="#fff" />
          <text x="122.5" y="37" fontSize="5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontWeight="700" style={{ fontFamily: "Arial,sans-serif" }}>NEW</text>
        </g>
      </g>
    );
  } else if (f.pack === "hanger") {
    body = (
      <g>
        <path d="M80 13 q6 0 6 5 q0 4 -6 6 L44 38 H116 L80 24" stroke="#8a8f98" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {em(80, 76, 54)}
      </g>
    );
  } else if (f.pack === "book") {
    body = (
      <g>
        <rect x="52" y="18" width="58" height="86" rx="2" fill={col} />
        <rect x="108" y="20" width="5" height="82" fill="#f3efe6" />
        <rect x="52" y="18" width="7" height="86" fill={dark} />
        <rect x="64" y="28" width="40" height="7" rx="1" fill={lab} opacity=".9" />
        {em(84, 64, 28)}
        {brand(84, 94, 5.5, "#fff")}
      </g>
    );
  } else if (f.pack === "plain") {
    body = <g><ellipse cx="80" cy="98" rx="34" ry="8" fill={light} />{em(80, 62, 58)}</g>;
  } else {
    body = (
      <g>
        <polygon points="46,32 58,22 124,22 112,32" fill={light} />
        <polygon points="112,32 124,22 124,96 112,106" fill={dark} />
        <rect x="46" y="32" width="66" height="74" fill={col} />
        <rect x="46" y="84" width="66" height="13" fill={lab} opacity=".92" />
        {brand(79, 90.5, 6)}
        {em(79, 58, 30)}
      </g>
    );
  }
  return (
    <svg viewBox="0 0 160 120" width="100%" height="100%" aria-hidden="true" style={{ display: "block" }}>
      <ellipse cx="80" cy="109" rx="44" ry="5" fill="rgba(0,0,0,.13)" />
      {body}
    </svg>
  );
}

function YzBadge({ it, idx }) {
  let t = "";
  let bg = YZ_COLORS.navy;
  if (it.cat === "pick" && it.badge) { t = it.badge; bg = it.badge === "ベストセラー" ? "#c45500" : YZ_COLORS.navy; }
  else if (it.cat === "trend" && idx < 3) { t = "急上昇"; bg = "#cc0c39"; }
  else if (it.cat === "wish") { t = "♡ ほしい物"; bg = "#d0587a"; }
  if (!t) return null;
  return <span style={{ display: "inline-block", background: bg, color: "#fff", fontSize: 9.5, fontWeight: 800, borderRadius: 4, padding: "2px 5px", lineHeight: 1.2 }}>{t}</span>;
}

function YzStars({ r, n, small }) {
  const w = Math.max(0, Math.min(100, (r / 5) * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: small ? 10.5 : 12, marginTop: small ? 1 : 0 }}>
      <span style={{ position: "relative", display: "inline-block", color: "#d5d9d9", letterSpacing: 0, lineHeight: 1 }} aria-label={"5つ星のうち" + r}>
        ★★★★★
        <span style={{ position: "absolute", left: 0, top: 0, width: w + "%", overflow: "hidden", whiteSpace: "nowrap", color: "#f2a33a" }}>★★★★★</span>
      </span>
      {n != null ? <span style={{ color: YZ_COLORS.link }}>{yzYen(n)}</span> : null}
    </div>
  );
}

function YzStepper({ n, onChange, min }) {
  const c = YZ_COLORS;
  const btn = { width: 30, height: 30, fontSize: 17, color: c.ink, display: "flex", alignItems: "center", justifyContent: "center" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", border: "2px solid " + c.yellow, borderRadius: 999, overflow: "hidden", background: "#fff" }}>
      <button type="button" aria-label="減らす" onClick={() => onChange(Math.max(min, n - 1))} style={yzBare(btn)}>{n <= 1 && min === 0 ? "🗑" : "−"}</button>
      <span style={{ minWidth: 26, textAlign: "center", fontSize: 14, fontWeight: 700 }}>{n}</span>
      <button type="button" aria-label="増やす" onClick={() => onChange(Math.min(YZ_MAX_QTY, n + 1))} style={yzBare(btn)}>+</button>
    </span>
  );
}

function YzBigBtn({ onClick, ja, ko, disabled, light }) {
  const c = YZ_COLORS;
  return (
    <button type="button" onClick={disabled ? undefined : onClick}
      style={yzBare({ display: "block", width: "100%", marginTop: 12, padding: "10px 0 8px", borderRadius: 999, background: light ? "#fff" : c.yellow, border: "1px solid " + (light ? c.line : c.yellowEdge), color: c.ink, opacity: disabled ? 0.5 : 1, textAlign: "center", lineHeight: 1.2 })}>
      <span style={{ display: "block", fontSize: 14.5, fontWeight: 800 }}>{ja}</span>
      <span style={{ display: "block", fontSize: 10.5, color: c.sub, marginTop: 1 }}>{ko}</span>
    </button>
  );
}

function YzHead({ ja, ko }) {
  return (
    <div style={{ margin: "2px 2px 10px" }}>
      <div lang="ja" style={{ fontSize: 16, fontWeight: 800 }}>{ja}</div>
      <div lang="ko" style={{ fontSize: 11, color: YZ_COLORS.sub }}>{ko}</div>
    </div>
  );
}

function YzSec({ ja, ko, children }) {
  return (
    <div style={{ marginTop: 16, paddingTop: 12, borderTop: "6px solid #eef1f3" }}>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{ja} <span style={{ fontSize: 10.5, fontWeight: 400, color: YZ_COLORS.sub }}>{ko}</span></div>
      {children}
    </div>
  );
}

function YzBack({ label, onClick }) {
  return <button type="button" onClick={onClick} style={yzBare({ fontSize: 12.5, color: YZ_COLORS.link, marginBottom: 8 })}>‹ {label}</button>;
}

function YzBox({ title, ko, children }) {
  const c = YZ_COLORS;
  return (
    <div style={{ background: "#fff", border: "1px solid " + c.line, borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{title} <span style={{ fontSize: 10.5, fontWeight: 400, color: c.sub }}>{ko}</span></div>
      {children}
    </div>
  );
}

function YzRadio({ on, onClick, ja, fee, sub, ko }) {
  const c = YZ_COLORS;
  return (
    <button type="button" onClick={onClick}
      style={yzBare({ display: "flex", gap: 10, width: "100%", textAlign: "left", padding: "8px 10px", marginTop: 4, borderRadius: 10, border: "1px solid " + (on ? c.amber : c.line), background: on ? "#fff8ea" : "#fff", color: c.ink })}>
      <span style={{ flex: "none", width: 16, height: 16, marginTop: 2, borderRadius: "50%", border: "2px solid " + (on ? "#e47911" : "#a3a9b0"), boxShadow: on ? "inset 0 0 0 3px #fff" : "none", background: on ? "#e47911" : "#fff" }} />
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: 700 }}>{ja} <span style={{ fontWeight: 400, color: c.sub }}>· {fee}</span></span>
        <span style={{ display: "block", fontSize: 11.5, color: c.ok }}>{sub}</span>
        <span style={{ display: "block", fontSize: 11, color: c.sub, marginTop: 1 }}>{ko}</span>
      </span>
    </button>
  );
}

function YzSeg({ on, onClick, ja, ko }) {
  const c = YZ_COLORS;
  return (
    <button type="button" onClick={onClick}
      style={yzBare({ flex: 1, padding: "7px 0 6px", borderRadius: 10, border: "1px solid " + (on ? c.navy : c.line), background: on ? c.navy : "#fff", color: on ? "#fff" : c.ink, textAlign: "center", lineHeight: 1.2 })}>
      <span style={{ display: "block", fontSize: 13, fontWeight: 700 }}>{ja}</span>
      <span style={{ display: "block", fontSize: 10, opacity: 0.75 }}>{ko}</span>
    </button>
  );
}

function YzRow({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "2px 0" }}>
      <span style={{ color: YZ_COLORS.sub }}>{k}</span>
      <span>{v}</span>
    </div>
  );
}

function YzLogo() {
  return (
    <span style={{ position: "relative", display: "inline-block", paddingBottom: 5, lineHeight: 1 }}>
      <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-.02em", fontFamily: "'Arial Rounded MT Bold','Helvetica Neue',Arial,sans-serif" }}>yamazon</span>
      <span style={{ fontSize: 11, opacity: 0.85 }}>.co.jp</span>
      <svg viewBox="0 0 80 10" width="62" height="8" aria-hidden="true" style={{ position: "absolute", left: 4, bottom: 0 }}>
        <path d="M2 8 L18 2 L28 6 L40 1 L52 6 L62 3 L76 8" fill="none" stroke={YZ_COLORS.amber} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function YzCartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path d="M2.5 4h3l2.4 10.2a1.5 1.5 0 0 0 1.5 1.1h8.3a1.5 1.5 0 0 0 1.4-1l2.2-6.3H7" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="19.5" r="1.5" fill="#fff" />
      <circle cx="17" cy="19.5" r="1.5" fill="#fff" />
    </svg>
  );
}

function YzSearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6" fill="none" stroke="#1f2a37" strokeWidth="2.2" />
      <path d="M15 15l5 5" stroke="#1f2a37" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/* ───────── 계산 ───────── */

function yzBuild(trend, wish) {
  const out = [];
  YZ_PICKS.forEach((p, i) => out.push({ id: "p" + i, cat: "pick", e: p[0], ja: p[1], ko: p[2], price: p[3], desc: p[4] || "", badge: p[5] || "", pack: p[6] || "" }));
  yzLines(trend).forEach((line, i) => {
    const p = yzFields(line);
    if (!p[1] && !p[2]) return;
    out.push({ id: "t" + i, cat: "trend", e: p[0], ja: p[1] || p[2], ko: p[2] || "", price: yzInt(p[3]), desc: p[4] || "" });
  });
  yzLines(wish).forEach((line, i) => {
    const p = yzFields(line);
    if (!p[1] && !p[2]) return;
    out.push({ id: "w" + i, cat: "wish", e: p[0], ja: p[1] || p[2], ko: p[2] || "", price: yzInt(p[3]), desc: "", memoJa: p[4] || "", memoKo: p[5] || "" });
  });
  YZ_ADULT.forEach((p, i) => out.push({ id: "a" + i, cat: "adult", e: p[0], ja: p[1], ko: p[2], price: p[3], desc: p[4] || "", stash: p[5] || "", pack: p[6] || "" }));
  return out.map((it) => {
    const h = yzHash(it.ja + it.ko);
    return { ...it, rating: 3.6 + (h % 14) / 10, reviews: 6 + ((h >>> 5) % 4200) };
  });
}

/* 상품마다 고정된 브랜드·할인·옵션 등 (이름으로 정해져서 매번 같다) */
function yzInfo(it) {
  const h = yzHash(it.id + it.ja);
  const adult = it.cat === "adult";
  const brands = adult ? YZ_BRANDS_ADULT : YZ_BRANDS;
  const off = h % 10 < 4 ? [10, 15, 20, 25, 30][(h >>> 4) % 5] : 0;
  const pack = yzPackOf(it);
  let opts = null;
  if (pack === "hanger") opts = { name: "サイズ", list: ["S", "M", "L", "XL"], def: 1 };
  else if (adult && (it.stash === "장난감" || it.stash === "구속")) opts = { name: "カラー", list: ["ピンク", "ブラック", "パープル"], def: 0 };
  return {
    h, off, pack, opts,
    brand: brands[(h >>> 7) % brands.length],
    ref: off ? Math.round(it.price / (1 - off / 100) / 10) * 10 : 0,
    monthly: [50, 100, 200, 300, 500, 1000][(h >>> 9) % 6],
    left: h % 7 === 0 ? 1 + ((h >>> 3) % 4) : 0,
    want: 1 + ((h >>> 11) % 3)
  };
}

function yzPackOf(it) {
  if (it.pack) return it.pack;
  const e = it.e || "";
  for (const k in YZ_PACK_BY_EMOJI) if (YZ_PACK_BY_EMOJI[k].indexOf(e) >= 0) return k;
  return "box";
}

function yzTileBg(it) {
  return it.cat === "adult" ? "linear-gradient(180deg,#fbf1f5,#efdbe6)" : "linear-gradient(180deg,#ffffff,#eef1f4)";
}

function yzReviews(it, h) {
  const pool = it.cat === "adult" ? YZ_REV_ADULT : YZ_REV_GEN;
  const a = h % pool.length;
  let b = (h >>> 5) % pool.length;
  if (b === a) b = (a + 1) % pool.length;
  const out = [pool[a], pool[b]];
  if (it.cat === "adult" ? (h >>> 13) % 3 === 0 : it.e === "🧸") out.unshift(it.cat === "adult" ? YZ_REV_MARO[(h >>> 2) % YZ_REV_MARO.length] : YZ_REV_MARO_CUTE);
  return out;
}

function yzDist(r) {
  const p5 = Math.max(10, Math.min(85, Math.round((r - 3) * 45)));
  const p4 = Math.round((100 - p5) * 0.5);
  const p3 = Math.round((100 - p5 - p4) * 0.5);
  const p1 = Math.round((100 - p5 - p4 - p3) * 0.6);
  return [p5, p4, p3, 100 - p5 - p4 - p3 - p1, p1];
}

function yzShade(hex, amt) {
  const n = parseInt(String(hex).slice(1), 16);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const ch = (v) => Math.round((t - v) * p + v);
  return "rgb(" + ch(n >> 16) + "," + ch((n >> 8) & 255) + "," + ch(n & 255) + ")";
}

function yzOptName(o) {
  return ["S", "M", "L", "XL"].indexOf(o) >= 0 ? "サイズ" : "カラー";
}

function yzOptKo(o) {
  return YZ_OPT_KO[o] || o;
}

function yzLines(v) {
  const out = [];
  const walk = (x) => {
    if (Array.isArray(x)) x.forEach(walk);
    else if (x != null) String(x).split(/\n+/).forEach((s) => { if (s.trim()) out.push(s.trim()); });
  };
  walk(v);
  return out;
}

/* 첫 칸이 이모지가 아니면(봇이 빼먹으면) 🎁를 끼워 넣는다 */
function yzFields(line) {
  const p = String(line).split("|").map((s) => s.trim());
  const first = p[0] || "";
  const looksEmoji = first.length <= 8 && !/[A-Za-z0-9぀-ヿ一-鿿가-힯]/.test(first);
  if (!looksEmoji) p.unshift("🎁");
  if (!p[0]) p[0] = "🎁";
  return p;
}

function yzInt(v) {
  const n = parseInt(String(v == null ? "" : v).replace(/[^\d]/g, ""), 10);
  return isFinite(n) && n > 0 ? n : 1980;
}

function yzYen(n) {
  try { return Number(n).toLocaleString("ja-JP"); } catch (e) { return String(n); }
}

function yzHash(s) {
  let h = 2166136261;
  const str = String(s);
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

function yzMark(it) {
  return it.cat === "wish" ? "♡ " : it.cat === "adult" ? "🔞 " : "";
}

function yzOrderText(lines, ship, named, card, note, total) {
  const head = "[!야마존 주문] " + (ship === "fast" ? "お急ぎ便(지금 바로 도착)" : "通常配送(오늘 중 도착)") + " · 보내는 사람: " + (named ? "내 이름" : "익명");
  const body = lines.map((l) => "- " + yzMark(l.it) + l.it.ja + "(" + l.it.ko + (l.opt ? "·" + yzOptKo(l.opt) : "") + ")" + (l.it.stash ? "[" + l.it.stash + "]" : "") + " ×" + l.n);
  const tail = ["합계 ¥" + yzYen(total)];
  if (String(card).trim()) tail.push("카드: 「" + String(card).trim() + "」");
  let text = [head].concat(body).concat([tail.join(" · ")]).join("\n");
  if (String(note).trim()) text += "\n\n" + String(note).trim();
  return text;
}

function yzMemoText(lines, named, date) {
  const m = String(date || "").match(/(\d{1,2})\D+(\d{1,2})\D*$/);
  const d = m ? Number(m[1]) + "/" + Number(m[2]) + " " : "";
  const list = lines.map((l) => (l.it.ko || l.it.ja) + (l.opt ? "(" + yzOptKo(l.opt) + ")" : "") + (l.n > 1 ? " ×" + l.n : "")).join(", ");
  const who = named ? "{{user}}가 야마존으로 마시로에게 보낸 선물: " : "{{user}}가 야마존으로 마시로에게 익명으로 보낸 선물(마시로는 보낸 사람을 모른다): ";
  return "[야마존 선물] " + d + who + list + ". 마시로의 집에 있고, 마시로가 쓰고 있다.";
}

function yzCopy(text) {
  let ok = false;
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ok = document.execCommand("copy");
    document.body.removeChild(ta);
  } catch (e) {}
  if (!ok) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text); ok = true; } } catch (e) {}
  }
  return ok;
}

function yzSend(text) {
  try {
    if (typeof sendMessage === "function") { sendMessage(text); return "sent"; }
  } catch (e) {}
  return yzCopy(text) ? "copied" : "manual";
}

function yzBare(extra) {
  return { appearance: "none", WebkitAppearance: "none", border: 0, background: "none", padding: 0, margin: 0, font: "inherit", cursor: "pointer", ...extra };
}

function yzClamp(n, extra) {
  return { display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical", overflow: "hidden", wordBreak: "break-word", ...extra };
}

function yzField(extra) {
  return { display: "block", width: "100%", boxSizing: "border-box", border: "1px solid " + YZ_COLORS.line, borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", color: YZ_COLORS.ink, background: "#fff", outline: "none", ...extra };
}

/* ───────── 설정 ───────── */

const YZ_HEIGHT = 640;     // 화면 높이(px). 안쪽은 스크롤
const YZ_MAX_QTY = 9;      // 한 상품 최대 개수
const YZ_FAST_FEE = 500;   // お急ぎ便 배송비

const YZ_FONT = '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';

const YZ_COLORS = {
  navy: "#1f2a37",
  navy2: "#2d3b4d",
  amber: "#f3a847",
  yellow: "#ffd54d",
  yellowEdge: "#f2c230",
  plum: "#6b2a55",
  page: "#eef1f3",
  ink: "#1b1f24",
  sub: "#5f6873",
  faint: "#9aa3ad",
  line: "#dde2e6",
  link: "#00708a",
  price: "#b12704",
  ok: "#067d62"
};

const YZ_PACK = ["#f4a7bb", "#8ec5ea", "#b7a4ee", "#93d3a6", "#f7c46c", "#f29b7f", "#9fb3cf", "#7fcfc7"];
const YZ_PACK_ADULT = ["#2a1626", "#1d1b2e", "#3a1430", "#121218"];
const YZ_BRANDS = ["MOFU", "nicoli", "HOKKA", "Lumi", "kotori", "PUNI", "sora", "YZ BASICS"];
const YZ_BRANDS_ADULT = ["LOVE LAB", "mellow", "PINK SIGN", "NIGHT CAT", "velvet", "ura-ura"];
const YZ_SWATCH = { "ピンク": "#f27aa8", "ブラック": "#222", "パープル": "#8d5ad6" };
const YZ_OPT_KO = { "ピンク": "핑크", "ブラック": "블랙", "パープル": "퍼플" };

/* 봇이 채우는 상품은 이모지로 포장 모양을 고른다(없으면 상자) */
const YZ_PACK_BY_EMOJI = {
  hanger: ["🧣", "🧤", "🧥", "👕", "👗", "👘", "🩳", "👚", "👖", "🥻", "🩱"],
  tag: ["🧸", "🐻", "🐰", "🐱", "🐶", "🐼", "🐧", "🐹", "🦊", "🐥", "🐻‍❄️"],
  bottle: ["🧴", "🍶", "🍾", "🧃", "🥤", "🍼"],
  jar: ["🕯️", "🍯", "🫙"],
  pouch: ["🛁", "🍪", "🍬", "🍭", "🌰", "🫘"],
  card: ["🖊️", "✒️", "✏️", "🖌️", "🔋", "🧦", "💍", "🎀", "📎"],
  book: ["📚", "📓", "📕", "📖", "📒", "📔"],
  plain: ["🪴", "🌷", "💐", "🌹", "🎄", "⛄"]
};

const YZ_TABS = [
  { id: "pick", ja: "おすすめ", ko: "추천" },
  { id: "trend", ja: "トレンド", ko: "트렌드" },
  { id: "wish", ja: "ほしい物リスト", ko: "마시로 위시" },
  { id: "adult", ja: "大人 🔞", ko: "성인" }
];

const YZ_SHIP = [
  { id: "normal", ja: "通常配送", sub: "本日中にお届け", ko: "지금 상황이 끝난 뒤, 마시로가 집에서 열어요" },
  { id: "fast", ja: "お急ぎ便", sub: "今すぐお届け", ko: "지금 장면을 끊고, 마시로가 집에서 바로 받아 열어요" }
];

/* 리뷰: [별, 닉네임, 제목JA, 본문JA, 본문KO, 도움 됨 수] */
const YZ_REV_GEN = [
  [5, "みかん", "プレゼントに最適", "友達の誕生日に贈りました。とても喜んでくれました。", "친구 생일에 보냈어요. 엄청 좋아했어요.", 24],
  [4, "ヤマゾン カスタマー", "思ったより小さい", "写真より少し小さめ。でも可愛いので許します。", "사진보다 조금 작아요. 근데 귀여워서 용서합니다.", 11],
  [1, "K.T.", "箱が潰れてた", "箱がぺしゃんこで届きました。中身は無事でした。", "상자가 납작하게 찌그러져 왔어요. 내용물은 멀쩡했어요.", 7],
  [5, "通りすがりの大学生", "リピート3回目", "気に入って3回目の購入です。もう手放せない。", "마음에 들어서 세 번째 구매예요. 이제 못 끊어요.", 31],
  [3, "ゆうき", "値段相応", "悪くはないです。値段なりという感じ。", "나쁘진 않아요. 딱 가격만큼이에요.", 4],
  [5, "ねこ好き", "推しの色", "推しのカラーだったので即決しました。", "최애 색이라 바로 샀어요.", 18],
  [2, "ヤマゾン常連", "色が違う", "届いた色が写真と全然違いました…", "받은 색이 사진이랑 완전 달라요…", 9],
  [4, "S.Y.", "配送が早い", "注文した日に届いて助かりました。", "주문한 날 와서 살았어요.", 15]
];

const YZ_REV_ADULT = [
  [5, "匿名希望", "詳しくは言えませんが", "恋人と使いました。詳しくは言えませんが★5です。", "애인이랑 썼습니다. 자세히는 말 못 하지만 별 다섯 개입니다.", 88],
  [4, "ヤマゾン カスタマー", "梱包が完璧", "中身が分からない箱で届いたので家族にバレませんでした。", "내용물을 알 수 없는 상자로 와서 가족한테 안 들켰어요.", 64],
  [1, "R.", "説明書が読めない", "説明書が全部外国語でした。勘で使いました。", "설명서가 전부 외국어였어요. 감으로 썼어요.", 21],
  [3, "夜型人間", "これはこれで", "想像していたのと違いましたが、これはこれで。", "상상한 거랑 달랐지만 이건 이거대로.", 37],
  [5, "リピーター", "二度目の購入", "前のは壊れました。察してください。", "저번 건 망가졌습니다. 눈치껏 알아주세요.", 112],
  [2, "半信半疑", "効果は…？", "効果は…正直よく分かりません。気のせいかも。", "효과는… 솔직히 잘 모르겠어요. 기분 탓일지도.", 45],
  [5, "彼氏持ち", "反応が最高", "相手の反応が最高でした。また買います。", "상대 반응이 최고였어요. 또 살게요.", 53],
  [4, "M.", "音が静か", "思ったより静かで、隣の部屋にも聞こえませんでした。", "생각보다 조용해서 옆방에도 안 들렸어요.", 29]
];

/* 마시로가 몰래 쓴 리뷰(닉네임 まろ). 성인 상품 셋 중 하나꼴, 추천의 곰 쿠션에 나온다 */
const YZ_REV_MARO = [
  [5, "まろ", "資料として", "資料として購入しました。構造がとてもよく分かりました。使用はしていません。", "자료로 구입했습니다. 구조를 아주 잘 알 수 있었습니다. 사용은 하지 않았습니다.", 128],
  [5, "まろ", "あくまで仕事用です", "仕事の資料です。あくまで資料です。角度別に撮影させていただきました。", "일 자료입니다. 어디까지나 자료입니다. 각도별로 촬영했습니다.", 96],
  [4, "まろ", "開けるまで三日", "箱を開ける勇気が出るまで三日かかりました。中身は想像の三倍でした……。", "상자를 열 용기가 날 때까지 사흘 걸렸습니다. 내용물은 상상의 세 배였습니다…….", 143]
];
const YZ_REV_MARO_CUTE = [5, "まろ", "抱き心地が天才", "抱き心地が天才です。二個目を買いました。作業中もずっと膝の上にいます。", "안는 느낌이 천재예요. 두 개째 샀어요. 작업할 때도 계속 무릎 위에 있어요.", 57];

/* 추천 코너: [이모지, 상품명JA, 상품명KO, 가격, 소개KO, 배지, 포장] */
const YZ_PICKS = [
  ["🧸", "もちもち白くまクッション 40cm", "말랑말랑 북극곰 쿠션 40cm", 2980, "끌어안으면 손이 푹 들어가는 저반발 쿠션. 선물 포장 무료.", "ベストセラー", "tag"],
  ["🧦", "もこもこルームソックス 3足組", "수면 양말 3켤레 세트", 1280, "발목까지 폭신한 실내용 양말. 무난한 선물 1순위.", "", "card"],
  ["🍫", "ベルギーチョコレート アソート 24粒", "벨기에 초콜릿 어소트 24알", 2980, "한 알씩 맛이 다른 선물용 상자.", "やまぞんチョイス", "box"],
  ["☕", "ロイヤルミルクティー スティック 30本", "로열 밀크티 스틱 30개입", 1180, "뜨거운 물만 부으면 되는 진한 밀크티.", "", "box"],
  ["🍊", "愛媛みかん 家庭用 5kg", "에히메 귤 가정용 5kg", 3480, "겉에 작은 흠집이 있는 가정용. 맛은 그대로.", "", "kraft"],
  ["🛁", "入浴剤 アソート 20包", "입욕제 어소트 20포", 1580, "온천 향 다섯 가지. 피곤한 날 한 포씩.", "", "pouch"],
  ["🕯️", "アロマキャンドル ホワイトムスク", "아로마 캔들 화이트 머스크", 1980, "은은한 비누 향. 다 쓰면 유리 용기는 소품으로.", "", "jar"],
  ["🧴", "ハンドクリーム ギフトセット 3本", "핸드크림 선물 세트 3개", 2200, "끈적이지 않는 무향·시트러스·로즈.", "", "bottle"],
  ["🎧", "ワイヤレスイヤホン ノイキャン", "노이즈 캔슬링 무선 이어폰", 6980, "작업할 때 바깥 소리를 꺼 준다. 케이스 포함 30시간.", "ベストセラー", "box"],
  ["🔋", "モバイルバッテリー 10000mAh", "보조배터리 10000mAh", 2780, "폰을 두 번 충전한다. 얇고 가볍다.", "", "card"],
  ["🖊️", "ゲルインクボールペン 0.3mm 10色", "젤잉크 볼펜 0.3mm 10색", 1650, "가는 선이 깔끔하게 나오는 필기구 세트.", "", "card"],
  ["📓", "ドット方眼ノート A5 5冊", "도트 노트 A5 5권", 1100, "메모·스케치 겸용.", "", "book"],
  ["🍜", "ご当地カップ麺 12種セット", "지역 컵라면 12종 세트", 3200, "홋카이도부터 오키나와까지 한 상자.", "", "kraft"],
  ["🪴", "ミニ観葉植物 ポトス", "미니 관엽식물 포토스", 1480, "물만 가끔 주면 되는 초보용 화분.", "", "plain"],
  ["💡", "USB卓上ライト 調光式", "USB 탁상 조명 (밝기 조절)", 1990, "밤샘 작업용. 색온도 3단계.", "やまぞんチョイス", "box"],
  ["🫖", "電気ケトル 0.8L", "전기 주전자 0.8L", 3280, "1분이면 물이 끓는다.", "", "box"]
];

/* 성인 코너: [이모지, 상품명JA, 상품명KO, 가격, 소개KO, MashiroStash 분류, 포장]
   !리스트 기본 재고(로터·마사지기·딜도·플러그·텐고·털 수갑·실크 안대·로프·메이드복·고양이귀·러브젤·콘돔·마사지 오일·깃털·저온 캔들)와 겹치지 않게 골랐다. */
const YZ_ADULT = [
  ["💓", "心拍連動 前立腺リモコンバイブ", "심박 연동 전립선 리모컨 바이브", 8900, "심박수가 올라갈수록 진동이 세져 참을수록 자극이 강해진다.", "장난감", "box"],
  ["⏲️", "タイマーロック式クリア貞操帯", "타이머 잠금 투명 정조대", 6800, "설정 시간이 끝나기 전엔 절대 열리지 않는 반투명 케이지.", "구속", "box"],
  ["🔒", "南京錠付きレザー拘束ミトン", "자물쇠 가죽 구속 벙어리장갑", 4500, "손가락을 쓰지 못하게 막아 혼자 만지는 것을 원천 차단한다.", "구속", "card"],
  ["🐰", "前開きバニーボーイスーツ", "앞트임 버니 보이 슈트", 7200, "앞부분이 트여 있고 꼬리가 플러그로 고정되는 노출형 바니 슈트.", "코스튬", "hanger"],
  ["🫧", "ワイヤレス乳首サクションポンプ", "무선 니플 진공 펌프", 5400, "펄스 모드로 젖꼭지를 강하게 흡입해 감도를 끌어올리는 개발 기구.", "마사지", "box"],
  ["⚡", "スマホ連動 低周波パルスチョーカー", "원격 저주파 펄스 초커", 7900, "앱 버튼을 누르면 목덜미에 찌릿한 저주파 자극이 흐르는 가죽 초커.", "기타", "card"],
  ["🐙", "自律駆動バイオ触手トイ", "자가 구동 바이오 촉수 토이", 12800, "전원을 켜면 생물처럼 제멋대로 구불거리며 얽혀 들어오는 촉수 기구.", "장난감", "jar"],
  ["🔥", "噂の感度3000倍ヒートジェル", "소문의 감도 3000배 히트 젤", 3980, "한 방울만 발라도 옷깃이 스칠 때마다 떨릴 정도로 과민해지는 수상한 젤.", "소모품", "bottle"],
  ["🌫️", "濃厚フェロモン発情ディフューザー", "페로몬 발정 디퓨저", 6200, "들이마시면 이성이 흐려지고 몸이 달아오르는 달콤한 안개형 향수.", "기타", "bottle"],
  ["🌀", "催眠ペンデュラム＆暗示イヤホン", "최면 진자＆암시 이어폰 세트", 9800, "미세 주파수와 속삭임으로 저항심을 녹이고 순종적으로 만드는 키트.", "기타", "box"],
  ["🎙️", "声量連動ボイスセンサーローター", "성량 연동 보이스 로터", 4800, "신음이나 목소리가 커질수록 진동이 강해져 소리를 참아야 멈춘다.", "장난감", "box"],
  ["🎀", "体温反応セルフタイトニングリボン", "체온 반응 자가 조임 리본", 3400, "체온이 올라 흥분할수록 매듭이 저절로 팽팽하게 조여드는 특수 리본.", "구속", "card"],
  ["💧", "水溶性シースルーメイドエプロン", "수용성 시스루 메이드 에이프런", 4200, "땀이나 액체가 닿은 부위부터 서서히 녹아내려 맨살이 드러난다.", "코스튬", "hanger"],
  ["✨", "体温発光 淫紋ボディシール", "체온 발광 음문 바디 스티커", 1980, "하복부에 붙이면 체온이 오를수록 붉은빛으로 은은하게 발광하는 문양.", "코스튬", "card"],
  ["🌌", "暗闇発光ネオンボディローション", "야광 네온 바디 로션", 2980, "피부에 문지르면 어둠 속에서 분홍빛으로 빛나 손자국이 고스란히 남는다.", "소모품", "bottle"],
  ["🍯", "溶けるハニーシロップキャンドル", "녹는 꿀 시럽 식용 캔들", 2600, "떨어져도 굳지 않고 따뜻한 시럽처럼 녹아 핥아먹을 수 있는 촛농.", "소모품", "jar"],
  ["🪶", "電動フェザーくすぐりワンド", "전동 깃털 간지럼 완드", 3800, "초미세 진동이 도는 깃털로 민감한 부위만 훑어 고문처럼 애태운다.", "마사지", "card"],
  ["🧊", "温冷交互パルスローラー", "온냉 교차 펄스 롤러", 5900, "차가운 냉기와 뜨거운 열기가 5초마다 교차하며 미세 전류를 흘린다.", "마사지", "box"]
];
