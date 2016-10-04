var leaf_layer;
var start_date = 1450, end_date = 1540;

var mySlider = $("#fSlider").slider({ precision: 10, value: 1450, enabled: false });
//var value = mySlider.slider('getValue');

mySlider.on('slideEnabled', function() {
  loadStreetsData();
});

mySlider.on('slideStop', function(val) {
  console.log('val: ' + val.value);
  if (leaf_layer)
    leaf_layer.clearLayers();

  if (val.value >= start_date && val.value <= end_date) {
    loadStreetsData(val);
  }
});

var KDmap = L.map('KDmap').setView([55.678, 12.575], 13);

var tile = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWVhdG9uMnZlZ2dpZXMiLCJhIjoiY2lzcmsweTVkMDA0MTJ6bXJxenc0MDVvYSJ9.SoOKdWLPa_WDpOXJ6f_FtQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'kd_map'
});
tile.addTo(KDmap)
tile.on('load', function(evt) {
  if (!mySlider.slider('isEnabled'))
    mySlider.slider('enable');
});

function loadStreetsData(val) {
  if (val == undefined) val = { value: start_date };
  $.getJSON('/map-streets/filter/' + val.value, function(result) {
      console.log('docs: ' + result.length);
      $.each(result, function(i, val) {
        $.each(val.streets, function(j, street) {
          console.log('street: ' + street.modern)
          $.getJSON('/map-streets/location/' + street.modern, function(geodata) {
            addLayer(geodata);
            if (j == val.streets.length - 1 && i == result.length - 1)
              KDmap.fitBounds(leaf_layer.getBounds());
          });
        });
      });
  });
};

function addLayer(data) {
  if (leaf_layer) {
    console.log('updating layer: ' + data);
    leaf_layer.addData(data);
  } else {
    console.log('adding layer: ' + data);
    leaf_layer = L.geoJSON(data, {
      style: {
        "color": "#ff7800",
        "weight": 5,
        "opacity": 0.65
     },
      onEachFeature: function(feature, layer) {
        console.log('feature: ' + feature.properties._id);
        layer.bindPopup(feature.properties.Gadenavn);
      }
    });
    leaf_layer.addTo(KDmap);
  }
};
