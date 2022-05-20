function openContent(evt="summary", contentType) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(contentType).style.display = "block";
  if(evt != "summary"){
    evt.currentTarget.className += " active";
  } else {
    let summary = document.getElementById("summaryTabBtn");
    summary.className += " active";
  }
}
