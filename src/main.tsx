import { type FunctionComponent, render } from "preact";
import { effect, Signal, signal } from "@preact/signals";
import "./index.css";

import { repeatedly } from "./scheduler";
import { EventBus, RAFEventBus } from "./event-bus";

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
      cancel = repeatedly(() => frame.value++);
    }
  });
};

const state: State = {
  frame: signal(0),
  paused: signal(false),
};

toggle(state);

// Events

const bus = new RAFEventBus({
  toggle: () => (state.paused.value = !state.paused.value),
  reset: (x: number = 0) => (state.frame.value = x),
});

// UI

const App: FunctionComponent<{ state: State; bus: EventBus }> = ({
  state: { frame, paused },
  bus,
}) => (
  <>
    <div>{frame}</div>
    <button
      style={{ width: "3.5rem" }}
      onClick={() => bus.dispatch(["toggle"])}
    >
      {paused.value ? "run" : "pause"}
    </button>
    <button onClick={() => bus.dispatch(["reset"])}>reset</button>
  </>
);

render(
  <App state={state} bus={bus} />,
  document.getElementById("app") as HTMLElement
);
