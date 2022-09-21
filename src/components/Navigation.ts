import { h, spec } from 'forest';
import { dragTool, fieldSize, resetFocus } from '../model/field';
import { select } from './stateless/form';
import css from './styles.module.css';

export function navigation() {
  dragTool.initEvents();

  h('button', {
    classList: [css.arrowBtn],
    handler: { click: resetFocus },
    text: 'reset focus',
  });

  h('div', () => {
    spec({ style: { position: 'absolute', right: '150px', bottom: '20px', zIndex: 1 } });

    select({
      options: fieldSize.$options.map((sizes) => {
        return sizes.map((size) => {
          return { label: `cell ${size}px`, value: String(size) };
        });
      }),
      value: fieldSize.$cellSize.map((it) => String(it)),
      onChange: fieldSize.cellSizeChanged.prepend((ev) => +ev.target.value),
    });
  });
}
