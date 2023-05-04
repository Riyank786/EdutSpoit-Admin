let url = window.location.href;
url = new URL(url);
let cls = url.searchParams.get("class");
let subject = url.searchParams.get("subject");
let chapter = url.searchParams.get("chapter");
let content;
let videoId;
let qTypeToPost;
let qIdToPost;
let questionData = [];

// get request to url
function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, false);
  xmlHttp.send(null);
  return xmlHttp.responseText;
}

// modals handling

// modal of adding question
var modal = document.getElementById("addQuestionModal");
var queInput = document.getElementById("que-input");

// modal of adding answer
var ansModal = document.getElementById("addAnswerModal");
var ansInput = document.getElementById("ans-input");

//  modal of adding content
var contentModal = document.getElementById("addContentModal");

// opens add question modal 
function openModal(qType) {
  modal.style.display = "flex";
  queInput.focus();

  qTypeToPost = qType;
}

let queContainerId;
let ansContainerId;
let queIndex;
// opens add answer modal 
function openAnsModal(queFilterId, queId, ansId, index) {
  ansModal.style.display = "flex";
  ansInput.focus();
  qIdToPost = queFilterId;
  queContainerId = queId;
  ansContainerId = ansId;
  queIndex = index;
}

// opens content modal for adding content and updating content both 
function openAddContentModal(func, index=0, videoId, contentId){
  $('#addContentModal .modal-content .modal-form .addBtn').remove();
  let btnName;
  if(func == "addContent"){
    btnName = "Add Content" 
  }else{ 
    btnName = "Update Content"
    let data = content[0].videos[index];
    $('#video-link-input').val(data.link);
    $('#video-title-input').val(data.title);
    $('#video-desc-input').val(data.summary);
  }
  $('#addContentModal .modal-content .modal-form').append(`
  <button class="addBtn" onclick="${func}('${videoId}','${contentId}',${index})">${btnName}</button>
  `)
  contentModal.style.display = "flex";
  $("#video-link-input").focus();
}


function resetInputs(){
  queInput.value = "";
  ansInput.value = "";
  $('#video-link-input').val('');
  $('#video-title-input').val('');
  $('#video-desc-input').val('');
}

// for closing tha modals
$('.close').click(() => {
  $('.modal').hide();
  resetInputs();
});
window.onclick = function (event) {
  if (event.target == modal || event.target == ansModal || event.target == contentModal) {
    ansModal.style.display = "none";
    modal.style.display = "none";
    contentModal.style.display = "none";
    resetInputs();
  }
};

// modals handle complete


// ------------------------ add Answer function ------------------------ //
function addContent(){
  let videoLink = $('#video-link-input').val();
  let videoTitle = $('#video-title-input').val();
  let videoDesc = $('#video-desc-input').val();
  if(!videoLink || videoLink == ""){
    toastr['warning']("Video Link Should not be empty!");
    $("#video-link-input").focus();
    return;
  }
  if (!videoTitle || videoTitle == ""){
    toastr['warning']("Video Title should not be empty!");
    $("#video-title-input").focus();
    return;
  }
  videoLink = videoLink.replace('youtu.be/', 'youtube.com/embed/')

  let data = {
    class: cls,
    subject: subject,
    chapterName: chapter,
    videos: [
      {
        link: videoLink,
        title: videoTitle,
        summary: videoDesc
      }
    ]
  }

  let url = " http://localhost:3000/addContent";
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
  xhr.onload = function () {
    if (xhr.status != 200) {
      console.log(`Error ${xhr.status} : ${xhr.statusText}`);
    } else {
      if (xhr.response) {
        toastr["success"]("Content added");
        contentdata = JSON.parse(xhr.response);
        content[0] = contentdata
        setVideoList(content);
        contentModal.style.display = 'none';
        resetInputs();
      }
    }
  };
}

// ------------------------ update content function ------------------------ //
function updateContent(videoId, contentId, index){
  let updateUrl = ' http://localhost:3000/updateContent'; 
  let videoLink = $('#video-link-input').val();
  let videoTitle = $('#video-title-input').val();
  let videoDesc = $('#video-desc-input').val();
  const updateData = {
    videoId, contentId, videoLink, videoTitle, videoDesc
  }
  var xhr = new XMLHttpRequest();
  xhr.open("PATCH", updateUrl, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(updateData));
  xhr.onload = function () {
    if (xhr.status != 200) {
      console.log(`Error ${xhr.status} : ${xhr.statusText}`);
    } else {
      if (xhr.responseText == "content updted") {
        toastr["success"]("Content updated");
        content[0].videos[index].link = videoLink;
        content[0].videos[index].title = videoTitle;
        content[0].videos[index].summary = videoDesc;
        setVideoList(content);
        setVideoNContent(index);
        $('.modal').hide();
        resetInputs();
      } 
    }
  };
}

// ------------------------ delete content function ------------------------ //
function deleteVideoContent(videoId, contentId){
  Swal.fire({
    title: "Are you sure?",
    text: "All data of this video will deleted. You won't be able to revert this!",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      deleteContentFromDb(videoId, contentId);
      
    }
  });
}
// ------------------------ request to delete subject ------------------------ //
function deleteContentFromDb(videoId, contentId){
  let theUrl = ` http://localhost:3000/deleteVideoContent?videoId=${videoId}&contentId=${contentId}`;
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("DELETE", theUrl, false);
  xmlHttp.send(null);
  if (xmlHttp.responseText == "content deleted") {
    toastr["success"]("Content Deleted");
    setAllContent({cls, subject, chapter});
  } else {
    toastr['error']("Something went wrong please try again!");
  }
}


// ------------------------ post request to add question ------------------------ //
async function addQuestionsToDb(data) {
  let url = " http://localhost:3000/addQuestion";
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
  xhr.onload = function () {
    if (xhr.status != 200) {
      console.log(`Error ${xhr.status} : ${xhr.statusText}`);
    } else {
      if (xhr.response == "question added") {
        toastr["success"]("Question added");
        setQuestions(data.videoId);
      }
    }
  };
}

// ------------------------ add Question function ------------------------ //
async function addQuestion() {
  let queToAdd = queInput.value;
  if (!queToAdd || queToAdd == "") {
    toastr["warning"]("Question should not be empty");
    return;
  }

  let data = {
    class: cls,
    subject: subject,
    chapterName: chapter,
    videoId: videoId,
    qType: qTypeToPost,
    question: {
      question: queToAdd,
      userId: "61fe87a86868c06b2779bbbb",
    },
    answers: [],
  };

  await addQuestionsToDb(data);

  modal.style.display = "none";
  queInput.value = "";
}

// ------------------------ delete Question function ------------------------ //
function deleteQuestion(id, videoId){
  Swal.fire({
    text: "Are you sure you want to delete this question?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {

      const deleteQuestionUrl = ` http://localhost:3000/deleteQuestion?questionId=${id}`;
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("DELETE", deleteQuestionUrl, false);
      xmlHttp.send(null);
      if (xmlHttp.responseText == "question deleted") {
        toastr["success"]("Question Deleted");
        console.log("videoId : ", videoId)
        setQuestions(videoId);
      } else {
        toastr['error']("Something went wrong please try again!");
      }

    }
  });
}

// ------------------------ post request to add answer ------------------------ //
async function addAnswerToDb(data) {
  let url = " http://localhost:3000/addAnswer";
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
  xhr.onload = function () {
    if (xhr.status != 200) {
      console.log(`Error ${xhr.status} : ${xhr.statusText}`);
    } else {
      toastr["success"]("Answer added");
      questionData[queIndex].answers = [];
      questionData[queIndex].answers = [...JSON.parse(xhr.response)];
      handleClick(queContainerId, ansContainerId, queIndex);
    }
  };
}

// ------------------------ add Answer function ------------------------ //
async function addAnswer() {
  let ansToAdd = ansInput.value;
  if (!ansToAdd || ansToAdd == "") {
    toastr["warning"]("Answer should not be empty");
    return;
  }

  let data = {
    id: qIdToPost,
    answer: {
      answer: ansToAdd,
      userId: "6203bde9713c2a8ffc59d553",
    },
  };

  await addAnswerToDb(data);

  ansModal.style.display = "none";
  ansInput.value = "";
}

function resetVideoNContent(){
  // $("#video-frame").attr("src", "" + "?autoplay=1");
  $("#summary").empty();
  $(".que-container").empty();
  $("#videoFrame-wrapper").empty();
}

function setVideoNContent(index) {
  if(content.length != 0){
    if(content[0].videos.length != 0){
      $("#videoFrame-wrapper").empty();
      $("#videoFrame-wrapper").append(`
        <iframe
          width="100%"
          height="100%"
          id="video-frame"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      `)
      let currentData = content[0].videos[index];
      $("#video-frame").attr("src", currentData.link + "?autoplay=1");
      $('#summary').empty();
      $("#summary").append(`
        <h3>${currentData.title}</h3>
        <p>${currentData.summary}</P>
      `)
      $(".video-link").removeClass("video-link-active");
      $(`#video-${index}`).addClass("video-link-active");
      videoId = currentData._id;
      openContent("summary", "summary");
      setQuestions(currentData._id);
    }
  } else {
    resetVideoNContent();
  }
}

function setVideoList(videoContent) {
  $("#video-list").empty();
  $("#video-list").append(`
    <div class="heading">
      <h3>Videos Lists</h3>
      <button
        class="close-video-list"
        id="closeVideoList"
        onclick="hideVideoList()"
      >
        &times;
      </button>
    </div>
  `);
  if(videoContent.length != 0){
    videoContent[0].videos.forEach((video, index) => {
      $("#video-list").append(`
      <li class="video-link" id="video-${index}" onclick="setVideoNContent('${index}')">
      <div>${index + 1}. ${video.title}.</div>
      <div class='video-controls'>
      <div class="video-control"><i class="fa fa-trash-o" onclick="deleteVideoContent('${video._id}','${videoContent[0]._id}')"></i></div>
      <div class="video-control"><i class="fa fa-pencil" onclick="openAddContentModal('updateContent', ${index}, '${video._id}','${videoContent[0]._id}')"></i></div>
      </div>
      </li>
      `);
    });
  }
  $("#video-list").append(`
    <li class="addContentBtn" onclick="openAddContentModal('addContent')"> + Add Content </li>
  `);
}

function getTimeDiff(timeStart) {
  let timeEnd = new Date();
  timeStart = new Date(timeStart);

  var hourDiff = timeEnd - timeStart;
  var minDiff = hourDiff / 60 / 1000;
  var hDiff = hourDiff / 3600 / 1000;
  var humanReadable = {};
  humanReadable.hours = Math.floor(hDiff);
  humanReadable.minutes = Math.floor(minDiff - 60 * humanReadable.hours);
  if (humanReadable.hours > 24) {
    let day = Math.floor(humanReadable.hours / 24);
    if (day > 1) return `${day} days`;
    else {
      return `${day} day`;
    }
  }
  if (humanReadable.hours > 0) {
    if (humanReadable.hours > 1) return `${humanReadable.hours} hours`;
    else return `${humanReadable.hours} hour`;
  } else {
    if (humanReadable.minutes > 1) {
      return `${humanReadable.minutes} minutes`;
    } else {
      return `${humanReadable.minutes} minute`;
    }
  }
}

function setQuestions(videoId) {
  let url = ` http://localhost:3000/fetchQnA?videoId=${videoId}`;
  let questions = JSON.parse(httpGet(url));

  openQuestions("imp-que-wrapper", "imp-que-detail-page");
  openQuestions("pre-que-wrapper", "pre-que-detail-page");
  openQuestions("chpt-que-wrapper", "chpt-que-detail-page");

  $(".que-container").empty();
  if (questions.length == 0) {
    $(".que-container").append(`
      <h4>No questions for this video. Ask first question.</h4>
    `);
  }
  let queId;
  let ansId;
  let queCon;
  questionData = [];
  questions.forEach((que, index) => {
    questionData.push(que);
    let postedTime = que.createdAt;
    postedTime = getTimeDiff(postedTime);
    if (que.qType == "important") {
      queId = "imp-que-wrapper";
      ansId = "imp-que-detail-page";
      queCon = "imp-que-container";
    } else if (que.qType == "previous") {
      queId = "pre-que-wrapper";
      ansId = "pre-que-detail-page";
      queCon = "pre-que-container";
    } else if (que.qType == "chapter") {
      queId = "chpt-que-wrapper";
      ansId = "chpt-que-detail-page";
      queCon = "chpt-que-container";
    }
    $(`#${queCon}`).append(`
      <div class="que-card" onclick="openAnswers('${queId}', '${ansId}'); handleClick('${queId}', '${ansId}', ${index})">
        <button class="deleteBtn deleteCardBtn" onclick="deleteQuestion('${que._id}','${videoId}')">&times;</button>
        <h4 class="que">${que.question.question}</h4>
        <div class="que-desc">
        <div class="desc">
        <p><b>Posted by : </b>${que.question.userName}</p>
        <p><i>${postedTime} ago</i></p>
      </div>
      <div class="ans-icon">
        <p><i class="fa fa-comments-o"></i> ${que.answers.length}</p>
        </div>
        </div>
      </div>
    `);
  });
}

function handleClick(queId, ansId, index) {
  let que = questionData[index];
  let answers = que.answers;
  let question = que.question.question;
  let queFilterId = que._id;

  $(`#${ansId}`).empty();

  if (answers.length == 0) {
    $(`#${ansId}`).append(`
      <div class="tabcontent-header">
        <h3>Important Q&A</h3>
        <button class="addAnsBtn" onclick="openAnsModal('${queFilterId}', '${queId}', '${ansId}', ${index})">Add answer</button>
      </div>
      <button class="backBtn" onclick="openQuestions('${queId}', '${ansId}')">Back to all Qeustions</button>
      <h4>Q. - ${question}</h4>
      <h4>No answers for this question. Be the first to add answer for this question.</h4>
    `);
  } else {
    $(`#${ansId}`).append(`
      <div class="tabcontent-header">
        <h3>Important Q&A</h3>
        <button class="addAnsBtn" onclick="openAnsModal('${queFilterId}', '${queId}', '${ansId}', ${index})">Add answer</button>
      </div>
      <button class="backBtn" onclick="openQuestions('${queId}', '${ansId}')">Back to all Qeustions</button>
      <h4>Q. - ${question}</h4>
      <h4>Answers</h4>
    `);
    answers.forEach((ans, index) => {
      console.log(ans)
      let postedTime = ans.createdAt;
      postedTime = getTimeDiff(postedTime);

      $(`#${ansId}`).append(`
        <div class="ans-card">
          <button class="deleteBtn deleteCardBtn" >&times;</button>
          <div class="ans">${ans.answer}</div>
          <div class="ans-desc">
            <p><b>Posted by : </b>${ans.userName}</p>
            <p><i>${postedTime} ago</i></p>
          </div>
        </div>
      `);
    });
  }
}

function goToHomePage() {
  window.location.href = "index.html";
}

function showVideoList() {
  $("#closeVideoList").css("display", "flex");
  $("#video-list").css({
    right: "10px",
    "z-index": "9999999",
    transition: "all 0.5s",
  });
}

function hideVideoList() {
  $("#closeVideoList").css("display", "none");
  $("#video-list").css({
    right: "-300px",
    transition: "all 0.5s",
  });
}

function getContentData(crntClass, crntSubject, crntChapter) {
  let queURL = ` http://localhost:3000/content?class=${crntClass}&subject=${crntSubject}&chapterName=${crntChapter}`;
  let data = JSON.parse(httpGet(queURL));
  return data;
}

// setting the class select options
function setClassOptions() {
  let classes = getClasses();
  let crntCls = cls;
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

  });
  return crntCls;
}

// setting the subject select options
function setSubjectOptions(crntClass) {
  let subjects = getSubjects(crntClass);
  // if (subject == null || subject == "") {
  //   subject = subjects[0];
  // }
  $("#subjectSelect").find("option").remove().end();
  if(subjects.length == 0){
    return "";
  }
  subjects.forEach((sub, index) => {
    let selected;
    if(index == 0){
      subject = sub;
    }
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
  });

  return subject;
}

function setChapterOptions(crntClass, crntSubject) {
  let chapters = getChapters(crntClass, crntSubject);
  // if (chapter == null || chapter == "") {
  //   chapter = chapters[0];
  //   console.log(chapter)
  // }
  $("#chapterSelect").find("option").remove().end();
  if(chapters.length == 0){
    return "";
  }
  chapters.forEach((chpt, index) => {
    if(index == 0){
      chapter = chpt;
    }
    let selected;
    if (chapter == chpt) {
      selected = `selected`;
    } else {
      selected = ``;
    }
    $("#chapterSelect").append(
      `
      <option value="${chpt}"` +
        selected +
        `>${chpt}</option>
      `
    );
  });
  return chapter;
}

function setAllContent(currentData) {
  if(!currentData.content){
    content = getContentData(currentData.cls, currentData.subject, currentData.chapter);
  }
  setVideoList(content);
  setVideoNContent(0);
}

onload = () => {
  let userName = JSON.parse(localStorage.getItem('UserInfo')).user.userName;
  $('#userName').text(userName);
  
  cls = setClassOptions();
  subject = setSubjectOptions(cls);
  chapter = setChapterOptions(cls, subject);
  setAllContent({cls, subject, chapter});

  $(document).on("change", "#classSelect", function () {
    cls = $(this).val();
    subject = setSubjectOptions(cls, null);
    chapter = setChapterOptions(cls, subject, null);
    window.history.replaceState(
      null,
      null,
      `?class=${cls}&subject=${subject}&chapter=${chapter}`
    );
    setAllContent({cls, subject, chapter});
  });
  $(document).on("change", "#subjectSelect", function () {
    subject = $(this).val();
    chapter = setChapterOptions(cls, subject, null);
    window.history.replaceState(
      null,
      null,
      `?class=${cls}&subject=${subject}&chapter=${chapter}`
    );
    setAllContent({cls, subject, chapter});
  });
  $(document).on("change", "#chapterSelect", function () {
    chapter = $(this).val();
    window.history.replaceState(
      null,
      null,
      `?class=${cls}&subject=${subject}&chapter=${chapter}`
    );
    setAllContent({cls, subject, chapter});
  });

  $(".video-controls").click(function(e) {
    e.stopPropagation();
  });
  $(".video-control").click(function(e) {
    e.stopPropagation();
  });
  $(".deleteCardBtn").click(function (e) {
    e.stopPropagation();
  });
};
