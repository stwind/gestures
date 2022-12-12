import { type FunctionComponent as FC, render } from 'preact';
import { useRef } from 'preact/hooks';
import './css/index.css';

import { type Mutable, mutable } from './signals';
import { type Node, node, passthrough } from './node';
import { usePointers, useCanvas2D, useWheel } from './ui';
import { annotate, cross } from './draw';
import { isMobile, copy, lerp } from './utils';

type Vec2 = [number, number];

interface Pointer {
  id: number;
  positions: Vec2[];
  type: 'move' | 'down' | 'up';
  active: boolean;
  trail: Vec2[];
}

interface State {
  pointers: Record<number, Pointer>;
  transform: [number, number, number, number, number, number];
}

const nodes = {
  main: passthrough(['down', 'move', 'up', 'wheel', 'context']),

  pointers: node(output => {
    const pointers: State['pointers'] = {};
    const removeInactive = isMobile();
    return {
      pointer: (e: PointerEvent) => {
        const pointer = (pointers[e.pointerId] ||= {
          id: e.pointerId,
          positions: [],
          trail: [],
          type: 'move',
          active: false,
        });

        pointer.active = e.buttons === 1;
        pointer.type = e.type.slice(7) as Pointer['type'];
        pointer.positions.unshift([e.offsetX, e.offsetY]);
        if (pointer.positions.length > 30) pointer.positions.pop();

        if (pointer.active || pointer.type == 'up') {
          if (pointer.type == 'down') pointer.trail.length = 0;
          pointer.trail.unshift([e.offsetX, e.offsetY]);
        }

        if (e.type == 'pointerdown' && removeInactive) {
          for (const id in pointers)
            if (pointers[id].type == 'up') delete pointers[id];
        }
        output('value', pointers);
      },
    };
  }),
  state: node(output => {
    const state: State = {
      transform: [1, 0, 0, 1, 0, 0],
      pointers: {},
    };
    const tfms = [1, 0, 0, 1, 0, 0];
    return {
      pointers: (pointers: State['pointers']) => {
        state.pointers = pointers;
        const downP = Object.values(pointers).find(p => p.type == 'down');
        if (downP) copy(tfms, state.transform);

        const activeP = Object.values(pointers).find(
          p => p.active || p.type == 'up'
        );
        if (activeP) {
          const a = activeP.trail[0];
          const b = activeP.trail.at(-1)!;
          state.transform[4] = tfms[4] + a[0] - b[0];
          state.transform[5] = tfms[5] + a[1] - b[1];
        }

        output('value', state);
      },
      wheel: (e: WheelEvent) => {
        const s = e.deltaY * 1e-4;

        state.transform[4] = lerp(
          state.transform[4],
          e.offsetX,
          s / state.transform[0]
        );
        state.transform[0] -= s;

        state.transform[5] = lerp(
          state.transform[5],
          e.offsetY,
          s / state.transform[3]
        );
        state.transform[3] -= s;
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
    const drawMark = (size = 500) => {
      ctx.fillStyle = 'rgba(36,94,7,.85)';
      ctx.strokeStyle = 'hsl(0,0%,20%)';
      const x = (ctx.canvas.width - size) * 0.5;
      const y = (ctx.canvas.height - size) * 0.5;
      ctx.fillRect(x, y, size, size);
    };
    return {
      init: ([_ctx, _dpr]: [CanvasRenderingContext2D, number]) => {
        ctx = _ctx;
        dpr = _dpr;
        clear();
        drawMark();
      },
      update({ pointers, transform }: State) {
        clear();

        ctx.save();
        ctx.transform(
          transform[0],
          transform[1],
          transform[2],
          transform[3],
          transform[4] * dpr,
          transform[5] * dpr
        );
        drawMark();
        ctx.restore();

        for (const { id, active, positions, trail } of Object.values(
          pointers
        )) {
          ctx.fillStyle = 'hsla(0,0%,50%,.1)';
          ctx.strokeStyle = 'hsla(0,0%,50%,.5)';
          let s = positions.length + 10;
          for (const [x, y] of positions) {
            ctx.beginPath();
            ctx.arc(x * dpr, y * dpr, s--, 0, 360);
            ctx.fill();
            ctx.stroke();
          }

          if (trail.length > 0) {
            ctx.strokeStyle = 'hsl(0,0%,30%)';
            ctx.beginPath();
            ctx.moveTo(trail[0][0] * dpr, trail[0][1] * dpr);
            for (let i = 1, n = trail.length; i < n; i++) {
              const [x, y] = trail[i];
              ctx.lineTo(x * dpr, y * dpr);
            }
            ctx.stroke();

            const first = trail[0],
              last = trail[trail.length - 1];
            ctx.strokeStyle = 'rgb(202,38,38)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(first[0] * dpr, first[1] * dpr);
            ctx.lineTo(last[0] * dpr, last[1] * dpr);
            ctx.stroke();
            ctx.lineWidth = 1;
          }

          const [x, y] = positions[0];
          ctx.setLineDash([2, 2]);
          ctx.strokeStyle = 'hsl(0,0%,20%)';
          cross({ ctx, dpr }, { x, y });
          annotate(
            { ctx, dpr },
            {
              x,
              y,
              text: `[${id}] ${x.toFixed(0)},${y.toFixed(0)}`,
              bg: active ? 'rgb(202,38,38)' : 'hsl(0,0%,20%)',
            }
          );
          ctx.setLineDash([]);
        }
      },
    };
  }),
};

nodes.main.route(nodes.pointers, {
  move: 'pointer',
  down: 'pointer',
  up: 'pointer',
});
nodes.main.route(nodes.state, { wheel: 'wheel' });
nodes.main.route(nodes.draw, { context: 'init' });
nodes.pointers.route(nodes.state, { value: 'pointers' });
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
    down: e => events.dispatch('down', e),
    move: e => events.dispatch('move', e),
    up: e => events.dispatch('up', e),
  });

  return (
    <canvas
      class="stage"
      ref={canvasRef}
      {...props}
      onWheel={useWheel(e => events.dispatch('wheel', e))}
    ></canvas>
  );
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
