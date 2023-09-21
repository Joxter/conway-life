import { fieldSize, focusToTheMiddle } from "../model/field";
import css from "./styles.module.css";
import { PlusMinus } from "./stateless/PlusMinus";
import { useUnit } from "effector-solid";

export function Navigation() {
  const [cellSize] = useUnit([fieldSize.$cellSize]);

  return (
    <div>
      <button class={css.arrowBtn} onClick={focusToTheMiddle}>
        to center
      </button>
      <div style={{ position: "absolute", right: "10px", bottom: "70px", "z-index": 1 }}>
        <PlusMinus
          value={cellSize().size}
          onPlusClicked={fieldSize.plus}
          onMinusClicked={fieldSize.minus}
          range={fieldSize.options}
          class={css.roundBox}
        />
      </div>
    </div>
  );
}
