import { type FunctionComponent as FC, render } from 'preact';
import { useRef, useEffect, useCallback } from 'preact/hooks';
import { effect, Signal } from '@preact/signals';
import './css/index.css';

import { EventBus, eventBus } from './event-bus';
import { type Mutable, mutable } from './signals';

const use =
  (...vals: (Signal<any> | Mutable<any>)[]) =>
  (fn: (...xs: any[]) => void) =>
  () =>
    fn(...vals.map(val => val.value));

const state: {
  mouse: Mutable<[number, number]>;
} = {
  mouse: mutable([-1, -1]),
};

const bus = eventBus({
  mouse: val => (state.mouse.value = val),
});

// UI
const App: FC<{ state: typeof state; bus: EventBus }> = ({
  state: { mouse },
  bus,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const dpr = window.devicePixelRatio;
    const [width, height] = [
      canvas.clientWidth * dpr,
      canvas.clientHeight * dpr,
    ];
    canvas.width = width;
    canvas.height = height;

    return effect(
      use(mouse)(([x, y]: typeof mouse.value) => {
        setTimeout(() => {
          ctx.clearRect(0, 0, width, height);
          ctx.beginPath();
          ctx.arc(x * dpr, y * dpr, 20, 0, 360);
          ctx.fillStyle = 'red';
          ctx.fill();
        }, 300);
      })
    );
  }, []);

  const onMove = useCallback(
    (e: PointerEvent) => bus.dispatch('mouse', [e.offsetX, e.offsetY]),
    []
  );
  return (
    <>
      <canvas class="stage" ref={canvasRef} onPointerMove={onMove}></canvas>
      <div>
        {mouse.value[0].toFixed(0)},{mouse.value[1].toFixed(0)}
      </div>
    </>
  );
};

render(
  <App state={state} bus={bus} />,
  document.getElementById('app') as HTMLElement
);
