type Fn = (x: any) => void;
type Create = (output: (port: string, val: any) => void) => Record<string, Fn>;

export interface Node {
  on(port: string, f: Fn): () => void;
  dispatch(port: string, x: any): void;
  pipe(outPort: string, node: Node, inPort: string, tx?: (x: any) => any): void;
}

const identity = (x: any) => x;

export const node = (create: Create): Node => {
  const listeners: Record<string, Fn[]> = {};

  const inputs = create((port, val) =>
    listeners[port] && listeners[port].forEach(f => f(val)));

  const on: Node['on'] = (port, f) => {
    if (!listeners[port]) listeners[port] = [];
    listeners[port].push(f);
    return () => listeners[port] = listeners[port].filter(x => x != f);
  };

  return {
    on,
    dispatch: (port, val) => inputs[port] && inputs[port](val),
    pipe: (outPort: string, node: Node, inPort: string, tx = identity) =>
      on(outPort, x => node.dispatch(inPort, identity(x)))
  };
};