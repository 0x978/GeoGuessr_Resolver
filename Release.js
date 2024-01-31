// ==UserScript==
// @name         Geoguessr Location Resolver (Works in all modes)
// @namespace    http://tampermonkey.net/
// @version      12
// @description  Features: Automatically score 5000 Points | Score randomly between 4500 and 5000 points | Open in Google Maps
// @author       0x978
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        GM_webRequest
// ==/UserScript==


// =================================================================================================================
// 'An idiot admires complexity, a genius admires simplicity'
// Learn how I made this script: https://github.com/0x978/GeoGuessr_Resolver/blob/master/howIMadeTheScript.md
// Contribute things you think will be cool once you learn: https://github.com/0x978/GeoGuessr_Resolver/pulls
// ================================================================================================================

let globalCoordinates = { // keep this stored globally, and we'll keep updating it for each API call.
    lat: 0,
    lng: 0
}

let globalPanoID = undefined

// Below, I intercept the API call to Google Street view and view the result before it reaches the client.
// Then I simply do some regex over the response string to find the coordinates, which Google gave to us in the response data
// I then update a global variable above, with the correct coordinates, each time we receive a response from Google.
// This needs further testing - but initial tests look promising

var originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
    if (url.startsWith('https://maps.googleapis.com')) {

        this.addEventListener('load', function () {
            let interceptedResult = this.responseText
            const pattern = /-?\d+\.\d+,-?\d+\.\d+/g;
            let match = interceptedResult.match(pattern)[0];
            let split = match.split(",")

            let lat = Number.parseFloat(split[0])
            let lng = Number.parseFloat(split[1])

            // Geoguessr now calls the Google Maps API multiple times each round, with subsequent requests overwriting
            // the saved coordinates. We can just take the first instance of coordinates each round.
            // We can use the PanoID to see if the round changed.
            let localPanoID = getPanoID()
            if(localPanoID !== globalPanoID){
                globalCoordinates.lat = lat
                globalCoordinates.lng = lng
                console.log(globalCoordinates)
                globalPanoID = localPanoID
            }
        });
    }
    // Call the original open function
    return originalOpen.apply(this, arguments);
};


// ====================================Placing Marker====================================

function placeMarker(safeMode){
    let {lat,lng} = globalCoordinates

    if (safeMode) { // applying random values to received coordinates.
        const sway = [Math.random() > 0.5,Math.random() > 0.5]
        const multiplier = Math.random() * 4
        const horizontalAmount = Math.random() * multiplier
        const verticalAmount = Math.random() * multiplier
        sway[0] ? lat += verticalAmount : lat -= verticalAmount
        sway[1] ? lng += horizontalAmount : lat -= horizontalAmount
    }

    // Okay well played Geoguessr u got me there for a minute, but below should work.
    // Below is the only intentionally complicated part of the code - it won't be simplified or explained for good reason.
    let element = document.getElementsByClassName("guess-map_canvas__JAHHT")[0]
    if(!element){
        placeMarkerStreaks()
        return
    }
    const keys = Object.keys(element)
    const key = keys.find(key => key.startsWith("__reactFiber$"))
    const props = element[key]
    const x = props.return.return.memoizedProps.map.__e3_.click
    const y = Object.keys(x)[0]

    const z = {
        latLng:{
            lat: () => lat,
            lng: () => lng,
        }
    }
    x[y].em(z)
}

// similar idea as above, but with special considerations for the streaks modes.
// again - will not be explained.
function placeMarkerStreaks(){
    let {lat,lng} = globalCoordinates
    let element = document.getElementsByClassName("region-map_mapCanvas__R95Ki")[0]
    if(!element){
        return
    }
    const keys = Object.keys(element)
    const key = keys.find(key => key.startsWith("__reactFiber$"))
    const props = element[key]
    const x = props.return.return.memoizedProps.map.__e3_.click
    const y = Object.keys(x)
    const w = "(e.latLng.lat(),e.latLng.lng())}"
    const z = y.find(a => x[a].xe.toString().slice(5) === w)
    const v = {
        latLng:{
            lat: () => lat,
            lng: () => lng,
        }
    }
    x[z].em(v)
}

// ====================================Open In Google Maps====================================

function mapsFromCoords() { // opens new Google Maps location using coords.

    const {lat,lng} = globalCoordinates
    if (!lat || !lng) {
        return;
    }

    // Reject any attempt to call an overridden window.open, or fail .
    if(nativeOpen && nativeOpen.toString().indexOf('native code') === 19){
        nativeOpen(`https://maps.google.com/?output=embed&q=${lat},${lng}&ll=${lat},${lng}&z=5`);
    }
}

// ====================================Utility stuff====================================

// Gets the current panorama ID
// There is multiple ways to get this, in case this one is patched
function getPanoID(){
    let panoElement = document.querySelectorAll('[data-qa="panorama"]')[0]
    const keys = Object.keys(panoElement)
    const reactKey = keys.find(key => key.startsWith("__reactFiber$"))
    const reactProps = panoElement[reactKey]
    const panoID = reactProps.return.memoizedProps.panoId

    return panoID
}

// ====================================Controls,setup, etc.====================================


let onKeyDown = (e) => {
    if (e.keyCode === 49) {
        e.stopImmediatePropagation(); // tries to prevent the key from being hijacked by geoguessr
        placeMarker(true)
    }
    if (e.keyCode === 50) {
        e.stopImmediatePropagation();
        placeMarker(false)
    }
    if (e.keyCode === 51) {
        e.stopImmediatePropagation();
        mapsFromCoords(false)
    }
}

document.addEventListener("keydown", onKeyDown);