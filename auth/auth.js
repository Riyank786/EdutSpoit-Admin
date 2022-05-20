// -------------------------------- login handling -------------------------------- // 
function login(data){

  const loginURL = " https://edu-spot.herokuapp.com/admin/adminLogin";

  const xhr = new XMLHttpRequest();
  xhr.open("POST", loginURL, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
  xhr.onload = function () {
    if (xhr.status != 200) {
      console.log(`Error ${xhr.status} : ${xhr.statusText}`);
      toastr["error"]("something went wrong, please try again later");
    } else {
      if(xhr.responseText == "please provide email or password"){
        toastr["error"]('Something went wrong, please try again');
      } else if(xhr.responseText == "Incorrect email or password"){
        toastr["warning"]('Incorrect email or password');
      } else if(xhr.responseText == "not logged in"){
        toastr["error"]('Something went wrong, please try again');
      }else if(xhr.responseText == "user unauthorized"){
        toastr["warning"]("You are unauthorized");
      }else{
        let response = JSON.parse(xhr.response);
        localStorage.setItem("Authorization", response.token);
        localStorage.setItem("UserInfo", JSON.stringify(response.data));
        window.location.href = "/EdutSpot-Admin/";
      } 
    }
  };

}

function loginUser(){
  
  const emailId = $("#userEmail").val();
  const password = $("#userPassword").val();

  if(!emailId || !password || emailId == "" || password == ""){
    toastr["warning"]("Please fill all details");
    return;
  }

  const data = { emailId, password };
  login(data);
}
