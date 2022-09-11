/**
 * ./src/extensions.ts
 * @author Lukas Pistrol <lukas@pistrol.com>
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Number {
  /**
   * Converts a number [0-max] to a percentage value [0-100].
   * @param  {number} max The maximum value of the number.
   * @returns {number} The percentage value.
   */
  convertToPercent(max: number): number;

  /**
   * Converts a percentage value [0-100] to a number [0-max].
   * @param max The maximum value of the number.
   * @returns {number} The number.
   */
  convertToColor(max: number): number;

  /**
   * Clamps a number between a minimum and maximum value.
   * @param min The minimum value of the number.
   * @param max The maximum value of the number.
   * @returns {number} The clamped number.
   */
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Boolean {
  /**
   * Converts a boolean to a string of ['On', 'Off']
   * @returns string
   */
  onOff(): string;
}

Boolean.prototype.onOff = function () {
  return this ? 'On' : 'Off';
};

/**
 * A promise that resolves after a given time in ms.
 * @param  {number} ms
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
