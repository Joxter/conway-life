import { palette } from "../../model/field";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";

export function Palette() {
  let [items, currentPalette] = useUnit([palette.$items, palette.$currentPalette]);

  return (
    <div class={css.root}>
      <button
        classList={{
          [css.item]: true,
          [css.current]: !currentPalette(),
        }}
        onClick={() => palette.selectPattern(null)}
      >
        X
      </button>

      {items().map((name) => {
        let image = `https://cerestle.sirv.com/Images/png/${name.replace(".rle", "")}.png`;

        return (
          <button
            classList={{
              [css.item]: true,
              [css.current]: currentPalette()?.name === name,
            }}
            onClick={() => palette.selectPattern(name)}
            style={{
              "background-image": `url("${image}")`,
            }}
          ></button>
        );
      })}
    </div>
  );
}
