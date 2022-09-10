// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Number {
  convertToPercent(max: number): number;
  convertToColor(max: number): number;
  clamp(min: number, max: number): number;
}

Number.prototype.convertToPercent = function (max: number) {
  return Math.round((Number(this) / max) * 100).clamp(0, 100);
};

Number.prototype.convertToColor = function (max: number) {
  return Math.round((Number(this) / 100) * max).clamp(0, max);
};

Number.prototype.clamp = function (min: number, max: number) {
  return Math.min(Math.max(Number(this), min), max);
};
