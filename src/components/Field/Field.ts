import { h, list, spec, node } from 'forest';
import {
  $viewField,
  $viewHoveredCells,
  $viewLabels,
  fieldSize,
  hoveredCell,
} from '../../model/field';
import { Color1, Color2 } from '../../types';
import { getWindowParams } from '../../utils';
import css from './styles.module.css';

function getSvgSquareUrl(size: number) {
  const svg = `
<svg viewBox='0 0 ${size} ${size}' xmlns='http://www.w3.org/2000/svg'>
<line x1='0' y1='0' x2='0' y2='${size}' stroke='#b4b6b8' />
<line x1='0' y1='0' x2='${size}' y2='0' stroke='#b4b6b8' />
</svg>`;
  return `data:image/svg+xml;base64,` + btoa(svg.replace(/\n/g, ''));
}

export function field() {
  h('div', {
    classList: [css.field],
    styleVar: {
      cellSize: fieldSize.$cellSize.map((it) => it + 'px'),
      color1: Color1,
      color2: Color2,
    },
    style: {
      // backgroundImage: $fieldTilesStyle.map((mode) => {
      //   let picUrl = mode === 'elsa' ? heartLine : getSvgSquareUrl(mode);
      //   return `url("${picUrl}")`;
      // }),
      // backgroundSize: fieldSize.$cellSize.map((it) => `${it}px ${it}px`),
    },
    handler: {
      mousemove: hoveredCell.fieldMouseMoved,
      mouseleave: hoveredCell.fieldMouseLeaved,
    },
    fn() {
      const vp = getWindowParams();

      h('canvas', () => {
        spec({
          attr: {
            width: vp.width,
            height: vp.height
          }
        });
        node((can) => {
          requestAnimationFrame(render);

          function render() {
            let { size, field } = $viewField.getState();
            // @ts-ignore
            let ctx = can.getContext("2d");

            let { width: w, height: h } = can.getBoundingClientRect();
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = Color1;

            ctx.beginPath();

            field.forEach((c) => {
              ctx.rect(c.col * size, c.row * size, size, size);
            });

            ctx.fill();

            requestAnimationFrame(render);
          }
        });
      });

      list($viewHoveredCells, ({ store: $cell }) => {
        h('div', {
          style: {
            left: $cell.map((it) => it ? it.x : '-100px'),
            top: $cell.map((it) => it ? it.y : '-100px'),
          },
          classList: [css.cell, css.hoveredCell],
        });
      });

      list($viewLabels, ({ store: $labelStore }) => {
        h('div', {
          style: {
            left: $labelStore.map((it) => it.x),
            top: $labelStore.map((it) => it.y),
          },
          text: $labelStore.map((it) => it.label),
          classList: [css.label],
        });
      });
    },
  });
}
