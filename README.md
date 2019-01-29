[![Build Status](https://travis-ci.org/dakom/xstate-media-widgets.svg?branch=master)](https://travis-ci.org/dakom/xstate-media-widgets)

## [LIVE DEMO](https://dakom.github.io/xstate-media-widgets)

Proof-of-concept using [xstate](https://xstate.js.org/docs/) to drive some media widgets 

Everything is very decoupled and built around typescript generics. This makes it so:

* Everything you see is powered _by only 4 statecharts (!)_ and very thin React components
* Easily swap out the "component" and/or "view" layer with something other than React/Vue/whatever
* Clear separation not only of logic, data, and view - but even further separating IO vs. state
* Incredible power for composition. Many more widgets can be constructed from what's here, and it can be built upon for even more flexibility. For example, adding a generic "loader" statechart would open up the door for building drum-machines, video player, etc. all while keeping it super-duper-DRY
* Despite all the above, strict compile-time checks and deterministic logic

## TODO

The clock runs completely independantly from the media, and for the purposes what I was kicking the tires on here, that's totally fine and maybe even a little interesting that they're independant. 

Though it can drift pretty badly from the media timing especially if you wait a while before granting privacy permission.

It'd be an improvement to drive the clock from the media on playback, but not sure if I'll get around to that here ;)
