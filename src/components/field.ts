import { combine } from 'effector';
import { h, list } from 'forest';
import { $field, $fieldSize, cellHovered, rawClicked } from '../model/field';
import css from './styles.module.css';

export function field() {
  h('div', {
    classList: [css.field],
    styleVar: { width: $fieldSize.map((it) => it.width) },
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
              [css.on]: $colStore,
              [css.roundCell]: combine($colkey, $fieldSize, (col, field) => {
                return col >= field.width / 2;
              }),
            },
          });
        });
      });
    },
  });
}
