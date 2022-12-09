import { type FunctionComponent as FC, render } from 'preact';
import { useRef, useEffect, useCallback } from 'preact/hooks';
import { signal } from '@preact/signals';
import './css/index.css';

import { type Mutable, mutable } from './signals';
import { type Node, node } from './node';

const lastN = (n: number) =>
  node(output => {
    const xs: number[] = [];
    return {
      val(x: number) {
        xs.push(x);
        if (xs.length > n) xs.shift();
        output('val', xs);
      },
    };
  });

const nodes = {
  main: lastN(30),
  draw: node(() => {
    let ctx: CanvasRenderingContext2D;
    return {
      init: (_ctx: CanvasRenderingContext2D) => {
        ctx = _ctx;
        ctx.fillStyle = 'hsl(0,0%,95%)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      },
      draw(positions: number[][]) {
        if (!ctx) return;

        ctx.fillStyle = 'hsl(0,0%,95%)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        let s = 10;
        ctx.fillStyle = 'rgba(202,38,38,.3)';
        for (const [x, y] of positions) {
          ctx.beginPath();
          ctx.arc(x * 2, y * 2, s++, 0, 360);
          ctx.fill();
          ctx.stroke();
        }
      },
    };
  }),
};
nodes.main.pipe('val', nodes.draw, 'draw');

const state: {
  positions: Mutable<number[][]>;
} = {
  positions: mutable([]),
};

nodes.main.on('val', x => (state.positions.value = x));

// Components
type Component = FC<{ state: typeof state; events: Node }>;

const Canvas: Component = ({ state, events }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;

    const dpr = window.devicePixelRatio;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    nodes.draw.dispatch('init', ctx);
  }, []);

  const onMove = useCallback(
    (e: PointerEvent) => events.dispatch('val', [e.offsetX, e.offsetY]),
    []
  );

  return <canvas class="stage" ref={canvasRef} onPointerMove={onMove}></canvas>;
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
