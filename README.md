# Geogussr Location resolver and Instant Guesser.

A small Javascript application which finds the correct location in the online game Geogussr.
The user has the choice to then see the correct location or instantly make the correct guess and recieve maximum points.

## How to use
This application is a Tampermonkey Script, therefore, you will need to install the tampermonkey extension:
- (Chromium browsers): https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en
- (Firefox):  https://addons.mozilla.org/en-GB/firefox/addon/tampermonkey/

After this, just simply add the code in Resolver.js as a new script.

**Once in a game, either:**
- press 'V' on the  keyboard, and the script will give the best description possible of the current location
- press 'B' on the keyboard, and the script will make a pinpoint accurate guess for maximum points.

## Credits:
- https://nominatim.org - For providing an API to use to reverse lookup Latitude and Longitude coordinates.
- https://stackoverflow.com/questions/29321742/react-getting-a-component-from-a-dom-element-for-debugging - Despite not giving me the
  exact answer I was looking for, it helped me find a way to solve the problem I was having.
- https://stackoverflow.com/questions/2694640/find-an-element-in-dom-based-on-an-attribute-value - For showing me how to USE the same HTML element to access required props, regardless of gamemode.

# Disclaimer:
This completely ruins the fun of the game, I mostly made this just to see what was possible.

Furthermore, I doubt this script is the most optimal solution to finding a Geoguessr location, It's likely there is a solution
that doesn't need an API and *a lot* less code, but this solution is what felt most logical to me after looking at the Website's code.

## Screenshot:
<img src="https://cdn.upload.systems/uploads/xbHlUDj4.jpg"/>
