// ==UserScript==
// @name         Geoguessr Location Resolver (Works in all modes)
// @namespace    http://tampermonkey.net/
// @version      13
// @description  Features: Automatically score 5000 Points | Score randomly between 4500 and 5000 points | Open in Google Maps
// @author       0x978
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        GM_webRequest
// @downloadURL https://update.greasyfork.org/scripts/450253/Geoguessr%20Location%20Resolver%20%28Works%20in%20all%20modes%29.user.js
// @updateURL https://update.greasyfork.org/scripts/450253/Geoguessr%20Location%20Resolver%20%28Works%20in%20all%20modes%29.meta.js
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

var originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
    // Geoguessr now calls the Google Maps API multiple times each round, with subsequent requests overwriting
    // the saved coordinates. Calls to this exact API path seems to be legitimate for now. A better solution than panoID currently?
    // Needs testing.
    if (method.toUpperCase() === 'POST' &&
        (url.startsWith('https://maps.googleapis.com/$rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/GetMetadata') ||
            url.startsWith('https://maps.googleapis.com/$rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/SingleImageSearch'))) {

        this.addEventListener('load', function () {
            let interceptedResult = this.responseText
            const pattern = /-?\d+\.\d+,-?\d+\.\d+/g;
            let match = interceptedResult.match(pattern)[0];
            let split = match.split(",")

            let lat = Number.parseFloat(split[0])
            let lng = Number.parseFloat(split[1])


            globalCoordinates.lat = lat
            globalCoordinates.lng = lng
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

    let element = document.querySelectorAll('[class^="guess-map_canvas__"]')[0]
    if(!element){
        placeMarkerStreaks()
        return
    }

    const latLngFns = {
        latLng:{
            lat: () => lat,
            lng: () => lng,
        }
    }

    // Fetching Map Element and Props in order to extract place function
    const reactKeys = Object.keys(element)
    const reactKey = reactKeys.find(key => key.startsWith("__reactFiber$"))
    const elementProps = element[reactKey]
    const mapElementClick = elementProps.return.return.memoizedProps.map.__e3_.click
    const mapElementPropKey = Object.keys(mapElementClick)[0]
    const mapClickProps = mapElementClick[mapElementPropKey]
    const mapClickPropKeys = Object.keys(mapClickProps)

    for(let i = 0; i < mapClickPropKeys.length ;i++){
        if(typeof mapClickProps[mapClickPropKeys[i]] === "function"){
            mapClickProps[mapClickPropKeys[i]](latLngFns)
        }
    }
}

function placeMarkerStreaks(){
    let {lat,lng} = globalCoordinates
    let element = document.getElementsByClassName("region-map_mapCanvas__0dWlf")[0]
    if(!element){
        return
    }
    const reactKeys = Object.keys(element)
    const reactKey = reactKeys.find(key => key.startsWith("__reactFiber$"))
    const elementProps = element[reactKey]
    const mapElementClick = elementProps.return.return.memoizedProps.map.__e3_.click
    const mapElementClickKeys = Object.keys(mapElementClick)
    const functionString = "(e.latLng.lat(),e.latLng.lng())}"
    const latLngFn = {
        latLng:{
            lat: () => lat,
            lng: () => lng,
        }
    }

    // Fetching Map Element and Props in order to extract place function
    for(let i = 0; i < mapElementClickKeys.length; i++){
        const curr = Object.keys(mapElementClick[mapElementClickKeys[i]])
        let func = curr.find(l => typeof mapElementClick[mapElementClickKeys[i]][l] === "function")
        let prop = mapElementClick[mapElementClickKeys[i]][func]
        if(prop && prop.toString().slice(5) === functionString){
            prop(latLngFn)
        }
    }
}

// ====================================Open In Google Maps====================================

function mapsFromCoords() { // opens new Google Maps location using coords.

    const {lat,lng} = globalCoordinates
    if (!lat || !lng) {
        return;
    }

    if (nativeOpen) {
        const nativeOpenCodeIndex = nativeOpen.toString().indexOf('native code')

        // Reject any attempt to call an overridden window.open, or fail.
        // 19 is for chromium-based browsers; 23 is for firefox-based browsers.
        if (nativeOpenCodeIndex === 19 || nativeOpenCodeIndex === 23) {
            nativeOpen(`https://maps.google.com/?output=embed&q=${lat},${lng}&ll=${lat},${lng}&z=5`);
        }
    }
}

// ====================================Controls,setup, etc.====================================

// Usage ping - sends only script version to server to track usage.
fetch(`https://geoguessrping.0x978.com/ping?script_version=13`)

const scripts = document.querySelectorAll('script');
scripts.forEach(script => {
    if (script.id === "resolver-cheat-detection-script") {
        script.remove()
    }
});

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