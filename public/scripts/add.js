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

    // When a category is selected, populate item list
    $("#categoryDDL").on("change", onCategoryDDLChange);
  });

  // Connect buttons to click event handlers
  $("#submitBtn").on("click", onSubmitBtnClicked);
  $("#createItemBtn").on("click", onCreateItemBtnClicked);
  $("#cancelBtn").on("click", onCancelBtnClicked);
});

function onCategoryDDLChange() {
  // Reset itemDDL
  $("#itemDDL").val("");

  // Get selected category
  let category = $("#categoryDDL").val();

  if (category != "") {
    // Find itemDDL
    let itemDDL = $("#itemDDL");

    $("#itemDDL").empty();

    let theOption = $("<option>", {
      text: "Select an Item",
      value: "",
    });

    // Add items to itemDDL
    itemDDL.append(theOption);

    $.getJSON("/api/items/bycategory/" + category, function (results) {
      // Put items as <Option> elements in DDL
      let length = results.length;
      for (let i = 0; i < length; i++) {
        theOption = $("<option>", {
          text: results[i].name,
          value: results[i].name,
        });

        // Add items to itemDDL
        itemDDL.append(theOption);
      }
    });
  } else {
    let itemDDL = $("#itemDDL");
    // Reset itemDDL
    $("#itemDDL").empty();
    let theOption = $("<option>", {
      text: "Select an Item",
      value: "",
    });

    // Add items to itemDDL
    itemDDL.append(theOption);
  }
}

function onSubmitBtnClicked() {
  let itemData =
    "name=" + $("#itemDDL").val() + "&category=" + $("#categoryDDL").val();

  // take info from form and POST to items.json

  $.ajax({
    url: "api/list",
    type: "POST",
    data: itemData,
  })
    .done(function () {
      swal({
        title: "Success",
        text: "Item added to List!",
        icon: "success",
        button: "Continue",
      }).then(() => {
        window.location = "index.html";
      });
    })
    .fail(function () {
      swal({
        title: "Error",
        text: "Item is already on List!",
        icon: "error",
      });
    });
  return false;
}

function onCancelBtnClicked() {
  // User will be directed back to index.html
  window.location = "index.html";
}

function onCreateItemBtnClicked() {
  // User will be directed to create.html
  window.location = "create.html";
}
