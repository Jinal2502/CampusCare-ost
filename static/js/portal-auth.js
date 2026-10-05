(function () {
  var dialog = document.getElementById("auth-dialog");
  var form = document.getElementById("auth-form");
  var title = document.getElementById("auth-title");
  var submit = document.getElementById("auth-submit");
  if (!dialog || !form) return;

  var mode = "login";

  function openAuth(nextMode) {
    mode = nextMode || "login";
    var isSignup = mode === "signup";
    title.textContent = isSignup ? "Create a demo account" : "Sign in to Student Portal";
    submit.textContent = isSignup ? "Sign up and continue" : "Log in and continue";
    document.querySelectorAll(".auth-tab").forEach(function (tab) {
      tab.classList.toggle("is-active", tab.getAttribute("data-mode") === mode);
    });
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  }

  document.querySelectorAll("[data-open-auth]").forEach(function (button) {
    button.addEventListener("click", function () {
      openAuth("login");
    });
  });

  document.querySelectorAll(".auth-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      openAuth(tab.getAttribute("data-mode"));
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var password = form.elements.password.value;
    if (!name || !email || !password) return;

    sessionStorage.setItem(
      "campuscareDemoUser",
      JSON.stringify({ name: name, email: email })
    );
    window.location.href = form.getAttribute("data-portal-url") || "/student-portal/";
  });
})();
