import { signal } from "@preact/signals";

export interface Mutable<T> {
  notify(): void;
  peek(): T;
  set value(x: T);
  get value(): T;
}

const identity = <T>(x1: T, x0?: T) => x1;

export const mutable = <T>(x: T, update: (x1: T, x0?: T) => T = identity): Mutable<T> => {
  const version = signal(0);
  const notify = () => version.value = version.peek() + 1;
  return {
    notify,
    peek: () => x,
    set value(val: T) {
      x = update(val, x);
      notify();
    },
    get value() {
      version.value;
      return x;
    }
  };
};
