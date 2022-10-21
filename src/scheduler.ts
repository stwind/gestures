export type Callback = () => void;
export interface IScheduler<T> {
  schedule(f: Callback): T;
  cancel(x: T): void;
}

export const RAF_SCHEDULER = {
  schedule(cb: Callback): number {
    return requestAnimationFrame(cb);
  },

  cancel(x: number): void {
    cancelAnimationFrame(x);
  }
} as IScheduler<number>;

export const NULL_SCHEDULER = {
  schedule() { },
  cancel() { }
} as IScheduler<void>;

export const once = <T>(scheduler: IScheduler<T>) => {
  let id: T | undefined;
  return (f: Callback) => {
    if (id === undefined) {
      id = scheduler.schedule(() => {
        id = undefined;
        f();
      });
    }
  }
}

export const repeatedly = <T,>(f: () => any, scheduler: IScheduler<T> = RAF_SCHEDULER as IScheduler<T>) => {
  let handle = scheduler.schedule(function step() {
    if (f() !== false) handle = scheduler.schedule(step);
  });
  return () => scheduler.cancel(handle);
}

