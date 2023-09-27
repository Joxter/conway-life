import { newMakeGo } from "./makeGo";

let gen = 0;
let lastRes: ReturnType<typeof newMakeGo> | null = null;

self.addEventListener("message", (ev) => {
  if (ev.data.fauna) {
    lastRes = null;
    lastRes = newMakeGo(ev.data.fauna);
    gen = 1;

    self.postMessage({ res: lastRes, gen });
  } else if (ev.data.gen) {
    if (!lastRes) {
      console.log("no lastRes");
      return;
    }

    while (gen < ev.data.gen) {
      gen++;
      lastRes = newMakeGo(lastRes!.fauna);
    }

    self.postMessage({ res: lastRes!, gen });
  }
});
