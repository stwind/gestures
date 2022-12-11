export const isMobile = () => typeof navigator !== "undefined" &&
  /mobile|tablet|ip(ad|hone|od)|android|silk|crios/i.test(navigator.userAgent);

export const copy = (dst: number[], src: number[]) => (src.forEach((x, i) => dst[i] = x), dst);
