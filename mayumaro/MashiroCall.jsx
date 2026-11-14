// 필요 훅: useState, useEffect (react)
// 통화 화면. 마시로와 {{user}}가 떨어져서 통화가 연결되는 순간 한 번 뜬다. 대화는 본문에서 평소 형식으로 이어진다.
//   video={false} : 음성통화. 프로필과 통화 시간이 뜬다.
//   video={true}  : {{user}}가 건 영상통화. 그림을 세 겹으로 겹쳐 그린다(위가 있으면 위가 보인다).
//       맨 위  특별 그림  vc-상황.webp            doing에서 MC_SCENES 낱말을 찾았을 때만
//       가운데 기본 그림  vc-세트-표정.webp        place·look·face로 정함 (세트 4 × 표정 5 = 20장)
//       맨 아래 카메라 꺼짐 화면                    그림이 하나도 없을 때의 안전망
//   place : home(집, 티셔츠) / school(학교, 후드티) / out(외출, 흐린 배경)
//   look  : out일 때만. hoodie(후드티, 기본) / dressed(사복) → 세트 out / out-dressed
//   face  : fluster(당황, 기본) / shy(수줍) / teary(울먹) / serious(진지) / happy(반가움)
//   doing : 마시로가 하던 일, 짧은 한국어. clock : 연결된 시각. name : LIME 이름(기본 真白)
// 그림은 MC_URL 폴더에 올리면 코드를 고치지 않아도 바로 뜬다.
// 선택 칸(위젯 규칙에는 없음, 유저가 유저 노트로 쓰게 하는 칸):
//   you     : 오른쪽 아래 내 화면에 띄울 {{user}} 사진 주소. {face}를 넣으면 그 자리에 youFace 단어가 들어간다.
//             예) you="https://…/me-{face}.webp" → me-shy.webp. 비어 있으면 YOU 상자가 뜬다.
//   youFace : {{user}}의 표정. face와 같은 다섯 단어(한국어도 됨). 없으면 fluster.

function MashiroCall(props = {}) {
  const { video = false, place = "home", look = "hoodie", face = "fluster", doing = "", clock = "23:41", name = "真白", you = "", youFace = "" } = props;
  const isVideo = video === true || String(video) === "true";
  const scene = isVideo ? mcScene(doing) : "";
  const base = isVideo ? mcBase(place, look, face) : "";
  const youSrc = isVideo ? mcYou(you, youFace) : "";
  const [sec, setSec] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mode = isVideo ? "video" : "voice";
  const timer = String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0");

  return (
    <div style={{ width: "100%", maxWidth: 320, margin: "10px auto", padding: "4px 6px 12px", fontFamily: MC_FONT }}>
      <style>{MC_CSS}</style>
      <div className="mc-phone" style={{ position: "relative", aspectRatio: "9 / 16", borderRadius: 34, overflow: "hidden", background: "#11141b", boxShadow: "0 18px 40px -16px rgba(0,0,0,.6), inset 0 0 0 2px #3a3c43" }}>
        {/* 화면: 영상통화는 '카메라 꺼짐' 위에 상황 그림을 덮는다(그림이 없으면 밑이 보임) */}
        {mode === "video" ? (
          <>
            <div style={{ position: "absolute", inset: 0, paddingBottom: "34%", textAlign: "center", background: "radial-gradient(circle at 50% 36%, #2a2f3d, #12151c 70%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#d9dce4" }}>
              <McCamOff />
              <span style={{ fontSize: 13, fontWeight: 700 }}>カメラがオフになっています</span>
              <span style={{ fontSize: 11.5, opacity: 0.7 }}>상대가 카메라를 가리고 있어요</span>
            </div>
            <div className="mc-feed" role="img" aria-label={String(doing || "영상통화 화면")} style={{ position: "absolute", inset: 0, backgroundImage: 'url("' + MC_URL + "vc-" + base + '.webp")', backgroundSize: "cover", backgroundPosition: "center" }} />
            {scene ? (
              <div className="mc-feed" aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: 'url("' + MC_URL + "vc-" + scene + '.webp")', backgroundSize: "cover", backgroundPosition: "center" }} />
            ) : null}
          </>
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, #fbe3ea 0%, #e6e3f3 55%, #cfdcee 100%)" }} />
        )}

        {/* 위쪽: 이름과 통화 시간 */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, padding: "16px 14px 22px", textAlign: "center", color: mode === "voice" ? "#2b2a33" : "#fff", background: mode === "voice" ? "none" : "linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,0))" }}>
          <div style={{ fontSize: 10.5, letterSpacing: 1, opacity: 0.8 }}>{mode === "voice" ? "LIME 音声通話" : "LIME ビデオ通話"}</div>
          {mode === "voice" ? null : <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2, textShadow: "0 1px 3px rgba(0,0,0,.4)" }}>{String(name)}</div>}
          <div style={{ fontSize: 12, marginTop: 2, fontVariantNumeric: "tabular-nums", opacity: 0.9 }}>{timer}</div>
        </div>

        {/* 음성통화 가운데 */}
        {mode === "voice" ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: "24%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "#2b2a33" }}>
            <div className="mc-ring" style={{ borderRadius: "50%", padding: 6, background: "rgba(255,255,255,.6)" }}>
              <McAvatar size={96} />
            </div>
            <div style={{ fontSize: 19, fontWeight: 800 }}>{String(name)}</div>
            <div className="mc-wave" aria-hidden="true" style={{ display: "flex", gap: 4, alignItems: "center", height: 22 }}>
              {[0, 1, 2, 3, 4].map((k) => (
                <i key={k} style={{ width: 4, height: 22, borderRadius: 2, background: "#e07b93", animationDelay: k * 0.13 + "s" }} />
              ))}
            </div>
          </div>
        ) : null}

        {/* 내 화면 (영상통화일 때): YOU 상자 위에 {{user}} 사진을 덮는다(없으면 YOU 상자가 보임) */}
        {mode !== "voice" ? (
          <div style={{ position: "absolute", right: "4%", bottom: "19%", width: "20%", aspectRatio: "2 / 3", borderRadius: 10, overflow: "hidden", background: "linear-gradient(160deg, #3b4152, #262a35)", border: "2px solid rgba(255,255,255,.75)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.75)", fontSize: 11, fontWeight: 700, boxShadow: "0 4px 10px rgba(0,0,0,.35)" }}>
            YOU
            {youSrc ? (
              <span role="img" aria-label="내 화면" style={{ position: "absolute", inset: 0, backgroundImage: 'url("' + youSrc + '")', backgroundSize: "cover", backgroundPosition: "center" }} />
            ) : null}
          </div>
        ) : null}

        {/* 아래쪽: 연결 시각과 버튼 */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "18px 0 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, background: mode === "voice" ? "none" : "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,.5))" }}>
          <div style={{ display: "flex", gap: 18 }} aria-hidden="true">
            <McBtn bg="rgba(255,255,255,.22)" d="M12 4a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v3" dark={mode === "voice"} />
            <McBtn bg="#e5484d" d="M5 14c4.5-3.6 9.5-3.6 14 0l-2 2.4-3-1.2v-2.2c-1.4-.4-2.6-.4-4 0v2.2l-3 1.2z" fill />
            <McBtn bg="rgba(255,255,255,.22)" d={mode === "voice" ? "M4 10v4M8 7v10M12 5v14M16 8v8M20 10v4" : "M4 7h11v10H4zM15 10l5-3v10l-5-3"} dark={mode === "voice"} />
          </div>
          <div style={{ fontSize: 10.5, color: mode === "voice" ? "#5b5866" : "rgba(255,255,255,.75)" }}>{String(clock)} 接続</div>
        </div>
      </div>
    </div>
  );
}

/* ───────── 설정 ───────── */

const MC_URL = "https://mayumaro.vercel.app/img/photo/";

/* 특별 그림: 상황 이름 ← doing에서 찾을 낱말. 위에서부터 먼저 맞는 것을 쓴다.
   흔한 낱말(밥, 작업, 침대 등)은 넣지 않는다. 평범한 장면은 기본 그림이 맡는다. */
const MC_SCENES = [
  ["sick", ["감기", "몸살", "열이 나", "아파서", "앓"]],
  ["wakeup", ["자다", "잠결", "늦잠", "졸다", "엎드려", "막 일어"]],
  ["bath", ["씻고", "샤워", "목욕", "욕실", "머리 말리"]],
  ["festival", ["축제", "마츠리", "유카타", "불꽃놀이"]],
  ["newyear", ["참배", "하츠모데", "신사", "새해"]],
  ["kotatsu", ["코타츠", "귤 까"]],
  ["dressup", ["꾸민 옷", "옷 고르", "약속 준비", "외출 준비"]],
  ["pose", ["포즈", "거울 앞", "자기 손"]],
  ["hide", ["숨기", "자료를 덮", "자료 상자", "황급히 치우"]],
  ["deadline", ["마감 지옥", "밤샘", "철야", "에너지 드링크"]],
  ["cook", ["요리", "앞치마", "냄비", "볶", "끓이"]],
  ["eat", ["야식", "밥 한가득", "먹방", "폭식", "한 입 가득"]],
  ["workout", ["운동", "홈트", "스트레칭", "팔굽혀", "윗몸"]],
  ["plush", ["언박싱", "새 인형", "인형 택배"]],
  ["studio", ["공방", "도예", "물레", "점토", "가마"]],
  ["rain", ["처마", "비를 피", "우산이 없", "우산 없이"]],
  ["crane", ["인형 뽑기", "뽑기", "게임센터", "오락실", "크레인"]],
  ["art", ["화방", "펜촉", "화구"]]
];

function mcScene(doing) {
  const t = String(doing || "").trim();
  if (!t) return "";
  const low = t.toLowerCase();
  for (let i = 0; i < MC_SCENES.length; i++) if (low === MC_SCENES[i][0]) return MC_SCENES[i][0];
  for (let i = 0; i < MC_SCENES.length; i++) {
    const words = MC_SCENES[i][1];
    for (let k = 0; k < words.length; k++) if (t.indexOf(words[k]) >= 0) return MC_SCENES[i][0];
  }
  return "";
}

/* 기본 그림: 세트(home / school / out / out-dressed) + 표정. 한국어로 써도 알아듣는다. */
const MC_FACES = { fluster: ["당황", "허둥"], shy: ["수줍", "부끄"], teary: ["울먹", "눈물", "울"], serious: ["진지", "침착"], happy: ["반가", "웃", "기쁨"] };

function mcFace(face) {
  const fc = String(face || "").toLowerCase();
  if (MC_FACES[fc]) return fc;
  for (const key in MC_FACES) {
    if (MC_FACES[key].some((w) => fc.indexOf(w) >= 0)) return key;
  }
  return "fluster";
}

function mcBase(place, look, face) {
  const pl = String(place || "").toLowerCase();
  const lk = String(look || "").toLowerCase();
  let set = "home";
  if (pl.indexOf("school") >= 0 || pl.indexOf("campus") >= 0 || pl.indexOf("학교") >= 0) set = "school";
  else if (pl.indexOf("out") >= 0 || pl.indexOf("외출") >= 0 || pl.indexOf("밖") >= 0) set = (lk.indexOf("dress") >= 0 || lk.indexOf("사복") >= 0 || lk.indexOf("꾸민") >= 0) ? "out-dressed" : "out";
  return set + "-" + mcFace(face);
}

/* {{user}} 사진 주소: http(s)로 시작할 때만 쓰고, {face} 자리에 표정 단어를 넣는다 */
function mcYou(you, youFace) {
  const u = String(you || "").trim();
  if (!/^https?:\/\//i.test(u) || /["'()\s]/.test(u)) return "";
  return u.split("{face}").join(mcFace(youFace));
}

/* ───────── 보조 요소 ───────── */

const MC_FONT =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';

const MC_CSS = `
@keyframes mc-rise { from { opacity: 0; transform: translateY(24px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes mc-on { from { opacity: 0; filter: blur(6px); } to { opacity: 1; filter: none; } }
@keyframes mc-ring { 0% { box-shadow: 0 0 0 0 rgba(224,123,147,.45); } 100% { box-shadow: 0 0 0 18px rgba(224,123,147,0); } }
@keyframes mc-bar { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
.mc-phone { animation: mc-rise .45s cubic-bezier(.2,.9,.25,1) both; }
.mc-feed { animation: mc-on .7s ease-out .15s both; }
.mc-ring { animation: mc-ring 1.6s ease-out infinite; }
.mc-wave i { display: block; transform-origin: center; animation: mc-bar .9s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .mc-phone, .mc-feed, .mc-ring, .mc-wave i { animation: none; } }
`;

function McBtn({ bg, d, fill, dark }) {
  const col = dark ? "#3b3946" : "#fff";
  return (
    <span style={{ width: 46, height: 46, borderRadius: "50%", background: dark && !fill ? "rgba(255,255,255,.7)" : bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,.18)" }}>
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path d={d} fill={fill ? "#fff" : "none"} stroke={fill ? "#fff" : col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function McCamOff() {
  return (
    <svg viewBox="0 0 48 48" width="54" height="54" aria-hidden="true">
      <rect x="6" y="15" width="24" height="18" rx="4" fill="none" stroke="#d9dce4" strokeWidth="2.4" />
      <path d="M30 21l10-5v16l-10-5" fill="none" stroke="#d9dce4" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M8 9l32 30" stroke="#e5484d" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

/* LIME 프로필과 같은 오리지널 토끼 인형 */
function McAvatar({ size }) {
  return (
    <svg viewBox="0 0 34 34" width={size} height={size} aria-hidden="true" style={{ display: "block", borderRadius: "50%" }}>
      <circle cx="17" cy="17" r="17" fill="#fde6ee" />
      <ellipse cx="12" cy="9" rx="3" ry="6.5" fill="#fff" stroke="#e7d5dc" />
      <ellipse cx="22" cy="9" rx="3" ry="6.5" fill="#fff" stroke="#e7d5dc" />
      <ellipse cx="17" cy="20.5" rx="10" ry="8.5" fill="#fff" stroke="#e7d5dc" />
      <circle cx="13.5" cy="20" r="1.2" fill="#4a4550" />
      <circle cx="20.5" cy="20" r="1.2" fill="#4a4550" />
      <circle cx="11.5" cy="23" r="1.5" fill="#f6b3c6" opacity=".85" />
      <circle cx="22.5" cy="23" r="1.5" fill="#f6b3c6" opacity=".85" />
      <path d="M15.8 23c.8.6 1.6.6 2.4 0" stroke="#4a4550" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}
