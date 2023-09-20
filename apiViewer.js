// ==UserScript==
// @name         Geoguessr API Experiemnts
// @namespace    http://tampermonkey.net/
// @version      b_API
// @description
// @author       0x978
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        GM_webRequest
// ==/UserScript==

function coordinateClimber(isStreaks){
    let timeout = 10
    let path = document.querySelector('div[data-qa="panorama"]');
    while (timeout > 0){
        const props = path[Object.keys(path).find(key => key.startsWith("__reactFiber$"))]
        const checkReturns = iterateReturns(props,isStreaks)
        if(checkReturns){
            return {
                "lat":checkReturns[0],
                "lng":checkReturns[1]
            }
        }
        path = path.parentNode
        timeout--
    }
    alert("Failed to find co-ordinates. Please make an issue on GitHub or GreasyFork. " +
        "Please make sure you mention the game mode in your report.")
}

function iterateReturns(element,isStreaks){
    let timeout = 10
    let path = element
    while(timeout > 0){
        const coords = checkProps(path.memoizedProps,isStreaks)
        if(coords){
            return coords
        }
        path = element.return
        timeout--
    }
}

function checkProps(props,isStreaks){
    if(props?.panoramaRef){
        const found = props.panoramaRef.current.location.latLng
        return [found.lat(),found.lng()]
    }
    if(props.streakLocationCode && isStreaks){
        return props.streakLocationCode
    }
    if(props.lat){
        return [props.lat,props.lng]
    }
}

function apiHandler(isPlace){
    const path = isPlace ? "Guess" : "pin"
    const coords = coordinateClimber()
    const sendObj = {
        "lat":coords.lat,
        "lng":coords.lng,
        "roundNumber":getRoundNumber()
    }
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendObj),
        credentials: 'include'
    };
    const url = `https://game-server.geoguessr.com/api/duels/${getGameID()}/${path}`;
    fetch(url, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid response');
            }
            return response.json();
        })
        .then(data => {
            if(!isPlace){
                receiveGameData(data)
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function receiveGameData(gameData){
    console.log(gameData)
}


function getGameID(){
    return window.location.href.slice(32) // works for duels, will need to be corrected
}

function getRoundNumber(){
    const path = document.getElementsByClassName("game_main__sYtZN")[0]
    const props = path[Object.keys(path).find(key => key.startsWith("__reactFiber$"))]
    return props.return.return.memoizedProps.gameState.currentRoundNumber
}

function badapiHandler(isPlace){
    const path = isPlace ? "Guess" : "pin"
    const coords = coordinateClimber()
    const sendObj = {
        "lat":79.70614035593177,
        "lng":-43.310454654785175,
        "roundNumber":getRoundNumber()
    }
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendObj),
        credentials: 'include'
    };
    const url = `https://game-server.geoguessr.com/api/duels/${getGameID()}/${path}`;
    fetch(url, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid response');
            }
            return response.json();
        })
        .then(data => {
            if(!isPlace){
                receiveGameData(data)
            }
        })
        .catch(error => {
            console.error(error);
        });
}

let onKeyDown = (e) => {
    if (e.keyCode === 49) {
        e.stopImmediatePropagation();
        apiHandler(true)
    }
    if (e.keyCode === 50) {
        e.stopImmediatePropagation();
        apiHandler(false)
    }
    if (e.keyCode === 51) {
        e.stopImmediatePropagation();
        badapiHandler(true)
    }
}

document.addEventListener("keydown", onKeyDown);
