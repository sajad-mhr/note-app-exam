const token = document.cookie;
if (!token) window.location.href = "/login";
const logoutBtn = document.getElementById("logout");
const fullname_first_word = document.getElementById("fullname-first-word");
const show_fullname = document.getElementById("show-fullname");
const show_email = document.getElementById("show-email");
const title = document.getElementById("title");
const body = document.getElementById("body");
const addNoteBtn = document.getElementById("add-note-btn");
const notesContainer = document.getElementById("notes");
const emptyError = document.querySelector(".empty-error");
const truck_modal = document.querySelector("#staticBackdrop");
const header = document.querySelector("#header");

function delete_cookie(name) {
  if (document.cookie) {
    document.cookie = name + "=" + ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
  }
}

function hideFunc() {
  const modal = bootstrap.Modal.getInstance(truck_modal);
  modal.hide();
}

truck_modal.addEventListener("hide.bs.modal", () => {
  title.value = "";
  body.value = "";
  emptyError.innerHTML = "";
});

function parseJwt(token) {
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  let jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

function getNotes() {
  const URL = "http://127.0.0.1:8080/getNotesApi";
  fetch(URL)
    .then((res) => {
      switch (res.status) {
        case 200:
          res.json().then((data) => {
            if (data.reverse().length === 0) {
              let notNoteElem = `
              <div class="d-flex w-100 align-items-center justify-content-center">
                <span class="no-note">Write a note to yourself right now ♥</span>
              <div>
              `;
              notesContainer.innerHTML = notNoteElem;
            } else {
              notesContainer.innerHTML = "";
              let noteCard = "";
              data.forEach((note) => {
                noteCard = `
              <div class="col-12">
                <div class="notes-card">
               <div class="content">
                <span class="title">${note.title}</span>
                <div class="body-scroller">
                  <span class="body">${note.body.replace(
                    /\n/g,
                    "<br />"
                  )}</span>
                  </div>
                </div>
                <div class="delete">
                  <button class="fs-5 btn btn-danger me-3 p-2" onclick="deleteNote('${
                    note.noteId
                  }')">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
                </div>
              `;
                notesContainer.innerHTML += noteCard;
              });
            }
          });
          break;
        case 401:
          res.text().then((data) => {
            console.log(data);
            delete_cookie("userToken");
            window.location.href = "/login";
          });
          break;

        default:
          res.text().then((data) => {
            console.log(data);
          });
          break;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function addNote() {
  const URL = "http://127.0.0.1:8080/createNoteApi";
  if (title.value.trim() && body.value.trim()) {
    emptyError.style.display = "none";
    let noteObj = {
      title: title.value.trim(),
      body: body.value.trim(),
    };
    fetch(URL, {
      method: "POST",
      body: JSON.stringify(noteObj),
    }).then((res) => {
      switch (res.status) {
        case 200:
          res.text().then((data) => {
            console.log(data);
            getNotes();
            title.value = "";
            body.value = "";
            hideFunc();
          });
          break;

        case 403:
          res.text().then((data) => {
            console.log(data);
          });
          break;
        default:
          res.text().then((data) => {
            console.log(data);
          });
          break;
      }
    });
  } else {
    console.log("empty");
    emptyError.style.display = "block";
    emptyError.innerHTML = "Title and Body is required";
  }
}

function deleteNote(noteId) {
  const URL = `http://127.0.0.1:8080/deleteNoteApi/${noteId}`;
  fetch(URL, {
    method: "DELETE",
  }).then((res) => {
    switch (res.status) {
      case 200:
        res.text().then((data) => {
          console.log(data);
          getNotes();
        });
        break;

      case 403:
        res.text().then((data) => {
          console.log(data);
        });
        break;
      default:
        res.text().then((data) => {
          console.log(data);
        });
        break;
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  getNotes();
  show_fullname.innerHTML = parseJwt(token).user.fullname;
  show_email.innerHTML = parseJwt(token).user.email;
  let first_word = parseJwt(token).user.fullname.substring(0, 1);
  fullname_first_word.innerHTML = first_word.toUpperCase();
  if (window.scrollY > 0) {
    header.classList.add("fixed");
  } else {
    header.classList.remove("fixed");
  }
});

addNoteBtn.addEventListener("click", addNote);

logoutBtn.addEventListener("click", () => {
  delete_cookie("userToken");
  window.location.href = "/login";
});

window.addEventListener("scroll", (e) => {
  if (window.scrollY > 0) {
    header.classList.add("fixed");
  } else {
    header.classList.remove("fixed");
  }
});
