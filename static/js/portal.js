(function () {
  // Same-origin routes on Django (and Flask) that write to database/students.db
  var API = "";

  var tableBody = document.getElementById("student-rows");
  var emptyState = document.getElementById("student-empty");
  var totalEl = document.getElementById("stat-total");
  var marksEl = document.getElementById("stat-marks");
  var attendanceEl = document.getElementById("stat-attendance");
  var formDialog = document.getElementById("student-dialog");
  var form = document.getElementById("student-form");
  var formTitle = document.getElementById("student-dialog-title");
  var formError = document.getElementById("student-form-error");
  var deleteDialog = document.getElementById("delete-dialog");
  var deleteText = document.getElementById("delete-text");
  var deleteConfirm = document.getElementById("delete-confirm");
  var toast = document.getElementById("portal-toast");
  var who = document.getElementById("portal-user");

  var students = [];
  var editingId = null;
  var pendingDelete = null;
  var toastTimer = null;

  function showToast(message, isError) {
    toast.textContent = message;
    toast.classList.toggle("is-error", Boolean(isError));
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.hidden = true;
    }, 3500);
  }

  function average(list, key) {
    if (!list.length) return "—";
    var sum = list.reduce(function (total, student) {
      return total + Number(student[key]);
    }, 0);
    return (sum / list.length).toFixed(1);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    totalEl.textContent = String(students.length);
    marksEl.textContent = average(students, "marks");
    attendanceEl.textContent = students.length ? average(students, "attendance") + "%" : "—";
    emptyState.hidden = students.length !== 0;
    tableBody.innerHTML = students
      .map(function (student) {
        return (
          "<tr>" +
          "<td>" + student.id + "</td>" +
          "<td>" + escapeHtml(student.name) + "</td>" +
          "<td>" + escapeHtml(student.email) + "</td>" +
          "<td>" + escapeHtml(student.department) + "</td>" +
          "<td>" + student.semester + "</td>" +
          "<td>" + student.attendance + "%</td>" +
          "<td>" + student.marks + "</td>" +
          '<td><div class="portal-actions">' +
          '<button type="button" class="button button--secondary button--small" data-edit="' +
          student.id +
          '">Edit</button>' +
          '<button type="button" class="button button--danger button--small" data-delete="' +
          student.id +
          '">Delete</button>' +
          "</div></td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function loadStudents() {
    return fetch(API + "/students")
      .then(function (response) {
        if (!response.ok) throw new Error("Could not load students.");
        return response.json();
      })
      .then(function (data) {
        students = data.students || [];
        render();
      })
      .catch(function () {
        students = [];
        render();
        emptyState.hidden = false;
        emptyState.textContent =
          "Could not load student records. Restart Django with python manage.py runserver.";
      });
  }

  function openForm(student) {
    editingId = student ? student.id : null;
    formTitle.textContent = student ? "Edit student" : "Add student";
    formError.hidden = true;
    form.elements.name.value = student ? student.name : "";
    form.elements.email.value = student ? student.email : "";
    form.elements.department.value = student ? student.department : "";
    form.elements.semester.value = student ? student.semester : "";
    form.elements.attendance.value = student ? student.attendance : "";
    form.elements.marks.value = student ? student.marks : "";
    formDialog.showModal();
    form.elements.name.focus();
  }

  function payloadFromForm() {
    return {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      department: form.elements.department.value.trim(),
      semester: form.elements.semester.value,
      attendance: form.elements.attendance.value,
      marks: form.elements.marks.value,
    };
  }

  document.getElementById("add-student").addEventListener("click", function () {
    openForm(null);
  });

  tableBody.addEventListener("click", function (event) {
    var editButton = event.target.closest("[data-edit]");
    var deleteButton = event.target.closest("[data-delete]");
    if (editButton) {
      var student = students.find(function (row) {
        return String(row.id) === editButton.getAttribute("data-edit");
      });
      if (student) openForm(student);
    }
    if (deleteButton) {
      pendingDelete = students.find(function (row) {
        return String(row.id) === deleteButton.getAttribute("data-delete");
      });
      if (!pendingDelete) return;
      deleteText.textContent =
        "Delete " + pendingDelete.name + "? This removes the row from SQLite.";
      deleteDialog.showModal();
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var isEdit = editingId !== null;
    var url = isEdit ? API + "/students/" + editingId : API + "/students";
    fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadFromForm()),
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return { ok: response.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          formError.textContent = (result.data && result.data.error) || "Could not save the student.";
          formError.hidden = false;
          return;
        }
        formDialog.close();
        showToast(result.data.message || "Saved.");
        return loadStudents();
      })
      .catch(function () {
        formError.textContent = "Could not save. Check that Django is still running.";
        formError.hidden = false;
      });
  });

  deleteConfirm.addEventListener("click", function () {
    if (!pendingDelete) return;
    var id = pendingDelete.id;
    fetch(API + "/students/" + id, { method: "DELETE" })
      .then(function (response) {
        return response.json().then(function (data) {
          return { ok: response.ok, data: data };
        });
      })
      .then(function (result) {
        deleteDialog.close();
        pendingDelete = null;
        if (!result.ok) {
          showToast((result.data && result.data.error) || "Could not delete the student.", true);
          return;
        }
        showToast(result.data.message || "Student deleted.");
        return loadStudents();
      })
      .catch(function () {
        deleteDialog.close();
        showToast("Could not delete. Check that Django is still running.", true);
      });
  });

  try {
    var saved = JSON.parse(sessionStorage.getItem("campuscareDemoUser") || "null");
    if (saved && saved.name) {
      who.textContent = "Signed in as " + saved.name;
    }
  } catch (error) {
    who.textContent = "Student records";
  }

  loadStudents();
})();
