let PORT = process.env.PORT || 5000;
let express = require("express");
let bodyParser = require("body-parser");
let fs = require("fs");

let app = express();

let http = require("http");
let server = http.Server(app);

app.use(express.static("public"));

server.listen(PORT, function () {
  console.log("Grocery List server running");
});

// Create application/x-www-form-urlencoded parser
let urlencodedParser = bodyParser.urlencoded({
  extended: false,
});

// ------ Get next ID helper ------------------

function getNextId(counterType) {
  // use 'member' or 'team' as counterType
  // read the counter file
  let data = fs.readFileSync(__dirname + "/data/counters.json", "utf8");
  data = JSON.parse(data);

  // find the next id from the counters file and then increment the
  // counter in the file to indicate that id was used
  let id = -1;
  switch (counterType.toLowerCase()) {
    case "item":
      id = data.nextItem;
      data.nextItem++;
      break;
    case "category":
      id = data.nextCategory;
      data.nextCategory++;
      break;
    case "user":
      id = data.nextUser;
      data.nextUser++;
      break;
  }

  // save the updated counter
  fs.writeFileSync(__dirname + "/data/counters.json", JSON.stringify(data));

  return id;
}

// ------ Membership change conflict helpers ------------------

/*
function getMinAgeOfMember(team)
{
    let minAge = 100000;
    for (let i = 0; i < team.Members.length; i++)
    {
        if (Number(team.Members[i].MemberAge) < minAge) 
        {
            minAge = Number(team.Members[i].MemberAge);
        }
    }
    return minAge;
}

function getMaxAgeOfMember(team)
{
    let maxAge = -1;
    for (let i = 0; i < team.Members.length; i++)
    {
        if (Number(team.Members[i].MemberAge) > maxAge) 
        {
            maxAge = Number(team.Members[i].MemberAge);
        }
    }
    return maxAge;
}
*/

/*
function isThereAnyGenderChangeConflicts(newGender, team)
{
    if (newGender == "Any")
    {
        // No conflict w/ switching to coed
        return false;  
    } 
 
    let conflictGender = newGender == "Male" ? "Female" : "Male";

    // look for member whose gender would conflict with new team gender
    let match = team.Members.find(element => element.MemberGender == conflictGender);
    if (match != null) 
    {
        // console.log("Found existing member whose gender conflicts with switch to " + newGender);
        return true;  // found a conflict!          
    }

    return false; // no conflicts
}
*/

// ------ Validation helpers ------------------

function isValidItem(item) {
  if (item.category == undefined || item.category.trim() == "") return 1;
  if (item.name == undefined || item.name.trim() == "") return 2;

  return -1;
}

// ------------------------------------------------------------------------------
// THIS CODE ALLOWS REQUESTS FOR THE PAGES THROUGH

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/" + "index.html");
});

app.get("/index.html", function (req, res) {
  res.sendFile(__dirname + "/public/" + "index.html");
});

// TODO:  YOU WILL NEED TO ADD MORE CALLS TO app.get() FOR EACH PAGE
//        YOU END UP BUILDING

// ------------------------------------------------------------------------------
// THIS CODE ALLOWS REQUESTS FOR THE API THROUGH

// GET LIST
app.get("/api/list", function (req, res) {
  console.log("Received a GET request for list");

  let data = fs.readFileSync(__dirname + "/data/list.json", "utf8");
  data = JSON.parse(data);

  console.log("Returned data is: ");
  console.log(data);
  res.end(JSON.stringify(data));
});

// GET CATEGORIES
app.get("/api/categories", function (req, res) {
  console.log("Received a GET request for categories");

  let data = fs.readFileSync(__dirname + "/data/categories.json", "utf8");
  data = JSON.parse(data);

  console.log("Returned data is: ");
  console.log(data);
  res.end(JSON.stringify(data));
});

// GET ITEMS
app.get("/api/item", function (req, res) {
  console.log("Received a GET request for items");

  let data = fs.readFileSync(__dirname + "/data/items.json", "utf8");
  data = JSON.parse(data);

  console.log("Returned data is: ");
  console.log(data);
  res.end(JSON.stringify(data));
});

// GET ALL ITEMS BY CATEGORY
app.get("/api/items/bycategory/:category", function (req, res) {
  let category = req.params.category;
  console.log("Received a GET request for items in category " + category);

  let data = fs.readFileSync(__dirname + "/data/items.json", "utf8");
  data = JSON.parse(data);

  //find all items by specific category
  let matches = data.filter((i) => i.category == category);

  console.log("Returned data is: ");
  console.log(matches);
  res.end(JSON.stringify(matches));
});

// POST REQUEST TO ADD NEW ITEM TO items.json
app.post("/api/items", urlencodedParser, function (req, res) {
  console.log("Received a POST request to add an item");
  console.log("BODY -------->" + JSON.stringify(req.body));

  // assemble item information so we can validate it
  let item = {
    id: getNextId("item"), // assign id to item
    category: req.body.category,
    name: req.body.name,
  };

  console.log("Performaing validation...");
  let errorCode = isValidItem(item);
  if (errorCode != -1) {
    console.log("Invalid data found! Reason: " + errorCode);
    res.status(400).send("Bad Request - Incorrect of Missing Data");
    return;
  }

  let data = fs.readFileSync(__dirname + "/data/items.json", "utf8");
  data = JSON.parse(data);

  // check for duplicate item
  let matchingItem = data.find(
    (item) => item.name.toLowerCase() == req.body.name.toLowerCase()
  );
  if (matchingItem != null) {
    // item already exists
    console.log("ERROR: Item is already on List!");
    res.status(403).send(); // forbidden
    return;
  }

  // add the item
  data.push(item);

  fs.writeFileSync(__dirname + "/data/items.json", JSON.stringify(data));

  console.log("Item added: ");
  console.log(item);

  //res.status(201).send();
  res.end(JSON.stringify(item)); //return the new item w it's itemId
});

// POST request to add item to list.json
app.post("/api/list", urlencodedParser, function (req, res) {
  console.log("Got a POST request to add an item to List");
  console.log("BODY -------->" + JSON.stringify(req.body));

  let data = fs.readFileSync(__dirname + "/data/list.json", "utf8");
  data = JSON.parse(data);

  // check for duplicate item
  let matchingItem = data.find(
    (item) => item.name.toLowerCase() == req.body.name.toLowerCase()
  );
  if (matchingItem != null) {
    // item already exists
    console.log("ERROR: Item is already on List!");
    res.status(403).send(); // forbidden
    return;
  }

  // check for blank item
  let blankItem = data.find(
    (item) => item.name.toLowerCase() == req.body.name.toLowerCase()
  );
  if ((blankItem = "")) {
    // item is blank
    console.log("ERROR: You did not select an Item!");
    res.status(403).send(); // forbidden
    return;
  }

  let item = {
    name: req.body.name,
    category: req.body.category,
  };

  data.push(item);

  fs.writeFileSync(__dirname + "/data/list.json", JSON.stringify(data));

  console.log("New item added!");
  console.log(item);
  res.status(200).send();
});

// POST request to add category to categories.json
app.post("/api/category", urlencodedParser, function (req, res) {
  console.log("Got a POST request to add a category to categories");
  console.log("BODY -------->" + JSON.stringify(req.body));

  let data = fs.readFileSync(__dirname + "/data/categories.json", "utf8");
  data = JSON.parse(data);

  // check for duplicate item
  let matchingCategory = data.find(
    (category) => category.name.toLowerCase() == req.body.name.toLowerCase()
  );
  if (matchingCategory != null) {
    // category already exists
    console.log("ERROR: Category already exists!");
    res.status(403).send(); // forbidden
    return;
  }

  let category = {
    id: getNextId("category"), // assign id to team
    name: req.body.name,
  };

  data.push(category);

  fs.writeFileSync(__dirname + "/data/categories.json", JSON.stringify(data));

  console.log("New category added!");
  console.log(category);
  res.status(200).send();
});

// DELETE ITEM FROM LIST
app.delete("/api/item/:name", function (req, res) {
  let name = req.params.name;
  console.log("Received a DELETE request for item " + name);

  let data = fs.readFileSync(__dirname + "/data/list.json", "utf8");
  data = JSON.parse(data);

  // find the index number of the item in the array
  let foundAt = data.findIndex((element) => element.name == name);

  // delete the item if found
  if (foundAt != -1) {
    data.splice(foundAt, 1);
  }

  fs.writeFileSync(__dirname + "/data/list.json", JSON.stringify(data));

  console.log("Delete request processed");
  // Note: even if we didn't find the item, send a 200 because they are gone
  res.status(200).send();
});

// ----------------------------------------------------------------------------
// USER MANAGEMENT

// GET request to check if user name is available
app.get("/api/username_available/:username", function (req, res) {
  let username = req.params.username;
  console.log("Checking to see if this username " + username + " is available");

  let data = fs.readFileSync(__dirname + "/data/users.json", "utf8");
  data = JSON.parse(data);

  let matchingUser = data.find(
    (user) => user.username.toLowerCase() == username.toLowerCase()
  );

  let message;
  if (matchingUser == null) {
    message = "YES";
  } else {
    message = "NO";
  }

  console.log("Is user name available? " + message);
  res.end(message);
});

// POST request to add a user
app.post("/api/users", urlencodedParser, function (req, res) {
  console.log("Got a POST request to add a user");
  console.log("BODY -------->" + JSON.stringify(req.body));

  let data = fs.readFileSync(__dirname + "/data/users.json", "utf8");
  data = JSON.parse(data);

  // check for duplicate username
  let matchingUser = data.find(
    (user) => user.username.toLowerCase() == req.body.username.toLowerCase()
  );
  if (matchingUser != null) {
    // username already exists
    console.log("ERROR: username already exists!");
    res.status(403).send(); // forbidden
    return;
  }

  let user = {
    id: getNextId("user"), // assign new id
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
  };

  data.push(user);

  fs.writeFileSync(__dirname + "/data/users.json", JSON.stringify(data));

  console.log("New user added!");
  console.log(user);
  res.status(200).send();
});

// POST request to login -- send username and password in request body
app.post("/api/login", urlencodedParser, function (req, res) {
  console.log("Got a POST request for a user to login");
  console.log("BODY -------->" + JSON.stringify(req.body));

  let data = fs.readFileSync(__dirname + "/data/users.json", "utf8");
  data = JSON.parse(data);

  // check to see if credentials match a user
  let match = data.find(
    (user) =>
      user.username.toLowerCase() == req.body.username.toLowerCase() &&
      user.password == req.body.password
  );

  if (match == null) {
    // credentials don't match any user
    console.log("Error:  credentials don't match known user");
    res.status(403).send(); // forbidden
    return;
  }

  let user = {
    id: match.id,
    name: match.name,
    username: match.username,
  };

  // login successful - return user w/o password
  console.log("Login successful for: ");
  console.log(user);
  res.end(JSON.stringify(user));
});
