let email = document.getElementById("email");
let password = document.getElementById("password");
let register_btn = document.getElementById("register-btn");
let email_error = document.getElementById("email-error");
let password_error = document.getElementById("password-error");
let toast = document.querySelector(".toast-s");
let toastMsg = document.querySelector(".toast-s > span");
let toastBtn = document.querySelector(".toast-s > button");
let show_password = document.getElementById("show-password");
function validationForm() {
  if (!email.value) {
    email_error.style.display = "block";
    email_error.innerHTML = "Email is required.";
  } else {
    email_error.style.display = "none";
  }
  if (!password.value) {
    password_error.style.display = "block";
    password_error.innerHTML = "Password is required.";
  } else {
    password_error.style.display = "none";
  }
  if (email.value && password.value) {
    register_btn.setAttribute("disabled", true);
    email_error.style.display = "none";
    password_error.style.display = "none";

    let userObj = {
      email: email.value,
      password: password.value,
    };
    const URL = "http://127.0.0.1:8080/loginApi";
    fetch(URL, {
      method: "POST",
      body: JSON.stringify(userObj),
    }).then((res) => {
      switch (res.status) {
        case 200:
          res.text().then((data) => {
            console.log(data);
            openToast(data, "green");
            register_btn.removeAttribute("disabled");
            setTimeout(() => {
              window.location.href = "/notes";
            }, 1000);
          });
          break;

        case 401:
          res.text().then((data) => {
            console.log(data);
            openToast(data, "red");
            register_btn.removeAttribute("disabled");
          });
          break;
        default:
          res.text().then((data) => {
            console.log(data);
            openToast(data, "yellow");
            register_btn.removeAttribute("disabled");
          });
          break;
      }
    });
  }
}
function closeToast() {
  toast.classList.remove("show");
  toast.classList.add("hide");
}
function openToast(msg, color) {
  toast.classList.remove("hide");
  toast.classList.add("show");
  toast.style.backgroundColor = color;
  toastMsg.innerHTML = msg;
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
  }, 3000);
}



function showPassword(eleminp,elemicon) {
  let inputType = eleminp.getAttribute("type");
  let icon = elemicon.className.split(" ")[1];
  if (inputType === "password" && icon === "bi-eye-slash") {
    eleminp.setAttribute("type","text");
    elemicon.classList.replace("bi-eye-slash","bi-eye")
  }else{
    eleminp.setAttribute("type","password");
    elemicon.classList.replace("bi-eye","bi-eye-slash")
  }
}

show_password.addEventListener("click", () => {
  showPassword(password,show_password);
});

toastBtn.addEventListener("click", closeToast);

register_btn.addEventListener("click", validationForm);

window.addEventListener("DOMContentLoaded", () => {
  let token = document.cookie;
  if (token.split("=")[1]) {
    window.location.href = "/notes";
  }
});
