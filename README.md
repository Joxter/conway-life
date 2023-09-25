# Game of Life

## TODO

- [ ] better UI
  - [x] auto-focus and auto-zoom
  - [ ] update progress bar
  - [x] something for Perf
- [ ] better catalogue
  - [ ] better search, search by name/author/comment
  - [ ] pagination ?
  - [x] order by size
  - [x] order by population
  - [ ] filter by type (ship, oscillator, ...)
  - [x] generate better previews (small images like ~200px max)
- [ ] add borders of current fauna to the field
- [ ] simply analytics
  - [ ] is die
  - [ ] is ship
  - [ ] num of islands
  - [ ] time to die
- [ ] scale less then 1px (1/2, 1/4, ...)
- [ ] progress improvements:
  - [x] play/stop
  - [x] (WIP) different speed
  - [ ] pause
  - [ ] restart (restore to 0)
  - [ ] back to N steps
- [ ] (WIP) add HashLife algorithm
  - [ ] make webworker optional
  - [x] copy implementation from copy (lol), rewrite to TS
- [ ] (WIP) mobile support
  - [x] proper scroll and toggle
  - [ ] 2-finger zoom
- [ ] tools:
  - [x] toggle one cell
  - [ ] draw pen
  - [ ] add undo/redo
  - [ ] area to focus
  - [ ] ??? a line, selections to move/remove
- [ ] add keyboard support
- [x] better parser rle/cells files (need links, name, size, ..)
- [x] search patterns by name
  - [x] generate images and upload to cdn
  - [x] preview images
- [x] better scale:
  - [x] "+" and "-" and with center in the middle of the screen
  - [x] scale on scroll
- [x] save to local store
- [x] canvas render
- [x] refactoring
  - [x] store only live cells
  - [x] recalculate only live cells
  - [x] boundaryless mode
  - [x] fix history (save only live cells, update types)
- [x] refactoring navigation (move by mouse)
- [x] safe delete
- [x] better "reset focus" focus to the center of paint
- [x] move camera with mouse or touch
- [x] add Elsa for Alisa mode, add "heart" cell design
- [x] add mobile layout
- [x] dynamic cell size
- [x] add paint/erase mode
- [x] remove from history
- [x] add dynamic field size
- [x] two colors mode
- [x] move "camera"
- [x] toggle color on click, instead of painting
