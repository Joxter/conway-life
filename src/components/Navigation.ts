import { h, list, spec } from 'forest';
import { fieldSize, moveFocus, resetFocus } from '../model/field';
import redo from './redo-arrow-icon.svg';
import { select } from './stateless/form';
import css from './styles.module.css';

export function navigation() {
  const moveLeft = moveFocus.prepend<any>(() => {
    return { col: 5 };
  });
  const moveRight = moveFocus.prepend<any>(() => {
    return { col: -5 };
  });
  const moveUp = moveFocus.prepend<any>(() => {
    return { row: 5 };
  });
  const moveDown = moveFocus.prepend<any>(() => {
    return { row: -5 };
  });

  h('div', () => {
    spec({
      style: {
        display: 'grid',
        gridTemplateColumns: '30px 30px 30px',
        gridTemplateRows: '30px 30px 30px',
        gap: '8px',
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(255,255,255, 0.9)',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #aaa',
        zIndex: 1,
      },
    });

    h('div', {});
    h('button', {
      text: '^',
      classList: [css.arrowBtn],
      style: { transform: 'rotate(90deg)' },
      handler: { click: moveUp },
    });
    h('div', {});
    h('button', {
      text: '<-',
      classList: [css.arrowBtn],
      style: { transform: 'rotate(0deg)' },
      handler: { click: moveLeft },
    });
    h('button', {
      // text: 'X',
      classList: [css.arrowBtn],
      style: { backgroundImage: `url("${redo}")` },
      handler: { click: resetFocus },
    });
    h('button', {
      text: '->',
      classList: [css.arrowBtn],
      style: { transform: 'rotate(180deg)' },
      handler: { click: moveRight },
    });
    h('div', {});
    h('button', {
      text: 'v',
      classList: [css.arrowBtn],
      style: { transform: 'rotate(270deg)' },
      handler: { click: moveDown },
    });
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
