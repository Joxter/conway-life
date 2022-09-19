import { h } from 'forest';
import { $selectedColor, colorSelected, elsaMode } from '../model/field';
import { Color1, Color2 } from '../types';
import { checkbox } from './stateless/form';
import css from './styles.module.css';

export function colorSelector() {
  checkbox({ label: 'Elsa', value: elsaMode.$isOn, onChange: elsaMode.changed });

  h('div', {
    style: { display: 'flex', gap: '8px' },
    fn() {
      h('button', {
        classList: {
          [css.colorBtn]: true,
          [css.currentColor]: $selectedColor.map((it) => it === 1),
        },
        style: { backgroundColor: Color1 },
        handler: { click: colorSelected.prepend(() => 1) },
      });
      h('button', {
        classList: {
          [css.colorBtn]: true,
          [css.currentColor]: $selectedColor.map((it) => it === 2),
        },
        style: { backgroundColor: Color2 },
        handler: { click: colorSelected.prepend(() => 2) },
      });
      h('button', {
        classList: {
          [css.colorBtn]: true,
          [css.currentColor]: $selectedColor.map((color) => !color),
        },
        handler: { click: colorSelected.prepend(() => 0) },
      });
    },
  });
}
