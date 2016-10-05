  var leaf_layer;
var start_date = 1450, end_date = 1540;

var mySlider = $("#fSlider").slider({ precision: 10, value: 1450, enabled: false });
//var value = mySlider.slider('getValue');

mySlider.on('slideEnabled', function() {
  loadStreetsData();
});

mySlider.on('slideStop', function(val) {
  if (leaf_layer)
    leaf_layer.clearLayers();

  if (val.value >= start_date && val.value <= end_date) {
    loadStreetsData(val);
  }
});

var KDmap = L.map('KDmap').setView([55.678, 12.575], 13);

KDmap.on('popupopen', function(popup) {
  console.log('popup opened');
});

var tile = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWVhdG9uMnZlZ2dpZXMiLCJhIjoiY2lzcmsweTVkMDA0MTJ6bXJxenc0MDVvYSJ9.SoOKdWLPa_WDpOXJ6f_FtQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'kd_map'
}).on('load', function(evt) {
  if (!mySlider.slider('isEnabled'))
    mySlider.slider('enable');
}).addTo(KDmap)

function loadStreetsData(val) {
  if (val == undefined) val = { value: start_date };
  $.getJSON('/map-streets/filter/' + val.value, function(result) {
      $.each(result, function(i, val) {
        $.each(val.streets, function(j, street) {
          $.getJSON('/map-streets/location/' + street.modern, function(geodata) {
            addLayer(geodata);
            if (j == val.streets.length - 1 && i == result.length - 1)
              if ($('#fZoom').is(':checked')) KDmap.fitBounds(leaf_layer.getBounds());
          });
        });
      });
  });
};

function onClicked(e) {
  console.log('clicked feature: ' + e.target.feature.properties.Id);
  $('#documents').empty();
  $.each(e.target.feature.properties.References, function(i, ref) { //TODO: Search by street (modern) match
    console.log('ref: ' + ref);
    $.get('/map-streets/document/' + ref, { street: e.target.feature.properties.Gadenavn }).done(function(doc) {
      addDocument(doc);
    });
  });
};

function addLayer(data) {
  if (leaf_layer) {
    leaf_layer.addData(data);
  } else {
    leaf_layer = L.geoJSON(data, {
      style: {
        "color": "#ff7800",
        "weight": 5,
        "opacity": 0.65
     },
      onEachFeature: function(feature, layer) {
        layer.bindTooltip(feature.properties.Gadenavn);
        //layer.bindPopup(feature.properties.Gadenavn);
        layer.on({
          click: onClicked
        });
      }
    });
    leaf_layer.addTo(KDmap);
  }
};

function addDocument(docRendered) {
  $('#documents').append(docRendered);
};
