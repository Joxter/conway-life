import {
  $viewField,
  $viewHoveredCells,
  $viewLabels,
  fieldSize,
  hoveredCell,
} from "../../model/field";
import { Color1, Color2 } from "../../types";
import { getWindowParams } from "../../utils";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";
import { onMount } from "solid-js";

export function Field() {
  let vp = getWindowParams();
  let [viewHoveredCells, viewLabels, cellSize] = useUnit([
    $viewHoveredCells,
    $viewLabels,
    fieldSize.$cellSize,
  ]);

  let can: HTMLCanvasElement;

  onMount(() => {
    requestAnimationFrame(render);

    function render() {
      if (!can) {
        console.warn("no canvas");
        return;
      }

      let { size, field } = $viewField.getState();
      // @ts-ignore
      let ctx = can.getContext("2d");
      if (!ctx) {
        console.warn("no context");
        return;
      }

      let { width: w, height: h } = can.getBoundingClientRect();
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = Color1;

      ctx.beginPath();

      field.forEach((c) => {
        if (ctx) {
          ctx.rect(c.col, c.row, size.size, size.size);
        }
      });

      let { width, height } = getWindowParams();

      ctx.roundRect(width / 2 - 6, height / 2 - 6, 12, 12, 10);
      ctx.fill();

      requestAnimationFrame(render);
    }
  });

  return (
    <div
      class={css.field}
      style={{
        // @ts-ignore
        "--cellSize": cellSize().size + "px",
        "--color1": Color1,
        "--color2": Color2,
      }}
      onMouseMove={({ clientX, clientY }) =>
        hoveredCell.fieldMouseMoved({ x: clientX, y: clientY })
      }
      onMouseLeave={hoveredCell.fieldMouseLeaved}
    >
      <canvas width={vp.width} height={vp.height} ref={(el) => (can = el)}></canvas>
      {viewHoveredCells().map((cell) => {
        return (
          <div
            style={{ left: cell.x, top: cell.y }}
            classList={{ [css.cell]: true, [css.hoveredCell]: true }}
          />
        );
      })}
      {viewLabels().map((labelStore) => {
        return (
          <div style={{ left: labelStore.x, top: labelStore.y }} classList={{ [css.label]: true }}>
            {labelStore.label}
          </div>
        );
      })}
    </div>
  );
}
