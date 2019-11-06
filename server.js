//Includes
var express = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql");
var path = require("path");
var crypto = require("crypto");
var dbJSON = require("./security/db.json");
var geolib = require("geolib");
var dateFormat = require("dateformat");
var moment = require("moment");

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

// Fetch single user profile
server.post("/api/fetchProfile", function(req, res) {
  console.log("/fetchProfile");
  let sql =
    'SELECT users.* FROM users WHERE users.regNo = "' + req.body.regNo + '";';
  con.query(sql, function(err, result) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      res.send(result[0]);
    }
  });
});

// Fetch single driver profile
server.post("/api/fetchDriverProfile", function(req, res) {
  console.log("/fetchDriverProfile");
  let sql =
    'SELECT drivers.* FROM drivers WHERE drivers.driverID = "' +
    req.body.driverID +
    '";';
  con.query(sql, function(err, result) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      res.send(result[0]);
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
  console.log("/fetchCabsLocation" + Math.random());
  let sql = "SELECT * FROM cabs;";
  con.query(sql, function(err, result) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      res.send(result);
    }
  });
});

// Authenticate a user login
server.post("/api/authLogin", function(req, res) {
  console.log("User login");
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

// Authenticate a driver login
server.post("/api/authDriverLogin", function(req, res) {
  console.log("Driver Login" + req.body.pwd);
  let driverID = req.body.driverID;
  let pwd = req.body.pwd;
  var pwdHash = crypto
    .createHash("sha256")
    .update(pwd, "utf8")
    .digest("hex");
  let sql = 'SELECT pwd FROM drivers WHERE driverID = "' + driverID + '";';
  con.query(sql, function(err, result) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      if (result.length == 0) {
        res.send({ status: "-1" });
      } else {
        if (result[0].pwd == pwdHash) res.send({ status: "1" });
        else res.send({ status: "0" });
      }
    }
  });
});

//Update Cabs Location from Android app
server.post("/api/updateCabsLocation", function(req, res) {
  var cabID = req.body.cabID;
  var lat = req.body.lat;
  var long = req.body.long;
  console.log("Gokul");
  var sjt = { latitude: 12.971695, longitude: 79.163428 };
  var tt = { latitude: 12.971115, longitude: 79.159427 };

  let sql1 = "SELECT isAT FROM cabs WHERE cabID = " + cabID;
  let sql2 = "";

  var isAtSjt = geolib.isPointWithinRadius(
    sjt,
    { latitude: lat, longitude: long },
    15
  );
  var isAtTt = geolib.isPointWithinRadius(
    tt,
    { latitude: lat, longitude: long },
    15
  );

  con.query(sql1, function(err, result) {
    if (err) {
      throw err;
    } else {
      //When not at any building
      if (result[0].isAT == null) {
        var pos = "";
        if (isAtSjt) {
          //On transit to SJT
          sql2 =
            'UPDATE cabs SET gpsLatitude = "' +
            lat +
            '", gpsLongitude = "' +
            long +
            '", isAT = "sjt", analyticsTimestamp ="' +
            dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") +
            '" WHERE cabID = ' +
            cabID +
            ";";
          console.log(sql2);
        } else if (isAtTt) {
          //On transit to TT
          sql2 =
            'UPDATE cabs SET gpsLatitude = "' +
            lat +
            '", gpsLongitude = "' +
            long +
            '", isAT = "tt", analyticsTimestamp ="' +
            dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") +
            '" WHERE cabID = ' +
            cabID +
            ";";
        } else {
          //On transit to On transit
          sql2 =
            'UPDATE cabs SET gpsLatitude = "' +
            lat +
            '", gpsLongitude = "' +
            long +
            '", isAT = NULL, analyticsTimestamp = NULL WHERE cabID = ' +
            cabID +
            ";";
        }
        con.query(sql2, function(err, result) {
          if (err) {
            res.send({ status: "error" });
            throw err;
          } else {
            res.send({ status: "success" });
          }
        });
      } else if (isAtSjt || isAtTt) {
        //Building to same Building within 15meters
        let sql2 =
          'UPDATE cabs SET gpsLatitude = "' +
          lat +
          '", gpsLongitude = "' +
          long +
          '" WHERE cabID = ' +
          cabID +
          ";";
        con.query(sql2, function(err, result) {
          if (err) {
            res.send({ status: "error" });
            throw err;
          } else {
            res.send({ status: "success" });
          }
        });
      } else {
        //Building to On Transit
        let sql2 =
          "SELECT analyticsTimestamp,isAT FROM cabs WHERE cabID = " + cabID;
        con.query(sql2, function(err, result) {
          if (err) {
            res.send({ status: "error" });
            throw err;
          } else {
            //Calculating Waiting Time
            var cabStop = moment(
              result[0].analyticsTimestamp,
              "YYYY-MM-DD HH:mm:ss"
            );
            var cabStart = moment(
              dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
            );
            var stop = result[0].isAT;
            var secondsDiff = cabStart.diff(cabStop, "seconds");
            sql2 =
              'UPDATE cabs SET gpsLatitude = "' +
              lat +
              '", gpsLongitude = "' +
              long +
              '", isAT = NULL, analyticsTimestamp = NULL WHERE cabID = ' +
              cabID +
              ";";
            con.query(sql2, function(err, result) {
              if (err) {
                res.send({ status: "error" });
                throw err;
              } else {
                sql3 =
                  "INSERT INTO cabanalytics (cabID, waitingTime, stop) VALUES (" +
                  cabID +
                  "," +
                  secondsDiff +
                  ',"' +
                  stop +
                  '")';
                con.query(sql3, function(err, result) {
                  if (err) {
                    res.send({ status: "error" });
                    throw err;
                  } else {
                    res.send({ status: "success" });
                  }
                });
              }
            });
          }
        });
      }
    }
  });
});

// Recharge handler for Android App
server.post("/api/makeTransaction", function(req, res) {
  console.log(req.body);
  var status = req.body.status;
  var regNo = req.body.regNo;
  var timestamp = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
  var amount = req.body.amount;
  var paymentID = req.body.paymentID;
  let sql = "SELECT balance FROM users WHERE regNo = '" + regNo + "'";
  con.query(sql, function(err, result1) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      var latest = parseInt(result1[0].balance) + parseInt(amount);
      console.log(latest + "  " + result1[0].balance + "  " + amount);
      let sqlUp =
        "UPDATE users SET balance = " +
        latest +
        " WHERE regNo = '" +
        regNo +
        "';";
      con.query(sqlUp, function(err, result2) {
        if (err) {
          res.send({ status: "error" });
          throw err;
        } else {
          let sqlLast =
            "INSERT INTO transactions(status,regNo,timestamp,amount,paymentID) VALUES(" +
            status +
            ",'" +
            regNo +
            "','" +
            timestamp +
            "'," +
            amount +
            ",'" +
            paymentID +
            "');";
          con.query(sqlLast, function(err, result3) {
            if (err) {
              res.send({ status: "error" });
              throw err;
            } else {
              res.send({ status: "success" });
            }
          });
        }
      });
    }
  });
});

server.post("/api/pay", function(req, res) {
  console.log("Got it");
  var rfuid = req.body.rfuid;
  var timestamp = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
  var cabID = req.body.cabID;
  var routeID = req.body.routeID;
  let sql = "SELECT regNo,balance FROM users WHERE rfuid = '" + rfuid + "';";
  con.query(sql, function(err, result) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      var regNo = result[0].regNo;
      var balance = result[0].balance;
      if (parseInt(balance) < 15) {
        res.send({ status: "Low Balance" });
      } else {
        var newBalance = parseInt(balance) - parseInt("15");
        console.log("New Balance : " + newBalance);
        let sql1 =
          "UPDATE users SET balance = " +
          newBalance +
          " WHERE regNo = '" +
          regNo +
          "';";
        con.query(sql1, function(err, result1) {
          if (err) {
            res.send({ status: "error" });
            throw err;
          } else {
            console.log("Making payments");
            let sql2 =
              "INSERT INTO payments (cabID,regNo,timestamp,routeID,amount) VALUES ('" +
              cabID +
              "','" +
              regNo +
              "','" +
              timestamp +
              "','" +
              routeID +
              "',15);";
            con.query(sql2, function(err, result2) {
              if (err) {
                res.send({ status: "error" });
                throw err;
              } else {
                res.send({ status: "Paid", balance: balance });
              }
            });
          }
        });
      }
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
//Analytics AJAX Routes =================================================================

server.post("/api/weeklyPayments", function(req, res) {
  let sql =
    "SELECT DISTINCT DATE(timestamp) as day, COUNT(payID) as count FROM payments WHERE timestamp >DATE_SUB(now(), INTERVAL 1 WEEK) GROUP BY DATE(timestamp) ORDER BY DATE(timestamp)";
  con.query(sql, function(err, result) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      var weekly = {};
      weekly.status = "success";
      weekly.data = result;
      res.send(weekly);
    }
  });
});

server.post("/api/routeUsage", function(req, res) {
  let sql = "SELECT routeID, COUNT(*) AS count FROM payments GROUP BY routeID;";
  con.query(sql, function(err, result) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      var routes = {};
      routes.status = "success";
      routes.data = result;
      res.send(routes);
    }
  });
});

server.post("/api/averageWaitingTime", function(req, res) {
  let sql =
    "SELECT DISTINCT stop, avg(waitingTime) as avg FROM cabanalytics GROUP BY stop;";
  con.query(sql, function(err, result) {
    if (err) {
      res.send({ status: "error" });
      throw err;
    } else {
      var avg = {};
      avg.status = "success";
      avg.data = result;
      res.send(avg);
    }
  });
});

//End of AJAX Routes ====================================================================
//-------------------------------------------------------------------------------------
//Server Startup and Listen ======================================================
require("dns").lookup(require("os").hostname(), function(err, add, fam) {
  ip = add;
  server.listen(server.get("port"), function() {
    console.log(
      "Shuttle Pay Server started at : " + Date() + " at port : " + ip
    );
  });
});
