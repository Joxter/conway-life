import { createEvent, sample } from 'effector';
import { h, list, spec } from 'forest';
import { $field, $fieldSize, cellHovered, moveFocus, resetFocus, toggleCell } from '../model/field';
import { Color1, Color2 } from '../types';
import { getRowColFromEvent } from '../utils';
import redo from './redo-arrow-icon.svg';
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

  h('p', () => {
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
    },
    fn() {
      list($field, ({ store: $rowStore, key: $rowKey }) => {
        list($rowStore, ({ store: $colStore, key: $colkey }) => {
          h('div', {
            data: { row: $rowKey, col: $colkey },
            handler: { mouseover: cellHovered },
            classList: {
              [css.cell]: true,
              [css.on1]: $colStore.map((it) => it === 1),
              [css.on2]: $colStore.map((it) => it === 2),
            },
          });
        });
      });
    },
  });
}
