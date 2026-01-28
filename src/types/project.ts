/**
 * プロジェクト、トラック、ノートに関するアプリ全体で使用する型定義はこのファイルに記載
 */

export interface Project {
  id: string;
  name: string;
  imagePath: string;
}

export interface AudioNote {
  id: string;
  noteName: string;
  posX: number;
  audioBuffer?: AudioBuffer;
}

export interface AudioTrack {
  id: string;
  trackName: string;
  trackNode: GainNode;
  notes: Map<string, AudioNote>;
}
