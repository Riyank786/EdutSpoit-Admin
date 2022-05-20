$('#totalClasses').html(getClasses().length);
$('#totalSubjects').html(getAllSubjects().length);
$('#totalChapters').html(getAllChapters().length);
$('#totalVideos').html(getAllVideos().totalVideos);
$('#totalQnA').html(getAllQuestions());

onload = () => {
  let userName = JSON.parse(localStorage.getItem('UserInfo')).user.userName;
  $('#userName').text(userName);
}