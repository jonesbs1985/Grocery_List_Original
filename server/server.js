let express = require("express");
let bodyParser = require("body-parser");
let fs = require("fs");

let app = express();

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

function isValidTeam(team) {
  if (team.TeamName == undefined || team.TeamName.trim() == "") return 1;
  if (team.OrganizationName == undefined || team.OrganizationName.trim() == "")
    return 2;
  if (team.SponsorName == undefined || team.SponsorName.trim() == "") return 3;
  if (team.SponsorPhone == undefined || team.SponsorPhone.trim() == "")
    return 4;
  if (team.SponsorEmail == undefined || team.SponsorEmail.trim() == "")
    return 5;
  if (team.MaxTeamSize == undefined || isNaN(team.MaxTeamSize)) return 6;

  return -1;
}

function isValidMember(member) {
  if (member.MemberEmail == undefined || member.MemberEmail.trim() == "")
    return 1;
  if (member.MemberName == undefined || member.MemberName.trim() == "")
    return 2;
  if (member.UserName == undefined || member.UserName.trim() == "") return 3;
  if (member.MemberRating == undefined || isNaN(member.MemberRating)) return 4;
  if (member.Fighter == undefined || member.Fighter.trim() == "") return 5;

  return -1;
}

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

// ADD AN ITEM
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
    console.log("Invalid data found! Reson: " + errorCode);
    res.status(400).send("Bad Request - Incorrect of Missing Data");
    return;
  }

  let data = fs.readFileSync(__dirname + "/data/items.json", "utf8");
  data = JSON.parse(data);

  // add the item
  data.push(item);

  fs.writeFileSync(__dirname + "/data/items.json", JSON.stringify(data));

  console.log("Item added: ");
  console.log(item);

  //res.status(201).send();
  res.end(JSON.stringify(item)); //return the new item w it's itemId
});

// GET ORGANIZATION
app.get("/api/organizations", function (req, res) {
  console.log("Received a GET request for all organizations");

  let data = fs.readFileSync(__dirname + "/data/organizations.json", "utf8");
  data = JSON.parse(data);

  console.log("Returned data is: ");
  console.log(data);
  res.end(JSON.stringify(data));
});

// GET ALL FIGHTERS
app.get("/api/fighters", function (req, res) {
  console.log("Received a GET request for all fighters");

  let data = fs.readFileSync(__dirname + "/data/fighters.json", "utf8");
  data = JSON.parse(data);

  console.log("Returned data is: ");
  console.log(data);
  res.end(JSON.stringify(data));
});

// GET ALL TEAMS
app.get("/api/teams", function (req, res) {
  console.log("Received a GET request for all teams");

  let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
  data = JSON.parse(data);

  console.log("Returned data is: ");
  console.log(data);
  res.end(JSON.stringify(data));
});

// GET ONE TEAM BY ID
app.get("/api/teams/:id", function (req, res) {
  let id = req.params.id;
  console.log("Received a GET request for team " + id);

  let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
  data = JSON.parse(data);

  let match = data.find((element) => element.TeamId == id);
  if (match == null) {
    res.status(404).send("Team Not Found");
    return;
  }

  console.log("Returned data is: ");
  console.log(match);
  res.end(JSON.stringify(match));
});

// GET MANY TEAMS BY ORGANIZATION (with MaxTeamSize > 1)
app.get("/api/teams/byorganization/:id", function (req, res) {
  let id = req.params.id;
  console.log("Received a GET request for teams in organization " + id);

  let orgData = fs.readFileSync(__dirname + "/data/organizations.json", "utf8");
  orgData = JSON.parse(orgData);

  let organization = orgData.find(
    (element) => element.OrganizationId.toLowerCase() == id.toLowerCase()
  );
  if (organization == null) {
    res.status(404).send("Organization Not Found");
    return;
  }

  let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
  data = JSON.parse(data);

  // find the matching teams for a specific organization
  let matches = data.filter(
    (element) =>
      element.OrganizationName == organization.OrganizationName &&
      element.MaxTeamSize > 1
  );

  console.log("Returned data is: ");
  console.log(matches);
  res.end(JSON.stringify(matches));
});

// GET all Solo Players(Team with max size 1) BY ORGANIZATION
app.get("/api/solo/byorganization/:id", function (req, res) {
  let id = req.params.id;
  console.log("Received a GET request for teams in organization " + id);

  let orgData = fs.readFileSync(__dirname + "/data/organizations.json", "utf8");
  orgData = JSON.parse(orgData);

  let organization = orgData.find(
    (element) => element.OrganizationId.toLowerCase() == id.toLowerCase()
  );
  if (organization == null) {
    res.status(404).send("Organization Not Found");
    return;
  }

  let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
  data = JSON.parse(data);

  // find the matching teams for a specific organization
  let matches = data.filter(
    (element) =>
      element.OrganizationName == organization.OrganizationName &&
      element.MaxTeamSize == 1
  );

  console.log("Returned data is: ");
  console.log(matches);
  res.end(JSON.stringify(matches));
});

// GET All Teams and SoloTeams BY ORGANIZATION
app.get("/api/teamsandsolo/byorganization/:id", function (req, res) {
  let id = req.params.id;
  console.log(
    "Received a GET request for teams and solo players in organization " + id
  );

  let orgData = fs.readFileSync(__dirname + "/data/organizations.json", "utf8");
  orgData = JSON.parse(orgData);

  let organization = orgData.find(
    (element) => element.OrganizationId.toLowerCase() == id.toLowerCase()
  );
  if (organization == null) {
    res.status(404).send("Organization Not Found");
    return;
  }

  let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
  data = JSON.parse(data);

  // find the matching teams for a specific organization
  let matches = data.filter(
    (element) => element.OrganizationName == organization.OrganizationName
  );

  console.log("Returned data is: ");
  console.log(matches);
  res.end(JSON.stringify(matches));
});

// GET A SPECIFIC MEMBER IN A SPECIFIC TEAM
app.get("/api/teams/:teamid/members/:memberid", function (req, res) {
  let teamId = req.params.teamid;
  let memberId = req.params.memberid;
  console.log(
    "Received a GET request for member " + memberId + " in team " + teamId
  );

  let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
  data = JSON.parse(data);

  // find the team
  let matchingTeam = data.find((element) => element.TeamId == teamId);
  if (matchingTeam == null) {
    res.status(404).send("Team Not Found");
    return;
  }

  // find the member
  let match = matchingTeam.Members.find((m) => m.MemberId == memberId);
  if (match == null) {
    res.status(404).send("Member Not Found");
    return;
  }

  console.log("Returned data is: ");
  console.log(match);
  res.end(JSON.stringify(match));
});

// GET A SPECIFIC MEMBER IN ANY TEAM
app.get("/api/member/byusername/:username", function (req, res) {
  let username = req.params.username;
  console.log("Received a GET request for member " + username);

  let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
  data = JSON.parse(data);

  // find the member
  let matchingMember = null;
  for (let i = 0; i < data.length; i++) {
    matchingMember = data[i].Members.find((m) => m.UserName == username);
    if (matchingMember != null) {
      break;
    }
  }

  if (matchingMember == null) {
    res.status(404).send("Member is not assigned to a team");
    return;
  }

  console.log("Returned data is: ");
  console.log(matchingMember);
  res.end(JSON.stringify(matchingMember));
});

// GET A SPECIFIC TEAM CONTAINING SPECIFIC MEMBER
app.get("/api/teams/containing/:username", function (req, res) {
  let username = req.params.username;
  console.log("Received a GET request for team containing member " + username);

  let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
  data = JSON.parse(data);

  // find the member
  let matchingMember = null;
  let teamIndex = -1;
  for (let i = 0; i < data.length; i++) {
    matchingMember = data[i].Members.find((m) => m.UserName == username);
    if (matchingMember != null) {
      teamIndex = i;
      break;
    }
  }

  if (matchingMember == null) {
    res.status(404).send("Member is not assigned to a team");
    return;
  }

  console.log("Returned data is: ");
  console.log(data[teamIndex]);
  res.end(JSON.stringify(data[teamIndex]));
});

// GET ALL users
app.get("/api/users", function (req, res) {
  console.log("Received a GET request for all users");

  let data = fs.readFileSync(__dirname + "/data/users.json", "utf8");
  data = JSON.parse(data);

  console.log("Returned data is: ");
  console.log(data);
  res.end(JSON.stringify(data));
});

// ADD A TEAM
app.post("/api/teams", urlencodedParser, function (req, res) {
  console.log("Received a POST request to add a team");
  console.log("BODY -------->" + JSON.stringify(req.body));

  // assemble team information so we can validate it
  let team = {
    TeamId: getNextId("team"), // assign id to team
    TeamName: req.body.TeamName,
    OrganizationName: req.body.OrganizationName,
    SponsorName: req.body.SponsorName,
    SponsorPhone: req.body.SponsorPhone,
    SponsorEmail: req.body.SponsorEmail,
    MaxTeamSize: Number(req.body.MaxTeamSize),
    Members: [],
  };

  console.log("Performing validation...");
  let errorCode = isValidTeam(team);
  if (errorCode != -1) {
    console.log("Invalid data found! Reason: " + errorCode);
    res.status(400).send("Bad Request - Incorrect or Missing Data");
    return;
  }

  let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
  data = JSON.parse(data);

  // add the team
  data.push(team);

  fs.writeFileSync(__dirname + "/data/teams.json", JSON.stringify(data));

  console.log("Team added: ");
  console.log(team);

  //res.status(201).send();
  res.end(JSON.stringify(team)); // return the new team w it's teamId
});

// EDIT A TEAM
app.put("/api/teams", urlencodedParser, function (req, res) {
  console.log("Received a PUT request to edit a team");
  console.log("BODY -------->" + JSON.stringify(req.body));

  // assemble team information so we can validate it
  let team = {
    TeamId: req.body.TeamId,
    TeamName: req.body.TeamName,
    OrganizationName: req.body.OrganizationName,
    SponsorName: req.body.SponsorName,
    SponsorPhone: req.body.SponsorPhone,
    SponsorEmail: req.body.SponsorEmail,
    MaxTeamSize: Number(req.body.MaxTeamSize),
  };

  console.log("Performing validation...");
  let errorCode = isValidTeam(team);
  if (errorCode != -1) {
    console.log("Invalid data found! Reason: " + errorCode);
    res.status(400).send("Bad Request - Incorrect or Missing Data");
    return;
  }

  let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
  data = JSON.parse(data);

  // find the team
  let match = data.find((element) => element.TeamId == req.body.TeamId);
  if (match == null) {
    res.status(404).send("Team Not Found");
    return;
  }

  // update the team
  match.TeamName = req.body.TeamName;
  match.OrganizationName = req.body.OrganizationName;
  match.SponsorName = req.body.SponsorName;
  match.SponsorPhone = req.body.SponsorPhone;
  match.SponsorEmail = req.body.SponsorEmail;

  // make sure new values for MaxTeamSize or other CUSTOm fields
  // don't conflict with members already in the team

  if (Number(req.body.MaxTeamSize) < match.Members.length) {
    res
      .status(409)
      .send("New team size too small based on current number of members");
    return;
  }
  match.MaxTeamSize = Number(req.body.MaxTeamSize);

  /*
    if ( Number(req.body.MinMemberAge) > getMinAgeOfMember(match) )
    {
        res.status(409).send("New minimum age is invalid because it conficts with current members");
		return;
    }
    match.MinMemberAge = Number(req.body.MinMemberAge);

    if ( Number(req.body.MaxMemberAge) < getMaxAgeOfMember(match) )
    {
        res.status(409).send("New maximum age is invalid because it conficts with current members");
		return;
    }
    match.MaxMemberAge = Number(req.body.MaxMemberAge);
    */

  /*
    if ( isThereAnyGenderChangeConflicts(req.body.TeamGender, match) )
    {
        res.status(409).send("Gender change conflicts with current member on team");
		return;
    }
    match.TeamGender = req.body.TeamGender,
    */

  fs.writeFileSync(__dirname + "/data/teams.json", JSON.stringify(data));

  console.log("Update successful!  New values: ");
  console.log(match);
  res.status(200).send();
});

// DELETE A TEAM
app.delete("/api/teams/:id", function (req, res) {
  let id = req.params.id;
  console.log("Received a DELETE request for team " + id);

  let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
  data = JSON.parse(data);

  // find the index number of the team in the array
  let foundAt = data.findIndex((element) => element.TeamId == id);

  // delete the team if found
  if (foundAt != -1) {
    data.splice(foundAt, 1);
  }

  fs.writeFileSync(__dirname + "/data/teams.json", JSON.stringify(data));

  console.log("Delete request processed");
  // Note:  even if we didn't find the team, send a 200 because they are gone
  res.status(200).send();
});

// ADD A MEMBER TO A TEAM
app.post("/api/teams/:id/members", urlencodedParser, function (req, res) {
  let id = req.params.id;
  console.log("Received a POST request to add a member to team " + id);
  console.log("BODY -------->" + JSON.stringify(req.body));

  // assemble member information so we can validate it
  let member = {
    MemberId: getNextId("member"), // assign new id
    MemberEmail: req.body.MemberEmail,
    MemberName: req.body.MemberName,
    UserName: req.body.UserName,
    MemberRating: Number(req.body.MemberRating),
    Fighter:
      "<img class='size' src='images/fighters/" + req.body.Fighter + "'>",
  };

  console.log("Performing member validation...");
  let errorCode = isValidMember(member);
  if (errorCode != -1) {
    console.log("Invalid data found! Reason: " + errorCode);
    res.status(400).send("Bad Request - Incorrect or Missing Data");
    return;
  }

  let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
  data = JSON.parse(data);

  // find the team
  let match = data.find((element) => element.TeamId == id);
  if (match == null) {
    res.status(404).send("Team Not Found");
    return;
  }

  // make sure assignment doesn't violate team rules
  /*
    if (member.Age < match.MinMemberAge || member.Age > match.MaxMemberAge)
    {
        res.status(409).send("Member's age is outside of bounds of team's age rules");
		return;       
    }
    */

  /*
    if (match.TeamGender != "Any" && member.MemberGender != match.TeamGender)
    {
        res.status(409).send("Member's gender does not conform to team's gender rules");
		return;       
    }
    */
  // if length of member array is at max size, will reject new member
  if (match.Members.length >= match.MaxTeamSize) {
    console.log("Member rejected, team at capacity!");
    res.status(400).send("Bad Request - Team at Capacity");
    return;
  }
  // add the member
  match.Members.push(member);

  fs.writeFileSync(__dirname + "/data/teams.json", JSON.stringify(data));

  console.log("New member added!");
  res.status(200).send();
});

// EDIT A MEMBER IN A TEAM
app.put("/api/teams/:id/members", urlencodedParser, function (req, res) {
  let id = req.params.id;
  console.log("Received a PUT request to edit a member in team " + id);
  console.log("BODY -------->" + JSON.stringify(req.body));

  // assemble member information so we can validate it
  let member = {
    MemberId: req.body.MemberId,
    MemberEmail: req.body.MemberEmail,
    MemberName: req.body.MemberName,
    UserName: req.body.UserName,
    MemberRating: req.body.MemberRating,
    Fighter: "x",
  };

  console.log("Performing member validation...");
  let errorCode = isValidMember(member);
  if (errorCode != -1) {
    console.log("Invalid data found! Reason: " + errorCode);
    res.status(400).send("Bad Request - Incorrect or Missing Data");
    return;
  }

  // find the team
  let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
  data = JSON.parse(data);

  // find the team
  let matchingTeam = data.find((element) => element.TeamId == id);
  if (matchingTeam == null) {
    res.status(404).send("Team Not Found");
    return;
  }

  // find the member
  let match = matchingTeam.Members.find((m) => m.MemberId == req.body.MemberId);
  if (match == null) {
    res.status(404).send("Member Not Found");
    return;
  }

  // update the member
  match.MemberEmail = req.body.MemberEmail;
  match.MemberName = req.body.MemberName;
  match.UserName = req.body.UserName;
  match.MemberRating = req.body.MemberRating;

  // make sure edit doesn't violate team rules

  /*
    if (match.MemberAge < matchingTeam.MinMemberAge || match.MemberAge > matchingTeam.MaxMemberAge)
    {
        res.status(409).send("Member's new age is outside of bounds of team's age rules");
		return;       
    }
    */

  /*
    if (matchingteam.teamGender != "Any" && match.MemberGender != matchingTeam.TeamGender)
    {
        res.status(409).send("Member's new gender does not conform to the team's gender rules");
		return;       
    }
    */

  fs.writeFileSync(__dirname + "/data/teams.json", JSON.stringify(data));

  console.log("Member updated!");
  res.status(200).send();
});

// DELETE A MEMBER IN A TEAM
app.delete("/api/team/:teamid/members/:memberid", function (req, res) {
  let teamId = req.params.teamid;
  let memberId = req.params.memberid;
  console.log(
    "Received a DELETE request for member " + memberId + " in team " + teamId
  );

  // find the team
  let data = fs.readFileSync(__dirname + "/data/teams.json", "utf8");
  data = JSON.parse(data);

  let matchingTeam = data.find((element) => element.TeamId == teamId);
  if (matchingTeam == null) {
    res.status(404).send("Team Not Found");
    return;
  }

  // find the member
  let foundAt = matchingTeam.Members.findIndex((m) => m.MemberId == memberId);

  // delete the member if found
  if (foundAt != -1) {
    matchingTeam.Members.splice(foundAt, 1);
  }

  fs.writeFileSync(__dirname + "/data/teams.json", JSON.stringify(data));

  console.log("Delete request processed");
  // Note:  even if we didn't find them, send a 200 back because they are gone
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

// ------------------------------------------------------------------------------
// SITE SET-UP

app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

let server = app.listen(8081, function () {
  let port = server.address().port;

  console.log("App listening at port %s", port);
});
