function openSideMenu() {
  $("#closeSideBar").css("display", "flex");
  $(".sidebar").css({
    left: "-1px",
    "box-shadow": "0px 0px 5px rgba(0, 0, 0, 0.6)",
    transition: " all 0.5s",
  });
}

function closeSideBar() {
  $("#closeSideBar").css("display", "none");
  $(".sidebar").css({
    left: "-300px",
    "box-shadow": "0px 0px 5px rgba(0, 0, 0, 0.6)",
    transition: " all 0.5s",
  });
}
