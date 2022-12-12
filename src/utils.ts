export const isMobile = () => typeof navigator !== "undefined" &&
  /mobile|tablet|ip(ad|hone|od)|android|silk|crios/i.test(navigator.userAgent);

export const copy = (dst: number[], src: number[]) => (src.forEach((x, i) => dst[i] = x), dst);

export const lerp = (a: number, b: number, t: number) =>
  a * (1 - t) + b * t;