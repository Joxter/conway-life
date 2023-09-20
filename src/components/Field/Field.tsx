import { $viewField, $viewHoveredCells, $viewLabels, fieldSize, screen } from "../../model/field";
import { Color1, XY } from "../../types";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";
import { onMount, createSignal } from "solid-js";

let isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

export function Field() {
  let [viewHoveredCells, viewLabels, cellSize] = useUnit([
    $viewHoveredCells,
    $viewLabels,
    fieldSize.$cellSize,
  ]);

  let can: HTMLCanvasElement;

  let touchStartRef: XY | null = null;
  let touchCurrentRef: XY | null = null;

  onMount(() => {
    requestAnimationFrame(render);

    function render() {
      if (!can) {
        console.warn("no canvas");
        return;
      }

      let {
        size: { size },
        field,
      } = $viewField.getState();
      // @ts-ignore
      const ctx = can.getContext("2d");
      if (!ctx) {
        console.warn("no context");
        return;
      }

      let { width: w, height: h } = can.getBoundingClientRect();
      ctx.clearRect(0, 0, w, h);
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

  let [events, setEvents] = createSignal<string[]>([]);

  let compactEvents = () => {
    let allEvents = events();

    let lastEvent: any = null;
    let result: Array<[string, number]> = [];

    allEvents.forEach((event) => {
      if (lastEvent === event) {
        result[result.length - 1][1]++;
      } else {
        result.push([event, 1]);
        lastEvent = event;
      }
    });

    return result;
  };

  return (
    <div
      class={css.field}
      style={{
        // @ts-ignore
        "--cellSize": cellSize().size + "px",
        "--color1": Color1,
      }}
    >
      <div
        style={{
          position: "absolute",
          "z-index": "2",
          bottom: "90px",
          right: "50px",
          height: "80vh",
          display: "grid",
          width: "150px",
          "font-size": "12px",
          "line-height": "1",
          "align-content": "end",
          "pointer-events": "none",
          overflow: "hidden",
        }}
      >
        {compactEvents().map(([name, cnt], i) => (
          <div>
            {i}) {cnt} {name}
          </div>
        ))}
        <div>isTouchDevice: {String(isTouchDevice)}</div>
        <div>d</div>
      </div>
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
        ref={(el) => (can = el)}
      ></canvas>
      {viewHoveredCells().map((cell) => {
        return (
          <div
            style={{ left: cell.x + "px", top: cell.y + "px" }}
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
