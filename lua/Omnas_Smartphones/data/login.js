document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  let res = await fetch("http://localhost:8080/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  let data = await res.json();

  if (data.success) {
    localStorage.setItem("adminToken", data.token);
    window.location.href = "admin-panel.html";
  } else {
    alert("Invalid username or password");
  }
});
