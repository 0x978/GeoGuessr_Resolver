// ==UserScript==
// @name         geoGuessr Resolver (dev)
// @namespace    http://tampermonkey.net/
// @version      8.0
// @description  Features: Automatically score 5000 Points | Score randomly between 4500 and 5000 points | Open in Google Maps
// @author       0x978
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        none
// ==/UserScript==


alert(`           Thanks for using geoGuessr Resolver by 0x978.
           ============================================
           Please use the safer guess Option to avoid bans in competitive
           ============================================
            Controls (UPDATED!):
            '1': Place marker on a "safe" guess (4500 - 5000)
            '2': Place marker on a "perfect" guess (5000)
            '3': Get a description of the correct location.
            '4': Open location in Google Maps (In a new tab)
            '5': See opponent's guess distance from correct answer.
            ----------------------------------------------------------`)


async function getAddress(lat,lon){
    let response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
    return await response.json();
}

function displayLocationInfo() {
    let coordinates = getCoordinates()
    // api call with the lat lon to retrieve data.
    getAddress(coordinates[0],coordinates[1]).then(data => {
        console.log(data)
        alert(`
    Country: ${data.address.country}
    County: ${data.address.county}
    City: ${data.address.city}
    Road: ${data.address.road}
    State: ${data.address.state}
    Postcode: ${data.address.postcode}
    Village/Suburb: ${(data.address.village||data.address.suburb)}

   Postal Address: ${data.display_name}
    `) } );

}

function placeMarker(safeMode,skipGet,coords){

    let [lat,lng] = skipGet ? coords : getCoordinates()
    if(document.getElementsByClassName("guess-map__canvas-container")[0] === undefined){ // if this is not defined, the user must be in a streaks game, streaks mode uses a different map and therefore is calculated in a different function
        placeMarkerStreaksMode([lat,lng])
        return;
    }

    if(safeMode){
        lat += (Math.random() / 2);
        lng += (Math.random() / 2);
    }

    let element = document.getElementsByClassName("guess-map__canvas-container")[0] // html element containing needed props.
    let keys = Object.keys(element) // all keys
    let key = keys.find(key => key.startsWith("__reactFiber$")) // the React key I need to access props
    let placeMarker = element[key].return.memoizedProps.onMarkerLocationChanged // getting the function which will allow me to place a marker on the map

    placeMarker({lat:lat,lng:lng}) // placing the marker on the map at the correct coordinates given by getCoordinates(). Must be passed as an Object.

}

function placeMarkerStreaksMode([lat,lng]){

    let element = document.getElementsByClassName("region-map_map__7jxcD")[0] // this map is unique to streaks mode, however, is similar to that found in normal modes.
    let keys = Object.keys(element)
    let reactKey = keys.find(key => key.startsWith("__reactFiber$"))
    let placeMarkerFunction = element[reactKey].return.memoizedProps.onRegionSelected // This map works by selecting regions, not exact coordinates on a map, which is handles by the "onRegionSelected" function.

    // the onRegionSelected method of the streaks map doesn't accept an object containing coordinates like the other game-modes.
    // Instead, it accepts the country's 2-digit IBAN country code.
    // For now, I will pass the location coordinates into an API to retrieve the correct Country code, but I believe I can find a way without the API in the future.
    // TODO: find a method without using an API since the API is never guaranteed.

    getAddress(lat,lng).then(data => { // using API to retrieve the country code at the current coordinates.
        let countryCode = data.address.country_code
        placeMarkerFunction(countryCode) // passing the country code into the onRegionSelected method.
    })

}

// detects game mode and return appropriate coordinates.
function getCoordinates(){

    let x = document.getElementsByClassName("styles_root__3xbKq")[0]
    let keys = Object.keys(x)
    let key = keys.find(key => key.startsWith("__reactFiber$"))
    let props = x[key]
    let found = props.return.memoizedProps.panorama.position

    return([found.lat(),found.lng()]) // lat and lng are functions returning the lat/lng values
}

function mapsFromCoords(){ // opens new Google Maps location using coords.
    let [lat,lon] = getCoordinates()
    if(!lat||!lon){return;}
    window.open(`https://www.google.com/maps/place/${lat},${lon}`);
}

// function matchEnemyGuess(){ broken due to geoguessr AC
//     const enemyGuess = getEnemyGuess()
//     console.log(enemyGuess)
//     let eLat = enemyGuess.lat
//     let eLng = enemyGuess.lng
//     console.log(eLat,eLng)
//     placeMarker(false,true,[eLat,eLng])
// }

function fetchEnemyDistance(){
    const guessDistance = getEnemyGuess().distance
    const km = Math.round(guessDistance / 1000)
    const miles = Math.round(km * 0.621371)
    alert(`Enemy guess is ${km} km (${miles} miles) away.
    
(If the user has not guessed this round, this is the previous round guess.)`)
}

function getEnemyGuess(){
    let x = document.getElementsByClassName("game_layout__TO_jf")[0]
    let keys = Object.keys(x)
    let key = keys.find(key => key.startsWith("__reactFiber$"))
    let props = x[key]
    let teamArr = props.return.memoizedProps.gameState.teams
    let enemyTeam = findEnemyTeam(teamArr,findID())
    let enemyGuesses = enemyTeam.players[0].guesses
    let recentGuess = enemyGuesses[enemyGuesses.length-1]
    return recentGuess
}

function findID(){
    let y = document.getElementsByClassName("user-nick_root__DUfvc")[0]
    let keys = Object.keys(y)
    let key = keys.find(key => key.startsWith("__reactFiber$"))
    let props = y[key]
    let id = props.return.memoizedProps.userId
    return id
}

function findEnemyTeam(teams,userID){
    let player0 = teams[0].players[0].playerId
    if(player0 !== userID){
        return teams[0]
    }
    else{
        return teams[1]
    }
}


let onKeyDown = (e) => {
    if(e.keyCode === 49){placeMarker(true,false,undefined)}
    if(e.keyCode === 50){placeMarker(false,false,undefined)}
    if(e.keyCode === 51){displayLocationInfo()}
    if(e.keyCode === 52){mapsFromCoords()}
    if(e.keyCode === 53){fetchEnemyDistance()}
    //if(e.keyCode === 54){matchEnemyGuess()} // broken due to geoguessr AC, not sure if possible to fix.

}


document.addEventListener("keydown", onKeyDown);
