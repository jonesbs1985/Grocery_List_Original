"use strict";

$(function () {
  // fetch list data to load table
  $.getJSON("api/list", function (results) {
    let items = results;
    items.sort(function (a, b) {
      var textA = a.category.toUpperCase();
      var textB = b.category.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });

    let length = items.length;

    // if there are no items on list, display message saying so
    if (length == 0) {
      // create row with one <td> that contains a message
      let row = $(
        "<tr><td colspan='2'>There are no Items on your List at this time.<td><tr>"
      );
      $("#listTbl").append(row);
      return;
    }

    // loop through each item on list
    for (let i = 0; i < length; i++) {
      // create row
      let row = $("<tr>");
      // create cell1 with item category
      let tdCategory = $("<td>").html(results[i].category);
      // create cell2 with item name
      let tdName = $("<td>").html(results[i].name);
      // create cell3 with remove button
      let tdBtn = $("<td>").html(
        '<input type="button" id="removeBtn" class="btn btn-danger" value="Remove">'
      );

      // connect button to click event handler
      tdBtn.on("click", function () {
        removeItem(results[i].name);
      });

      // assemble cells in the row
      row.append(tdCategory);
      row.append(tdName);
      row.append(tdBtn);

      // assemble row in table
      $("#listTbl").append(row);
    }
  });
});

function removeItem(name) {
  swal({
    title: "Confirmation",
    text: "Do you want to remove this item from the list?",
    icon: "warning",
    buttons: {
      cancel: true,
      confirm: "Yes",
    },
  }).then(function () {
    $.ajax({
      url: "api/item/" + name,
      type: "DELETE",
    })
      .done(function () {
        swal({
          title: "Success",
          text: "This item has been removed from the list",
          icon: "success",
        });
      })
      .then(() => {
        window.location = "index.html";
      })
      .fail(function () {
        swal({
          title: "Error",
          text: "Item not found",
          icon: "error",
        });
      });
  });
}
