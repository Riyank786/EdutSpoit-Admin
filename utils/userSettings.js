function logOutUser(){
  localStorage.removeItem("Authorization");
  localStorage.removeItem("UserInfo");
  window.location.href = "/admin/auth/";
}

const addAdminUsermodal = document.getElementById("addUserModal");
const closeAdminUserModal = document.getElementsByClassName("closeAdminUserModal")[0];
const userNameRef = document.getElementById("modal-username");
const emailIdRef = document.getElementById("modal-email");
const passwordRef = document.getElementById("modal-password");

function addAdminUser(){
  addAdminUsermodal.style.display = "flex";
}

function resetAdminModalInputs(){
  userNameRef.value = "";
  emailIdRef.value = "";
  passwordRef.value = "";
}

closeAdminUserModal.onclick = function () {
  addAdminUsermodal.style.display = "none";
  resetAdminModalInputs();
};

window.onclick = function (event) {
  if (event.target == addAdminUsermodal) {
    addAdminUsermodal.style.display = "none";
    resetAdminModalInputs();
  }
};

$("#addAdminBtn").click(() => {

  let userName = userNameRef.value;
  let emailId = emailIdRef.value;
  let password = passwordRef.value;
  
  if(!userName || userName == "" || !emailId || emailId == "" || !password || password == ""){
    toastr['warning']('Please fill all the details');
    return;
  }
  let userRole = "admin";
  let data = {userName, emailId, password, userRole};

  const url = " https://edu-spot.herokuapp.com/admin/addAdminUser";

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
  xhr.onload = function () {
    if (xhr.status != 200) {
      console.log(`Error ${xhr.status} : ${xhr.statusText}`);
      toastr["error"]("something went wrong, please try again later");
    } else {
      if(xhr.responseText == "email exists"){
        toastr["warning"]('Email already exists');
      } else if(xhr.responseText == "username exists"){
        toastr["warning"]('User Name already taken');
      } else if(xhr.responseText == "not logged in"){
        toastr["error"]('Something went wrong, please try again');
      }else if(xhr.responseText == "user unauthorized"){
        toastr["warning"]("You are unauthorized");
      }else if(xhr.responseText == "adminuser added"){
        toastr["success"]("Admin User added");
        addAdminUsermodal.style.display = "none";
        resetAdminModalInputs();
      } 
    }
  };

});