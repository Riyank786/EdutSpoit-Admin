
var modal = document.getElementById("addChapterModal");

// getting class and subject from the url params
function getParams() {
  let url = window.location.href;
  url = new URL(url);
  let params = {
    cls: url.searchParams.get("class"),
    subject: url.searchParams.get("subject")
  }
  return params;
}

// setting the class select options
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
  return crntCls;
}

// setting the subject select options
function setSubjectOptions(cls, subject){
  let subjects = getSubjects(cls);
  if(subject == null || subject == ""){
    subject = subjects[0];
  }
  $("#subjectSelect").find('option').remove().end();
  $("#subjectSelector").find('option').remove().end();
  subjects.forEach(sub => {
    let selected;
    if (subject == sub) {
      selected = `selected`;
    } else {
      selected = ``;
    }
    $("#subjectSelect").append(
      `
      <option value="${sub}"` +
        selected +
        `>${sub}</option>
      `
    );
    $('#subjectSelector').append(
      `
      <option value="${sub}"` +
        selected +
        `>${sub}</option>
      `
    );
  });
  setChapterCard(cls, subject);
  return subject;
}

// opens the options dropdown
function openOptions(chpt) {
  $(`#myDropdown-${chpt}`).addClass("show");
}
// closing the options dropdown
$(document).mouseup(function (e) {
  if ($(e.target).closest(".dropdown-content").length === 0) {
    $(".dropdown-content").removeClass("show");
  }
});

let chptToBeEdited;
// edit modal functions
function openEditChapterModal(cls, subject, chptName){  
  chptToBeEdited = chptName;
  $('#editChapterModal').css('display',"flex");
  $('#chapter-edit-input').val(chptName);
  $('#editModalClassLabel').empty().append(`Class: ${cls}`);
  $('#editModalSubjectLabel').empty().append(`Subject: ${subject}`);
  $('#chapter-edit-input').focus();
}
function cancelEditFunc(){
  $("#editChapterModal").css('display', 'none' );
}
$('.close:eq(1)').click(() => cancelEditFunc());
// -----------------  setting the chapter cards ----------------- //
function setChapterCard(cls, sub) {
  let urls = ` http://localhost:3000/chapter?class=${cls}&subject=${sub}`
  let chapters = JSON.parse(httpGet(urls));
  $('.card').remove();
  
  let imgLink = "";
  switch (sub) {
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
  chapters.forEach((chapter, index) => {
    $("#body-wrapper").append(` 
            <div class="card">
                <div class="card-image">
                    <img src="${imgLink}" alt="Integer" height="100%" width="100%">
                </div> 
                <div class="card-desc">
                    <h4>${chapter.chapterName}</h4>
                    <p>${chapter.videos} ${chapter.videos > 1 ? "videos" : "video"
      }</p>
                    <button ${chapter.videos == 0 ? 'disabled' : ''} id='${index}' onclick="goToContentPage('${chapter.class}','${chapter.subject}','${chapter.chapterName}')">Start Learning</button>
                </div>
                <div class="cardOption" onclick="openOptions('${chapter.chapterName.split(' ')[0]}')"><i class="fa fa-ellipsis-v"></i></div>
                <div id="myDropdown-${chapter.chapterName.split(' ')[0]}" class="dropdown-content">
                    <ul>
                      <li class="update-sub" onclick="openEditChapterModal('${chapter.class}','${chapter.subject}','${chapter.chapterName}')"><i class="fa fa-pencil"></i>Edit</li>
                      <li class="del-sub" onclick="deleteChapter('${chapter.class}','${chapter.subject}','${chapter.chapterName}')"><i class="fa fa-trash-o"></i>Delete</li>
                    </ul>
                </div>
            </div>
        `);
  });
} 
// ------------------------ function to go on content page ------------------------ //
function goToContentPage(cls, subject, chapter){
  window.location.href = `content.html?class=${cls}&subject=${subject}&chapter=${chapter}`;
}

// ------------------------ add chapter function ------------------------ //
function addNewChapter(){
  let cls = $('#classSelector').find(":selected").text();
  let sub = $('#subjectSelector').find(":selected").text();
  let chptName = $('#chapter-input').val();
  if(!chptName || chptName == ""){
    toastr["warning"]("Chapter Name should not be empty!")
    return;
  }
  let chapterData = {
    chapterName: chptName,
    subject: sub,
    class: cls,
  }
  addChpater(chapterData);
  modal.style.display = "none";
  $('#chapter-input').val('');
}

// ------------------------ post request to save chapter ------------------------ //
function addChpater(data){
  let url = ' http://localhost:3000/addChapter';
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
  xhr.onload = function () {
    if (xhr.status != 200) {
      console.log(`Error ${xhr.status} : ${xhr.statusText}`);
    } else {
      setChapterCard(data.class, data.subject);
      if (xhr.response == "chapter exists") {
        toastr["info"]("Chapter already exists!")
      } else if (xhr.response == "chapter added") {
        toastr["success"]("Chapter added");
        $("#classSelector").val(data.class).change();
        $("#subjectSelector").val(data.subject).change();
      }
    }
  };
}

// ------------------------ update chapter funtion  ------------------------ //
function editChapter(chptToBeEdited, crntClass, crntSubject){
  let newChpt = $('#chapter-edit-input').val();
  if(!newChpt || newChpt == ""){
    toastr['warning']("Chapter Name should not be empty!");
    return;
  }
  let updateChptData = {
    oldChpt: chptToBeEdited,
    newChpt: newChpt,
    class: crntClass,
    subject: crntSubject
  }
  updateChapter(updateChptData);
}

// ------------------------ patch request to update subject ------------------------ //
function updateChapter(updateData){
  let url = " http://localhost:3000/updateChapter";
  var xhr = new XMLHttpRequest();
  xhr.open("PATCH", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(updateData));
  xhr.onload = function () {
    if (xhr.status != 200) {
      console.log(`Error ${xhr.status} : ${xhr.statusText}`);
    } else {
      setChapterCard(updateData.class, updateData.subject);
      if (xhr.response == "chapter updated") {
        // Swal.fire({
        //   icon: "success",
        //   title: "Chapter Updated",
        //   showConfirmButton: false,
        //   timer: 1500,
        // });
        toastr["success"]("Chapter updated");
        $("#editChapterModal").css('display', 'none' );
      } 
    }
  };
}

// ------------------------ request to delete chapter ------------------------ //
function deleteChapterFromDb(cls, subject, chapter){
  let theUrl = ` http://localhost:3000/deleteChapter?class=${cls}&subject=${subject}&chapter=${chapter}`;
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("DELETE", theUrl, false);
  xmlHttp.send(null);
  if (xmlHttp.responseText == "chapter deleted") {
    toastr["success"]("Chapter Deleted");
    setChapterCard(cls, subject, chapter);
  } else {
    toastr['error']("Something went wrong please try again!");
  }
}

// ------------------------ delete chapter function ------------------------ //
function deleteChapter(cls, subject, chapter){
  Swal.fire({
    title: "Are you sure?",
    text: "All data of this chapter will deleted. You won't be able to revert this!",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      deleteChapterFromDb(cls, subject, chapter);
    }
  });
}


onload = () => {
  let userName = JSON.parse(localStorage.getItem('UserInfo')).user.userName;
  $('#userName').text(userName);
  
  let params = getParams();
  let classes = getClasses(); // getting classes from the getclasses utils
  let crntClass = setClassOptions(classes, params.cls);
  let crntSubject = setSubjectOptions(crntClass, params.subject)

  $(document).on("change", "#classSelect", function () {
    let selectedClass = $(this).val();
    let crntSubject = setSubjectOptions(selectedClass, null);
    $("#classSelector").val(selectedClass).change();
    window.history.replaceState(null, null, `?class=${selectedClass}&subject=${crntSubject}`);
    crntClass = selectedClass;
    setChapterCard(crntClass, crntSubject);
  });
  $(document).on("change", "#subjectSelect", function () {
    let selectedSubject = $(this).val();
    $("#subjectSelector").val(selectedSubject).change();
    window.history.replaceState(null, null, `?class=${crntClass}&subject=${selectedSubject}`);
    crntSubject = selectedSubject;
    setChapterCard(crntClass, crntSubject);
  });

  $("#editChptBtn").click(() => {
    editChapter(chptToBeEdited, crntClass, crntSubject);
  })
 
}

// --------------- modal handling --------------- //
function openModal() {
  $('#addChapterModal').css('display', 'flex' );
}

$('.close').first().click(() => {
  $("#addChapterModal").css('display', 'none' );
})

window.onclick = function (event) {
  if (event.target == modal ) {
    $('#addChapterModal').css('display', 'none' );
    $("#editChapterModal").css('display', 'none' );
  }
};