// ==UserScript==
// @name         Geogussr Resolver
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  A Geogussr location resolver.
// @author       0X69ED75
// @match        https://www.geoguessr.com/game/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        none
// ==/UserScript==

function Grab() {
    let x = document.getElementsByClassName("game-layout__panorama")[0] // getting the html element containing the props I need.
    let location = document.getElementsByClassName("game-layout__panorama-canvas")[0].textContent.trim(); // Getting the text supplied in properties, contains small amount of info about the location. Not used now but could be used as a fallback
    let keys = Object.keys(x) // getting all the keys of the properties of said HTML element.
    let key = keys.find(key => key.startsWith("__reactFiber$")) // finds the key in the previous array of keys, containing reactFiber, this will contain the state props we are looking for.
    let foundProps = document.getElementsByClassName("game-layout__panorama")[0][key].child.memoizedProps.children.props // navigating through properties until we find what we want.
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



let onKeyDown = (e) => {
    if(e.keyCode === 86){Grab()}
}


document.addEventListener("keydown", onKeyDown);
