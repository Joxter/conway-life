import {
  $viewField,
  $viewHoveredCells,
  $viewLabels,
  dragTool,
  fieldSize,
  hoveredCell,
} from "../../model/field";
import { Color1 } from "../../types";
import { getWindowParams } from "../../utils";
import css from "./styles.module.css";
import { useUnit } from "effector-solid";
import { onMount, createSignal } from "solid-js";

let isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

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
      // onMouseMove={({ clientX, clientY }) =>
      //   hoveredCell.fieldMouseMoved({ x: clientX, y: clientY })
      // }
      // onMouseLeave={hoveredCell.fieldMouseLeaved}
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
            setEvents([...events(), "onTouchStart-" + ev.touches.length]);
            if (ev.touches.length === 1) {
              dragTool.onMDown({ x: ev.touches[0].clientX, y: ev.touches[0].clientY });
            }
          }
        }}
        onTouchEnd={(ev) => {
          if (isTouchDevice) {
            setEvents([...events(), "onTouchEnd"]);
            dragTool.onMUp();
          }
        }}
        onTouchMove={(ev) => {
          setEvents([...events(), "onTouchMove-" + ev.touches.length]);
          if (ev.touches.length === 1) {
            hoveredCell.fieldMouseMoved({ x: ev.touches[0].clientX, y: ev.touches[0].clientY });
          }
        }}
        onMouseLeave={() => {
          /*
  onTouchStart
  onTouchMove ....
  onTouchEnd
*/
          if (!isTouchDevice) {
            setEvents([...events(), "onMouseLeave"]);
            hoveredCell.fieldMouseLeaved();
          }
        }}
        onMouseMove={(ev) => {
          if (!isTouchDevice) {
            setEvents([...events(), "onMouseMove"]);
            hoveredCell.fieldMouseMoved({ x: ev.clientX, y: ev.clientY });
          }
        }}
        onMouseDown={(ev) => {
          if (!isTouchDevice) {
            setEvents([...events(), "onMouseDown"]);
            dragTool.onMDown({ x: ev.clientX, y: ev.clientY });
          }
        }}
        onMouseUp={(ev) => {
          if (!isTouchDevice) {
            setEvents([...events(), "onMouseUp"]);
            dragTool.onMUp();
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
