type Fn = (x: any) => void;
type Port = string;
type Output = (port: Port, val: any) => void;
type Create = (output: Output) => Record<Port, Fn>;

export interface Node {
  on(port: string, f: Fn): () => void;
  dispatch(port: Port, x: any): void;
  route(node: Node, ports: Record<Port, Port>): void;
}

export const node = (create: Create): Node => {
  const listeners: Record<Port, Fn[]> = {};

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
    route: (node, ports) => Object.entries(ports).forEach(
      ([outP, inP]) => on(outP, x => node.dispatch(inP, x)))
  };
};

export const passthrough = (names: string[]) => node(output =>
  Object.fromEntries(names.map(name => [name, x => output(name, x)])));
