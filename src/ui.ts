import { type Ref, useCallback, useEffect } from 'preact/hooks';

const capitilize = (s: string) => s[0].toUpperCase() + s.slice(1);

type Handler = (e: PointerEvent) => void;
export const usePointers = (handlers: Record<string, Handler>) => {
  const props: Record<string, Handler> = {};
  for (const key in handlers)
    props[`onPointer${capitilize(key)}`] = useCallback(handlers[key], []);
  return props;
};

export const useCanvas2D = (
  ref: Ref<HTMLCanvasElement>,
  cb: (ctx: CanvasRenderingContext2D, dpr: number) => void,
  dpr = window.devicePixelRatio
) => useEffect(() => {
  const canvas = ref.current!;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;

  cb(canvas.getContext('2d') as CanvasRenderingContext2D, dpr);
}, []);

export const useWheel = (cb: (e: WheelEvent) => void) =>
  useCallback(cb, []);