import { type IScheduler, type Callback, NULL_SCHEDULER, once } from "./scheduler.js";

export type Event = [string, any?];
export type Handler = (args: any, bus: EventBus) => void;
export type Handlers = Record<string, Handler>;

export class EventBus {
  #queue: Event[] = [];

  constructor(public handlers: Record<string, Handler>) { }

  dispatch(name: keyof typeof this.handlers, data?: any) {
    this.#queue.push([name, data]);
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

  constructor(handlers: Handlers, scheduler: IScheduler<T>) {
    super(handlers);
    this.#later = once(scheduler);
  }

  dispatch(name: keyof typeof this.handlers, data?: any) {
    super.dispatch(name, data);
    this.#later(() => this.process());
  }
}

export const eventBus = <T,>(handlers: Handlers, scheduler = NULL_SCHEDULER as IScheduler<T>) =>
  new ScheduledEventBus(handlers, scheduler);