import { render } from "solid-js/web";
import { calculated, focusToTheMiddle, progress, startCalc } from "./model/field";
import "./model/app";
import "./style.css";
import { Field } from "./components/Field/Field";
import { Navigation } from "./components/Navigation";
import { Progress } from "./components/Progress";
import { Perf } from "./components/Perf";

function App() {
  return (
    <div>
      <div style={{ position: "absolute", "pointer-events": "none" }}>
        <h2>TODO</h2>
        <ul>
          <li> ++ navigation</li>
          <li> ++ field</li>
          <li> ++ Progress</li>
          <li> ++ perf</li>
          <li>history</li>
          <li>reset button</li>
          <li>import stuff</li>
        </ul>
      </div>
      <Navigation />
      <Field />
      <div
        style={{
          position: "absolute",
          width: "100%",
          "background-color": "rgba(255,255,255, 0.9)",
        }}
      >
        <h1>Game of Life</h1>
        <Progress />
      </div>
      <Perf />
    </div>
  );

  /*

  h('div', () => {
    navigation();
    h('div', {
      style: { position: 'absolute', width: '100%', backgroundColor: 'rgba(255,255,255, 0.9)' },
      fn() {
        h('h1', { text: 'Game of Life' });

        history();
        colorSelector();

        Progress();
      },
    });

    Perf();

    h('button', {
      text: 'Reset',
      style: { position: 'absolute', bottom: '20px', left: '20px' },
      handler: { click: resetFieldPressed },
    });

    h('div', () => {
      spec({ style: { position: 'absolute', bottom: '50px', left: '20px' } });
      // h('button', { text: 'Export', handler: { click: exportClicked } });
      h('button', { text: 'Import', handler: { click: importClicked } });
      h('br', {});
      h('textarea', {
        style: { fontSize: '8px', width: '100%', height: '100px', lineHeight: 1 },
        text: $exported,
        handler: {
          change: exportFieldChanged.prepend((ev) => {
            // @ts-ignore
            return ev.target.value;
          }),
        },
      });
    });
  });
*/
}

initWW();

function initWW() {
  const worker = new Worker("./webworkerGo.js");

  worker.addEventListener("message", (ev) => {
    // console.log(ev.data);
    calculated(ev.data);
  });
  worker.addEventListener("error", (err) => {
    console.log("main.error err", err);
  });

  startCalc.watch((fauna) => {
    worker.postMessage(fauna);
  });
}

render(() => <App />, document.querySelector<HTMLDivElement>("#app")!);

/*
- [x] (WIP) add presets by with 1 click
- [ ] (WIP) better scale:
  - [x] (WIP) "+" and "-" and with center in the middle of the screen
  - [x] (WIP) scale on scroll
- [ ] progress improvements:
  - [x] play/pause
  - [ ] different speed
  - [ ] restart (restore to 0)
  - [ ] back to N steps
- [ ] tools:
  - [x] toggle one cell
  - [ ] draw pen
  - [ ] add undo/redo
  - [ ] area to focus
  - [ ] ??? a line, selections to move/remove
- [x] canvas render
- [ ] add keyboard support
- [ ] (WIP) import/export blueprints from [conwaylife.com](https://conwaylife.com/ref/lexicon/zip/nbeluchenko/lexr_m.htm)
- [x] refactoring navigation (move by mouse)
- [x] safe delete
- [x] better "reset focus" focus to the center of paint
- [x] move camera with mouse or touch
- [x] add Elsa for Alisa mode, add "heart" cell design
- [x] add mobile layout
- [x] refactoring
  - [ ] store only live cells
  - [ ] recalculate only live cells
  - [x] boundaryless mode
  - [ ] fix history (save only live cells, update types)
- [x] dynamic cell size
- [x] add paint/erase mode
- [x] remove from history
- [x] add dynamic field size
- [x] two colors mode
- [x] move "camera"
- [x] toggle color on click, instead of painting
*/
