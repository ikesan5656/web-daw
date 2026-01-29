// 標準のBPM
export const DEFAULT_BPM = 120;
// 1拍あたりの秒数
export const SECONDS_PER_BEAT = 60 / DEFAULT_BPM;
// 1拍あたりのピクセル数
export const PIXELS_PER_BEAT = 50;

/**
 * 拍数から秒数へ変換
 */
export const beatToSeconds = (beat: number) => beat * SECONDS_PER_BEAT;

/**
 * 拍数からピクセル数へ変換
 */
export const beatToPixels = (beat: number) => beat * PIXELS_PER_BEAT;

/**
 * ピクセル数から拍数へ変換（マウス操作でのノート配置用）
 */
export const pixelsToBeat = (px: number) => px / PIXELS_PER_BEAT;

/**
 * durationからピクセル数へ変換
 * @param duration
 * @returns
 */
export const convertDurationToPixel = (duration: number): number => {
  // 秒を拍に変換
  const beat = duration / SECONDS_PER_BEAT;
  // 拍をピクセルに変換
  const pixel = beat * PIXELS_PER_BEAT;
  return pixel;
};

/**
 * ピクセル数から秒数へ変換
 * @param pixel
 * @returns duration (秒)
 */
export const convertPixelToDuration = (pixel: number): number => {
  // 1. ピクセルを拍に変換
  const beat = pixel / PIXELS_PER_BEAT;
  // 2. 拍を秒に変換
  const duration = beat * SECONDS_PER_BEAT;
  return duration;
};
