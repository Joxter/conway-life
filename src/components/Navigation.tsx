import { fieldSize, focusToTheMiddle } from "../model/field";
import { PlusMinus } from "./PlusMinus";
import { useUnit } from "effector-solid";

export function Navigation() {
  const [cellSize] = useUnit([fieldSize.$cellSize]);

  return (
    <>
      <div>
        <PlusMinus
          value={cellSize().size}
          onPlusClicked={fieldSize.plus}
          onMinusClicked={fieldSize.minus}
          range={fieldSize.options}
        />
      </div>
      <button style={{ padding: "4px", "margin-top": "10px" }} onClick={focusToTheMiddle}>
        to center
      </button>
    </>
  );
}
