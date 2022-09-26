import { Event, Store } from 'effector';
import { ClassListArray, ClassListMap, h, spec, text } from 'forest';

export function PlusMinus(
  props: {
    range: readonly [number, number];
    value: Store<number>;
    onMinusClicked: Event<any>;
    onPlusClicked: Event<any>;
    classList?: ClassListMap | ClassListArray;
  },
) {
  const [from, to] = props.range;

  h('div', () => {
    spec({ classList: props.classList });

    h('button', {
      handler: { click: props.onMinusClicked },
      text: '-',
      attr: { disabled: props.value.map((val) => val <= from) },
    });
    text` ${props.value} `;
    h('button', {
      handler: { click: props.onPlusClicked },
      text: '+',
      attr: { disabled: props.value.map((val) => val >= to) },
    });
  });
}
