import { signal } from "@preact/signals";

export interface Mutable<T> {
  notify(): void;
  peek(): T;
  set value(x: T);
  get value(): T;
}

export const mutable = <T>(x: T, update?: (x: T) => void): Mutable<T> => {
  const version = signal(0);
  const notify = () => version.value = version.peek() + 1;
  return {
    notify,
    peek: () => x,
    set value(val: T) {
      x = val;
      notify();
    },
    get value() {
      version.value;
      return x;
    }
  };
};