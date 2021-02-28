"use strict";

$(function () {
  // fetch list data to load table
  $.getJSON("api/list", function (results) {
    let length = results.length;

    // loop through each item on list
    for (let i = 0; i < length; i++) {
      // create row
      let row = $("<tr>");
      // create cell1 with item category
      let tdCategory = $("<td>").html(results[i].category);
      // create cell2 with item name
      let tdName = $("<td>").html(results[i].name);

      // assemble cells in the row
      row.append(tdCategory);
      row.append(tdName);

      // assemble row in table
      $("#listTbl").append(row);
    }
  });
});
