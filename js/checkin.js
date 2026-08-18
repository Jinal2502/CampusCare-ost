(function () {
  "use strict";

  var STORAGE_EMAIL = "campuscareEmail";
  var STORAGE_NAME = "campuscareName";
  var STORAGE_ID = "campuscareStudentId";

  var scores = { mood: 5, energy: 3, stress: 2 };
  var viewYear;
  var viewMonth; // 1-12
  var checkinsByDate = {};
  var selectedDate = null;
  var currentStudent = null;

  var onboardPanel = document.getElementById("onboard-panel");
  var dailyPanel = document.getElementById("daily-panel");
  var onboardForm = document.getElementById("onboard-form");
  var dailyForm = document.getElementById("daily-form");
  var onboardError = document.getElementById("onboard-error");
  var dailyError = document.getElementById("daily-error");
  var dailySuccess = document.getElementById("daily-success");
  var welcomeTitle = document.getElementById("welcome-title");
  var btnSwitch = document.getElementById("btn-switch-account");
  var calendarLocked = document.getElementById("calendar-locked");
  var calendarActive = document.getElementById("calendar-active");
  var calendarGrid = document.getElementById("calendar-grid");
  var monthLabel = document.getElementById("calendar-month-label");
  var dayDetail = document.getElementById("day-detail");
  var dayDetailDate = document.getElementById("day-detail-date");
  var dayDetailScores = document.getElementById("day-detail-scores");
  var dayDetailNote = document.getElementById("day-detail-note");
  var statCount = document.getElementById("stat-count");
  var statAvg = document.getElementById("stat-avg");
  var statMood = document.getElementById("stat-mood");

  var now = new Date();
  viewYear = now.getFullYear();
  viewMonth = now.getMonth() + 1;

  function api(path, options) {
    return fetch(path, options).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var err = new Error((data && data.error) || "Request failed");
          err.status = res.status;
          throw err;
        }
        return data;
      });
    });
  }

  function showError(el, message) {
    el.textContent = message;
    el.hidden = false;
  }

  function hideError(el) {
    el.hidden = true;
    el.textContent = "";
  }

  function monthKey(y, m) {
    return y + "-" + String(m).padStart(2, "0");
  }

  function formatMonthTitle(y, m) {
    return new Date(y, m - 1, 1).toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });
  }

  function formatDayTitle(dateStr) {
    var parts = dateStr.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function todayISO() {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  }

  function moodLabel(n) {
    var labels = { 1: "Low", 2: "Meh", 3: "Okay", 4: "Good", 5: "Great" };
    return labels[n] || String(n);
  }

  function setScore(group, value) {
    scores[group] = value;
    var row = document.querySelector('.score-row[data-score="' + group + '"]');
    if (!row) return;
    row.querySelectorAll(".score-btn").forEach(function (btn) {
      var active = Number(btn.getAttribute("data-value")) === value;
      btn.classList.toggle("is-selected", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function bindScoreButtons() {
    document.querySelectorAll(".score-row").forEach(function (row) {
      var group = row.getAttribute("data-score");
      row.querySelectorAll(".score-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          setScore(group, Number(btn.getAttribute("data-value")));
        });
      });
    });
  }

  function showOnboarding() {
    currentStudent = null;
    onboardPanel.hidden = false;
    dailyPanel.hidden = true;
    calendarLocked.hidden = false;
    calendarActive.hidden = true;
    dayDetail.hidden = true;
  }

  function showDaily(student) {
    currentStudent = student;
    onboardPanel.hidden = true;
    dailyPanel.hidden = false;
    calendarLocked.hidden = true;
    calendarActive.hidden = false;
    welcomeTitle.textContent = "Hi, " + student.full_name.split(" ")[0];
    localStorage.setItem(STORAGE_EMAIL, student.email);
    localStorage.setItem(STORAGE_NAME, student.full_name);
    if (student.id) localStorage.setItem(STORAGE_ID, String(student.id));
  }

  function normalizeCheckinDate(value) {
    if (!value) return "";
    if (typeof value === "string") return value.slice(0, 10);
    return String(value).slice(0, 10);
  }

  function renderCalendar() {
    monthLabel.textContent = formatMonthTitle(viewYear, viewMonth);
    calendarGrid.innerHTML = "";

    var first = new Date(viewYear, viewMonth - 1, 1);
    // Monday-first: Sun=0 → 6, Mon=1 → 0, ...
    var startPad = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    var today = todayISO();

    var i;
    for (i = 0; i < startPad; i++) {
      var empty = document.createElement("div");
      empty.className = "cal-day cal-day--empty";
      empty.setAttribute("aria-hidden", "true");
      calendarGrid.appendChild(empty);
    }

    for (i = 1; i <= daysInMonth; i++) {
      var dateStr =
        viewYear +
        "-" +
        String(viewMonth).padStart(2, "0") +
        "-" +
        String(i).padStart(2, "0");
      var entry = checkinsByDate[dateStr];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-day";
      btn.setAttribute("data-date", dateStr);

      var num = document.createElement("span");
      num.className = "cal-day-num";
      num.textContent = String(i);
      btn.appendChild(num);

      var dot = document.createElement("span");
      dot.className = "cal-day-dot";
      btn.appendChild(dot);

      if (dateStr === today) {
        btn.classList.add("cal-day--today");
      }

      if (entry) {
        btn.classList.add("cal-day--has-data", "stress-" + entry.stress);
        btn.setAttribute(
          "aria-label",
          formatDayTitle(dateStr) +
            ", stress " +
            entry.stress +
            ", mood " +
            entry.mood
        );
      } else {
        btn.classList.add("cal-day--muted");
        btn.setAttribute("aria-label", formatDayTitle(dateStr) + ", no check-in");
        btn.disabled = true;
      }

      if (selectedDate === dateStr) {
        btn.classList.add("cal-day--selected");
      }

      if (entry) {
        btn.addEventListener("click", function (date) {
          return function () {
            selectedDate = date;
            showDayDetail(date);
            renderCalendar();
          };
        }(dateStr));
      }

      calendarGrid.appendChild(btn);
    }
  }

  function showDayDetail(dateStr) {
    var entry = checkinsByDate[dateStr];
    if (!entry) {
      dayDetail.hidden = true;
      return;
    }
    dayDetail.hidden = false;
    dayDetailDate.textContent = formatDayTitle(dateStr);
    dayDetailScores.textContent =
      "Mood " +
      entry.mood +
      " · Energy " +
      entry.energy +
      " · Stress " +
      entry.stress;
    dayDetailNote.textContent = entry.note ? "“" + entry.note + "”" : "";
  }

  function updateStats(stats) {
    statCount.textContent = String(stats.count || 0);
    statAvg.textContent = stats.avg_stress != null ? String(stats.avg_stress) : "—";
    statMood.textContent =
      stats.latest_mood != null ? moodLabel(stats.latest_mood) : "—";
  }

  function applyCalendarData(data) {
    checkinsByDate = {};
    (data.checkins || []).forEach(function (row) {
      var key = normalizeCheckinDate(row.checkin_date);
      checkinsByDate[key] = row;
    });
    updateStats(data.stats || { count: 0 });
    if (selectedDate && !checkinsByDate[selectedDate]) {
      selectedDate = null;
      dayDetail.hidden = true;
    } else if (selectedDate) {
      showDayDetail(selectedDate);
    }
    renderCalendar();
  }

  function applyTodayPrefill(checkin) {
    if (!checkin) return;
    setScore("mood", checkin.mood);
    setScore("energy", checkin.energy);
    setScore("stress", checkin.stress);
    document.getElementById("note").value = checkin.note || "";
  }

  function studentQuery() {
    if (currentStudent && currentStudent.id) {
      return "student_id=" + encodeURIComponent(currentStudent.id);
    }
    return "email=" + encodeURIComponent(currentStudent.email);
  }

  function loadMonth() {
    if (!currentStudent) return Promise.resolve();

    return api(
      "/api/checkins?" +
        studentQuery() +
        "&month=" +
        encodeURIComponent(monthKey(viewYear, viewMonth))
    ).then(function (data) {
      applyCalendarData(data);
    });
  }

  function enterSession(student, payload) {
    showDaily(student);
    selectedDate = null;
    dayDetail.hidden = true;
    if (payload && payload.checkins) {
      applyCalendarData(payload);
      applyTodayPrefill(payload.today_checkin);
      return Promise.resolve();
    }
    return loadMonth().catch(function (err) {
      showError(dailyError, err.message || "Could not load your data.");
    });
  }

  onboardForm.addEventListener("submit", function (event) {
    event.preventDefault();
    hideError(onboardError);

    var full_name = document.getElementById("full-name").value.trim();
    var email = document.getElementById("email").value.trim();
    var course = document.getElementById("course").value.trim();
    var year = document.getElementById("year").value.trim();

    if (!full_name) {
      showError(onboardError, "Please enter your full name.");
      return;
    }
    if (!email || email.indexOf("@") === -1) {
      showError(onboardError, "Please enter a valid email.");
      return;
    }

    var btn = document.getElementById("btn-onboard");
    btn.disabled = true;
    btn.textContent = "Continuing…";

    api("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: full_name,
        email: email,
        course: course,
        year: year,
        month: monthKey(viewYear, viewMonth),
      }),
    })
      .then(function (data) {
        return enterSession(data.student, data);
      })
      .catch(function (err) {
        showError(onboardError, err.message || "Could not save profile.");
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = "Continue";
      });
  });

  dailyForm.addEventListener("submit", function (event) {
    event.preventDefault();
    hideError(dailyError);
    dailySuccess.hidden = true;

    if (!currentStudent) return;

    var btn = document.getElementById("btn-save");
    btn.disabled = true;
    btn.textContent = "Saving…";

    var today = todayISO();
    var optimistic = {
      checkin_date: today,
      mood: scores.mood,
      energy: scores.energy,
      stress: scores.stress,
      note: document.getElementById("note").value.trim() || null,
    };
    checkinsByDate[today] = optimistic;
    selectedDate = today;
    applyCalendarData({
      checkins: Object.keys(checkinsByDate).map(function (k) {
        return checkinsByDate[k];
      }),
      stats: (function () {
        var rows = Object.keys(checkinsByDate).map(function (k) {
          return checkinsByDate[k];
        });
        var count = rows.length;
        var avg =
          count === 0
            ? null
            : Math.round((rows.reduce(function (s, r) { return s + r.stress; }, 0) / count) * 10) / 10;
        return {
          count: count,
          avg_stress: avg,
          latest_mood: optimistic.mood,
        };
      })(),
    });
    showDayDetail(today);
    dailySuccess.textContent = "Saved — calendar updated";
    dailySuccess.hidden = false;

    api("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: currentStudent.id,
        email: currentStudent.email,
        mood: scores.mood,
        energy: scores.energy,
        stress: scores.stress,
        note: document.getElementById("note").value.trim(),
        month: monthKey(viewYear, viewMonth),
      }),
    })
      .then(function (data) {
        if (data.checkins) {
          selectedDate = normalizeCheckinDate(data.checkin.checkin_date);
          applyCalendarData(data);
          showDayDetail(selectedDate);
        }
      })
      .catch(function (err) {
        dailySuccess.hidden = true;
        showError(dailyError, err.message || "Could not save check-in.");
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = "Save today’s check-in";
      });
  });

  btnSwitch.addEventListener("click", function () {
    localStorage.removeItem(STORAGE_EMAIL);
    localStorage.removeItem(STORAGE_NAME);
    localStorage.removeItem(STORAGE_ID);
    hideError(dailyError);
    dailySuccess.hidden = true;
    showOnboarding();
  });

  document.getElementById("btn-prev-month").addEventListener("click", function () {
    viewMonth -= 1;
    if (viewMonth < 1) {
      viewMonth = 12;
      viewYear -= 1;
    }
    selectedDate = null;
    dayDetail.hidden = true;
    loadMonth().catch(function (err) {
      showError(dailyError, err.message);
    });
  });

  document.getElementById("btn-next-month").addEventListener("click", function () {
    viewMonth += 1;
    if (viewMonth > 12) {
      viewMonth = 1;
      viewYear += 1;
    }
    selectedDate = null;
    dayDetail.hidden = true;
    loadMonth().catch(function (err) {
      showError(dailyError, err.message);
    });
  });

  bindScoreButtons();
  setScore("mood", scores.mood);
  setScore("energy", scores.energy);
  setScore("stress", scores.stress);
  renderCalendar();

  var savedEmail = localStorage.getItem(STORAGE_EMAIL);
  if (savedEmail) {
    api(
      "/api/students?email=" +
        encodeURIComponent(savedEmail) +
        "&month=" +
        encodeURIComponent(monthKey(viewYear, viewMonth))
    )
      .then(function (data) {
        return enterSession(data.student, data);
      })
      .catch(function () {
        localStorage.removeItem(STORAGE_EMAIL);
        localStorage.removeItem(STORAGE_NAME);
        localStorage.removeItem(STORAGE_ID);
        showOnboarding();
      });
  } else {
    showOnboarding();
  }
})();
