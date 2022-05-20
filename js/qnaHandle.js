function openAnswers(queId,ansId){
  $(`#${queId}`).hide();
  $(`#${ansId}`).show();
}

function openQuestions(queId,ansId){
  $(`#${ansId}`).hide();
  $(`#${queId}`).show();
}