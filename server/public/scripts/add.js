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
          value: results[i].category,
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

function onSubmitBtnClicked() {}

function onCancelBtnClicked() {
  // User will be directed back to index.html
  window.location = "index.html";
}
