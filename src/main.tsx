import { type FunctionComponent as FC, render } from 'preact';
import { useRef } from 'preact/hooks';
import './css/index.css';

import { type Mutable, mutable } from './signals';
import { type Node, node, drag, passthrough, lastN } from './node';
import { usePointers, useCanvas2D } from './ui';
import { annotate } from './draw';
import { isMobile } from './utils';

type Vec2 = [number, number];

interface Pointer {
  id: number;
  pos: Vec2;
  active: boolean;
}

interface State {
  pointers: Record<number, Pointer>;
}

const nodes = {
  main: passthrough([
    'over',
    'enter',
    'down',
    'move',
    'up',
    'cancel',
    'out',
    'leave',
    'context',
  ]),

  state: node(output => {
    const state: State = {
      pointers: {},
    };
    const removeInactive = isMobile();
    return {
      pointer: (e: PointerEvent) => {
        const active = e.buttons === 1;
        if (!state.pointers[e.pointerId]) {
          state.pointers[e.pointerId] = {
            id: e.pointerId,
            pos: [e.clientX, e.clientY],
            active,
          };
        } else {
          state.pointers[e.pointerId].pos = [e.clientX, e.clientY];
          state.pointers[e.pointerId].active = active;
        }
        if (removeInactive && !active) delete state.pointers[e.pointerId];
        output('value', state);
      },
    };
  }),
  draw: node(() => {
    let ctx: CanvasRenderingContext2D,
      dpr: number = window.devicePixelRatio;
    const clear = () => {
      ctx.fillStyle = 'hsl(0,0%,95%)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };
    return {
      init: ([_ctx, _dpr]: [CanvasRenderingContext2D, number]) => {
        ctx = _ctx;
        dpr = _dpr;
        clear();
      },
      update({ pointers }: State) {
        clear();

        ctx.strokeStyle = 'hsl(0,0%,20%)';
        ctx.setLineDash([2, 2]);
        for (const {
          id,
          active,
          pos: [x, y],
        } of Object.values(pointers)) {
          ctx.beginPath();
          ctx.moveTo(0, y * dpr);
          ctx.lineTo(ctx.canvas.width, y * dpr);
          ctx.stroke();
          ctx.moveTo(x * dpr, 0);
          ctx.lineTo(x * dpr, ctx.canvas.height);
          ctx.stroke();

          const opts = {
            x,
            y,
            dpr,
            text: `[${id}] ${x.toFixed(0)},${y.toFixed(0)}`,
            bg: active ? 'red' : 'hsl(0,0%,20%)',
          };
          annotate(ctx, opts);
        }
        ctx.setLineDash([]);
      },
    };
  }),
};

nodes.main.route(nodes.state, {
  move: 'pointer',
  down: 'pointer',
  up: 'pointer',
});
nodes.main.route(nodes.draw, { context: 'init' });
nodes.state.route(nodes.draw, { value: 'update' });

const state: {
  positions: Mutable<Vec2[]>;
} = {
  positions: mutable([]),
};

// Components
type Component = FC<{ state: typeof state; events: Node }>;

const Canvas: Component = ({ events }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvas2D(canvasRef, (ctx, dpr) => events.dispatch('context', [ctx, dpr]));

  const props = usePointers({
    over: e => events.dispatch('over', e),
    enter: e => events.dispatch('enter', e),
    down: e => events.dispatch('down', e),
    move: e => events.dispatch('move', e),
    up: e => events.dispatch('up', e),
    cancel: e => events.dispatch('cancel', e),
    out: e => events.dispatch('out', e),
    leave: e => events.dispatch('leave', e),
  });

  return <canvas class="stage" ref={canvasRef} {...props}></canvas>;
};

const Info: Component = ({ state: { positions } }) => (
  <div class="info">
    {positions.value.map((pos, i) => (
      <div key={i}>
        {pos[0].toFixed(4)}, {pos[1].toFixed(4)}
      </div>
    ))}
  </div>
);

const App: Component = props => (
  <>
    <Canvas {...props} />
    <Info {...props} />
  </>
);

render(
  <App state={state} events={nodes.main} />,
  document.getElementById('app') as HTMLElement
);
