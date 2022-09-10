import './style.css';
import { createEvent } from 'effector';
import { h, spec, text, using } from 'forest';
import { $field, cellHovered, gameTimer, rawClicked, reset, tick } from './model';
import { field } from './ui-components/field';

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

    h('p', () => {
      // todo
      //  - move to a separate component
      //  - add color picker
      //  - add paint/erase mode
      //  - add input timer interval
      //  - add dynamic field size
      //  - add undo/redo
      //  - saved states, return to saved

      spec({ style: { display: 'flex', gap: '8px' } });
      h('button', { text: 'Tick', handler: { click: tick } });
      text` timer: ${gameTimer.isRunning.map((on) => on ? 'on' : 'off')} `;
      h('button', { text: 'Start', handler: { click: gameTimer.start } });
      h('button', { text: 'Stop', handler: { click: gameTimer.stop } });

      h('button', { style: { marginLeft: 'auto' }, text: 'Reset', handler: { click: reset } });

      // const colorChanged = createEvent<any>();
      // colorChanged.watch((ev) => console.log(ev.target.value));
      // h('input', { attr: { type: 'color', value: '#e55562' }, handler: { change: colorChanged } });
    });

    field($field, rawClicked, cellHovered);
  });
}

using(document.querySelector<HTMLDivElement>('#app')!, App);
