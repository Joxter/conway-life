import { MyFauna } from "./lifes/myFauna";

let lastRes: MyFauna | null = null;

self.addEventListener("message", (ev) => {
  if (ev.data.fauna) {
    lastRes = new MyFauna();
    lastRes.deserialise(ev.data.fauna);
  } else if (ev.data.gen) {
    if (!lastRes) {
      console.log("no lastRes");
      return;
    }

    lastRes.nextGen();

    self.postMessage({ calculated: lastRes.serialise() });
  }
});
