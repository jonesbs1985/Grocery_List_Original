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

      // assemble cells in the row
      row.append(tdCategory);
      row.append(tdName);
      row.append(tdBtn);

      // assemble row in table
      $("#listTbl").append(row);
    }
  });
});
