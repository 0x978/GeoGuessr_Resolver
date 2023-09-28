// ==UserScript==
// @name         geoGuessr
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Features: Automatically score 5000 Points | Score randomly between 4500 and 5000 points | Open in Google Maps
// @author       Harry Hopkinson
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        none
// ==/UserScript==

let loopCount = 0;
let cancelXpFarm = false;

async function getAddress(lat, lon) {
  let response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
  );
  return await response.json();
}

function displayLocationInfo() {
  let coordinates = getCoordinates();
  getAddress(coordinates[0], coordinates[1]).then((data) => {
    let locationInfo = `
Country: ${data.address.country}
County: ${data.address.county}
City: ${data.address.city}
Road: ${data.address.road}
State: ${data.address.state}
Postcode: ${data.address.postcode}
Village/Suburb: ${data.address.village || data.address.suburb}

Postal Address: ${data.display_name}
`;
    sendLocationToServer(locationInfo);
  });
}

function sendLocationToServer(locationInfo) {
  const url = "http://localhost:8080/save-location";

  fetch(url, {
    method: "POST",
    body: JSON.stringify({ locationInfo }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function placeMarker(safeMode) {
  let [lat, lng] = getCoordinates();
  if (
    document.getElementsByClassName("guess-map__canvas-container")[0] ===
    undefined
  ) {
    // if this is not defined, the user must be in a streaks game, streaks mode uses a different map and therefore is calculated in a different function
    placeMarkerStreaksMode([lat, lng]);
    return;
  }

  if (safeMode) {
    lat += Math.random() / 2;
    lng += Math.random() / 2;
  }

  let element = document.getElementsByClassName(
    "guess-map__canvas-container"
  )[0]; // html element containing needed props.
  let keys = Object.keys(element); // all keys
  let key = keys.find((key) => key.startsWith("__reactFiber$")); // the React key I need to access props
  let placeMarker = element[key].return.memoizedProps.onMarkerLocationChanged; // getting the function which will allow me to place a marker on the map

  placeMarker({ lat: lat, lng: lng }); // placing the marker on the map at the correct coordinates given by getCoordinates(). Must be passed as an Object.
}

function placeMarkerStreaksMode([lat, lng]) {
  let element = document.getElementsByClassName("region-map_map__7jxcD")[0]; // this map is unique to streaks mode, however, is similar to that found in normal modes.
  let keys = Object.keys(element);
  let reactKey = keys.find((key) => key.startsWith("__reactFiber$"));
  let placeMarkerFunction =
    element[reactKey].return.memoizedProps.onRegionSelected; // This map works by selecting regions, not exact coordinates on a map, which is handles by the "onRegionSelected" function.

  // the onRegionSelected method of the streaks map doesn't accept an object containing coordinates like the other game-modes.
  // Instead, it accepts the country's 2-digit IBAN country code.
  // For now, I will pass the location coordinates into an API to retrieve the correct Country code, but I believe I can find a way without the API in the future.
  // TODO: find a method without using an API since the API is never guaranteed.

  getAddress(lat, lng).then((data) => {
    // using API to retrieve the country code at the current coordinates.
    let countryCode = data.address.country_code;
    placeMarkerFunction(countryCode); // passing the country code into the onRegionSelected method.
  });
}

// detects game mode and return appropriate coordinates.
function getCoordinates() {
  let x = document.getElementsByClassName("styles_root__3xbKq")[0];
  let keys = Object.keys(x);
  let key = keys.find((key) => key.startsWith("__reactFiber$"));
  let props = x[key];
  let found = props.return.memoizedProps.panorama.position;

  return [found.lat(), found.lng()]; // lat and lng are functions returning the lat/lng values
}

function mapsFromCoords() {
  // opens new Google Maps location using coords.
  let [lat, lon] = getCoordinates();
  if (!lat || !lon) {
    return;
  }
  window.open(`https://www.google.com/maps/place/${lat},${lon}`);
}

let onKeyDown = (e) => {
  if (e.keyCode === 49) {
    placeMarker(true);
  }
  if (e.keyCode === 50) {
    placeMarker(false);
  }
  if (e.keyCode === 52) {
    mapsFromCoords();
  }
  if (e.keyCode === 54) {
    if (!cancelXpFarm) {
      if (loopCount < 5) {
        // Random time between 8 and 15 seconds for pin placement
        const randomTime = Math.random() * (15 - 8) + 8;
        setTimeout(() => {
          placeMarker(true, false, undefined, () => {
            // After pin placement, simulate a space bar press
            var spaceKeyEvent = new KeyboardEvent("keydown", {
              keyCode: 32,
              which: 32,
            });
            document.dispatchEvent(spaceKeyEvent);
          });
          loopCount++;
        }, randomTime * 1000); // Convert to milliseconds
      } else {
        loopCount = 0;
        // Generate a random time interval between 5 and 10 seconds
        const randomTime = Math.random() * (10 - 5) + 5;
        setTimeout(() => {
          // Simulate a space bar press
          var spaceKeyEvent = new KeyboardEvent("keydown", {
            keyCode: 32,
            which: 32,
          });
          document.dispatchEvent(spaceKeyEvent);
        }, randomTime * 1000); // Convert to milliseconds
      }
    } else {
      return null;
    }
  }
  if (e.keyCode === 55) {
    if (!cancelXpFarm) {
      alert("XP Farm Currently Not Running");
    } else {
      alert("Terminating XP Farm");
      cancelXpFarm = true;
    }
  }
};

setInterval(() => {
  displayLocationInfo();
}, 5000);

document.addEventListener("keydown", onKeyDown);
