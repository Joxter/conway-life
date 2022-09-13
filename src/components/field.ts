import { h, list } from 'forest';
import { $field, $fieldSize, cellHovered, rawClicked } from '../model/field';
import { Color1, Color2 } from '../types';
import css from './styles.module.css';

export function field() {
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
