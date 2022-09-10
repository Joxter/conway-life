import { Event, Store } from 'effector';
import { h, list } from 'forest';
import { FIELD_SIZE } from '../model';
import css from './styles.module.css';

export function field($field: Store<boolean[][]>, rawClicked: Event<any>) {
  h('div', {
    classList: [css.field],
    styleVar: { size: FIELD_SIZE },
    handler: {
      click: rawClicked,
    },
    fn() {
      list($field, ({ store: $rowStore, key: $rowKey }) => {
        list($rowStore, ({ store: $colStore, key: $colkey }) => {
          h('div', {
            data: { row: $rowKey, col: $colkey },
            classList: { [css.cell]: true, [css.on]: $colStore },
          });
        });
      });
    },
  });
}
