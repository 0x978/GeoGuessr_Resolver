# Geogussr Location resolver and Instant Guesser.

A small Javascript application which finds the correct location in the online game Geogussr.

The user has the choice to place a pin in a location close to the location, place a pin on the exact location or open the location in Google Maps.

## How to use
This application is a Tampermonkey Script, therefore, you will need to install the tampermonkey extension:
- (Chromium browsers): https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en
- (Firefox):  https://addons.mozilla.org/en-GB/firefox/addon/tampermonkey/

After this, just simply add the code in Release.js as a new script.

## To use this script:

- Press '1' in game to place a pin on a location that will randomly score you between 4500 to 5000 score. (pressing "guess" is required to guess)

- Press '2' in game to place a pin on a location that will exactly score 5000 points. (pressing "guess" is required to guess)

- Press '3' in game to open Google Maps set on the correct location in a new tab.

## Credits:
- https://nominatim.org - For providing an API to use to reverse lookup Latitude and Longitude coordinates.
- https://stackoverflow.com/questions/29321742/react-getting-a-component-from-a-dom-element-for-debugging - Despite not giving me the
  exact answer I was looking for, it helped me find a way to solve the problem I was having.
- https://stackoverflow.com/questions/2694640/find-an-element-in-dom-based-on-an-attribute-value - For showing me how to use the same HTML element to access required props, regardless of gamemode.

# Disclaimer:
This ***completely ruins the fun of the game***, I made this to experiment with creating Tampermonkey scripts to modify website behaviour and because it's fun to reverse engineer this stuff.

<u>Please use at your own risk, and **don't ruin other's fun.** </u>

## Demonstration:
<img src="https://cdn.upload.systems/uploads/Wg827y99.gif"/>
