import { h, list } from 'forest';
import {
  $fieldTilesStyle,
  $viewField,
  $viewHoveredCells,
  $viewLabels,
  elsaMode,
  fieldSize,
  hoveredCell,
} from '../../model/field';
import { Color1, Color2, RENDER_MODE } from '../../types';
import { getWindowParams } from '../../utils';
import heartLine from './heart-line-icon.svg';
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
      backgroundImage: $fieldTilesStyle.map((mode) => {
        let picUrl = mode === 'elsa' ? heartLine : getSvgSquareUrl(mode);
        return `url("${picUrl}")`;
      }),
      backgroundSize: fieldSize.$cellSize.map((it) => `${it}px ${it}px`),
    },
    handler: {
      mousemove: hoveredCell.fieldMouseMoved,
      mouseleave: hoveredCell.fieldMouseLeaved,
    },
    fn() {
      const vp = getWindowParams();

      if (RENDER_MODE === 'svg') {
        h('svg', {
          attr: {
            width: vp.width,
            height: vp.height,
            viewBox: `0 0 ${vp.width} ${vp.height}`,
            xmlns: 'http://www.w3.org/2000/svg',
          },
          fn: () => {
            list($viewField, ({ store: $fieldStore }) => {
              h('rect', {
                attr: {
                  x: $fieldStore.map((it) => it.x),
                  y: $fieldStore.map((it) => it.y),
                  width: fieldSize.$cellSize,
                  height: fieldSize.$cellSize,
                  fill: Color1,
                },
              });
            });
          },
        });
      }

      if (RENDER_MODE === 'html') {
        list($viewField, ({ store: $fieldStore }) => {
          h('div', {
            style: {
              // todo test transition
              left: $fieldStore.map((it) => it.x),
              top: $fieldStore.map((it) => it.y),
            },
            classList: {
              [css.heartMode]: elsaMode.$isOn,
              [css.cell]: true,
              [css.on1]: $fieldStore.map((it) => it.val === 1),
              [css.on2]: $fieldStore.map((it) => it.val === 2),
            },
          });
        });
      }

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
