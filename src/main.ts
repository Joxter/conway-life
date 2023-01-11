import './style.css';
import { h, spec, text, using } from 'forest';
import { colorSelector } from './components/ColorSelector';
import { field } from './components/Field/Field';
import { history } from './components/History';
import { navigation } from './components/Navigation';
import { Perf } from './components/Perf';
import { Progress } from './components/Progress';
import { $exported, exportClicked, exportFieldChanged, importClicked } from './model/export';
import { calculated, resetFieldPressed, startCalc } from './model/field';
import './model/app';

function App() {
  h('div', () => {
    navigation();
    field();
    h('div', {
      style: { position: 'absolute', width: '100%', backgroundColor: 'rgba(255,255,255, 0.9)' },
      fn() {
        h('h1', { text: 'Game of Life' });

        history();
        colorSelector();

        Progress();
      },
    });

    Perf();

    h('button', {
      text: 'Reset',
      style: { position: 'absolute', bottom: '20px', left: '20px' },
      handler: { click: resetFieldPressed },
    });

    h('div', () => {
      spec({ style: { position: 'absolute', bottom: '50px', left: '20px' } });
      // h('button', { text: 'Export', handler: { click: exportClicked } });
      h('button', { text: 'Import', handler: { click: importClicked } });
      h('br', {});
      h('textarea', {
        style: { fontSize: '8px', width: '100%', height: '100px', lineHeight: 1 },
        text: $exported,
        handler: {
          change: exportFieldChanged.prepend((ev) => {
            // @ts-ignore
            return ev.target.value;
          }),
        },
      });
    });
  });
}

using(document.querySelector<HTMLDivElement>('#app')!, App);

initWW();

function initWW() {
  const worker = new Worker('./webworkerGo.js');

  worker.addEventListener('message', (ev) => {
    // console.log(ev.data);
    calculated(ev.data);
  });
  worker.addEventListener('error', (err) => {
    console.log('main.error err', err);
  });

  startCalc.watch((fauna) => {
    worker.postMessage(fauna);
  });
}

// todo
//  +- add presets by with 1 click
//  +- better scale:
//      +- "+" and "-" and with center in the middle of the screen
//      +- scale on scroll
//  - progress improvements:
//      + play/pause
//      - different speed
//      - restart (restore to 0)
//      - back to N steps
//  - tools:
//      + toggle one cell,
//      - draw pen
//      - add undo/redo
//      - area to focus
//      ? a line, selections to move/remove
//  + canvas render
//  - add keyboard support
//  +- import/export blueprints from https://conwaylife.com/ref/lexicon/zip/nbeluchenko/lexr_m.htm
//  + refactoring navigation (move by mouse)
//  ? add more colors
//  + safe delete
//  + better "reset focus" focus to the center of paint
//  + move camera with mouse or touch
//  + add Elsa for Alisa mode, add "heart" cell design
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
//  NONE:
//      - add color picker
