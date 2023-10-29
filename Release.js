// ==UserScript==
// @name         Geoguessr Location Resolver (Works in all modes)
// @namespace    http://tampermonkey.net/
// @version      11.1
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

// ==================================== ANTI-ANTI-cheat stuff ====================================
window.open = (...e) =>{ // try to re-write window.open back to its native function.
    nativeOpen(...e)
}

GM_webRequest([
    { selector: 'https://www.geoguessr.com/api/v4/trails', action: 'cancel' },
    { selector: 'https://www.geoguessr.com/api/v4/bdd406e4-c426-4d04-85b3-230f6fceef28', action: 'cancel' },
    { selector: 'https://www.geoguessr.com/api/v4/b9bc4481-80c9-483a-a945-c24d935174f0', action: 'cancel' },
]);
// ==================================== Coordinate Interception ====================================

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

    // Okay well played Geoguessr u got me there for a minute, but below should work.
    // Below is the only intentionally complicated part of the code - it won't be simplified or explained for good reason.
    let element = document.getElementsByClassName("guess-map_canvas__cvpqv")[0]
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
    x[y].xe(z)
}

// similar idea as above, but with special considerations for the streaks modes.
// again - will not be explained.
function placeMarkerStreaks(){
    let {lat,lng} = globalCoordinates
    let element = document.getElementsByClassName("region-map_mapCanvas__0dWlf")[0]
    if(!element){
        console.log("unable to find map element")
        return
    }
    const keys = Object.keys(element)
    const key = keys.find(key => key.startsWith("__reactFiber$"))
    const props = element[key]
    const x = props.return.return.memoizedProps.map.__e3_.click
    const y = Object.keys(x)
    const w = "e=>{m(e.latLng.lat(),e.latLng.lng())}"
    const z = y.find(a => x[a].xe.toString() === w)

    const v = {
        latLng:{
            lat: () => lat,
            lng: () => lng,
        }
    }

    x[z].xe(v)
}

// ====================================Open In Google Maps====================================

function mapsFromCoords() { // opens new Google Maps location using coords.

    const {lat,lng} = globalCoordinates
    if (!lat || !lng) {
        console.log("Failed to fetch coords for Google Maps")
        return;
    }

    // Reject any attempt to call an overridden window.open, or fail .
    if(window.open.toString().indexOf('native code') === -1){
        console.log("Geoguessr has overridden window.open.")
        if(nativeOpen && nativeOpen.toString().indexOf('native code') !== -1){
            console.log("fallback enabled.")
            nativeOpen(`https://www.google.com/maps/place/${lat},${lng}`);
        }
    }
    else{
        window.open(`https://www.google.com/maps/place/${lat},${lng}`)
    }
}

// ====================================Controls,setup, etc.====================================

function setInnerText(){
    const text = `
                Geoguessr Resolver Loaded Successfully

                IMPORTANT GEOGUESSR RESOLVER UPDATE INFORMATION:
                
                The script has been rewritten after a big update by the developers.
                
                Reminder that using the script is at your own risk - don't ruin other's fun.
                `
    if(document.getElementsByClassName("header_logo__hQawV")[0]){
        const logoWrapper = document.getElementsByClassName("header_logo__hQawV")[0]
        logoWrapper.innerText = text
    }
}

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
setInnerText()
document.addEventListener("keydown", onKeyDown);

