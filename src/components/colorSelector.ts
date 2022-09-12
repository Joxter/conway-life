import { h } from 'forest';
import { $selectedColor, colorSelected } from '../model/field';
import css from './styles.module.css';

export function colorSelector() {
  h('div', {
    style: { display: 'flex', gap: '8px' },
    fn() {
      h('button', {
        classList: {
          [css.colorBtn]: true,
          [css.currentColor]: $selectedColor,
        },
        style: { backgroundColor: '#5583e5' },
        handler: { click: colorSelected.prepend(() => true) },
      });
      h('button', {
        classList: {
          [css.colorBtn]: true,
          [css.currentColor]: $selectedColor.map((color) => !color),
        },
        handler: { click: colorSelected.prepend(() => false) },
      });
    },
  });
}
