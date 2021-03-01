"use strict";

$(function () {
  // Fetch Categories data to populate DDL
  $.getJSON("api/categories", function (results) {
    // Find DDL
    let categoryDDL = $("#categoryDDL");

    // Put the categories as <Option> elements in DDL
    let length = results.length;
    for (let i = 0; i < length; i++) {
      let theOption = $("<option>", {
        text: results[i].name,
        value: results[i].name,
      });

      // Add option to category DDL
      categoryDDL.append(theOption);
    }
  });

  // Connect buttons to click event handlers
  $("#submitBtn").on("click", onSubmitBtnClicked);
  $("#addCategoryBtn").on("click", onAddCategoryBtnClicked);
  $("#cancelBtn").on("click", onCancelBtnClicked);
});

function onSubmitBtnClicked() {
  let itemData =
    "category=" + $("#categoryDDL").val() + "&name=" + $("#itemName").val();

  // take info from form and POST to items.json
  $.ajax({
    url: "api/items",
    type: "POST",
    data: itemData,
  })
    .done(function () {
      window.location = "index.html";
    })
    .fail(function () {
      // This is used through the sweet alert library, it produces a good looking alert but shouldn't really fire
      swal({
        title: "Error",
        text: "There was an error creating your Item.",
        icon: "error",
      });
    });
  return false;
}

function onAddCategoryBtnClicked() {
  // User will be directed to category.html
  window.location = "category.html";
}

function onCancelBtnClicked() {
  // User will be directed back to index.html
  window.location = "index.html";
}
