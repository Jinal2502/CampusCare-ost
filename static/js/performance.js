(function () {
  var section = document.getElementById("performance");
  if (!section) return;

  var departmentSelect = document.getElementById("perf-department");
  var attendanceSelect = document.getElementById("perf-min-attendance");
  var marksSelect = document.getElementById("perf-min-marks");
  var totalEl = document.getElementById("perf-total");
  var totalNoteEl = document.getElementById("perf-total-note");
  var attendanceEl = document.getElementById("perf-attendance");
  var marksEl = document.getElementById("perf-marks");
  var topEl = document.getElementById("perf-top");
  var topNoteEl = document.getElementById("perf-top-note");
  var countEl = document.getElementById("perf-count");
  var barsEl = document.getElementById("perf-bars");
  var scatterEl = document.getElementById("perf-scatter");
  var legendEl = document.getElementById("perf-legend");
  var tableBody = document.getElementById("perf-table-body");
  var emptyEl = document.getElementById("perf-empty");

  var departmentColors = {
    "Computer Science": "#2563EB",
    "Information Technology": "#06B6D4",
    Electronics: "#7C3AED",
    Mechanical: "#10B981",
  };

  var allRecords = [];
  var summary = null;

  function formatNumber(value, digits) {
    var number = Number(value);
    if (!isFinite(number)) return "—";
    return number.toFixed(digits);
  }

  function formatPlain(value) {
    var number = Number(value);
    if (!isFinite(number)) return "—";
    if (Math.abs(number - Math.round(number)) < 0.001) return String(Math.round(number));
    return number.toFixed(1);
  }

  function average(rows, key) {
    if (!rows.length) return 0;
    var total = 0;
    for (var i = 0; i < rows.length; i += 1) total += Number(rows[i][key]);
    return total / rows.length;
  }

  function colorFor(department) {
    return departmentColors[department] || "#2563EB";
  }

  function selectedRows() {
    var department = departmentSelect.value;
    var minAttendance = Number(attendanceSelect.value);
    var minMarks = Number(marksSelect.value);
    return allRecords
      .filter(function (row) {
        if (department && row.department !== department) return false;
        if (Number(row.attendance) < minAttendance) return false;
        if (Number(row.final_marks) < minMarks) return false;
        return true;
      })
      .sort(function (a, b) {
        if (b.final_marks !== a.final_marks) return b.final_marks - a.final_marks;
        return String(a.student_name).localeCompare(String(b.student_name));
      });
  }

  function renderMetrics(rows) {
    var unfiltered =
      !departmentSelect.value &&
      Number(attendanceSelect.value) === 0 &&
      Number(marksSelect.value) === 0;

    if (!rows.length) {
      totalEl.textContent = "0";
      attendanceEl.textContent = "—";
      marksEl.textContent = "—";
      topEl.textContent = "—";
      topNoteEl.textContent = "No matching student";
      totalNoteEl.textContent = "No rows match the filters";
      return;
    }

    var avgAttendance = unfiltered && summary ? summary.average_attendance : average(rows, "attendance");
    var avgMarks = unfiltered && summary ? summary.average_final_marks : average(rows, "final_marks");
    var top = rows[0];

    totalEl.textContent = String(rows.length);
    attendanceEl.textContent = formatNumber(avgAttendance, 1) + "%";
    marksEl.textContent = formatNumber(avgMarks, 1);
    topEl.textContent = top.student_name;
    topNoteEl.textContent = top.department + " · " + formatPlain(top.final_marks) + " marks";
    totalNoteEl.textContent = unfiltered ? "Cleaned records" : "Matching the filters";
  }

  function renderBars(rows) {
    barsEl.textContent = "";
    if (!rows.length) {
      barsEl.textContent = "No department averages to show.";
      return;
    }

    var groups = {};
    rows.forEach(function (row) {
      if (!groups[row.department]) groups[row.department] = [];
      groups[row.department].push(row);
    });

    Object.keys(groups)
      .sort(function (a, b) {
        return average(groups[b], "final_marks") - average(groups[a], "final_marks");
      })
      .forEach(function (department) {
        var avg = average(groups[department], "final_marks");
        var row = document.createElement("div");
        row.className = "perf-bar-row";

        var label = document.createElement("span");
        label.className = "perf-bar-label";
        label.textContent = department;

        var track = document.createElement("div");
        track.className = "perf-bar-track";
        var fill = document.createElement("span");
        fill.className = "perf-bar-fill";
        fill.style.width = Math.max(0, Math.min(avg, 100)) + "%";
        fill.style.background = colorFor(department);
        track.appendChild(fill);

        var value = document.createElement("span");
        value.className = "perf-bar-value";
        value.textContent = formatNumber(avg, 1);

        row.appendChild(label);
        row.appendChild(track);
        row.appendChild(value);
        barsEl.appendChild(row);
      });
  }

  function svgEl(name, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.keys(attrs).forEach(function (key) {
      el.setAttribute(key, attrs[key]);
    });
    return el;
  }

  function renderScatter(rows) {
    Array.prototype.forEach.call(scatterEl.querySelectorAll("line, text, circle"), function (node) {
      node.remove();
    });

    var xMin = 50;
    var xMax = 100;
    var yMin = 50;
    var yMax = 100;
    var left = 46;
    var right = 338;
    var top = 16;
    var bottom = 188;

    function xPos(attendance) {
      return left + ((Number(attendance) - xMin) / (xMax - xMin)) * (right - left);
    }

    function yPos(marks) {
      return bottom - ((Number(marks) - yMin) / (yMax - yMin)) * (bottom - top);
    }

    scatterEl.appendChild(
      svgEl("line", { class: "perf-axis", x1: left, y1: bottom, x2: right, y2: bottom })
    );
    scatterEl.appendChild(
      svgEl("line", { class: "perf-axis", x1: left, y1: top, x2: left, y2: bottom })
    );

    [50, 75, 100].forEach(function (tick) {
      var xLabel = svgEl("text", { class: "perf-tick", x: xPos(tick), y: 208, "text-anchor": "middle" });
      xLabel.textContent = String(tick);
      scatterEl.appendChild(xLabel);

      var yLabel = svgEl("text", { class: "perf-tick", x: 8, y: yPos(tick) + 4 });
      yLabel.textContent = String(tick);
      scatterEl.appendChild(yLabel);
    });

    rows.forEach(function (row) {
      scatterEl.appendChild(
        svgEl("circle", {
          class: "perf-dot",
          cx: xPos(row.attendance).toFixed(1),
          cy: yPos(row.final_marks).toFixed(1),
          r: 5,
          fill: colorFor(row.department),
        })
      );
    });

    var desc = document.getElementById("perf-scatter-desc");
    if (desc) {
      desc.textContent = rows.length
        ? rows.length + " students plotted by attendance and final marks."
        : "No students match the current filters.";
    }
  }

  function renderLegend(rows) {
    legendEl.textContent = "";
    var seen = {};
    rows.forEach(function (row) {
      seen[row.department] = true;
    });
    Object.keys(seen)
      .sort()
      .forEach(function (department) {
        var item = document.createElement("span");
        item.className = "perf-legend-item";
        var swatch = document.createElement("span");
        swatch.className = "perf-swatch";
        swatch.style.background = colorFor(department);
        item.appendChild(swatch);
        item.appendChild(document.createTextNode(department));
        legendEl.appendChild(item);
      });
  }

  function renderTable(rows) {
    tableBody.textContent = "";
    emptyEl.hidden = rows.length > 0;
    rows.forEach(function (row) {
      var tr = document.createElement("tr");
      [
        row.student_name,
        row.department,
        formatPlain(row.attendance) + "%",
        formatPlain(row.study_hours),
        formatPlain(row.assignments_completed),
        formatPlain(row.internal_marks),
        formatPlain(row.final_marks),
      ].forEach(function (value) {
        var td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  }

  function render() {
    var rows = selectedRows();
    countEl.textContent = rows.length
      ? "Showing " + rows.length + " of " + allRecords.length + " students"
      : "Showing 0 of " + allRecords.length + " students";
    renderMetrics(rows);
    renderBars(rows);
    renderScatter(rows);
    renderLegend(rows);
    renderTable(rows);
  }

  function fillDepartments() {
    var names = {};
    allRecords.forEach(function (row) {
      names[row.department] = true;
    });
    Object.keys(names)
      .sort()
      .forEach(function (name) {
        var option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        departmentSelect.appendChild(option);
      });
  }

  departmentSelect.addEventListener("change", render);
  attendanceSelect.addEventListener("change", render);
  marksSelect.addEventListener("change", render);

  fetch(section.getAttribute("data-performance-url"))
    .then(function (response) {
      if (!response.ok) throw new Error("Could not load performance data");
      return response.json();
    })
    .then(function (data) {
      allRecords = data.records || [];
      summary = data.summary || null;
      fillDepartments();
      render();
    })
    .catch(function () {
      countEl.textContent = "Student performance data could not be loaded.";
    });
})();
