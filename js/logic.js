// Se cargan las URLs de nuestra API 
var API_quakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
// Se carga la liga en caso cuando se publique el sitio
//var API_plates = "../GeoJson/PB2002_boundaries.json"
//Se toma el JSON que esta publico de acuerdo al gitlab 
var API_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
// Funcion para establecer un ponderado del tamaño del radio
function markerSize(magnitude) {
    return magnitude * 3;
};

// Se define la funcion para dar color a los circulos
function Color(magnitude) {
  if (magnitude > 5) { return 'red' } 
  else if (magnitude > 4) { return 'darkorange' } 
  else if (magnitude > 3) { return 'coral' } 
  else if (magnitude > 2) { return 'yellow' } 
  else if (magnitude > 1) { return 'darkgreen' } 
  else { return 'lightgreen' }
};

// Se inicializa el Layer de terremotos
var earthquakes = new L.LayerGroup();

// Se obtiene la información del JSON para terremotos
d3.json(API_quakes, function (geoJson) {
    // Se crean los circulos en base a la información del GeoJson
    L.geoJSON(geoJson.features, {
        pointToLayer: function (geoJsonPoint, latlng) {
            return L.circleMarker(latlng, { radius: markerSize(geoJsonPoint.properties.mag) });
        },
        // Se da formato a los circulos
        style: function (geoJsonFeature) {
            return {
                fillColor: Color(geoJsonFeature.properties.mag),
                fillOpacity: 0.8,
                weight: 0.2,
                color: 'black'
            }
        },
        //Se coloca el formato en cada uno de las leyendas en los puntos
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "<h3 style='text-align:center;'>" + feature.properties.place + "</h3>" 
              + "<hr><p>" + new Date(feature.properties.time) + "</p>" 
              + "<h5 style='text-align:center;'>" + feature.properties.title + "</h5>" 
              + "<hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    }).addTo(earthquakes);
    // Se crea el mapa
    createMap(earthquakes);
});

// Se inicializa el Layer de placas tectonocas
var plateBoundary = new L.LayerGroup();

// Se obtiene la información del JSON para placas tectonicas
d3.json(API_plates, function (geoJson) {
    // Se define el estilo de la linea de las placas tectonicas
    L.geoJSON(geoJson.features, {
        style: function (geoJsonFeature) {
            return {
                weight: 2,
                color: 'brown'
            }
        },
    }).addTo(plateBoundary);
})

// Se crean los Layer para cada estilo de mapa
function createMap() {
  // Se crea un Layer con el formato High Contrast
  var highContrastMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.high-contrast',
      accessToken: API_KEY
  });
  // Se crea un Layer con el formato Streets
  var streetMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: API_KEY
  });
  // Se crea un Layer con el formato Dark Map
  var darkMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.dark',
      accessToken: API_KEY
  });
  // Se crea un Layer con el formato Satellite
  var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.satellite',
      accessToken: API_KEY
  });
  // Se crea un base con todos los layers
  var baseLayers = {
      "High Contrast": highContrastMap,
      "Street": streetMap,
      "Dark": darkMap,
      "Satellite": satellite
  };
  // Se crea un base con todos los layers
  var overlays = {
      "Earthquakes": earthquakes,
      "Plate Boundaries": plateBoundary,
  };

  // Se configura el mapa con los layers principales, centrado y con el zoom correspondiente 
  var map = L.map('map', {
      center: [40, -99],
      zoom: 4,
      layers: [streetMap, earthquakes, plateBoundary]
  });

  // Se agregan los controles correspondientes al mapa para activar o desactivar los layers
  L.control.layers(baseLayers, overlays).addTo(map);

  // Se instancian las leyendas
  var legend = L.control({ position: 'bottomright' });

  // Se agregan las leyendas donde se define la información de los terremotos
  legend.onAdd = function (map) {  
    var div = L.DomUtil.create('div', 'info legend'),
    magnitude = [1, 2, 3, 4, 5, 6];
    title = ['0-1', '>1', '>2', '>3', '>4', '>5'];

    div.innerHTML += "<h4>Magnitude</h4>"

    for (var i = 0; i < magnitude.length; i++) {
        div.innerHTML +=
        '<i style="background:' + Color(magnitude[i]) + ';">' + title[i] + '</i>';
        console.log(magnitude[i + 1]);
    }
    return div;
  };
  legend.addTo(map);
}