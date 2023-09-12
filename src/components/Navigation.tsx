import { dragTool, focusToTheMiddle } from "../model/field";
import css from "./styles.module.css";

export function Navigation() {
  dragTool.initEvents();

  return (
    <div>
      <button class={css.arrowBtn} onClick={focusToTheMiddle}>
        to center
      </button>
      <div style={{ position: "absolute", right: "150px", bottom: "20px", "z-index": 1 }}>
        <p>todo PlusMinus</p>
        {/*    PlusMinus({
      value: fieldSize.$cellSize,
      onPlusClicked: fieldSize.plus,
      onMinusClicked: fieldSize.minus,
      range: fieldSize.options,
      classList: [css.roundBox],
    });
*/}
      </div>
    </div>
  );
}
