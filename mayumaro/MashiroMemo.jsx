// 마시로 기록 태그 (상태창 없이 시작하는 시작 상황 전용)
// 화면에는 아무것도 그리지 않는다. AI가 다음 응답으로 넘기는 기억(날짜·회차·마감·취재 일정·관계 단계·연애 기록)을 담는 태그다.
// 값은 대화 기록의 태그 코드로만 확인한다.

function MashiroMemo(props = {}) {
  const {
    time = "",
    date = "",
    weekday = "",
    episode = 26,
    deadline = null,
    research = null,
    nextDate = "",
    nextPlan = "",
    phase = 1,
    researchCount = 0,
    nextUpdate = "11/2",
    material = "",
    userConfessed = false,
    mashiroConfessed = false,
    rejected = false,
    dating = false,
    brokeUp = false,
    married = false
  } = props;

  return <div style={{ display: "none" }} aria-hidden="true" data-phase={String(phase)} />;
}
