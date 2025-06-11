import { setupBottomSheetEvents, openBottomSheet, closeBottomSheet } from "./bottomSheetHandler.js";

//nav-bar-----------------------가져오기
window.addEventListener("DOMContentLoaded", async () => {
  const navRes = await fetch("/templates/nav-bar.html");
  const navHtml = await navRes.text();
  document.querySelector(".home-container").insertAdjacentHTML("beforeend", navHtml);

  const todoRes = await fetch("/templates/add-todo-sheet.html");
  const todoHtml = await todoRes.text();
  document.querySelector(".home-container").insertAdjacentHTML("beforeend", todoHtml);

  setupBottomSheetEvents();
  attachEditBtnHandler();

  const scheduleList = document.querySelector(".nav-icon2");
    if (scheduleList) {
      scheduleList.style.opacity = 0.5;
    }

  const form = document.getElementById("todoForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const titleInput = document.getElementById("todo");
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.value = "";
      titleInput.placeholder = "제목은 필수 입력입니다";
      titleInput.classList.add("required-placeholder");
      return;
    }
    titleInput.addEventListener("input", () => {
      if (titleInput.classList.contains("required-placeholder")) {
        titleInput.classList.remove("required-placeholder");
        titleInput.placeholder = "일정 제목";  // 원래 placeholder로 복원
      }
    });

    const memo = document.getElementById("memo").value;
    const year = document.getElementById("year").value;
    const month = document.getElementById("month").value;
    const day = document.getElementById("day").value;
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const sh = document.getElementById("start-hour").value;
    const sm = document.getElementById("start-minute").value;
    const eh = document.getElementById("end-hour").value;
    const em = document.getElementById("end-minute").value;
    const timeChecked = document.getElementById("time").checked;
    const time = timeChecked && sh && eh ? `${sh}:${sm}-${eh}:${em}` : "하루종일";
    const priorityChecked = document.getElementById("priority").checked;
    const pr = document.querySelector("input[name='priority-radio']:checked");
    const priority = priorityChecked && pr ? parseInt(pr.value) : null;


    if (window.editingScheduleId !== null) {
      const target = dummySchedules.find(s => s.id === window.editingScheduleId);
      if (target) {
        target.title = title || target.title;
        target.memo = memo || target.memo;
        target.date = date;
        target.time = time;
        target.priority = priority;
      }
    } else {
      const newId = dummySchedules.length ? Math.max(...dummySchedules.map(s => s.id)) + 1 : 1;
      dummySchedules.push({ id: newId, title, memo, date, time, priority });
    }

    renderSchedules(date);
    closeBottomSheet();
    document.getElementById("todoForm").reset();
    window.editingScheduleId = null;
  });
});

let currentDate = new Date();
const checkedStatus = {};

const dummySchedules = [
  { id: 1, date: "2025-06-02", time: "09:00 - 12:00", title: "졸작 보고서", memo: "월요일 회의 예정", priority: 1 },
  { id: 2, date: "2025-06-02", time: "하루종일", title: "졸작", memo: "메모 없음", priority: null },
  { id: 3, date: "2025-06-03", time: "13:00 - 14:00", title: "빅데이터 과제", memo: "주제 기획", priority: 2 },
  { id: 4, date: "2025-06-04", time: "하루종일", title: "교양 과제", memo: "기한 회의해보기", priority: null },
  { id: 5, date: "2025-06-02", time: "13:00 - 15:00", title: "졸작 보고서", memo: "월요일 회의 예정", priority: 2 },
  { id: 6, date: "2025-06-02", time: "07:00 - 08:00", title: "와와아아작", memo: "메모 없음", priority: null },
  { id: 7, date: "2025-06-03", time: "13:00 - 14:00", title: "빅데이터 과제", memo: "주제 기획", priority: 2 },
  { id: 8, date: "2025-06-04", time: "하루종일", title: "교양 과제", memo: "기한 회의해보기", priority: null },
  { id: 9, date: "2025-06-02", time: "하루종일", title: "졸작", memo: "메모 없음", priority: null },
  { id: 10, date: "2025-06-02", time: "하루종일", title: "졸작", memo: "메모 없음", priority: null },
  { id: 11, date: "2025-06-02", time: "하루종일", title: "졸작", memo: "메모 없음", priority: null },
  { id: 12, date: "2025-06-02", time: "하루종일", title: "졸작", memo: "메모 없음", priority: null },

];

//일정 우선순위에 따른 아이콘
const priorityIcons = {
  1: "/static/img/prio1.svg",
  2: "/static/img/prio2.svg",
  3: "/static/img/prio3.svg"
};


function renderCalendar(baseDate) {
  const weekCalendar = document.querySelector(".week-calendar");
  weekCalendar.innerHTML = "";
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  document.getElementById("calendar-year").textContent = `${year}년`;
  document.getElementById("calendar-month").textContent = `${month + 1}월`;

  const lastDay = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= lastDay; d++) {
    const thisDate = new Date(year, month, d);
    const weekday = ["일", "월", "화", "수", "목", "금", "토"][thisDate.getDay()];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const box = document.createElement("div");
    box.classList.add("day-box");
    box.dataset.date = dateStr;

    if (isCurrentMonth && d === today.getDate()) {
      box.classList.add("today", "selected");
    }

    box.innerHTML = `<div class="weekday">${weekday}</div><div class="day-number">${d}</div>`;
    box.addEventListener("click", () => {
      document.querySelector(".day-box.selected")?.classList.remove("selected");
      box.classList.add("selected");
      renderSchedules(dateStr);
    });

    weekCalendar.appendChild(box);
  }

  const defaultDate = isCurrentMonth ? today : new Date(year, month, 1);
  const defaultStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(defaultDate.getDate()).padStart(2, "0")}`;
  renderSchedules(defaultStr);
}

//일정 추가, 수정 등 완료 후 렌더링 할때
function renderSchedules(selectedDate) {
  const scheduleList = document.querySelector(".schedule-list");

  scheduleList.innerHTML = "";

  let schedules = dummySchedules.filter(item => item.date === selectedDate);
  schedules.forEach(s => {
    s.memo = s.memo || "메모 없음";
    s.time = s.time || "하루종일";
  });

  schedules.sort((a, b) => {
    const priorityA = (a.priority === null || a.priority === undefined) ? 999 : a.priority;
    const priorityB = (b.priority === null || b.priority === undefined) ? 999 : b.priority;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return a.time.localeCompare(b.time);
  });


  if (!schedules.length) {
    scheduleList.innerHTML = `<div class="no-schedule">추가된 일정이 없습니다.</div>`;
    return;
  }

  schedules.forEach(item => {
    const card = document.createElement("div");
    const iconHtml = item.priority && priorityIcons[item.priority]
      ? `<img src="${priorityIcons[item.priority]}" class="priority-icon" alt="우선순위 ${item.priority}">`
      : "";

    card.className = "schedule-card";
    card.innerHTML = `
       <div class = "schedule-left">
        <div class="prior-icon">${iconHtml}</div>
        <div class="schedule-checkbox">
          <input type="checkbox" class="check-task" data-id="${item.id}" ${item.is_checked ? "checked" : ""}>
          <span class="checkmark"></span>
        </div>
      </div>
      <div class="schedule-info">
        <div class="schedule-time">${item.time}</div>
        <div class="schedule-title">${item.title}</div>
        <div class="schedule-memo">${item.memo}</div>
      </div>
      <button class="more-btn">∙∙∙</button>
      <div class="toolbar hidden">
        <button class="edit-btn">수정</button>
        <button class="delete-btn">삭제</button>
      </div>
    `;

    scheduleList.appendChild(card);
    const checkbox = card.querySelector(".check-task");
    const title = card.querySelector(".schedule-title");
    const isChecked = checkedStatus[item.id] || false;
    checkbox.checked = isChecked;
    title.style.color = isChecked ? "var(--gray-50)" : "var(--gray-80)";
    title.style.textDecoration = isChecked ? "line-through" : "none";
  });

  document.querySelectorAll(".schedule-checkbox").forEach(box => {
    const checkbox = box.querySelector(".check-task");
    const title = box.closest(".schedule-card").querySelector(".schedule-title");
    box.addEventListener("click", (e) => {
      e.preventDefault();
      checkbox.checked = !checkbox.checked;
      checkedStatus[checkbox.dataset.id] = checkbox.checked;
      title.style.color = checkbox.checked ? "var(--gray-50)" : "var(--gray-80)";
      title.style.textDecoration = checkbox.checked ? "line-through" : "none";
    });
  });

  document.querySelectorAll(".more-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const toolbar = btn.nextElementSibling;
      toolbar.classList.toggle("hidden");
      document.querySelectorAll(".toolbar").forEach(el => {
        if (el !== toolbar) el.classList.add("hidden");
      });
    });
  });
}

document.getElementById("prev-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

document.getElementById("next-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

document.addEventListener("DOMContentLoaded", () => {
  const weekCalendar = document.querySelector(".week-calendar");
  const scheduleList = document.querySelector(".schedule-list");
const homeIcon = document.querySelector(".home-button");
  if (homeIcon) {
    homeIcon.classList.add("active-nav-icon");
  }
  renderCalendar(currentDate);
  setTimeout(() => {
    const todayBox = document.querySelector(".day-box.today");
    if (todayBox) todayBox.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, 50);
  setupHorizontalDrag(weekCalendar);
  setupVerticalDrag(scheduleList);
});

function setupHorizontalDrag(container) {
  let isDown = false, startX, scrollLeft;
  container.addEventListener("mousedown", e => {
    isDown = true;
    container.classList.add("dragging");
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });
  container.addEventListener("mouseleave", () => isDown = false);
  container.addEventListener("mouseup", () => isDown = false);
  container.addEventListener("mousemove", e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });
}

function setupVerticalDrag(container) {
  let isDown = false, startY, scrollTop;

  container.addEventListener("mousedown", e => {
    isDown = true;
    container.classList.add("dragging");
    startY = e.pageY;
    scrollTop = container.scrollTop;
  });

  container.addEventListener("mouseleave", () => {
    isDown = false;
    container.classList.remove("dragging");
  });

  container.addEventListener("mouseup", () => {
    isDown = false;
    container.classList.remove("dragging");
  });

  container.addEventListener("mousemove", e => {
    if (!isDown) return;
    e.preventDefault();
    const y = e.pageY;
    const walk = (y - startY) * 1.5; // 이동 거리
    container.scrollTop = scrollTop - walk;
  });
}

document.addEventListener("click", (e) => {
  const isMoreBtn = e.target.closest(".more-btn");
  const isToolbar = e.target.closest(".toolbar");
  
  if (isMoreBtn) {
    const currentCard = isMoreBtn.closest(".schedule-card");
    const thisToolbar = currentCard.querySelector(".toolbar");
    const isOpen = !thisToolbar.classList.contains("hidden");
    document.querySelectorAll(".toolbar").forEach(t => t.classList.add("hidden"));
    if (!isOpen) thisToolbar.classList.remove("hidden");
    return;
  }
  if (!isToolbar) {
    document.querySelectorAll(".toolbar").forEach(t => t.classList.add("hidden"));
  }

  if (e.target.classList.contains("delete-btn")) {
    const card = e.target.closest(".schedule-card");
    const id = parseInt(card.querySelector(".check-task").dataset.id);
    openConfirmModal("일정을 삭제할까요?", () => {
      const date = document.querySelector(".day-box.selected").dataset.date;
      dummySchedules.splice(dummySchedules.findIndex((s) => s.id === id), 1);
      renderSchedules(date);
    });
  }
});

function attachEditBtnHandler() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const card = e.target.closest(".schedule-card");
      const id = parseInt(card.querySelector(".check-task").dataset.id);
      const schedule = dummySchedules.find((s) => s.id === id);
      if (schedule) {
        openBottomSheet('edit', schedule);
      }
    }
  });
}

function openConfirmModal(message, onConfirm) {
  const modal = document.querySelector(".modal-overlay");
  modal.querySelector("p").textContent = message;
  modal.classList.remove("hidden");
  const cancelBtn = modal.querySelector(".cancel-btn");
  const confirmBtn = modal.querySelector(".confirm-delete-btn");
  const close = () => {
    modal.classList.add("hidden");
    cancelBtn.onclick = null;
    confirmBtn.onclick = null;
  };
  cancelBtn.onclick = close;
  confirmBtn.onclick = () => { onConfirm(); close(); };
}
