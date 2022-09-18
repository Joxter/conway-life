import './style.css';
import { h, using } from 'forest';
import { colorSelector } from './components/ColorSelector';
import { field } from './components/Field';
import { history } from './components/History';
import { progress } from './components/Progress';
import { resetFieldPressed } from './model/field';
import './model/app';

function App() {
  h('div', () => {
    field();
    h('div', {
      style: { position: 'absolute', width: '100%', backgroundColor: 'rgba(255,255,255, 0.9)' },
      fn() {
        h('h1', { text: 'Game of Life' });

        history();
        colorSelector();

        progress();
      },
    });

    h('button', {
      text: 'Reset',
      style: { position: 'absolute', bottom: '20px', left: '20px' },
      handler: { click: resetFieldPressed },
    });

    /*
    h('button', { text: 'Export', handler: { click: exportClicked } });
    h('br', {});
    h('textarea', {
      style: { fontSize: '8px', width: '100%', height: '100px', lineHeight: 1 },
      text: $exported,
    });
    */
  });
}

using(document.querySelector<HTMLDivElement>('#app')!, App);

// todo
//  +- add Elsa for Alisa mode, add "heart" cell design
//  - safe delete (timer before real removing)
//  - move camera with mouse or touch
//  - import/export blueprints from https://conwaylife.com/ref/lexicon/zip/nbeluchenko/lexr_m.htm
//  - tools:
//      - toggle one cell,
//      - draw like pen
//      - add undo/redo
//      ? line, area to move/remove
//  - better progress:
//      - different speed
//      - return to zero fauna
//      ? return go back to N steps
//  - add keyboard support
//  ? add more colors
//  ? canvas render
//  ? add color picker
//  + add mobile layout
//  + refactoring
//     + store only live cells
//     + recalculate only live cels
//     +-boundaryless mode
//     + fix history (save only live cells, update types)
//  + dynamic cell size
//  + add paint/erase mode
//  + remove from history
//  + add dynamic field size
//  + two colors mode
//  + move "camera"
//  + toggle color on click, instead of painting