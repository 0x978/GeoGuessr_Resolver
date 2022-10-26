// ==UserScript==
// @name         geoGuessr Resolver (dev)
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Cheat for Geoguessr, gets max points at the press of a button.
// @author       0X69ED75
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        none
// ==/UserScript==


alert(`           Thanks for using geoGuessr Resolver by 0x978.
           ============================================
           => Please use the safer guess Option to avoid bans in competitive. <=
           ============================================
            Controls (UPDATED!):
            '1': Place marker on a "safe" guess (4500 - 5000)
            '2': Place marker on a "perfect" guess (5000)
            '3': Auto Guess A "safe" Answer (4500 - 5000).
            '4': Auto Guess "perfect" Answer (5000)
            ----------------------------------------------------------
            If auto guess fails, press the key again.
            ----------------------------------------------------------`)


async function getAddress(lat,lon){
    let response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
    let data = await response.json()
    return data;
}

function placeMarker(safeMode,instantGuess){

    if(document.getElementsByClassName("guess-map__canvas-container")[0] === undefined){ // if this is not defined, the user must be in a streaks game, streaks mode uses a different map and therefore is calculated in a different function
        placeMarkerStreaksMode(instantGuess)
        return;
    }

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

    if(instantGuess){
        setTimeout(function() { // putting submit guess function in a timeout, to give the react props a second to update. Not doing this causes submission of guess before marker is placed.
            submitUserGuess()
        }, 1000);
    }
}

function placeMarkerStreaksMode(instantGuess){
    let coordinates = getCoordinates()
    let countryCode = ""

    let element = document.getElementsByClassName("region-map_map__7jxcD")[0] // this map is unique to streaks mode, however, is similar to that found in normal modes.
    let keys = Object.keys(element)
    let reactKey = keys.find(key => key.startsWith("__reactFiber$"))
    let placeMarkerFunction = element[reactKey].return.memoizedProps.onRegionSelected // This map works by selecting regions, not exact coordinates on a map, which is handles by the "onRegionSelected" function.

    // the onRegionSelected method of the streaks map doesn't accept an object containing coordinates like the other game-modes.
    // Instead, it accepts the country's 2-digit IBAN country code.
    // For now, I will pass the locaitons coordinates into an API to retrieve the correct Country code, but I believe I can find a way without the API in the future.
    // TODO: find a method without using an API since the API is never guaranteed.

    getAddress(coordinates[0],coordinates[1]).then(data => { // using API to retrieve the country code at the current coordinates.
        countryCode = data.address.country_code
        placeMarkerFunction(countryCode) // passing the country code into the onRegionSelected method.
    })

    if(instantGuess){
        setTimeout(function() { // putting submit guess function in a timeout, to give the react props a second to update. Not doing this causes submission of guess before marker is placed.
            submitUserGuess()
        }, 1000);
    }
}

// detects game mode and return appropriate coordinates.
function getCoordinates(){
    let element;
    let keys;
    let key;
    let found;
    //competitive
    if(document.getElementsByClassName("game-panorama_panorama__rdhFg").length > 0){
        element = document.getElementsByClassName("game-panorama_panorama__rdhFg")[0] // element for competitive
        keys = Object.keys(element) // all keys
        key = keys.find(key => key.startsWith("__reactFiber$")) // needed key
        found = element[key].return.memoizedProps.panorama // location of coords
    }
    else{
        element = document.querySelectorAll('[data-qa="panorama"]')[0] // finding the html element where "data-qa = panorama" this should hold the correct coordinates in ALL game modes.
        keys = Object.keys(element) // getting the keys of this html element.
        key = keys.find(key => key.startsWith("__reactFiber$")) // finding the reactFiber key in this element. This will contain the props we need.
        found = element[key].return.memoizedProps // accessing the props containing co-ordinates.
    }
    return([found.lat,found.lng])

}

function submitUserGuess(){

    let element = document.getElementsByClassName("button_button__CnARx button_variantPrimary__xc8Hp")[0] // button element which contains onClick function im looking for.
    let keys = Object.keys(element).find(key => key.startsWith("__reactFiber$"))
    let reactKey = element[keys]
    let submitGuess = reactKey.child.return.memoizedProps.onClick // the oncClick function gained from props. This submits a user's guess.

    submitGuess();
}


let onKeyDown = (e) => {
    if(e.keyCode === 49){placeMarker(true,false)}
    if(e.keyCode === 50){placeMarker(false,false)}
    if(e.keyCode === 51){placeMarker(true,true)}
    if(e.keyCode === 67){placeMarker(false,true)}
}


document.addEventListener("keydown", onKeyDown);
