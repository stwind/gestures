export interface Context2D {
  ctx: CanvasRenderingContext2D;
  dpr: number;
}

export const annotate = ({ ctx, dpr }: Context2D, {
  x, y, text,
  fg = 'hsl(0,0%,100%)',
  bg = 'hsl(0,0%,20%)',
  font = '18px Inconsolata',
}: {
  x: number;
  y: number;
  text: string;
  fg?: string;
  bg?: string;
  font?: string;
}) => {
  x *= dpr;
  y *= dpr;
  ctx.fillStyle = fg;
  ctx.strokeStyle = 'hsl(0,0%,20%)';
  ctx.font = font;
  ctx.textBaseline = 'middle';

  ctx.beginPath();
  ctx.moveTo(x, y);
  const isLeft = x < ctx.canvas.width / 2;
  const tx = isLeft ? x + 50 : x - 50;
  const ty = y < ctx.canvas.height / 2 ? y + 50 : y - 50;
  ctx.lineTo(tx, ty);
  ctx.stroke();
  ctx.textAlign = isLeft ? 'start' : 'end';
  const tm = ctx.measureText(text);

  const ttx = isLeft ? tx + 2 : tx - 2;
  const bx = isLeft ? ttx : ttx - tm.width;
  ctx.fillStyle = bg;
  ctx.fillRect(
    bx,
    ty - tm.fontBoundingBoxAscent,
    tm.width,
    tm.fontBoundingBoxAscent + tm.fontBoundingBoxDescent
  );
  ctx.fillStyle = fg;
  ctx.fillText(text, ttx, ty);
};

export const cross = ({ ctx, dpr }: Context2D, { x, y }: { x: number; y: number; }) => {
  ctx.beginPath();
  ctx.moveTo(0, y * dpr);
  ctx.lineTo(ctx.canvas.width, y * dpr);
  ctx.stroke();
  ctx.moveTo(x * dpr, 0);
  ctx.lineTo(x * dpr, ctx.canvas.height);
  ctx.stroke();
};