export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

export const isMobile = () => typeof navigator !== "undefined" &&
  /mobile|tablet|ip(ad|hone|od)|android|silk|crios/i.test(navigator.userAgent);

export const copy = (dst: number[], src: number[]) =>
  (src.forEach((x, i) => dst[i] = x), dst);

export const lerp = (a: number, b: number, t: number) =>
  a * (1 - t) + b * t;

// affine
export type Vec2 = [number, number];
export type Affine = [number, number, number, number, number, number];

export const matmul = (c: Affine, a: Affine, b: Affine) => {
  const [a0, a1, a2, a3, a4, a5] = a;
  const [b0, b1, b2, b3, b4, b5] = b;
  c[0] = a0 * b0 + a2 * b1;
  c[1] = a1 * b0 + a3 * b1;
  c[2] = a0 * b2 + a2 * b3;
  c[3] = a1 * b2 + a3 * b3;
  c[4] = a0 * b4 + a2 * b5 + a4;
  c[5] = a1 * b4 + a3 * b5 + a5;
  return c;
};

export const rotate = (rad: number): Affine => {
  const c = Math.cos(rad), s = Math.sin(rad);
  return [c, s, -s, c, 0, 0];
};

export const scale = ([sx, sy]: Vec2): Affine => [sx, 0, 0, sy, 0, 0];
export const translate = ([tx, ty]: Vec2): Affine => [1, 0, 0, 1, tx, ty];