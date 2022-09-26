import { h, spec } from 'forest';
import { dragTool, fieldSize, focusToTheMiddle } from '../model/field';
import { PlusMinus } from './stateless/plusMinus';
import css from './styles.module.css';

export function navigation() {
  dragTool.initEvents();

  h('button', {
    classList: [css.arrowBtn],
    handler: { click: focusToTheMiddle },
    text: 'to center',
  });

  h('div', () => {
    spec({ style: { position: 'absolute', right: '150px', bottom: '20px', zIndex: 1 } });

    PlusMinus({
      value: fieldSize.$cellSize,
      onPlusClicked: fieldSize.plus,
      onMinusClicked: fieldSize.minus,
      range: fieldSize.options,
      classList: [css.roundBox],
    });
  });
}
