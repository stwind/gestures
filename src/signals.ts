import { Signal, signal } from "@preact/signals";
import type { Node } from "./node";

export class Mutable<T> extends Signal<T> {
  version: Signal<number> = signal(0);
  val: T;

  constructor(val: T) {
    super(undefined);
    this.val = val;
  }

  peek() {
    return this.val;
  }

  notify() {
    const version = this.version;
    version.value = version.peek() + 1;
  }

  set value(val: T) {
    this.val = val;
    this.notify();
  }

  get value() {
    this.version.value;
    return this.val;
  }
}

export const mutable = <T>(x: T) => new Mutable(x);

export const fromPort = <T>(
  node: Node,
  port: string,
  init: T,
): Signal<T> => {
  const s = mutable(init);
  node.on(port, x => (s.value = x));
  return s;
};
