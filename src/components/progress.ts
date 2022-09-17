import { h, spec, text, variant } from 'forest';
import { $stepCount, gameTick, gameTimer, makeNSteps } from '../model/field';

export function progress() {
  h('p', () => {
    spec({ style: { display: 'flex', gap: '8px' } });
    h('button', { text: 'Step', handler: { click: gameTick } });
    h('button', { text: '100 steps', handler: { click: makeNSteps.prepend(() => 100) } });

    text` timer: ${gameTimer.isRunning.map((on) => on ? 'on' : 'off')} `;

    variant({
      source: gameTimer.isRunning.map((isOn) => {
        return { show: isOn ? '1' : '0' };
      }),
      key: 'show',
      cases: {
        '1': () => {
          h('button', { text: 'Stop', handler: { click: gameTimer.stop } });
        },
        '0': () => {
          h('button', { text: 'Start', handler: { click: gameTimer.start } });
        },
      },
    });

    text`generation: ${$stepCount}`;
  });
}
