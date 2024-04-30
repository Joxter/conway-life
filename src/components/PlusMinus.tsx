import { JSX } from "solid-js/types/jsx";

type Props = {
  range?: readonly [number, number];
  value: string | number;
  onMinusClicked: () => any;
  onPlusClicked: () => any;
  class?: string;
  children?: JSX.Element | JSX.Element[];
};

export function PlusMinus(props: Props) {
  return (
    <div class={props.class} style={{ display: "flex", "align-items": "center", gap: "8px" }}>
      {props.children && <span>{props.children}</span>}
      <button onClick={props.onMinusClicked}>-</button>
      <span>{props.value}</span>
      <button onClick={props.onPlusClicked}>+</button>
    </div>
  );
}
