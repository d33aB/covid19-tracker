const buildChartData = data => {
  // Desired Data Format:
  // [{
  //   x: date,
  //   y: numberOfCasesOnThatDate
  // }]

  // All cases
  let chartData = [];
  let lastDataPoint;
  for (let date in data.cases) {
    if (lastDataPoint) {
      let newDataPoint = {
        x: date,
        y: data.cases[date] - lastDataPoint,
      };
      chartData.push(newDataPoint);
    }

    lastDataPoint = data.cases[date];
  }
  return chartData;
};

const buildChart = chartData => {
  var timeFormat = 'MM/DD/YY';
  var ctx = document.getElementById('myChart').getContext('2d');
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      datasets: [
        {
          label: 'New Cases Globally',
          backgroundColor: 'rgb(225,173,1, 0.3)',
          borderColor: '#e1ad01',
          data: chartData,
        },
      ],
    },

    // Configuration options go here
    options: {
      maintainAspectRatio: false,
      responsive: true,
      elements: {
        point: {
          radius: 0,
        },
      },
      legend: {
        labels: {
          fontColor: 'white',
          fontSize: 14,
        },
      },
      tooltips: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (tooltipItem, data) {
            return numeral(tooltipItem.value).format('0,0');
          },
        },
      },
      scales: {
        xAxes: [
          {
            ticks: {
              fontColor: 'white',
              fontSize: 12,
            },
            type: 'time',
            time: {
              format: timeFormat,
              tooltipFormat: 'll',
            },
            scaleLabel: {
              display: true,
            },
            gridLines: {
              color: 'white',
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              fontColor: 'white',
              fontSize: 12,
              callback: function (value) {
                return numeral(value).format('0,0');
              },
            },
            gridLines: {
              color: 'white',
            },
          },
        ],
      },
    },
  });
};

const buildPieChart = data => {
  var ctx = document.getElementById('myPieChart').getContext('2d');
  var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      datasets: [
        {
          data: [data.active, data.recovered, data.deaths],
          backgroundColor: ['#1c86ee', '#397d02', '#bf0b1c'],
        },
      ],

      // These labels appear in the legend and in the tooltips when hovering different arcs
      labels: ['Active', 'Recovered', 'Deaths'],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
    },
  });
};
