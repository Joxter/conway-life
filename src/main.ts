import './style.css';
import { h, spec, text, using } from 'forest';
import { colorSelector } from './components/colorSelector';
import { field } from './components/field';
import { history } from './components/history';
import { $exported, exportClicked } from './model/export';
import { gameTick, gameTimer, reset, saveClicked } from './model/field';
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
      // todo
      //  - add keyboard support
      //  - move "camera"
      //  - add Elsa for Alisa mode, add "heart" cell design
      //  - refactoring
      //     + store only live cells
      //     + recalculate only live cels
      //     - canvas render
      //     +-boundaryless mode
      //     - fix history (save only live cells)
      //  - add more colors (paint, grey as fallback)
      //  - boundless mode
      //  - import/export blueprints from
      //  - add input timer interval
      //  - add undo/redo
      //  - add more colors (live)
      //  - select and move/delete parts
      //  - add color picker
      //  + add paint/erase mode
      //  + remove from history
      //  +-add dynamic field size
      //  + two colors mode

      spec({ style: { display: 'flex', gap: '8px' } });
      h('button', { text: 'Step', handler: { click: gameTick } });

      text` timer: ${gameTimer.isRunning.map((on) => on ? 'on' : 'off')} `;
      h('button', { text: 'Start', handler: { click: gameTimer.start } });
      h('button', { text: 'Stop', handler: { click: gameTimer.stop } });

      h('button', { style: { marginLeft: 'auto' }, text: 'Save', handler: { click: saveClicked } });
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
