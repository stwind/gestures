import { type IScheduler, type Callback, RAF_SCHEDULER, once } from "./scheduler";

export type Event = [string, any?];
export type Handler = (args: any, bus: EventBus) => void;

export class EventBus {
  #queue: Event[] = [];

  constructor(public handlers: Record<string, Handler>) {
  }

  dispatch(e: Event) {
    this.#queue.push(e);
  }

  process() {
    const queue = [...this.#queue];
    this.#queue.length = 0;
    const handlers = this.handlers;
    for (const [name, args] of queue) {
      const handler = handlers[name];
      if (handler) handler(args, this);
    }
  }
}

export class ScheduledEventBus<T> extends EventBus {
  #later: (f: Callback) => void;

  constructor(handlers: Record<string, Handler>, scheduler: IScheduler<T> = RAF_SCHEDULER as IScheduler<T>) {
    super(handlers);
    this.#later = once(scheduler);
  }

  dispatch(e: Event) {
    super.dispatch(e);
    this.#later(() => this.process());
  }
}