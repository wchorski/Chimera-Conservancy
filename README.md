## Chimera Conservancy
A pet / farm simulator game that is playable through the browser.

## Face Creator
A Mii style emoji editor to create player avitars

### Face Layers
0. base
1. cheeks (could go above or behind mouth)
2. eyes
3. brows
4. mouth
5. hat (hair, etc can also have partials that go behind base)
6. misc

## Setup


## Future
#todo
- [ ] set each svg layer with a `data-z` attribute. re-render whole svg on change to correct the stack
- [ ] preset skin colors with popup sliders
- [ ] docker compose file to launch couchdb container
- [ ] `/` home page that funnels to `/ranch`, `/emoji`, and `/messages` pages
- [ ] top bar nav on emoji and messages pages
- [ ] auto randomizing on timer for ranch page
- [ ] messages page, clear text area on submit
- [ ] message cards link db id and make delete button (with confirm)
- [ ] fix: not all brows react to sliders
- [x] each emoji's `<title>` tag should have its name
- [ ] make emoji inputs more comfortable on mobile touchscreens
- [ ] work on `/ranch` w pub/sub for emojis and messages
- [ ] clue in overflowing tiles with some sort of fade that cuts through the bottom row of buttons?
- [ ] fix color issue with cheeks and brows being red after creation
- [ ] button to init databases with starter data and init/reset data button (on homepage settings sidebar)
- [ ] emoji model. change `date` to `birthday`
- [ ] change `messages` to `content` as to avoid confusion with response or error messages

## Credits
> Vector Ranks Pack by @RhosGFX!
> offered for free under Creative Commons CC0. 
> https://creativecommons.org/publicdomain/zero/1.0/
- https://www.motiontricks.com/creating-dynamic-svg-elements-with-javascript/