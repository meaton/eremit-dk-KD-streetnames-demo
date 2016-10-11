var leaf_layer;
var streetsMap = [];
var start_date = 1450, end_date = 1540, transitionInt = 150;
var slider_opts = { precision: 10, value: 1450, enabled: false };

var mySlider = $("#fSlider").slider(slider_opts);

mySlider.on('slideEnabled', function() {
  loadStreetsData();
});

mySlider.on('slideStop', function(val) {
  if (leaf_layer)
    leaf_layer.clearLayers();

  //reset
  resetMap();

  if (val.value >= start_date && val.value <= end_date) {
    $('#filterLabel .datePeriod').text(val.value + ' - ' + (val.value + mySlider.slider('getAttribute', 'step')));
    setTimeout(loadStreetsData, 150, val);
  }
});

var KDmap = L.map('KDmap').setView([55.678, 12.575], 13);

KDmap.on('popupopen', function(popup) {});

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWVhdG9uMnZlZ2dpZXMiLCJhIjoiY2lzcmsweTVkMDA0MTJ6bXJxenc0MDVvYSJ9.SoOKdWLPa_WDpOXJ6f_FtQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'kd_map'
})
.on('load', function(evt) {
  if (!mySlider.slider('isEnabled'))
    mySlider.slider('enable');
})
.addTo(KDmap)

function loadStreetsData(val) {
  if (val == undefined)
    val = { value: start_date };

  $.getJSON('api/map-streets/get-documents/json/' + val.value, function(result) {
      $.each(result, function(i, val) {
        $.each(val.streets, function(j, street) {
          $.getJSON('api/map-streets/location/' + street.modern, function(geodata) {
            addLayer(geodata);
            if (j == val.streets.length - 1 && i == result.length - 1) {
              if ($('#fZoom').is(':checked'))
                KDmap.fitBounds(leaf_layer.getBounds());
              loadStreetDocuments(street.modern, true);
            } else
              loadStreetDocuments(street.modern);
          });
        });
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
        layer.on({
          click: onClicked
        });
      }
    });

    leaf_layer.addTo(KDmap);
  }
};

function loadStreetDocuments(street, isLast) {
  var url = 'api/map-streets/get-documents';
  var docsPartial = $('#documents .partial');

  if (!docsPartial.is(':empty') && streetsMap.length == 0)
    docsPartial.empty();

  if (isLast === undefined)
    isLast = false;

  if (streetsMap.indexOf(street) == -1) {
    streetsMap.push(street);

    if (mySlider.slider('isEnabled'))
      url = url + '/' + mySlider.slider('getValue');

    $.get(url, { street: street }).done(function(docs) {
      var hasResults = docsPartial.hasClass('results') || isLast;
      if (docs)
        addDocuments(docs, hasResults);
    });
  } else if (isLast) {
    docsPartial.addClass('results');
  }
};

function addDocuments(docRendered, isRendered) {
  var docsPartial = $('#documents .partial');
  docsPartial.append(docRendered);

  if (!$('#map-helptext').hasClass('hide'))
    $('#map-helptext').addClass('hide');

  if ($('#documents').hasClass('hide'))
    $('#documents').removeClass('hide');

  if (!docsPartial.hasClass('results') && isRendered)
    docsPartial.addClass('results');
};

function onClicked(e) {
  console.log('clicked feature: ' + e.target.feature.properties.Id);
  resetMap();
  //TODO: use filter if results are already shown (not cleared)
  setTimeout(loadStreetDocuments, transitionInt, e.target.feature.properties.Gadenavn, true);
};

$('.clearMap').on('click', function(evt) {
  resetMap();
  $('#map-helptext').removeClass('hide');
  $('#documents').addClass('hide');
});

function resetMap() {
  $('#documents .partial').removeClass('results');
  streetsMap = [];
}
