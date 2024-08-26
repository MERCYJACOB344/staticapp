var gMapObj = null;
var gMapMarker = null;
var gMapProps = null;
var mapInitialized = false;

function setMapObj(map) {
  gMapObj = map;
  if (!mapInitialized && gMapProps) {
    setMapLocation(gMapProps);
  }
}

function setMapMarker(markerObj) {
  gMapMarker = markerObj;
  /*
  if (gMapProps) {
    var latLng = {lat: markerObj.latitude, lng: markerObj.longitude};
    gMapMarker.setPosition(latLng);
  }*/
}

function setMapLocation(mapProps) {
  gMapProps = mapProps;  
  if (!gMapObj) return;
  mapInitialized = true;
  var latLng = {lat: mapProps.latitude, lng: mapProps.longitude};
  gMapObj.setCenter(latLng);
  if (gMapMarker) {
    gMapMarker.setPosition(latLng);
  }
  
}