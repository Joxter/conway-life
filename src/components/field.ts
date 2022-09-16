import { createEvent, sample } from 'effector';
import { h, list, spec, text } from 'forest';
import {
  $field,
  $fieldSize,
  $focus,
  cellHovered,
  moveFocus,
  resetFocus,
  toggleCell,
} from '../model/field';
import { Color1, Color2 } from '../types';
import { getRowColFromEvent } from '../utils';
import css from './styles.module.css';

export function field() {
  h('p', () => {
    spec({ style: { display: 'flex', gap: '8px' } });

    text`Move: `;

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

    h('button', { text: '<-', handler: { click: moveLeft } });
    h('button', { text: '^', handler: { click: moveUp } });
    h('button', { text: 'v', handler: { click: moveDown } });
    h('button', { text: '->', handler: { click: moveRight } });

    text`(${$focus.map(({ x }) => x)}, ${$focus.map(({ y }) => y)})`;

    h('button', { text: 'reset focus', handler: { click: resetFocus } });
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
