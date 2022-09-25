import { createEvent } from 'effector';
import { h, list } from 'forest';
import {
  $fieldTilesStyle,
  $viewField,
  $viewHoveredCell,
  elsaMode,
  fieldMouseMove,
  fieldSize,
} from '../../model/field';
import { Color1, Color2 } from '../../types';
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

const aaa = createEvent<any>();

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
      mousemove: fieldMouseMove,
      mouseleave: aaa, // todo add $hoverCell = null possibility
    },
    fn() {
      list($viewField, ({ store: $fieldStore }) => {
        h('div', {
          style: {
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

      h('div', {
        style: {
          boxShadow: 'inset 0px 0px 0px 3px #ec4dc7',
          left: $viewHoveredCell.map((it) => it.x),
          top: $viewHoveredCell.map((it) => it.y),
        },
        classList: [css.cell],
      });
    },
  });
}
