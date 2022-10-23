import { signal, effect } from "@preact/signals";

export interface RefSignal<T> {
  notify: () => void;
  dispose: () => void;
  set value(x: T);
  get value(): T;
}

export const ref = <T>(x: T, update?: (x: T) => void) => {
  const version = signal(0);
  const notify = () => version.value = version.peek() + 1;
  return {
    notify,
    dispose: effect(() => (update && update(x), notify())),
    set value(val: T) {
      x = val;
      notify();
    },
    get value() {
      version.value;
      return x;
    }
  } as RefSignal<T>;
};