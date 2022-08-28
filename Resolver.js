// ==UserScript==
// @name         geoGuessr Resolver 2.0
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Returns the correct location in Geoguessr
// @author       0X69ED75
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        none
// ==/UserScript==

function grab(element) {
    let x = document.getElementsByClassName(element)[0]  // Getting the HTML element passed as prop's content.
    let location = x.textContent.trim();// Getting the text supplied in properties, contains small amount of info about the location. Not used now but could be used as a fallback if API fails
    let keys = Object.keys(x); // getting all the keys of the properties of said HTML element.
    let key = keys.find(key => key.startsWith("__reactFiber$"))  // finds the key in the previous array of keys, containing reactFiber, this will contain the state props we are looking for.
    let foundProps = x[key].child.memoizedProps.children.props // going into each property of the html element, until reaching the props needed. Must go into children like this, as I can't yet figure out a viable way to access children directly.

    // getting lat and lon from said props.
    let lat = foundProps.lat
    let lon = foundProps.lng

    // api call with the lat lon to retrieve data.
    getAddress(lat,lon).then(data => {
        console.log(data)
        alert(`
    Country: ${data.address.country}
    County: ${data.address.county}
    Road: ${data.address.road}
    State: ${data.address.state}
    Latitude: ${lat}
    Longitude: ${lon}
    `) } );

}

// async function returns JSON from API call.
async function getAddress(lat,lon){
    let response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
    let data = await response.json()
    return data;
}

/* calculates which game mode the user is in.
It is worth noting these html elements below aren't the best to use for finding the lon/lat props, but are convenient.
For BR, it would be better to use "game_panoramaCanvas_nK_Bk" so I have to navigate through less children elements, but, this html element is on the same level as "game-layout__panorama-canvas" so is used so less code is written
In future updates I should look into the html element with: "data-qa="panorama"" as they share the exact same props regardless of gamemode, meaning this function would be redundant, but for now this will do.
 */
function handleGamemode(){
    if((document.getElementsByClassName("game_panorama__3IFKG")[0]) !== undefined){ // this html element not being undefined suggests the user is in a battle royale game.
        grab("game_panorama__3IFKG") // passing this elements' name to grab
    }
    else if(document.getElementsByClassName("game-layout__panorama-canvas")[0] !== undefined){ // this html not being undefined suggests a user is in a singleplayer game
        grab("game-layout__panorama") // passing this elements' name to grab
    }
    else{alert("Unable to find Location, please try another gamemode.")}

}



let onKeyDown = (e) => {
    if(e.keyCode === 86){handleGamemode()}
}


document.addEventListener("keydown", onKeyDown);
