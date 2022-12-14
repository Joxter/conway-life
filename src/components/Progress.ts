import { h, spec, text, variant } from 'forest';
import { progress } from '../model/field';
import css from './styles.module.css';

export function Progress() {
  h('p', () => {
    spec({
      classList: [css.whiteBox],
      style: {
        position: 'absolute',
        display: 'flex',
        gap: '8px',
      },
    });
    h('button', { text: 'Step', handler: { click: progress.oneStep } });
    // h('button', { text: '100 steps', handler: { click: makeNSteps.prepend(() => 100) } });

    text` timer: `;

    variant({
      source: progress.$isRunning.map((isOn) => {
        return { show: isOn ? '1' : '0' };
      }),
      key: 'show',
      cases: {
        '1': () => {
          // h('button', { text: 'Pause', handler: { click: progress.pause } });
          h('button', {
            text: 'Stop',
            style: { color: '#f8f8f8', backgroundColor: '#de4040', border: '0' },
            handler: { click: progress.pause }, // todo fix to Stop
          });
        },
        '0': () => {
          h('button', {
            text: 'Start',
            style: { color: '#f8f8f8', backgroundColor: '#50c40e', border: '0' },
            handler: { click: progress.start },
          });
        },
      },
    });

    text`steps: ${progress.$currentStep}`;
  });
}
