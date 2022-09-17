import { createEvent, sample } from 'effector';
import { h, list, spec } from 'forest';
import {
  $cellSize,
  $cellSizeOptions,
  $field,
  $fieldSize,
  $hoveredCell,
  fieldMouseMove,
  moveFocus,
  resetFocus,
  sizeChanged,
  toggleCell,
} from '../model/field';
import { Color1, Color2, initCellSize } from '../types';
import { getRowColFromEvent } from '../utils';
import redo from './redo-arrow-icon.svg';
import { select } from './stateless/form';
import css from './styles.module.css';

export function field() {
  const moveLeft = moveFocus.prepend<any>(() => {
    return { x: 5 };
  });
  const moveRight = moveFocus.prepend<any>(() => {
    return { x: -5 };
  });
  const moveUp = moveFocus.prepend<any>(() => {
    return { y: 5 };
  });
  const moveDown = moveFocus.prepend<any>(() => {
    return { y: -5 };
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
      options: $cellSizeOptions.map((sizes) => {
        return sizes.map((size) => {
          return { label: `cell ${size}px`, value: String(size) };
        });
      }),
      value: $cellSize.map((it) => String(it)),
      onChange: sizeChanged.prepend((ev) => +ev.target.value),
    });
  });

  $cellSize.watch(console.log);

  const rawClicked = createEvent<any>();
  sample({
    clock: rawClicked.filterMap(getRowColFromEvent),
    target: toggleCell,
  });

  h('div', {
    classList: [css.field],
    styleVar: {
      width: $fieldSize.map((it) => it.width),
      color1: Color1,
      color2: Color2,
    },
    handler: {
      click: rawClicked,
      mousemove: fieldMouseMove,
    },
    fn() {
      list($field, ({ store: $fieldStore }) => {
        h('div', {
          data: { row: $fieldStore.map((it) => it.x), col: $fieldStore.map((it) => it.y) },
          style: {
            left: $fieldStore.map((it) => it.x * initCellSize + 'px'),
            top: $fieldStore.map((it) => it.y * initCellSize + 'px'),
          },
          classList: {
            [css.cell10]: true,
            [css.on1]: $fieldStore.map((it) => it.val === 1),
            [css.on2]: $fieldStore.map((it) => it.val === 2),
          },
        });
      });

      h('div', {
        style: {
          boxShadow: 'inset 0px 0px 0px 3px #ec4dc7',
          left: $hoveredCell.map((it) => it.col * initCellSize + 'px'),
          top: $hoveredCell.map((it) => it.row * initCellSize + 'px'),
        },
        classList: [css.cell10],
      });
    },
  });
}
