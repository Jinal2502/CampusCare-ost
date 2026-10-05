(function () {
  "use strict";

  var MIN_CUSTOM = 1;
  var MAX_CUSTOM = 120;

  var MODES = {
    focus: {
      seconds: 25 * 60,
      label: "Focus",
      ready: "Ready to focus",
      running: "Focusing…",
      paused: "Focus paused",
    },
    short: {
      seconds: 5 * 60,
      label: "Short Break",
      ready: "Ready for a short break",
      running: "On a short break…",
      paused: "Break paused",
    },
    long: {
      seconds: 15 * 60,
      label: "Long Break",
      ready: "Ready for a long break",
      running: "On a long break…",
      paused: "Break paused",
    },
    custom: {
      seconds: 25 * 60,
      label: "Custom",
      ready: "Ready for a custom session",
      running: "Custom session in progress…",
      paused: "Custom session paused",
    },
  };

  var currentMode = "focus";
  var remaining = MODES.focus.seconds;
  var timerId = null;
  var isRunning = false;
  var sessionsCompleted = 0;

  var displayEl = document.getElementById("timer-display");
  var statusEl = document.getElementById("timer-status");
  var sessionEl = document.getElementById("session-count");
  var focusInput = document.getElementById("focus-input");
  var startBtn = document.getElementById("btn-start");
  var pauseBtn = document.getElementById("btn-pause");
  var resetBtn = document.getElementById("btn-reset");
  var modeButtons = document.querySelectorAll(".pomodoro-mode");
  var customPanel = document.getElementById("custom-panel");
  var customMinutesInput = document.getElementById("custom-minutes");
  var setCustomBtn = document.getElementById("btn-set-custom");
  var customError = document.getElementById("custom-error");

  function formatTime(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function updateDisplay() {
    displayEl.textContent = formatTime(remaining);
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function clearCustomError() {
    customError.hidden = true;
    customError.textContent = "";
    customMinutesInput.classList.remove("is-invalid");
    customMinutesInput.removeAttribute("aria-invalid");
  }

  function showCustomError(message) {
    customError.textContent = message;
    customError.hidden = false;
    customMinutesInput.classList.add("is-invalid");
    customMinutesInput.setAttribute("aria-invalid", "true");
  }

  function updateCustomPanel() {
    var showCustom = currentMode === "custom";
    customPanel.hidden = !showCustom;

    if (!showCustom) {
      clearCustomError();
      return;
    }

    var locked = isRunning;
    customMinutesInput.disabled = locked;
    setCustomBtn.disabled = locked;
  }

  function updateButtons() {
    startBtn.disabled = isRunning;
    pauseBtn.disabled = !isRunning;
    startBtn.textContent =
      remaining < MODES[currentMode].seconds && !isRunning ? "Resume" : "Start";
    updateCustomPanel();
  }

  function stopTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
    isRunning = false;
    updateButtons();
  }

  function getRunningStatus() {
    var task = focusInput.value.trim();
    if ((currentMode === "focus" || currentMode === "custom") && task) {
      return "Focusing on: " + task;
    }
    return MODES[currentMode].running;
  }

  function completeSession() {
    stopTimer();
    remaining = 0;
    updateDisplay();

    if (currentMode === "focus" || currentMode === "custom") {
      sessionsCompleted += 1;
      sessionEl.textContent = String(sessionsCompleted);
      setStatus(
        currentMode === "custom"
          ? "Custom session complete — nice work!"
          : "Focus session complete — nice work!"
      );
    } else {
      setStatus(MODES[currentMode].label + " complete — ready when you are");
    }
  }

  function tick() {
    if (remaining <= 1) {
      completeSession();
      return;
    }
    remaining -= 1;
    updateDisplay();
  }

  function startTimer() {
    if (isRunning) return;

    if (remaining <= 0) {
      remaining = MODES[currentMode].seconds;
      updateDisplay();
    }

    isRunning = true;
    setStatus(getRunningStatus());
    updateButtons();
    timerId = setInterval(tick, 1000);
  }

  function pauseTimer() {
    if (!isRunning) return;
    stopTimer();
    setStatus(MODES[currentMode].paused);
  }

  function resetTimer() {
    stopTimer();
    remaining = MODES[currentMode].seconds;
    updateDisplay();
    setStatus(MODES[currentMode].ready);
    updateButtons();
  }

  function validateCustomMinutes(raw) {
    var value = String(raw).trim();

    if (value === "") {
      return { ok: false, message: "Enter a duration in minutes." };
    }

    if (!/^\d+$/.test(value)) {
      return { ok: false, message: "Enter a whole number between 1 and 120." };
    }

    var minutes = Number(value);

    if (minutes === 0) {
      return { ok: false, message: "Duration must be at least 1 minute." };
    }

    if (minutes < MIN_CUSTOM || minutes > MAX_CUSTOM) {
      return { ok: false, message: "Choose a time between 1 and 120 minutes." };
    }

    return { ok: true, minutes: minutes };
  }

  function setCustomDuration() {
    if (isRunning) return;

    var result = validateCustomMinutes(customMinutesInput.value);

    if (!result.ok) {
      showCustomError(result.message);
      return;
    }

    clearCustomError();
    MODES.custom.seconds = result.minutes * 60;
    remaining = MODES.custom.seconds;
    updateDisplay();
    setStatus("Custom timer set to " + result.minutes + " min — ready to start");
    updateButtons();
  }

  function switchMode(mode) {
    if (!MODES[mode] || mode === currentMode) return;

    stopTimer();
    currentMode = mode;
    remaining = MODES[mode].seconds;
    updateDisplay();
    setStatus(MODES[mode].ready);
    updateButtons();

    modeButtons.forEach(function (btn) {
      var active = btn.getAttribute("data-mode") === mode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    if (mode === "custom") {
      customMinutesInput.value = String(Math.floor(MODES.custom.seconds / 60));
      clearCustomError();
    }
  }

  modeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchMode(btn.getAttribute("data-mode"));
    });
  });

  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);
  setCustomBtn.addEventListener("click", setCustomDuration);

  customMinutesInput.addEventListener("input", function () {
    if (customError.hidden === false) {
      clearCustomError();
    }
  });

  customMinutesInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      setCustomDuration();
    }
  });

  focusInput.addEventListener("input", function () {
    if (isRunning && (currentMode === "focus" || currentMode === "custom")) {
      setStatus(getRunningStatus());
    }
  });

  updateDisplay();
  setStatus(MODES.focus.ready);
  updateButtons();
})();
