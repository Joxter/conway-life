import { h, spec, text, variant } from 'forest';
import { $stepCount, gameTick, gameTimer, makeNSteps } from '../model/progress';

export function progress() {
  h('p', () => {
    spec({
      style: {
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255, 0.9)',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #aaa',
        display: 'flex',
        gap: '8px',
      },
    });
    h('button', { text: 'Step', handler: { click: gameTick } });
    // h('button', { text: '100 steps', handler: { click: makeNSteps.prepend(() => 100) } });

    text` timer: `;

    variant({
      source: gameTimer.isRunning.map((isOn) => {
        return { show: isOn ? '1' : '0' };
      }),
      key: 'show',
      cases: {
        '1': () => {
          h('button', {
            text: 'Stop',
            style: { color: '#f8f8f8', backgroundColor: '#de4040', border: '0' },
            handler: { click: gameTimer.stop },
          });
        },
        '0': () => {
          h('button', {
            text: 'Start',
            style: { color: '#f8f8f8', backgroundColor: '#50c40e', border: '0' },
            handler: { click: gameTimer.start },
          });
        },
      },
    });

    text`steps: ${$stepCount}`;
  });
}
