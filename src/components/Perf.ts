import { h, spec, text } from 'forest';
import { $stats, perf } from '../model/field';
import css from './styles.module.css';

export function Perf() {
  h('div', () => {
    spec({
      classList: [css.whiteBox],
      style: {
        position: 'absolute',
        display: 'grid',
        bottom: '10px',
        left: '130px',
      },
    });

    h('span', () => {
      text`FPS: ${perf.$fps}`;
    });
    h('span', () => {
      text`STEPS PER SEC: ${perf.$stepsPerSec}`;
    });
    h('span', () => {
      text`CALC TIME: ${perf.$time} msec`;
    });

    h('span', () => {
      text`CELLS: ${$stats.map((it) => it.faunaCellsAmount)}`;
    });
    h('span', () => {
      text`CELLS ON SCREEN: ${$stats.map((it) => it.fieldCellsAmount)}`;
    });
  });
}
