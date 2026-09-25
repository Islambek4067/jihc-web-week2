const fullName = document.getElementById("name");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const password = document.getElementById("password");
const emailLogin = document.getElementById("emailLogin");
const passwordLogin = document.getElementById("passwordLogin");

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const error = document.querySelector(".error");
const errorLogin = document.querySelector(".errorLogin");
const sheetBody = document.getElementById("sheetBody");





showUsers();


registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!registerForm.checkValidity()) {
    registerForm.reportValidity();
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: fullName.value,
        email: email.value,
        phone: phone.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      error.style.color = "green";
      error.innerHTML = "You successfully registered!";
      registerForm.reset();

      
      await showUsers();
    } else {
      error.style.color = "red";
      error.innerHTML = data.message || data.error;
    }
  } catch (err) {
    error.style.color = "red";
    error.innerHTML = "Server connection error";
  }
});


loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailLogin.value,
        password: passwordLogin.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      errorLogin.style.color = "green";
      errorLogin.innerHTML = "You're successfully logged in";
      loginForm.reset();
    } else {
      errorLogin.style.color = "red";
      errorLogin.innerHTML = data.message || data.error;
    }
  } catch (err) {
    errorLogin.style.color = "red";
    errorLogin.innerHTML = "Server connection error";
  }
});

async function showUsers() {
  try {
    const response = await fetch("http://localhost:5000/users");
    const users = await response.json();

    sheetBody.innerHTML = "";

    users.forEach((element) => {
      sheetBody.innerHTML += `
        <tr>
          <td>${element.id}</td>
          <td>${element.username}</td>
          <td>${element.email}</td>
          <td>${element.phone || "-"}</td>
          <td style="display:flex; flex-direction:column; gap:10px">
            <button onclick="editUser(${element.id}, '${element.username}')" style="background-color: black; color: white; border: none; padding: 5px 10px; cursor: pointer;">Edit</button>
            <button onclick="deleteUser(${element.id})" style="background-color: black; color: white; border: none; padding: 5px 10px; cursor: pointer;">Delete</button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error("Ошибка при получении пользователей:", err);
  }
}


async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    const response = await fetch("http://localhost:5000/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id })
    });

    if (response.ok) {
      await showUsers(); 
    } else {
      const data = await response.json();
      alert("Error: " + data.message);
    }
  } catch (err) {
    console.error("Delete error:", err);
  }
}


async function editUser(id, currentUsername) {
  const newUsername = prompt("Enter new username:", currentUsername);
  
  if (!newUsername || newUsername === currentUsername) return;

  try {
    const response = await fetch("http://localhost:5000/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id, username: newUsername })
    });

    if (response.ok) {
      await showUsers(); 
    } else {
      const data = await response.json();
      alert("Error: " + data.message);
    }
  } catch (err) {
    console.error("Update error:", err);
  }
}