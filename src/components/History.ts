import { createEvent, sample } from 'effector';
import { h, list, spec, text } from 'forest';
import {
  $historyView,
  $itemsToRemove,
  historySelected,
  removeClicked,
  restoreClicked,
  saveClicked,
} from '../model/history';
import css from './styles.module.css';

export function history() {
  h('div', {
    classList: [css.history],
    fn() {
      h('p', { text: 'History: ', style: { margin: '0' } });

      list($historyView, ({ store: $historyEl }) => {
        const rawClick = createEvent<any>();
        const rawRemoveClick = createEvent<any>();

        sample({
          // todo make different normal buttons
          source: { historyEl: $historyEl, itemsToRemove: $itemsToRemove },
          clock: rawClick,
          filter: ({ historyEl, itemsToRemove }) => {
            return itemsToRemove.has(historyEl.name);
          },
          fn: ({ historyEl }) => historyEl.name,
          target: restoreClicked,
        });

        sample({
          source: { historyEl: $historyEl, itemsToRemove: $itemsToRemove },
          clock: rawClick,
          filter: ({ historyEl, itemsToRemove }) => {
            return !itemsToRemove.has(historyEl.name);
          },
          fn: ({ historyEl }) => historyEl.name,
          target: historySelected,
        });

        sample({
          clock: rawRemoveClick,
          source: $historyEl.map((it) => it.name),
          target: removeClicked,
        });

        h('div', () => {
          h('button', () => {
            spec({ handler: { click: rawClick } });
            text`${$historyEl.map((it) => it.toRemove ? `restore (${it.name})` : it.name)}`;
          });
          h('button', () => {
            spec({ handler: { click: rawRemoveClick } });
            text`x`;
          });
        });
      });
      h('button', { style: { marginLeft: 'auto' }, text: 'Save', handler: { click: saveClicked } });
    },
  });
}
