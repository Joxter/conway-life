import { JSX } from "solid-js/types/jsx";

type Props = {
  range: readonly [number, number];
  value: number;
  onMinusClicked: () => any;
  onPlusClicked: () => any;
  class?: string;
  children?: JSX.Element | JSX.Element[];
}

export function PlusMinus(props: Props) {
  return (
    <div class={props.class} style={{ display: "flex", "align-items": "center", gap: "8px" }}>
      {props.children && <span>{props.children}</span>}
      <button onClick={props.onMinusClicked} disabled={props.value <= props.range[0]}>
        -
      </button>
      <span>{props.value}</span>
      <button onClick={props.onPlusClicked} disabled={props.value >= props.range[1]}>
        +
      </button>
    </div>
  );
}
