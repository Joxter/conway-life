export function PlusMinus(props: {
  range: readonly [number, number];
  value: number;
  onMinusClicked: () => any;
  onPlusClicked: () => any;
  class?: string;
}) {
  return (
    <div class={props.class}>
      <button onClick={props.onMinusClicked} disabled={props.value <= props.range[0]}>
        -
      </button>
      {` ${props.value} `}
      <button onClick={props.onPlusClicked} disabled={props.value >= props.range[1]}>
        +
      </button>
    </div>
  );
}
