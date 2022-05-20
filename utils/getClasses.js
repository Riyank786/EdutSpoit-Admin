// to sort the classes
function compareNumbers(a, b) {
  return a - b;
}
// get request to url
function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, false);
  xmlHttp.send(null);
  return xmlHttp.responseText;
}
// getting all classes
function getClasses() {
  let url = " https://edu-spot.herokuapp.com/";
  let classes = [];
  let data = JSON.parse(httpGet(url));
  data.forEach((el) => {
    classes.push(el.class);
  });
  classes = classes.sort(compareNumbers);
  return classes;
}

// getting subject of class 'cls'
function getSubjects(cls){
  let url = ` https://edu-spot.herokuapp.com/subject?class=${cls}`
  let subjects = [];
  let data = JSON.parse(httpGet(url));
  data.forEach(el =>{
    subjects.push(el.subject);
  });
  return subjects;
}

// getting chapter of class cls and subject
function getChapters(cls, subject){
  let url = ` https://edu-spot.herokuapp.com/chapter?class=${cls}&subject=${subject}`;
  let chapters = [];
  let data = JSON.parse(httpGet(url));
  data.forEach(el =>{
    chapters.push(el.chapterName);
  })
  return chapters;
}


// get all subjects 
function getAllSubjects(){
  let url = ` https://edu-spot.herokuapp.com/allSubjects`;
  return JSON.parse(httpGet(url));
}

// get all chapters
function getAllChapters(){
  let url = ` https://edu-spot.herokuapp.com/allChapters`;
  return JSON.parse(httpGet(url));
}

// get all videos
function getAllVideos(){
  let url = ` https://edu-spot.herokuapp.com/allVideos`;
  return JSON.parse(httpGet(url));
}

// get total questions
function getAllQuestions(){
  let url = ` https://edu-spot.herokuapp.com/totalQuestions`;
  return JSON.parse(httpGet(url));
}