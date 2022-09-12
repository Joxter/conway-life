import { createEvent, sample } from 'effector';
import { h, list, spec, text } from 'forest';
import { $history, historySelected, removeFromHistory } from '../model/history';
import css from './styles.module.css';

export function history() {
  h('div', {
    classList: [css.history],
    fn() {
      h('p', { text: 'History: ', style: { margin: '0' } });

      list($history, ({ store: $historyEl }) => {
        const rawClick = createEvent<any>();
        const rawRemoveClick = createEvent<any>();

        sample({
          clock: rawClick,
          source: $historyEl.map((it) => it.name),
          target: historySelected,
        });
        sample({
          clock: rawRemoveClick,
          source: $historyEl.map((it) => it.name),
          target: removeFromHistory,
        });

        h('div', () => {
          h('button', () => {
            spec({ handler: { click: rawClick } });
            text`${$historyEl.map((it) => it.name)}`;
          });
          h('button', () => {
            spec({ handler: { click: rawRemoveClick } });
            text`x`;
          });
        });
      });
    },
  });
}
