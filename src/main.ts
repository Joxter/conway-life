import './style.css';
import { h, using } from 'forest';
import { colorSelector } from './components/colorSelector';
import { field } from './components/field';
import { history } from './components/history';
import { progress } from './components/progress';
import { resetFieldPressed } from './model/field';
import './model/app';

function App() {
  h('div', () => {
    field();
    h('div', {
      style: { position: 'absolute', width: '100%', backgroundColor: 'rgba(255,255,255, 0.9)' },
      fn() {
        h('h1', { text: 'Game of Life' });

        // history();
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
//  - add inputs for timer interval and field size
//  +-add mobile layout
//  - add keyboard support
//  - safe delete (timer before real removing)
//  - add Elsa for Alisa mode, add "heart" cell design
//  - refactoring
//     + store only live cells
//     + recalculate only live cels
//     - canvas render
//     +-boundaryless mode
//     - fix history (save only live cells, update types)
//  - add more colors (paint, grey as fallback)
//  - import/export blueprints from https://conwaylife.com/ref/lexicon/zip/nbeluchenko/lexr_m.htm
//  - add undo/redo
//  ? add more colors
//  - select and move/delete parts
//  ? add color picker
//  + dynamic cell size
//  + add paint/erase mode
//  + remove from history
//  +-add dynamic field size
//  + two colors mode
//  + move "camera"
//  + toggle color on click, instead of painting
