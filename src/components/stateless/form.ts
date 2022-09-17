import { combine, Event, Store } from 'effector';
import { h, list, spec } from 'forest';

export function select<T extends string>(
  props: {
    options: Store<Array<{ label: string; value: T; }>>;
    value: Store<T>;
    onChange: Event<any>;
  },
) {
  h('select', () => {
    spec({ handler: { change: props.onChange } });
    list(props.options, ({ store }) => {
      h('option', {
        attr: {
          value: store.map((it) => it.value),
          selected: combine(store, props.value, (item, value) => {
            return item.value === value;
          }),
        },
        text: store.map((it) => it.label),
      });
    });
  });
}
