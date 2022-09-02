// ==UserScript==
// @name         geoGuessr Resolver (dev)
// @namespace    http://tampermonkey.net/
// @version      4.5
// @description  Cheat for Geoguessr, gets max points at the press of a button.
// @author       0X69ED75
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        none
// ==/UserScript==


alert(`           Thanks for using geoGuessr Resolver by 0x69ED75
           ============================================
           => Please use the safer guess Option to avoid bans in competitive. <=
           ============================================
            Controls:
            'C': Instantly Place A "Safer" Guess (4500-5000).
            'B': Instantly Guess Correct Answer
            'V': Show best calculation of current location
            ----------------------------------------------------------
            Please Note: Sometimes, the guess correct answer fails,
            if this happens just press B or C again
            ----------------------------------------------------------`)


function displayLocation() {
    let coordinates = getCoordinates()
    // api call with the lat lon to retrieve data.
    getAddress(coordinates[0],coordinates[1]).then(data => {
        console.log(data)
        alert(`
    Country: ${data.address.country}
    County: ${data.address.county}
    Road: ${data.address.road}
    State: ${data.address.state}
    Latitude: ${coordinates[0]}
    Longitude: ${coordinates[1]}
    `) } );

}

// async function returns JSON from API call.
async function getAddress(lat,lon){
    let response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
    let data = await response.json()
    return data;
}

function getCoordinates(){ // Get coordinates through react props exposed by looking at html elements.
    let x = document.querySelectorAll('[data-qa="panorama"]')[0] // finding the html element where "data-qa = panorama" this should hold the correct coordinates in ALL game modes.
    let keys = Object.keys(x) // getting the keys of this html element.
    let key = keys.find(key => key.startsWith("__reactFiber$")) // finding the reactFiber key in this element. This will contain the props we need.
    let found = x[key].return.memoizedProps // accessing the props containing co-ordinates.

    // accessing both lat and lon
    let lat = found.lat
    let lon = found.lng

    return([lat,lon])

}

function placeMarker(safeMode){

    let coordinates = getCoordinates()
    if(safeMode){
        coordinates[0] += (Math.random() / 2);
        coordinates[1] += (Math.random() / 2);
    }

    let start = document.getElementsByClassName("guess-map__canvas-container")[0] // html element containing needed props.
    let keys = Object.keys(start) // all keys
    let key = keys.find(key => key.startsWith("__reactFiber$")) // the React key I need to access props
    let onMarker = start[key].return.memoizedProps.onMarkerLocationChanged // getting the function which will allow me to place a marker on the map

    onMarker({lat:coordinates[0],lng:coordinates[1]}) // placing the marker on the map at the correct coordinates given by getCoordinates()

    setTimeout(function() { // putting submit guess function in a timeout, to give the react props a second to update. Not doing this causes submission of guess before marker is placed.
        submitUserGuess()
    }, 1000);
}

function submitUserGuess(){

    let element = document.getElementsByClassName("button_button__CnARx button_variantPrimary__xc8Hp")[0] // button element which contains onClick function im looking for.
    let keys = Object.keys(element).find(key => key.startsWith("__reactFiber$"))
    let reactKey = element[keys]
    let submitGuess = reactKey.child.return.memoizedProps.onClick // the oncClick function gained from props. This submits a user's guess.

    submitGuess();
}

let onKeyDown = (e) => {
    if(e.keyCode === 86){displayLocation()} // key = v
    if(e.keyCode === 66){placeMarker(false)} // key = b
    if(e.keyCode === 67){placeMarker(true)} // key = c

}


document.addEventListener("keydown", onKeyDown);
