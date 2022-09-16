import './style.css';
import { h, spec, text, using } from 'forest';
import { colorSelector } from './components/colorSelector';
import { field } from './components/field';
import { history } from './components/history';
import { $exported, exportClicked } from './model/export';
import {
  $focus,
  gameTick,
  gameTimer,
  makeNSteps,
  moveFocus,
  reset,
  resetFocus,
  saveClicked,
} from './model/field';
import './model/app';

function App() {
  h('div', () => {
    spec({
      style: {
        margin: '40px auto',
        maxWidth: '900px',
        border: '2px solid lightblue',
        padding: '16px',
      },
    });
    h('h1', { text: 'Game of Life' });

    history();
    colorSelector();

    h('p', () => {
      spec({ style: { display: 'flex', gap: '8px' } });
      h('button', { text: 'Step', handler: { click: gameTick } });
      h('button', { text: '1000 steps', handler: { click: makeNSteps.prepend(() => 1000) } });

      text` timer: ${gameTimer.isRunning.map((on) => on ? 'on' : 'off')} `;
      h('button', { text: 'Start', handler: { click: gameTimer.start } });
      h('button', { text: 'Stop', handler: { click: gameTimer.stop } });

      h('button', { style: { marginLeft: 'auto' }, text: 'Save', handler: { click: saveClicked } });
    });

    h('p', () => {
      spec({ style: { display: 'flex', gap: '8px' } });

      text`Move: `;

      const moveLeft = moveFocus.prepend<any>(() => {
        return { x: 5 };
      });
      const moveRight = moveFocus.prepend<any>(() => {
        return { x: -5 };
      });
      const moveUp = moveFocus.prepend<any>(() => {
        return { y: 5 };
      });
      const moveDown = moveFocus.prepend<any>(() => {
        return { y: -5 };
      });

      h('button', { text: '<-', handler: { click: moveLeft } });
      h('button', { text: '^', handler: { click: moveUp } });
      h('button', { text: 'v', handler: { click: moveDown } });
      h('button', { text: '->', handler: { click: moveRight } });

      text`(${$focus.map(({ x }) => x)}, ${$focus.map(({ y }) => y)})`;

      h('button', { text: 'reset focus', handler: { click: resetFocus } });
    });

    field();
    h('button', { text: 'Reset', handler: { click: reset } });
    h('hr', {});

    h('button', { text: 'Export', handler: { click: exportClicked } });
    h('br', {});
    h('textarea', {
      style: { fontSize: '8px', width: '100%', height: '100px', lineHeight: 1 },
      text: $exported,
    });
  });
}

using(document.querySelector<HTMLDivElement>('#app')!, App);

// todo
//  - add keyboard support
//  - safe delete (timer before real removing)
//  - add Elsa for Alisa mode, add "heart" cell design
//  - refactoring
//     + store only live cells
//     + recalculate only live cels
//     - canvas render
//     +-boundaryless mode
//     - fix history (save only live cells)
//  - add more colors (paint, grey as fallback)
//  - boundless mode
//  - import/export blueprints from https://conwaylife.com/ref/lexicon/zip/nbeluchenko/lexr_m.htm
//  - add input timer interval
//  - add undo/redo
//  - add more colors (live)
//  - select and move/delete parts
//  - add color picker
//  + add paint/erase mode
//  + remove from history
//  +-add dynamic field size
//  + two colors mode
//  + move "camera"
