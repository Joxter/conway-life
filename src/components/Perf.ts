import { h, spec, text } from 'forest';
import { $stats, perf, progress } from '../model/field';
import { PlusMinus } from './stateless/PlusMinus';
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
      text`EXPECTED STEPS:`;
    });
    PlusMinus({
      value: progress.$expectedStepsPerSec,
      onPlusClicked: progress.incExpectedStepsPerSec,
      onMinusClicked: progress.decExpectedStepsPerSec,
      range: progress.speedRange,
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
