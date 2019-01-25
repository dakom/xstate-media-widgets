[![Build Status](https://travis-ci.org/dakom/xstate-media-widgets.svg?branch=master)](https://travis-ci.org/dakom/xstate-media-widgets)

## [LIVE DEMO](https://dakom.github.io/xstate-media-widgets)

Proof-of-concept using [xstate](https://xstate.js.org/docs/) to drive some media widgets 

Everything is very decoupled and built around typescript generics:

* Re-use the same logic across all the widgets
* Easily swap out the "component" and/or "view" layer with something other than React/Vue/whatever
* Clear separation not only of logic, data, and view - but even further separating IO vs. state
* Incredible power for composition. Many more widgets can be constructed from what's here, and it can be built upon for even more flexibility. For example, adding a generic "loader" statechart would open up the door for building drum-machines, video player, etc. all while keeping it super-duper-DRY
* Despite all the above, strict compile-time checks
