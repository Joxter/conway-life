import { currGen, nextGen } from "./calcNextGen";

let gen = 0;
let lastRes: ReturnType<typeof nextGen> | null = null;

self.addEventListener("message", (ev) => {
  if (ev.data.fauna) {
    lastRes = currGen(ev.data.fauna);
    gen = 1;

    self.postMessage({ res: lastRes, gen });
  } else if (ev.data.gen) {
    if (!lastRes) {
      console.log("no lastRes");
      return;
    }

    // while (gen < ev.data.gen) {
    gen++;
    lastRes = nextGen(lastRes!.fauna);
    // }

    self.postMessage({ res: lastRes!, gen });
  }
});
