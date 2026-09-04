/* =========================================================
   여기 CONFIG 값만 바꾸면 날짜·장소·이름이 전체 페이지에 반영됩니다.
   (지도 링크, 캘린더 파일, D-day 계산까지 자동으로 처리돼요)
   ========================================================= */
const CONFIG = {
  personName: "강호철",
  // ISO 8601 형식. 시간대는 한국(+09:00) 기준입니다.
  eventDateISO: "2026-11-21T12:00:00+09:00",
  eventDurationHours: 3,
  eventDateDisplay: "2026년 11월 21일 토요일",
  eventTimeDisplay: "낮 12시",
  venueName: "그랜드컨벤션웨딩홀 (예시) · 3층 그랜드홀",
  venueAddress: "서울특별시 강남구 테헤란로 000 (샘플 주소)",
};

document.addEventListener("DOMContentLoaded", () => {
  const eventDate = new Date(CONFIG.eventDateISO);

  applyConfigText();
  renderDday(eventDate);
  wireCalendarButton(eventDate);
  wireMapButtons();
  wireCopyAddress();
  wireCopyLink();
  wireScrollCue();
});

/* ---------- CONFIG 값을 화면 텍스트에 반영 ---------- */
function applyConfigText() {
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("heroDate", `${CONFIG.eventDateDisplay} · ${CONFIG.eventTimeDisplay}`);
  setText("eventDateFull", CONFIG.eventDateDisplay);
  setText("venueName", CONFIG.venueName);
  setText("venueAddress", CONFIG.venueAddress);

  const timeEl = document.querySelector(".event-time");
  if (timeEl) timeEl.textContent = CONFIG.eventTimeDisplay;

  document.querySelectorAll(".hero-name").forEach((el) => (el.textContent = CONFIG.personName));
}

/* ---------- D-day ---------- */
function renderDday(eventDate) {
  const label = document.getElementById("ddayLabel");
  if (!label) return;

  const today = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.ceil(
    (Date.UTC(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()) -
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
      msPerDay
  );

  if (diff > 0) label.textContent = `D-${diff}`;
  else if (diff === 0) label.textContent = "D-DAY";
  else label.textContent = "고마운 하루";
}

/* ---------- 캘린더에 추가 (.ics 다운로드) ---------- */
function wireCalendarButton(eventDate) {
  const btn = document.getElementById("calendarBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const start = eventDate;
    const end = new Date(start.getTime() + CONFIG.eventDurationHours * 60 * 60 * 1000);

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//hwangap-invitation//KR",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@hwangap-invitation`,
      `DTSTAMP:${toICSDate(new Date())}`,
      `DTSTART:${toICSDate(start)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:${CONFIG.personName} 님 환갑 잔치`,
      `LOCATION:${CONFIG.venueName} ${CONFIG.venueAddress}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "환갑잔치.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("캘린더 파일을 내려받았어요");
  });
}

function toICSDate(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/* ---------- 지도 버튼 ---------- */
function wireMapButtons() {
  const q = encodeURIComponent(CONFIG.venueAddress);

  const naver = document.getElementById("naverMapBtn");
  if (naver) naver.href = `https://map.naver.com/v5/search/${q}`;

  const kakao = document.getElementById("kakaoMapBtn");
  if (kakao) kakao.href = `https://map.kakao.com/?q=${q}`;
}

/* ---------- 주소 복사 ---------- */
function wireCopyAddress() {
  const btn = document.getElementById("copyAddrBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const text = `${CONFIG.venueName}\n${CONFIG.venueAddress}`;
    await copyText(text);
    showToast("주소를 복사했어요");
  });
}

/* ---------- 링크 복사 (공유하기) ---------- */
function wireCopyLink() {
  const btn = document.getElementById("shareBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    await copyText(window.location.href);
    showToast("초대장 링크를 복사했어요");
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // 클립보드 API를 쓸 수 없는 환경을 위한 대체 방법
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

/* ---------- 스크롤 유도 버튼 ---------- */
function wireScrollCue() {
  const cue = document.getElementById("scrollCue");
  const greeting = document.getElementById("greeting");
  if (!cue || !greeting) return;

  cue.addEventListener("click", () => {
    greeting.scrollIntoView({ behavior: "smooth" });
  });
}

/* ---------- 토스트 ---------- */
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}
