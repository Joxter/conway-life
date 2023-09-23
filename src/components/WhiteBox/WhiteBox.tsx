import css from "./styles.module.css";
import { JSX } from "solid-js/types/jsx";

type Props = {
  class?: string | undefined;
  style: JSX.CSSProperties | undefined;
  children: JSX.Element | JSX.Element[];
};

export function WhiteBox(props: Props) {
  return (
    <div
      style={props.style}
      class={props.class}
      classList={{
        [css.root]: true,
      }}
    >
      {props.children}
    </div>
  );
}
