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
  c[0] = a[0] * b[0] + a[2] * b[1];
  c[1] = a[1] * b[0] + a[3] * b[1];
  c[2] = a[0] * b[2] + a[2] * b[3];
  c[3] = a[1] * b[2] + a[3] * b[3];
  c[4] = a[0] * b[4] + a[2] * b[5] + a[4];
  c[5] = a[1] * b[4] + a[3] * b[5] + a[5];
  return c;
};

export const rotate = (out: Affine, rad: number, p: Vec2 = [0, 0]) => {
  const c = Math.cos(rad), s = Math.sin(rad);
  matmul(out, [c, s, -s, c, 0, 0], [1, 0, 0, 1, -p[0], -p[1]]);
  matmul(out, [1, 0, 0, 1, p[0], p[1]], out);
  return out;
};