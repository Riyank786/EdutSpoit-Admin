onload = () => {
  let userName = JSON.parse(localStorage.getItem('UserInfo')).user.userName;
  $('#userName').text(userName);
  setClasses();
}

// setting the class cards in body wrapper
function setClasses() {
  let classes = getClasses(); // getting classes from the getclasses utils

  $("#body-wrapper").children().not(":first").remove();

  classes.forEach((cls) => {
    $("#body-wrapper").append(`
        <div class="card" onclick="goToSubjects(${cls})">
            ${cls}
            <div class="cardOption" onclick="openOptions(${cls})"><i class="fa fa-ellipsis-v"></i></div>
            <div id="myDropdown-${cls}" class="dropdown-content" onclick="deleteClass(${cls})">
                <i class="fa fa-trash-o"></i> Delete
            </div>
        </div>
        `);
  });
}

// ------------------------ delete Class function ------------------------ //
function deleteClass(cls) {
  Swal.fire({
    title: "Are you sure?",
    text: "All data of this class will deleted. You won't be able to revert this!",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      deleteClsFromDb(cls);
    }
  });
}

// ------------------------ request to delete class ------------------------ //
function deleteClsFromDb(cls) {
  let theUrl = ` https://edu-spot.herokuapp.com/deleteClass?class=${cls}`;
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("DELETE", theUrl, false);
  xmlHttp.send(null);
  if (xmlHttp.responseText == "class deleted") {
    setClasses();
    toastr["success"]("Class Deleted");
  } else {
    toastr["error"]("SOmething went wrong, please try again");
  }
}

// route to subject page of class cls
function goToSubjects(cls) {
  window.location.href = `subjects.html?class=${cls}`;
}

// for opening options
function openOptions(cls) {
  $(`#myDropdown-${cls}`).addClass("show");
}

// preventing the parent click when child is clicked
$(".cardOption").click((e) => {
  e.stopPropagation();
});
$(".dropdown-content").click((e) => {
  e.stopPropagation();
});

$(document).mouseup(function (e) {
  if ($(e.target).closest(".dropdown-content").length === 0) {
    $(".dropdown-content").removeClass("show");
  }
});

// modal handling
var modal = document.getElementById("chapterModal");
var span = document.getElementsByClassName("close")[0];
var classInput = document.getElementById("modal-input");

function openModal() {
  modal.style.display = "flex";
  classInput.focus();
};

span.onclick = function () {
  modal.style.display = "none";
  classInput.value = "";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
    classInput.value = "";
  }
};

// ------------------------ post request to save class ------------------------ //
async function addClasses(data) {
  let url = " https://edu-spot.herokuapp.com/addClass";
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
  xhr.onload = function () {
    if (xhr.status != 200) {
      console.log(`Error ${xhr.status} : ${xhr.statusText}`);
    } else {
      setClasses();
      if (xhr.response == "class exists") {
        toastr['info']('Class already exists');
      } else if (xhr.response == "class added") {
        toastr['success']('Class added');
      }
    }
  };
}

// ------------------------ add Class function ------------------------ //
async function addNewClass() {
  let clsToAdd = classInput.value;
  clsToAdd = clsToAdd.trim();
  if (!clsToAdd || clsToAdd == "") {
    toastr['warning']("Class should not be empty");
    return;
  }
  String.prototype.isNumber = function () {
    return /^\d+$/.test(this);
  };
  if (!clsToAdd.isNumber()) {
    toastr['warning']("Class should be a number");
    classInput.value = "";
    classInput.focus();
    return;
  }
  let data = {
    class: clsToAdd,
    subjects: [],
  };

  await addClasses(data);

  modal.style.display = "none";
  classInput.value = "";
}
