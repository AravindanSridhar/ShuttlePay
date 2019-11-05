$("document").ready(function() {
  // Weekly Payments Data AJAX
  var temp = $.ajax({
    type: "POST",
    url: "/api/weeklyPayments",
    success: function(result) {
      var labels = [];
      var dataPoints = [];
      var backgroundColor = [];
      var weekdays = new Array(7);
      weekdays[0] = "Sunday";
      weekdays[1] = "Monday";
      weekdays[2] = "Tuesday";
      weekdays[3] = "Wednesday";
      weekdays[4] = "Thursday";
      weekdays[5] = "Friday";
      weekdays[6] = "Saturday";
      for (i = 0; i < result.data.length; ++i) {
        var d = new Date(result.data[i].day);
        labels.push(weekdays[d.getDay()]);
        dataPoints.push(result.data[i].count);
        if (d.getDay() == 0 || d.getDay() == 6) {
          backgroundColor.push("grey");
        } else {
          backgroundColor.push("#FFA500");
        }
      }
      var ctx = document.getElementById("weeklyChart").getContext("2d");
      var myChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "non-working days",
              data: dataPoints,
              backgroundColor: backgroundColor
            }
          ]
        },
        options: {
          title: {
            display: true,
            text: "Week's Payments"
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true
                }
              }
            ]
          }
        }
      });
    }
  });

  // Route Usage Data AJAX
  var temp2 = $.ajax({
    type: "POST",
    url: "/api/routeUsage",
    success: function(result) {
      var labels = ["SJT - Main Gate", "Mens' Hostel"];
      var dataPoints = [result.data[0].count, result.data[1].count];
      var backgroundColor = ["#FFA500", "grey"];
      var ctx = document.getElementById("routeUsageChart").getContext("2d");
      var myChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [
            {
              label: "# of payments",
              data: dataPoints,
              backgroundColor: backgroundColor
            }
          ]
        },
        options: {
          title: {
            display: true,
            text: "Route Usage"
          }
        }
      });
    }
  });

  // Average Waiting Time Data AJAX
  var temp3 = $.ajax({
    type: "POST",
    url: "/api/averageWaitingTime",
    success: function(result) {
      console.log(result);
      var labels = [
        result.data[0].stop.toUpperCase(),
        result.data[1].stop.toUpperCase()
      ];
      var dataPoints = [result.data[0].avg, result.data[1].avg];
      var backgroundColor = ["#FFA500", "#FFA500"];
      var ctx = document
        .getElementById("averageWaitingTimeChart")
        .getContext("2d");
      var myChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Waiting Time in Seconds",
              data: dataPoints,
              backgroundColor: backgroundColor
            }
          ]
        },
        options: {
          title: {
            display: true,
            text: "Average Waiting Time"
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true
                }
              }
            ]
          }
        }
      });
    }
  });
});
