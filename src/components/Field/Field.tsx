import { $viewField, $viewHoveredCells, $viewLabels, fieldSize, screen } from "../../model/field";
import { XY } from "../../types";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";
import { For, onMount } from "solid-js";

const Color1 = "#5583e5";

let isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
const scale = window.devicePixelRatio;

export function Field() {
  let [viewHoveredCells, viewLabels, cellSize] = useUnit([
    $viewHoveredCells,
    $viewLabels,
    fieldSize.$cellSize,
  ]);

  let canvas: HTMLCanvasElement;

  let touchStartRef: XY | null = null;
  let touchCurrentRef: XY | null = null;

  onMount(() => {
    requestAnimationFrame(render);

    function render() {
      if (!canvas) {
        console.warn("no canvas");
        return;
      }

      // @ts-ignore
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.warn("no context");
        return;
      }

      let {
        size: { size },
        field,
      } = $viewField.getState();

      canvas.width = Math.floor(window.innerWidth * scale);
      canvas.height = Math.floor(document.body.offsetHeight * scale);

      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = document.body.offsetHeight + "px";

      ctx.scale(scale, scale);

      ctx.fillStyle = Color1;

      ctx.beginPath();

      if (size > 10) {
        field.forEach((c) => {
          ctx.rect(c[0] + 1, c[1] + 1, size - 1, size - 1);
        });
      } else {
        field.forEach((c) => {
          ctx.rect(c[0], c[1], size, size);
        });
      }

      ctx.fill();

      requestAnimationFrame(render);
    }
  });

  let threshold = 0;

  return (
    <div
      class={css.field}
      style={{
        // @ts-ignore
        "--cellSize": cellSize().size + "px",
        "--color1": Color1,
      }}
    >
      <canvas
        onTouchStart={(ev) => {
          if (isTouchDevice) {
            if (ev.touches.length === 1) {
              screen.onPointerDown({ x: ev.touches[0].clientX, y: ev.touches[0].clientY });
              touchStartRef = { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
              touchCurrentRef = null;
            }
          }
        }}
        onTouchMove={(ev) => {
          if (isTouchDevice) {
            if (ev.touches.length !== 1) {
              console.warn("onTouchMove ERROR");
              touchStartRef = null;
              touchCurrentRef = null;
            }

            if (touchStartRef) {
              touchCurrentRef = { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
              screen.onDrag({ from: touchStartRef, to: touchCurrentRef });
            }
          }
        }}
        onTouchEnd={(ev) => {
          if (isTouchDevice) {
            if (touchStartRef && !touchCurrentRef) {
              screen.onPointerClick(touchStartRef);
            }
            touchStartRef = null;
            touchCurrentRef = null;
          }
        }}
        onMouseDown={(ev) => {
          if (!isTouchDevice) {
            screen.onPointerDown({ x: ev.clientX, y: ev.clientY });
            touchStartRef = { x: ev.clientX, y: ev.clientY };
            touchCurrentRef = null;
          }
        }}
        onMouseMove={(ev) => {
          if (!isTouchDevice) {
            if (touchStartRef) {
              touchCurrentRef = { x: ev.clientX, y: ev.clientY };
              screen.onDrag({ from: touchStartRef, to: touchCurrentRef });
            } else {
              screen.onHover({ x: ev.clientX, y: ev.clientY });
            }
          }
        }}
        onMouseLeave={() => {
          if (!isTouchDevice) {
            screen.onPointerLeave();
            if (touchStartRef && !touchCurrentRef) {
              screen.onPointerClick(touchStartRef);
            }
            touchStartRef = null;
            touchCurrentRef = null;
          }
        }}
        onMouseUp={(ev) => {
          if (!isTouchDevice) {
            if (touchStartRef && !touchCurrentRef) {
              screen.onPointerClick(touchStartRef);
            }
            touchStartRef = null;
            touchCurrentRef = null;
          }
        }}
        onWheel={(ev) => {
          threshold += ev.deltaY;
          if (threshold > 20) {
            fieldSize.minus();
            threshold = 0;
          }
          if (threshold < -20) {
            fieldSize.plus();
            threshold = 0;
          }
        }}
        width={window.innerWidth}
        height={document.body.offsetHeight}
        ref={(el) => (canvas = el)}
      ></canvas>
      {viewHoveredCells().map((cell) => {
        return (
          <div
            style={{ left: cell.x + "px", top: cell.y + "px" }}
            classList={{ [css.cell]: true, [css.hoveredCell]: true }}
          />
        );
      })}
      <For each={viewLabels()}>
        {(labelStore) => {
          return (
            <div
              style={{ left: labelStore.x + "px", top: labelStore.y + "px" }}
              classList={{ [css.label]: true }}
            >
              {labelStore.label}
            </div>
          );
        }}
      </For>
    </div>
  );
}
