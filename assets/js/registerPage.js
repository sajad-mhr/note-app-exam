let fullname = document.getElementById("fullname");
let email = document.getElementById("email");
let password = document.getElementById("password");
let confirm_password = document.getElementById("confirm-password");
let register_btn = document.getElementById("register-btn");
let fullname_error = document.getElementById("fullname-error");
let email_error = document.getElementById("email-error");
let password_error = document.getElementById("password-error");
let confirm_password_error = document.getElementById("confirm-password-error");
let toast = document.querySelector(".toast-s");
let toastMsg = document.querySelector(".toast-s > span");
let toastBtn = document.querySelector(".toast-s > button");

let show_password = document.getElementById("show-password");
let show_confirm_password = document.getElementById("show-confirm-password");

var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

function validationForm() {
  if (!fullname.value) {
    fullname_error.style.display = "block";
    fullname_error.innerHTML = "fullname is required.";
  } else {
    fullname_error.style.display = "none";
  }
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
  if (!confirm_password.value) {
    confirm_password_error.style.display = "block";
    confirm_password_error.innerHTML = "Confirm Password is required.";
  } else {
    confirm_password_error.style.display = "none";
  }
  if (password.value !== confirm_password.value) {
    confirm_password_error.style.display = "block";
    confirm_password_error.innerHTML =
      "Password and Confirm Password Not Match";
  }
  if (email.value && !email.value.match(mailformat)) {
    email_error.style.display = "block";
    email_error.innerHTML = "The Email is not valid";
  }

  if (
    fullname.value &&
    email.value &&
    password.value &&
    confirm_password.value &&
    password.value === confirm_password.value &&
    email.value.match(mailformat)
  ) {
    register_btn.setAttribute("disabled", true);
    fullname_error.style.display = "none";
    email_error.style.display = "none";
    password_error.style.display = "none";
    confirm_password_error.style.display = "none";

    let userObj = {
      fullname: fullname.value,
      email: email.value,
      password: password.value,
    };
    const URL = "http://127.0.0.1:8080/registerApi";
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
              window.location.href = "/login";
            }, 1000);
          });
          break;

        case 403:
          res.text().then((data) => {
            console.log(data);
            email_error.style.display = "block";
            email_error.innerHTML = data;
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
show_confirm_password.addEventListener("click", () => {
  showPassword(confirm_password,show_confirm_password);
});

toastBtn.addEventListener("click", closeToast);

register_btn.addEventListener("click", validationForm);
window.addEventListener("DOMContentLoaded", () => {
  let token = document.cookie;
  if (token.split("=")[1]) {
    window.location.href = "/notes";
  }
});
