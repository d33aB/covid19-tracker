window.onload = () => {
  getCountriesData();
  getHistoricalData();
  getWorldCoronaData();
};

// Get the map
var map;
var infoWindow;
let coronaGlobalData;
let mapCircles = [];
const worldwideSelection = {
  name: `<i class="fas fa-globe"></i> Worldwide`,
  value: 'www',
  selected: true,
};

var casesTypeColors = {
  cases: '#e1ad01',
  todayCases: '#ffc0cb',
  active: '#1c86ee',
  recovered: '#397d02',
  deaths: '#bf0b1c',
  testsPerOneMillion: '#d93c7a',
};

const mapCenter = {
  lat: 38.80746,
  lng: -46.4796,
};

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: mapCenter,
    zoom: 2,
    // Disable zoom etc from map
    disableDefaultUI: true,
    styles: mapStyle,
  });
  infoWindow = new google.maps.InfoWindow();
}

const changeDataSelection = (elem, casesType) => {
  clearMap();
  showDataOnMap(coronaGlobalData, casesType);
  setActiveTab(elem);
};

const setActiveTab = elem => {
  const activeElement = document.querySelector('.card.active');
  activeElement.classList.remove('active');
  elem.classList.add('active');
};

const clearMap = () => {
  for (let circle of mapCircles) {
    circle.setMap(null);
  }
};

const setMapCenter = (lat, long, zoom) => {
  map.setZoom(zoom);
  map.panTo({
    lat: lat,
    lng: long,
  });
};
const initDropdown = searchList => {
  $('.ui.dropdown').dropdown({
    values: searchList,
    onChange: function (value, text) {
      if (value != worldwideSelection.value) {
        getCountryData(value);
      } else {
        getWorldCoronaData();
      }
    },
  });
};

const setSearchList = data => {
  let searchList = [];
  searchList.push(worldwideSelection);
  data.forEach(countryData => {
    searchList.push({
      name: `<img src="${countryData.countryInfo.flag}"> ${countryData.country}`,
      value: countryData.countryInfo.iso3,
    });
  });
  initDropdown(searchList);
};

// Get the country data from the API
const getCountriesData = () => {
  // fetch('http://localhost:3001/countries')
  fetch('https://corona.lmao.ninja/v2/countries')
    .then(response => {
      return response.json();
    })
    .then(data => {
      coronaGlobalData = data;
      setSearchList(data);
      showDataOnMap(data);
      showDataInTable(data);
      showDataInCarousel(data);
    });
};

const getWorldCoronaData = () => {
  fetch('https://disease.sh/v2/all')
    .then(response => {
      return response.json();
    })
    .then(data => {
      setStatsData(data);
      setMapCenter(mapCenter.lat, mapCenter.lng, 2);
      buildPieChart(data);
    });
};

const getCountryData = countryIso => {
  const url = 'https://disease.sh/v3/covid-19/countries/' + countryIso;
  fetch(url)
    .then(response => {
      return response.json();
    })
    .then(data => {
      setMapCenter(data.countryInfo.lat, data.countryInfo.long, 5);
      setStatsData(data);
      var test = new google.maps.Marker({
        position: { lat: -25.363, lng: 131.044 },
        map: map,
      });
      test.addListener('click', function () {
        infoWindow.open(map, test);
      });
    });
};

const setStatsData = data => {
  let casesWorldwide = numeral(data.todayCases).format('+0,0');
  let totalCases = numeral(data.cases).format('0.0a');
  let activeCases = numeral(data.active).format('0,0');
  let recoveredToday = numeral(data.todayRecovered).format('+0,0');
  let recoveredCases = numeral(data.recovered).format('0.0a');
  let deathsToday = numeral(data.todayDeaths).format('+0,0');
  let deathCases = numeral(data.deaths).format('0.0a');
  document.querySelector('.total-number').innerHTML = casesWorldwide;
  document.querySelector('.total-worldwide').innerHTML = `${totalCases} Total`;
  document.querySelector('.active-number').innerHTML = activeCases;
  document.querySelector('.recovered-number').innerHTML = recoveredToday;
  document.querySelector(
    '.recovered-total'
  ).innerHTML = `${recoveredCases} Total`;
  document.querySelector('.deaths-number').innerHTML = deathsToday;
  document.querySelector('.deaths-total').innerHTML = `${deathCases} Total`;
};

const getHistoricalData = () => {
  fetch('https://corona.lmao.ninja/v2/historical/all?lastdays=120')
    .then(response => {
      return response.json();
    })
    .then(data => {
      let chartData = buildChartData(data);
      buildChart(chartData);
    });
};

const openInfoWindow = () => {
  infoWindow.open(map);
};

// Show data on map
const showDataOnMap = (data, casesType = 'cases') => {
  data.map(country => {
    let countryCenter = {
      lat: country.countryInfo.lat,
      lng: country.countryInfo.long,
    };

    var countryCircle = new google.maps.Circle({
      strokeColor: 'orange',
      strokeOpacity: 0.2,
      strokeWeight: 2,
      fillColor: casesTypeColors[casesType],
      fillOpacity: 0.7,
      map: map,
      center: countryCenter,
      radius: country[casesType],
    });

    mapCircles.push(countryCircle);

    // Define country data from API in a html variable
    var html = `
      <div class="info-container">
        <div class="info-flag" style="background-image: url(${
          country.countryInfo.flag
        });">
        </div>
        <div class="info-name">
          ${country.country}
        </div>
        <div class="info-confirmed">
          Total: ${numeral(country.cases).format('0,0')}
        </div>
        <div class="info-active">
          Active: ${numeral(country.active).format('0,0')}
        </div>
        <div class="info-recovered">
          Recovered: ${numeral(country.recovered).format('0,0')}
        </div>
        <div class="info-deaths">
          Deaths: ${numeral(country.deaths).format('0,0')}
        </div>
      </div>
    `;

    // Define pop-up info window for all countries
    var infoWindow = new google.maps.InfoWindow({
      content: html,
      position: countryCircle.center,
    });

    // Create info window on hover
    google.maps.event.addListener(countryCircle, 'mouseover', function () {
      infoWindow.open(map);
    });

    // Close info window when mouse not in the circle
    google.maps.event.addListener(countryCircle, 'mouseout', function () {
      infoWindow.close();
    });
  });
};

// Store data in table
const showDataInTable = data => {
  var html = '';
  data.forEach(country => {
    html += `
    <tr>
      <td><img class="table-flag" src=${country.countryInfo.flag}></td>
      <td>${country.country}</td>
      <td>${numeral(country.cases).format('0,0')}</td>
      <td>${numeral(country.active).format('0,0')}</td>
      <td>${numeral(country.recovered).format('0,0')}</td>
      <td>${numeral(country.deaths).format('0,0')}</td>
    </tr>
    `;
  });
  document.getElementById('table-data').innerHTML = html;
};

// Today's news
const showDataInCarousel = data => {
  let newHtml = '';
  data.forEach(country => {
    newHtml += `
      <div class="carousel-item">
        <div class="row">
          <div class="col-6">
            <img class="d-block w-100 flag" src=${country.countryInfo.flag} alt=${country.country}>
          </div>
          <div class="col-6">
            <h5 class="text-warning text-center py-5">${country.todayCases} new cases in ${country.country} today!</h5>
          </div>
        </div>
      </div>
    `;
  });

  document.getElementById('carouselInner').innerHTML = newHtml;
  const element = document.getElementsByClassName('carousel-item')[0];
  element.classList.add('active');
};
