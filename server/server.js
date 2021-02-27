const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// enable CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Hard-Coded for demo
let USERS = [{
    "email": "foobar@test.com",
    "password": "password"
  },
  {
    "email": "bizbaz@test.com",
    "password": "password123"
  }
];
let CONTACTS = [{
    "id": 1,
    "name": "Stacy Carlson",
    "email": "stacy@test.com",
    "cell": "940-046-1801",
    "birthday": "8/2/1964"
  },
  {
    "id": 2,
    "name": "Nelson Bishop",
    "email": "nelson@test.com",
    "cell": "656-098-0894",
    "birthday": "3/4/1982"
  },
  {
    "id": 3,
    "name": "Raul Hudson",
    "email": "raul@test.com",
    "cell": "437-233-4655",
    "birthday": "5/4/1967"
  },
  {
    "id": 4,
    "name": "Chad Hunt",
    "email": "chad@test.com",
    "cell": "113-135-6781",
    "birthday": "12/4/1975"
  },
  {
    "id": 5,
    "name": "Cassandra Fowler",
    "email": "cassandra@test.com",
    "cell": "388-682-2464",
    "birthday": "3/1/1957"
  },
  {
    "id": 6,
    "name": "Manuel Adams",
    "email": "manuel@test.com",
    "cell": "549-154-9132",
    "birthday": "6/1/1996"
  },
  {
    "id": 7,
    "name": "Swati Verma",
    "email": "swati@test.com",
    "cell": "321-184-9017",
    "birthday": "4/9/1989"
  },
  {
    "id": 8,
    "name": "Corey Smith",
    "email": "corey@test.com",
    "cell": "118-937-0416",
    "birthday": "2/6/1958"
  },
  {
    "id": 9,
    "name": "Colleen Willis",
    "email": "colleen@test.com",
    "cell": "362-663-0461",
    "birthday": "4/1/1981"
  }
];

app.post('/login', (req, res) => {
  console.log('Login:');
  console.log(`${req.body.email}, ${req.body.password}`);

  let existingUser = USERS.filter((user) => user.email === req.body.email && user.password === req.body.password);

  if (existingUser.length == 1) {
    res.json({
      success: true
    });
  } else {
    res.json({
      success: false
    });
  }
});

app.post('/register', (req, res) => {
  console.log('Register:');
  console.log(req.body.email);

  let existingUser = USERS.filter((user) => user.email === req.body.email);

  if (existingUser.length == 0) {
    res.json({
      success: true
    });
  } else {
    res.json({
      success: false
    });
  }
});

app.post('/contact', (req, res) => {
  console.log('Adding Contact:');
  console.log(`${req.body.name}, ${req.body.email}, ${req.body.cell}, ${req.body.birthday}`);

  let existingContact = CONTACTS.filter((contact) => contact.email === req.body.email || contact.cell === req.body.cell);

  if (existingContact.length == 0) {
    CONTACTS.push({
      "id": CONTACTS.length + 1,
      "name": req.body.name,
      "email": req.body.email,
      "cell": req.body.cell,
      "birthday": req.body.birthday
    });
    res.json({
      success: true
    });
  } else {
    res.json({
      success: false
    });
  }
});

app.get('/users', (req, res) => {
  res.json({
    users: USERS
  });
});

app.get('/contacts', (req, res) => {
  res.json({
    contacts: CONTACTS
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000.');
});