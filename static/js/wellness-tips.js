/**
 * CampusCare — Practical 7
 * jQuery DOM updates for the Today's routine board.
 */
$(document).ready(function () {
  var STORAGE_KEY = "campuscare.routine.v1";
  var $board = $("#tips-board");
  var $list = $("#tips-list");
  var $status = $("#tips-status");
  var $focus = $("#todays-focus");
  var $input = $("#tip-input");
  var $type = $("#tip-type");
  var $greeting = $("#tips-greeting");
  var $suggestTitle = $("#tips-suggestion-title");
  var $suggestBody = $("#tips-suggestion-body");
  var $action = $("#tips-action-link");
  var $progress = $("#tips-progress");
  var $fill = $("#tips-progress-fill");
  var hideDone = false;
  var filter = "all";
  var suggestionIndex = 0;
  var pomodoroUrl = $action.attr("href") || "/pomodoro/";
  var checkinUrl = $board.attr("data-checkin-url") || "/checkin/";

  var suggestions = [
    {
      type: "focus",
      title: "Start with one focused session",
      body: "Open the timer, set a single intention, and stop when the session ends.",
      href: pomodoroUrl,
      cta: "Open timer",
    },
    {
      type: "wellness",
      title: "Reset before the next lecture",
      body: "Stand up, drink water, and give your eyes a short break from the screen.",
      href: checkinUrl,
      cta: "Log a check-in",
    },
    {
      type: "focus",
      title: "Protect this block from your phone",
      body: "Silence notifications for 25 minutes. One task is enough.",
      href: pomodoroUrl,
      cta: "Open timer",
    },
    {
      type: "wellness",
      title: "Notice how you actually feel",
      body: "A 20-second check-in beats guessing why the day feels heavy.",
      href: checkinUrl,
      cta: "Log a check-in",
    },
  ];

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { done: [], custom: [], focus: "" };
    } catch (err) {
      return { done: [], custom: [], focus: "" };
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function hourGreeting() {
    var hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  function visibleItems() {
    return $list.children(".tip-item").filter(function () {
      var $item = $(this);
      if (filter !== "all" && $item.attr("data-type") !== filter) return false;
      if (hideDone && $item.hasClass("is-done")) return false;
      return true;
    });
  }

  function applyFilter() {
    $list.children(".tip-item").each(function () {
      var $item = $(this);
      var matchType = filter === "all" || $item.attr("data-type") === filter;
      var matchDone = !(hideDone && $item.hasClass("is-done"));
      if (matchType && matchDone) {
        $item.show();
      } else {
        $item.hide();
      }
    });
  }

  function updateProgress() {
    var $items = $list.children(".tip-item");
    var total = $items.length;
    var done = $items.filter(".is-done").length;
    var percent = total ? Math.round((done / total) * 100) : 0;
    $progress.text(done + " of " + total + " done");
    $fill.css("width", percent + "%");
    if (done === total && total > 0) {
      $board.addClass("tips-layout--complete");
      $status.text("Nice — today's list is complete.");
    } else {
      $board.removeClass("tips-layout--complete");
    }
  }

  function renderSuggestion() {
    var item = suggestions[suggestionIndex % suggestions.length];
    $suggestTitle.text(item.title);
    $suggestBody.text(item.body);
    $action.text(item.cta).attr("href", item.href);
  }

  function setFocus(text) {
    if (!text) {
      $focus.text("Today's focus is not set yet.");
      return;
    }
    $focus.html("Today's focus: <strong></strong>");
    $focus.find("strong").text(text);
  }

  function makeTipItem(tip) {
    var pillClass =
      tip.type === "wellness" ? "meta-pill meta-pill--success" : "meta-pill meta-pill--primary";
    var pillText = tip.type === "wellness" ? "Wellness" : "Focus";
    var $item = $("<li></li>")
      .addClass("tip-item")
      .attr("data-id", tip.id)
      .attr("data-type", tip.type);

    var $main = $("<div></div>").addClass("tip-item-main");
    $main.append($("<span></span>").addClass(pillClass).text(pillText));
    $main.append($("<span></span>").addClass("tip-item-title").text(tip.title));

    var $actions = $("<div></div>").addClass("tip-item-actions");
    $actions.append($("<button></button>").attr("type", "button").addClass("tip-done").text("Done"));
    $actions.append(
      $("<button></button>").attr("type", "button").addClass("tip-remove").text("Remove")
    );

    $item.append($main).append($actions);
    return $item;
  }

  var state = loadState();
  $("#year").text(new Date().getFullYear());
  $greeting.text(hourGreeting());
  setFocus(state.focus);
  renderSuggestion();

  $.each(state.custom, function (_, tip) {
    $list.append(makeTipItem(tip));
  });

  $.each(state.done, function (_, id) {
    $list.children('.tip-item[data-id="' + id + '"]').addClass("is-done").find(".tip-done").text("Undo");
  });

  applyFilter();
  updateProgress();
  $status.text("Choose a reminder, or start with the suggestion on the left.");

  $("#btn-next-tip").on("click", function () {
    suggestionIndex += 1;
    renderSuggestion();
    $status.text("New suggestion ready.");
  });

  $("#btn-pin-tip").on("click", function () {
    var text = $suggestTitle.text();
    setFocus(text);
    state = loadState();
    state.focus = text;
    saveState(state);
    $status.text("Pinned as today's focus.");
  });

  $("#btn-calm").on("click", function () {
    $board.toggleClass("tips-layout--calm");
    var on = $board.hasClass("tips-layout--calm");
    $(this).toggleClass("is-active", on);
    $status.text(on ? "Calm mode is on." : "Calm mode is off.");
  });

  $("#btn-hide-done").on("click", function () {
    hideDone = !hideDone;
    $(this).toggleClass("is-active", hideDone).text(hideDone ? "Show completed" : "Hide completed");
    applyFilter();
  });

  $(".tips-chip[data-filter]").on("click", function () {
    filter = $(this).attr("data-filter");
    $(".tips-chip[data-filter]").removeClass("is-active");
    $(this).addClass("is-active");
    applyFilter();
    var shown = visibleItems().length;
    $status.text(shown ? "Showing " + shown + " reminder" + (shown === 1 ? "." : "s.") : "Nothing in this filter.");
  });

  $list.on("click", ".tip-item", function (event) {
    if ($(event.target).closest("button").length) return;
    var title = $(this).find(".tip-item-title").text();
    $(".tip-item").removeClass("is-active");
    $(this).addClass("is-active");
    setFocus(title);
    state = loadState();
    state.focus = title;
    saveState(state);
    var href = $(this).attr("data-href");
    if (href) $action.attr("href", href);
    $status.text("Selected: " + title);
  });

  $list.on("click", ".tip-done", function (event) {
    event.stopPropagation();
    var $item = $(this).closest(".tip-item");
    $item.toggleClass("is-done");
    var done = $item.hasClass("is-done");
    $(this).text(done ? "Undo" : "Done");
    state = loadState();
    var id = $item.attr("data-id");
    state.done = state.done.filter(function (value) {
      return value !== id;
    });
    if (done) state.done.push(id);
    saveState(state);
    applyFilter();
    updateProgress();
    $status.text(done ? "Marked as done." : "Moved back to the list.");
  });

  $("#btn-add-tip").on("click", function () {
    var text = $.trim($input.val());
    if (!text) {
      $status.text("Type a reminder before adding it.");
      $input.focus();
      return;
    }
    var tip = {
      id: "custom-" + Date.now(),
      type: $type.val() || "focus",
      title: text,
    };
    var $item = makeTipItem(tip);
    $list.append($item);
    $input.val("");
    state = loadState();
    state.custom.push(tip);
    saveState(state);
    applyFilter();
    updateProgress();
    $status.text("Reminder added for later today.");
  });

  $input.on("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      $("#btn-add-tip").trigger("click");
    }
  });

  $list.on("click", ".tip-remove", function (event) {
    event.stopPropagation();
    var $item = $(this).closest(".tip-item");
    var id = $item.attr("data-id");
    var title = $item.find(".tip-item-title").text();
    $item.remove();
    state = loadState();
    state.custom = state.custom.filter(function (tip) {
      return tip.id !== id;
    });
    state.done = state.done.filter(function (value) {
      return value !== id;
    });
    if (state.focus === title) {
      state.focus = "";
      setFocus("");
    }
    saveState(state);
    applyFilter();
    updateProgress();
    $status.text("Reminder removed.");
  });
});
