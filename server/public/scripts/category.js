"use strict";

$(function () {
  // Connect buttons to click event handlers
  $("#submitBtn").on("click", onSubmitBtnClicked);
  $("#cancelBtn").on("click", onCancelBtnClicked);
});

function onCancelBtnClicked() {
  // User will be directed back to index.html
  window.location = "create.html";
}

function onSubmitBtnClicked() {
  let categoryData = "name=" + $("#newCategory").val();

  // take info from form and POST to categories.json
  $.ajax({
    url: "api/category",
    type: "POST",
    data: categoryData,
  })
    .done(function () {
      window.location = "create.html";
    })
    .fail(function () {
      // This is used through the sweet alert library, it produces a good looking alert but shouldn't really fire
      swal({
        title: "Error",
        text: "There was an error creating your Category.",
        icon: "error",
      });
    });
  return false;
}
