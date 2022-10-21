import { type FunctionComponent, render } from "preact";
import { effect, Signal, signal } from "@preact/signals";
import "./index.css";

// Utils

const raf = (f: (t: DOMHighResTimeStamp) => any) => {
  let handle = requestAnimationFrame(function frame(t) {
    if (f(t) !== false) handle = requestAnimationFrame(frame);
  });
  return () => cancelAnimationFrame(handle);
};

// State

interface State {
  frame: Signal<number>;
  paused: Signal<boolean>;
}

const toggle = ({ frame, paused }: State) => {
  let cancel: () => void;
  return effect(() => {
    if (paused.value) {
      if (cancel) cancel();
    } else {
      cancel = raf(() => frame.value++);
    }
  });
};

const state: State = {
  frame: signal(0),
  paused: signal(false),
};

toggle(state);

// UI

const App: FunctionComponent<{ state: State }> = ({
  state: { frame, paused },
}) => (
  <>
    <div>{frame}</div>
    <button
      style={{ width: "3.5rem" }}
      onClick={() => (paused.value = !paused.value)}
    >
      {paused.value ? "run" : "pause"}
    </button>
    <button onClick={() => (frame.value = 0)}>reset</button>
  </>
);

render(<App state={state} />, document.getElementById("app") as HTMLElement);
