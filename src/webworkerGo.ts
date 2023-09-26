import { newMakeGo } from "./makeGo";

self.addEventListener("message", (ev) => {
  const res = newMakeGo(ev.data);
  self.postMessage(res);
});
