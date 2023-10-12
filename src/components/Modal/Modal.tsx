import css from "./styles.module.css";
import { JSX } from "solid-js/types/jsx";

type Props = {
  children: JSX.Element | JSX.Element[];
  open: boolean;
  close: () => any;
};

export function Modal(props: Props) {
  document.addEventListener("keydown", (ev) => {
    if (props.open && ev.code == "Escape") {
      props.close();
    }
  });

  return (
    <div
      class={css.overlay}
      style={{ display: props.open ? "initial" : "none" }}
      onClick={(ev) => {
        if (ev.target.classList.contains(css.overlay)) {
          props.close();
        }
      }}
    >
      <div class={css.modal}>
        {props.children}
        <button class={css.close} onClick={props.close}>
          close
        </button>
      </div>
    </div>
  );
}
