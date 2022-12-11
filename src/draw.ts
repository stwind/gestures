export const annotate = (ctx: CanvasRenderingContext2D, {
  x, y, text, dpr,
  fg = 'hsl(0,0%,100%)',
  bg = 'hsl(0,0%,20%)',
  font = '18px Inconsolata',
}: {
  x: number;
  y: number;
  text: string;
  dpr: number,
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