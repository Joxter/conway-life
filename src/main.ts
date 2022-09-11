import './style.css';
import { h, spec, text, using } from 'forest';
import { gameTimer, reset, saveClicked } from './model/field';
import { field } from './components/field';
import { history } from './components/history';
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
      //  - move to a separate component
      //  - add color picker
      //  - add paint/erase mode
      //  - add input timer interval
      //  +-add dynamic field size
      //  - add undo/redo !!!
      //  + saved states, return to saved
      //  - different colors mode
      //  - import/export blueprints
      //  - select and move/delete parts

      spec({ style: { display: 'flex', gap: '8px' } });
      text` timer: ${gameTimer.isRunning.map((on) => on ? 'on' : 'off')} `;
      h('button', { text: 'Start', handler: { click: gameTimer.start } });
      h('button', { text: 'Stop', handler: { click: gameTimer.stop } });

      h('button', { style: { marginLeft: 'auto' }, text: 'Save', handler: { click: saveClicked } });

      // const colorChanged = createEvent<any>();
      // colorChanged.watch((ev) => console.log(ev.target.value));
      // h('input', { attr: { type: 'color', value: '#e55562' }, handler: { change: colorChanged } });
    });

    field();
    h('button', { text: 'Reset', handler: { click: reset } });
  });
}

using(document.querySelector<HTMLDivElement>('#app')!, App);
