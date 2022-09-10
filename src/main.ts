import './style.css';
import { h, spec, using } from 'forest';
import { $field, rawClicked, tick } from './model';
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

    h('button', {
      text: 'Tick',
      handler: { click: tick },
    });

    field($field, rawClicked);
  });
}

using(document.querySelector<HTMLDivElement>('#app')!, App);
