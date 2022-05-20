function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, false);
  xmlHttp.send(null);
  return xmlHttp.responseText;
}

// adding classes to class select options
function setClassOptions(classes, crntCls) {
  if (crntCls == null || crntCls == "") {
    crntCls = classes[0];
  }
  classes.forEach((cls) => {
    let selected;
    if (crntCls == cls) {
      selected = `selected`;
    } else {
      selected = ``;
    }

    $("#classSelect").append(
      `
      <option value="${cls}"` +
        selected +
        `>${cls}</option>
      `
    );

    // class select for modal
    $("#classSelector").append(
      `
        <option value="${cls}"` +
        selected +
        `>${cls}</option>
      `
    );
  });
  setSubjects(crntCls);
  return crntCls;
}

function getParams() {
  let url = window.location.href;
  url = new URL(url);
  return url.searchParams.get("class");
}

// opens the options dropdown
function openOptions(subject) {
  $(`#myDropdown-${subject}`).addClass("show");
}

// closing the options dropdown
$(document).mouseup(function (e) {
  if ($(e.target).closest(".dropdown-content").length === 0) {
    $(".dropdown-content").removeClass("show");
  }
});


function goToChaptersPage(subject, cls) {
  window.location.href = `chapters.html?class=${cls}&subject=${subject}`;
}

// ------------------------ setting the subjects card ------------------------ //
function setSubjects(cls) {
  let urls = ` https://edu-spot.herokuapp.com/subject?class=${cls}`;
  let subjects = JSON.parse(httpGet(urls));

  $(".card").remove();

  // INFO : this is temporary images will update later
  subjects.forEach((subject) => {
    let imgLink = "";
    switch (subject.subject) {
      case "Maths":
        imgLink = "./images/maths.png";
        break;

      case "Science":
        imgLink = "./images/science.jpg";
        break;

      case "English":
        imgLink = "./images/english.jpg";
        break;

      case "Social Science":
        imgLink = "./images/social-science.png";
        break;

      default:
        imgLink = "./images/science.jpg";
        break;
    }
    
    $("#body-wrapper").append(`
        <div class="card">
            <div class="card-image">
                <img src="${imgLink}" alt="${
      subject.subject
    }" height="100%" width="100%">
            </div>
            <div class="card-desc">
                <h4>${subject.subject}</h4>
                <p>${subject.chapters} ${
      subject.chapters.length > 1 ? "chapters" : "chapter"
    }</p>
                <button ${
                  subject.chapters == 0 ? "disabled" : ""
                }  onclick="goToChaptersPage('${
      subject.subject
    }', '${subject.class}')")">Explore</button>
            </div>
            <div class="cardOption" onclick="openOptions('${subject.subject.replaceAll(
              " ",
              ""
            )}')"><i class="fa fa-ellipsis-v"></i></div>
            <div id="myDropdown-${subject.subject.replaceAll(
              " ",
              ""
            )}" class="dropdown-content">
                <ul>
                  <li class="update-sub" onclick="openEditSubjectModal('${subject.subject}','${subject.class}')"><i class="fa fa-pencil"></i>Edit</li>
                  <li class="del-sub" onclick="deleteSubject('${subject.class}','${subject.subject}')"><i class="fa fa-trash-o"></i>Delete</li>
                </ul>
            </div>
        </div>
        `);
  });
}


// ------------------------ modal handling starts ------------------------ //
var modal = document.getElementById("addSubjectModal");
var span = document.getElementsByClassName("close")[0];
var subjectInput = document.getElementById("modal-input");
var classSelector = document.getElementById("classSelector");

var editSubjectModal = document.getElementById("editSubjectModal");
var editSpan = document.getElementsByClassName("close")[1];
var cancelEdit = document.getElementsByClassName('cancel')[0];
var subjectEditInput = document.getElementById("subject-edit-input");
var editModalClass = document.getElementById("#editModalClass");
let subjectToBeEdited;

// add subject modal functions
function openModal() {
  modal.style.display = "flex";
}
span.onclick = function () {
  modal.style.display = "none";
};


// edit modal functions
function openEditSubjectModal(subject, cls){  
  subjectToBeEdited = subject;
  editSubjectModal.style.display = "flex";
  subjectEditInput.value = subject;
  $('#editModalClassLabel').empty().append(`Class ${cls}`);
  $('#subject-edit-input').focus();
}

function cancelEditFunc(){
  editSubjectModal.style.display = 'none';
}
editSpan.onclick = () => cancelEditFunc();
cancelEdit.onclick = () => cancelEditFunc();

// for closing the modal
window.onclick = function (event) {
  if (event.target == modal || event.target == editSubjectModal) {
    modal.style.display = "none";
    editSubjectModal.style.display = "none";
  }
};
// ------------------------ modal handling ends ------------------------ //


// ------------------------ add subject function ------------------------ //
function addNewSubject() {
  let subject = subjectInput.value.trim();
  let cls = classSelector.value.trim();
  if (!subject || subject == "") {
    toastr["warning"]("Subject name should not be empty!");
    return;
  }
  let subjectData = {
    subject: subject,
    class: cls,
    chapters: [],
  };
  addSubject(subjectData);
  modal.style.display = "none";
  subjectInput.value = "";
}

// ------------------------ post request to save subject ------------------------ //
function addSubject(data) {
  let url = " https://edu-spot.herokuapp.com/addSubject";
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
  xhr.onload = function () {
    if (xhr.status != 200) {
      console.log(`Error ${xhr.status} : ${xhr.statusText}`);
    } else {
      setSubjects(data.class);
      $("#classSelect").val(data.class).change();
      window.history.replaceState(null, null, `?class=${data.class}`);
      if (xhr.response == "subject exists") {
        toastr["info"]("Subject already exists!");
      } else if (xhr.response == "subject added") {
        toastr["success"]("Subject added!");
      }
    }
  };
}

// ------------------------ update subject funtion  ------------------------ //
function editSubject(sub, cls){
  let newSub = subjectEditInput.value; 
  if(!newSub || newSub == ""){
    toastr['warning']('Subject Name should not be empty!');
    return;
  }
  let updateData = { 
    oldSubName: sub,
    newSubName: newSub,
    class: cls
  }
  editSubjectModal.style.display = "none";
  updateSubject(updateData);
}

// ------------------------ patch request to update subject ------------------------ //
function updateSubject(updateData){
  let url = " https://edu-spot.herokuapp.com/updateSubject";
  var xhr = new XMLHttpRequest();
  xhr.open("PATCH", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(updateData));
  xhr.onload = function () {
    if (xhr.status != 200) {
      console.log(`Error ${xhr.status} : ${xhr.statusText}`);
    } else {
      setSubjects(updateData.class);
      if (xhr.response == "subject updated") {
        toastr["success"]("Subject updated");
      } 
    }
  };
}

// ------------------------ delete subject function ------------------------ //
function deleteSubject(cls, subject){
  Swal.fire({
    title: "Are you sure?",
    text: "All data of this subject will deleted. You won't be able to revert this!",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      deleteSubjectFromDb(cls, subject);
    }
  });
}
// ------------------------ request to delete subject ------------------------ //
function deleteSubjectFromDb(cls, subject){
  let theUrl = ` https://edu-spot.herokuapp.com/deleteSubject?class=${cls}&subject=${subject}`;
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("DELETE", theUrl, false);
  xmlHttp.send(null);
  if (xmlHttp.responseText == "subject deleted") {
    setSubjects(cls);
    toastr["success"]("Subject Deleted");
  } else {
    toastr['error']("Something went wrong please try again!");
  }
}

onload = () => {
  let userName = JSON.parse(localStorage.getItem('UserInfo')).user.userName;
  $('#userName').text(userName);
  let cls = getParams();
  let classes = getClasses();  // getting classes from the getclasses utils 
  let crntClass = setClassOptions(classes, cls);
  $(document).on("change", "#classSelect", function () {
    let selectedClass = $(this).val();
    $("#classSelector").val(selectedClass).change();
    window.history.replaceState(null, null, `?class=${selectedClass}`);
    setSubjects(selectedClass);
    crntClass = selectedClass;
  });
  
  $("#editSubBtn").click(() => {
    editSubject(subjectToBeEdited, crntClass);
  })
};
