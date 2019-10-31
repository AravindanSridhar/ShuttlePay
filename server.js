//Includes
var express = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql");
var path = require("path");
var crypto = require("crypto");
let dbJSON = require("./security/db.json");

//Server Initialization ================================================================
var server = express();

//Server Port specification
server.set("port", process.env.PORT || 5000);

//Body Parser
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
//Static Files
server.use(express.static(path.join(__dirname, "/public")));
//EJS View engine
server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));

//DB Connection
var con = mysql.createConnection(dbJSON);

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to MySQL DB!");
});

//Connection Reset Handler
setInterval(function() {
  con.query("SELECT 1");
}, 10000);

//End of Initialization ================================================================
//-------------------------------------------------------------------------------------
//Start of Server API Handlers===========================================================================

// Fetch single user profile along with latest transaction details
server.post("/api/fetchProfile", function(req, res) {
  let sql =
    'SELECT users.*, transactions.* FROM users INNER JOIN transactions ON users.latestTranID = transactions.transactionID WHERE users.regNo = "' +
    req.body.regNo +
    '";';
  con.query(sql, function(err, result) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      var profile = {};
      profile.status = "success";
      profile.data = result;
      res.send(profile);
    }
  });
});

// Fetch single user's transaction history
server.post("/api/fetchTransactionHistory", function(req, res) {
  let sql =
    'SELECT * FROM transactions WHERE regNo = "' + req.body.regNo + '";';
  con.query(sql, function(err, result) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      var history = {};
      history.status = "success";
      history.data = result;
      res.send(history);
    }
  });
});

// Fetch cabs' location
server.post("/api/fetchCabsLocation", function(req, res) {
  let sql = "SELECT * FROM cabs;";
  con.query(sql, function(err, result) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      var cabs = {};
      cabs.status = "success";
      cabs.data = result;
      res.send(cabs);
    }
  });
});

// Authenticate a user login
server.post("/api/authLogin", function(req, res) {
  let regNo = req.body.regNo;
  let pwd = req.body.pwd;
  var pwdHash = crypto
    .createHash("sha256")
    .update(pwd, "utf8")
    .digest("hex");
  let sql = 'SELECT password FROM users WHERE regNo = "' + regNo + '";';
  con.query(sql, function(err, result) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      if (result.length == 0) {
        res.send({ status: "-1" });
      } else {
        if (result[0].password == pwdHash) res.send({ status: "1" });
        else res.send({ status: "0" });
      }
    }
  });
});

server.post("/api/updateCabsLocation", function(req, res) {
  var cabID = req.body.cabID;
  var lat = req.body.lat;
  var long = req.body.long;
  let sql =
    'UPDATE cabs SET gpsLatitude = "' +
    lat +
    '", gpsLongitude = "' +
    long +
    '" WHERE cabID = ' +
    cabID +
    ";";
  con.query(sql, function(err, result) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      res.send({ status: "success" });
    }
  });
});

//End of Server API Handlers ===============================================================
//-------------------------------------------------------------------------------------
//Start of Dashboard Routes ===============================================================

server.get("/dashboard", function(req, res) {
  res.render("dashboard");
});

server.get("/analytics", function(req, res) {
  res.render("cabAnalytics");
});

server.get("/cabs", function(req, res) {
  let sql = "SELECT * FROM cabs;";
  con.query(sql, function(err, result) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      res.render("cabs", { cabs: result });
    }
  });
});

server.get("/users", function(req, res) {
  let sql = "SELECT * FROM users;";
  con.query(sql, function(err, result) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      res.render("users", { users: result });
    }
  });
});

//End of Dashboard Routes ===============================================================
//-------------------------------------------------------------------------------------
//Server Startup and Listen ======================================================
require("dns").lookup(require("os").hostname(), function(err, add, fam) {
  ip = add;
  server.listen(5000, function() {
    console.log(
      "Shuttle Pay Server started at : " + Date() + " at port : " + ip
    );
  });
});
