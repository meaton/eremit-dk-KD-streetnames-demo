var mySlider = $("#fSlider").slider({ precision: 10, value: 1450 });
var leaf_layer;

mySlider.on('slideStop', function(val) {
  console.log('val: ' + val.value);
  if (leaf_layer) leaf_layer.clearLayers();
  if (val.value >= 1450 && val.value <= 1550) {
    $.getJSON('/map-streets/filter/' + val.value, function(result) {
        console.log('docs: ' + result.length);
        $.each(result, function(i, val) {
          console.log('no streets: ' + val.streets)
          $.each(val.streets, function(j, street) {
            console.log('street: ' + street.modern)
            $.getJSON('/map-streets/location/' + street.modern, function(result) {
              addLayer(result);
            });
          });
        });
    });
  }
});

var value = mySlider.slider('getValue');

var KDmap = L.map('KDmap').setView([55.678, 12.575], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWVhdG9uMnZlZ2dpZXMiLCJhIjoiY2lzcmsweTVkMDA0MTJ6bXJxenc0MDVvYSJ9.SoOKdWLPa_WDpOXJ6f_FtQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'kd_map'
}).addTo(KDmap);

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

  KDmap.fitBounds(leaf_layer.getBounds());
};
