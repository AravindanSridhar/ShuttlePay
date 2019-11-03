$("document").ready(function() {
  var temp = $.ajax({
    type: "POST",
    url: "/weeklyPayments",
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
      console.log(backgroundColor);
      var ctx = document.getElementById("weeklyChart").getContext("2d");
      var myChart = new Chart(ctx, {
        type: "bar",
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
});
