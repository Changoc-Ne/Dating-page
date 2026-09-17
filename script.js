const state = {
  date: null,
  time: null,
  snacks: []
};

const today = new Date();
today.setHours(0, 0, 0, 0);
let viewDate = new Date(today.getFullYear(), today.getMonth(), 1);

const monthTitle = document.getElementById("monthTitle");
const calendar = document.getElementById("calendar");
const selectedDateLabel = document.getElementById("selectedDateLabel");

function pad(n) { return String(n).padStart(2, "0"); }

function formatLongDate(date) {
  return date.toLocaleDateString("vi-VN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}

function renderCalendar() {
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  monthTitle.textContent = viewDate.toLocaleDateString("vi-VN", {
    month: "long", year: "numeric"
  });

  calendar.innerHTML = "";

  const firstDay = new Date(y, m, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();

  for (let i = 0; i < 42; i++) {
    const day = i - startOffset + 1;
    const btn = document.createElement("button");

    let cellDate;
    if (day < 1) {
      btn.textContent = prevDays + day;
      btn.classList.add("muted");
      cellDate = new Date(y, m - 1, prevDays + day);
    } else if (day > daysInMonth) {
      btn.textContent = day - daysInMonth;
      btn.classList.add("muted");
      cellDate = new Date(y, m + 1, day - daysInMonth);
    } else {
      btn.textContent = day;
      cellDate = new Date(y, m, day);
    }

    const sameDay = (a, b) => a && a.toDateString() === b.toDateString();

    if (sameDay(cellDate, today)) btn.classList.add("today");
    if (state.date && sameDay(cellDate, state.date)) btn.classList.add("selected");

    // Không cho chọn ngày trong quá khứ.
    if (cellDate < today) {
      btn.disabled = true;
      btn.style.opacity = ".35";
      btn.style.cursor = "not-allowed";
    } else {
      btn.addEventListener("click", () => {
        state.date = cellDate;
        selectedDateLabel.textContent = formatLongDate(cellDate);
        updateSummary();
        renderCalendar();
      });
    }

    calendar.appendChild(btn);
  }
}

document.getElementById("prevMonth").addEventListener("click", () => {
  const previous = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  if (previous >= currentMonth) {
    viewDate = previous;
    renderCalendar();
  }
});

document.getElementById("nextMonth").addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  renderCalendar();
});

const hourWheel = document.getElementById("hourWheel");
const minuteWheel = document.getElementById("minuteWheel");

let selectedHour = 0;
let selectedMinute = 0;

function createInfiniteWheel(wheel, max) {
  wheel.innerHTML = "";

  // Tạo 3 vòng giống nhau
  for (let round = 0; round < 3; round++) {
    for (let i = 0; i < max; i++) {
      const item = document.createElement("div");

      item.className = "wheel-item";
      item.textContent = String(i).padStart(2, "0");

      wheel.appendChild(item);
    }
  }
}

createInfiniteWheel(hourWheel, 24);
createInfiniteWheel(minuteWheel, 60); 

function setInitialTime() {
  const hourItem = hourWheel.children[24 + selectedHour];
  const minuteItem = minuteWheel.children[60 + selectedMinute];

  if (hourItem) {
    hourItem.classList.add("selected");
  }

  if (minuteItem) {
    minuteItem.classList.add("selected");
  }

  requestAnimationFrame(() => {
    if (hourItem) {
      hourWheel.scrollTop =
        hourItem.offsetTop -
        (hourWheel.clientHeight / 2) +
        (hourItem.offsetHeight / 2);
    }

    if (minuteItem) {
      minuteWheel.scrollTop =
        minuteItem.offsetTop -
        (minuteWheel.clientHeight / 2) +
        (minuteItem.offsetHeight / 2);
    }

    updateTime();
  });
}


// =========================
// LẤY GIỜ ĐANG ĐƯỢC CHỌN
// =========================

function getSelectedValue(wheel) {
  const items = [...wheel.querySelectorAll(".wheel-item")];

  const wheelCenter =
    wheel.getBoundingClientRect().top +
    wheel.clientHeight / 2;

  let closestItem = null;
  let minDistance = Infinity;

  items.forEach(item => {
    const itemCenter =
      item.getBoundingClientRect().top +
      item.offsetHeight / 2;

    const distance =
      Math.abs(wheelCenter - itemCenter);

    if (distance < minDistance) {
      minDistance = distance;
      closestItem = item;
    }
  });

  return closestItem;
}

function keepInfiniteScroll(wheel, max) {
  const itemHeight =
    wheel.querySelector(".wheel-item").offsetHeight;

  const oneRoundHeight = max * itemHeight;

  // Nếu kéo quá lên vòng đầu
  if (wheel.scrollTop < oneRoundHeight * 0.5) {
    wheel.scrollTop += oneRoundHeight;
  }

  // Nếu kéo quá xuống vòng cuối
  if (wheel.scrollTop > oneRoundHeight * 1.5) {
    wheel.scrollTop -= oneRoundHeight;
  }
}

// =========================
// CẬP NHẬT GIỜ
// =========================

function updateTime() {

  state.time =
    `${String(selectedHour).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")}`;

  updateSummary();
}


// =========================
// XỬ LÝ KHI LĂN GIỜ
// =========================

hourWheel.addEventListener("scroll", () => {
  keepInfiniteScroll(hourWheel, 24);

  const selected = getSelectedValue(hourWheel);

  if (!selected) return;

  document
    .querySelectorAll("#hourWheel .wheel-item")
    .forEach(item => item.classList.remove("selected"));

  selected.classList.add("selected");

  selectedHour = Number(selected.textContent);

  updateTime();
});


// =========================
// XỬ LÝ KHI LĂN PHÚT
// =========================

minuteWheel.addEventListener("scroll", () => {
  keepInfiniteScroll(minuteWheel, 60);

  const selected = getSelectedValue(minuteWheel);

  if (!selected) return;

  document
    .querySelectorAll("#minuteWheel .wheel-item")
    .forEach(item => item.classList.remove("selected"));

  selected.classList.add("selected");

  selectedMinute = Number(selected.textContent);

  updateTime();
});

document.querySelectorAll(".snack").forEach(btn => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.name;
    if (state.snacks.includes(name)) {
      state.snacks = state.snacks.filter(x => x !== name);
      btn.classList.remove("selected");
    } else {
      state.snacks.push(name);
      btn.classList.add("selected");
    }
    updateSummary();
  });
});

function updateSummary() {
  document.getElementById("summaryDate").textContent =
    state.date ? formatLongDate(state.date) : "Chưa chọn";
  document.getElementById("summaryTime").textContent =
    state.time || "Chưa chọn";
  document.getElementById("summarySnacks").textContent =
    state.snacks.length ? state.snacks.join(", ") : "Chưa chọn";
}

document.getElementById("confirmBtn").addEventListener("click", () => {
  const message = document.getElementById("message");

  if (!state.date || !state.time) {
    message.textContent = "Bạn chọn ngày và giờ trước nhé ♡";
    return;
  }

  const snackText = state.snacks.length
    ? state.snacks.join(", ")
    : "chưa chọn món ăn vặt";

  const successText = document.getElementById("successText");
  const successOverlay = document.getElementById("successOverlay");

  successText.textContent =
    `Hẹn bạn vào ${formatLongDate(state.date)} lúc ${state.time}. ${snackText} ✨`;

  successOverlay.classList.add("show");
});

// =========================
// KHỞI TẠO AN TOÀN KHI DOM SẴN SÀNG
// =========================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Vẽ lịch ngay lập tức
  renderCalendar();

  // 2. Chờ 100ms cho layout tính xong chiều cao rồi mới set bánh xe giờ (tránh lỗi offsetHeight = 0)
  setTimeout(() => {
    setInitialTime();
  }, 100);

  // 3. Sự kiện đóng Popup
  const successClose = document.getElementById("successClose");
  const successBtn = document.getElementById("successBtn");
  const successOverlay = document.getElementById("successOverlay");

  if (successClose) {
    successClose.addEventListener("click", () => {
      successOverlay.classList.remove("show");
    });
  }

  if (successBtn) {
    successBtn.addEventListener("click", () => {
      successOverlay.classList.remove("show");
    });
  }
});