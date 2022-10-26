# Geogussr Location resolver and Instant Guesser.

A small Javascript application which finds the correct location in the online game Geogussr.
The user has the choice to either instantly guess the correct location, or place a pin on it.

## How to use
This application is a Tampermonkey Script, therefore, you will need to install the tampermonkey extension:
- (Chromium browsers): https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en
- (Firefox):  https://addons.mozilla.org/en-GB/firefox/addon/tampermonkey/

After this, just simply add the code in Resolver.js as a new script.

## To use this script:

  - Press **'1'** in game to place a pin on a location that will randomly score you between 4500 to 5000 score. (pressing "guess" is required to guess)

  - Press **'2'** in game to place a pin on a location that will exactly score 5000 points. (pressing "guess" is required to guess)

  - Press **'3'** in game to instantly randomly score 4500 to 5000 points (the script will attempt to guess for you, but is prone to fail. Press twice if 
fails)

  - Press **'4'** in game to instantly score 5000 points (the script will attempt to guess for you, but is prone to fail. Press twice if fails)


## Credits:
- https://nominatim.org - For providing an API to use to reverse lookup Latitude and Longitude coordinates.
- https://stackoverflow.com/questions/29321742/react-getting-a-component-from-a-dom-element-for-debugging - Despite not giving me the
  exact answer I was looking for, it helped me find a way to solve the problem I was having.
- https://stackoverflow.com/questions/2694640/find-an-element-in-dom-based-on-an-attribute-value - For showing me how to use the same HTML element to access required props, regardless of gamemode.

# Disclaimer:
This completely ruins the fun of the game, I made this to experiment with creating Tampermonkey scripts to modify website behaviour, please use at your own risk.

## Screenshot:
<img src="https://cdn.upload.systems/uploads/xbHlUDj4.jpg"/>
