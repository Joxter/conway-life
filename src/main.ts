import './style.css';
import { h, spec, text, using } from 'forest';
import { field } from './components/field';
import { history } from './components/history';
import { $exported, exportClicked } from './model/export';
import { gameTimer, reset, saveClicked } from './model/field';
import './model/app';

function App() {
  h('div', () => {
    spec({
      style: {
        margin: '40px auto',
        maxWidth: '600px',
        border: '2px solid lightblue',
        padding: '16px',
      },
    });
    h('h1', { text: 'Game of Life' });

    history();

    h('p', () => {
      // todo
      //  - add Elsa for Alisa mode, add "heart" cell design
      //  - add color picker
      //  - add paint/erase mode
      //  - add input timer interval
      //  +-add dynamic field size
      //  - add undo/redo !!!
      //  - different colors mode
      //  - import/export blueprints
      //  - select and move/delete parts
      //  + remove from history

      spec({ style: { display: 'flex', gap: '8px' } });
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
