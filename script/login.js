const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

const defaultUsername = "admin";
const defaultPassword = "admin123";

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === defaultUsername && password === defaultPassword) {
    window.location.href = "index.html";
  } else {
    errorMsg.classList.remove("hidden");
  }
});
