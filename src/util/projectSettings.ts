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

/**
 * タイムライン上のX座標から再生開始時刻(秒)を計算する
 * @param posX タイムライン左端からのピクセル距離
 * @returns 音楽上の再生開始時間（秒）
 */
export const convertPositionToStartTime = (posX: number): number => {
  // 1. ピクセルを拍数に変換 (例: 200px / 100pxPerBeat = 2拍目)
  const beats = posX / PIXELS_PER_BEAT;

  // 2. 拍数を秒数に変換 (例: 2拍 * 0.5s = 1.0秒)
  const startTimeInSeconds = beats * SECONDS_PER_BEAT;

  return startTimeInSeconds;
};

/**
 * 再生開始時刻(秒)からタイムライン上のX座標を計算する
 * @param startTimeInSeconds 音楽上の時間（秒）
 * @returns タイムライン左端からのピクセル距離
 */
export const convertStartTimeToPosition = (startTimeInSeconds: number): number => {
  // 1. 秒数を拍数に変換
  const beats = startTimeInSeconds / SECONDS_PER_BEAT;

  // 2. 拍数をピクセルに変換
  const posX = beats * PIXELS_PER_BEAT;

  return posX;
};
