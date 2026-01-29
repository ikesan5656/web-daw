import { Container, Graphics, Text } from "@pixi/react";
import { Fragment, memo, useCallback, type ReactNode } from "react";
import * as PIXI from "pixi.js";
import { TRACK_HEADER_WIDTH } from "@/util/trackSettings";
//import type { AudioTrack } from "@/contexts/AudioEngineContext";
import { AudioNote, AudioTrack } from "@/types/project";
import { convertDurationToPixel, convertStartTimeToPosition } from "@/util/projectSettings";

// ==========================================
// 定数定義 (親コンポーネントでも計算に使うため export します)
// ==========================================
export const TRACK_HEIGHT = 50; // トラックの高さ
export const BORDER_HEIGHT = 3; // 線の太さ（高さ）
export const TRACK_AREA_OFFSET_Y = 80; // 上部の余白（ルーラーの高さなど）
const CONTAINER_WIDTH = 1000000;

const COLOR_BORDER = 0xffffff; // 線の色
const COLOR_BG = 0xd3d3d3; // トラック背景色

// ==========================================
// 型定義
// ==========================================
interface TrackAreaProps {
  tracks: Map<string, AudioTrack>;
  scrollTop: number; // ★追加: 親からのスクロール量
  scrollX: number;
  pixiRef: React.Ref<PIXI.Container>; // ★追加: 座標変換(toLocal)用
  dragPreview: DragPreviewState;
}

// セパレーター（線）用のProps
interface TrackSeparatorProps {
  posY: number;
  width: number;
}

interface TrackContainerProps {
  posY: number;
  width: number;
  children?: ReactNode;
}

interface TrackHeaderProps {
  trackName: string;
  color: number;
}

interface TrackNoteProps {
  noteName: string;
  color: number;
  posX: number;
  duration: number;
}

interface TrackListProps {
  width: number;
  tracks: Map<string, AudioTrack>;
}

export interface DragPreviewState {
  isVisible: boolean;
  x: number; // ローカルX座標
  trackIndex: number; // 何番目のトラックか
}

// ==========================================
// 1. セパレーターコンポーネント (線)
// ==========================================
const TrackSeparator = memo(({ posY, width }: TrackSeparatorProps) => {
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(COLOR_BORDER);
      g.drawRect(0, 0, width, BORDER_HEIGHT);
      g.endFill();
    },
    [width]
  );

  return (
    <Container position={[0, posY]}>
      <Graphics draw={draw} />
    </Container>
  );
});

// ==========================================
// 2. トラックコンテナ (背景のみ)
// ==========================================
const TrackContainer = memo(({ posY, width, children }: TrackContainerProps) => {
  const drawBackground = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(COLOR_BG);
      g.drawRect(0, 0, width, TRACK_HEIGHT);
      g.endFill();
    },
    [width]
  );

  return (
    <Container position={[0, posY]}>
      {/* 背景 */}
      <Graphics draw={drawBackground} />
      {/* コンテンツ */}
      {children}
    </Container>
  );
});

// ==========================================
// 3. トラックコンテンツ (中身)
// ==========================================
const TrackNote = memo(({ noteName, color, posX, duration }: TrackNoteProps) => {
  const width = convertDurationToPixel(duration);
  const drawRect = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(color);
      g.drawRect(0, 0, width, TRACK_HEIGHT);
      g.endFill();
    },
    [color, width]
  );

  return (
    <Container position={[posX, 0]}>
      <Graphics draw={drawRect} />
      <Text
        text={noteName}
        style={
          new PIXI.TextStyle({
            fill: "white",
            fontSize: 11,
            // 1. 折り返しを有効にする
            wordWrap: true,
            // 2. 幅を「Containerの幅(100) - 左右の余白」に設定する
            wordWrapWidth: width - 10,
            // 3. 行の高さを極端に小さくするか、高さを固定的に捉える
            breakWords: true,
          })
        }
        anchor={[0, 0]}
        x={3}
        y={3}
        // 4. 文字が縦にはみ出るのを防ぐために、高さを制限する（マスク代わり）
        mask={null}
      />
    </Container>
  );
});

const TrackHeader = memo(({ trackName, color }: TrackHeaderProps) => {
  // console.log(`${trackName}再描画`); // ログがうるさい場合はコメントアウト
  const drawRect = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(color);
      g.drawRect(0, 0, TRACK_HEADER_WIDTH, TRACK_HEIGHT);
      g.endFill();
    },
    [color]
  );

  return (
    <Container position={[0, 0]}>
      <Graphics draw={drawRect} />
      <Text
        text={trackName}
        style={
          new PIXI.TextStyle({
            fill: "white",
            fontSize: 11,
          })
        }
        anchor={[0, 0.5]}
        x={10}
        y={TRACK_HEIGHT / 2}
      />
    </Container>
  );
});

const TrackList = memo(({ width, tracks }: TrackListProps) => {
  const unitHeight = TRACK_HEIGHT + BORDER_HEIGHT;

  return (
    <Container>
      {Array.from(tracks.values()).map((track, index) => {
        const trackY = BORDER_HEIGHT + index * unitHeight;
        const bottomLineY = trackY + TRACK_HEIGHT;

        return (
          <Fragment key={track.id || index}>
            {/* 1. トラック本体 */}
            <TrackContainer posY={trackY} width={width}>
              <TrackHeader trackName={track.trackName} color={0x000000} />
              <Container position={[TRACK_HEADER_WIDTH, 0]}>
                {Array.from((track.notes as Map<string, AudioNote>).values()).map(
                  (note: AudioNote) => {
                    return (
                      <TrackNote
                        key={note.id}
                        noteName={note.noteName}
                        color={0xff0000}
                        posX={convertStartTimeToPosition(note.when)}
                        duration={note.audioBuffer?.duration ?? 0}
                      />
                    );
                  }
                )}
              </Container>
            </TrackContainer>

            {/* 2. トラックの下にある線を描画 */}
            <TrackSeparator posY={bottomLineY} width={width} />
          </Fragment>
        );
      })}
    </Container>
  );
});

const GhostNote = memo(({ x, trackIndex }: { x: number; trackIndex: number }) => {
  const unitHeight = TRACK_HEIGHT + BORDER_HEIGHT;

  // Y座標の計算:
  // (トラック番号 * 1ユニットの高さ) + 線(border)の高さ
  // これにより、線の上に重ならず、トラックの内側に綺麗に収まります
  const y = trackIndex * unitHeight + BORDER_HEIGHT;

  const draw = useCallback((g: PIXI.Graphics) => {
    g.clear();
    // 半透明の白枠 + 赤い縁取り
    g.lineStyle(2, 0xff0000, 0.8);
    g.beginFill(0xffffff, 0.3);
    g.drawRect(0, 0, 100, TRACK_HEIGHT);
    g.endFill();
  }, []);

  return (
    <Container position={[x, y]}>
      <Graphics draw={draw} />
    </Container>
  );
});

// ==========================================
// 4. メインコンポーネント
// Stageは親にあるので、ここは Container を返すだけにする
// ==========================================
const TrackArea = memo(({ tracks, scrollTop, scrollX, pixiRef, dragPreview }: TrackAreaProps) => {
  // スクロール位置の計算
  // 開始位置(80px) - 現在のスクロール量
  const currentY = TRACK_AREA_OFFSET_Y - scrollTop;

  // 一番上の線: Y=0 (相対位置)
  const Y_TOP_LINE = 0;

  return (
    <Container
      ref={pixiRef} // ★親が toLocal するためのRef
      position={[-scrollX, currentY]} // ★スクロール反映
      eventMode="static" // 内部でのクリック等が必要になった場合のため
      width={CONTAINER_WIDTH}
      scale={{ x: 1, y: 1 }} // Scale horizontally to match the new width
      //resolution={window.devicePixelRatio} // Adjust resolution for better text rendering
    >
      {/* 1. 最上部のセパレーター */}
      <TrackSeparator posY={Y_TOP_LINE} width={CONTAINER_WIDTH} />

      {/* 2. トラックリスト */}
      <TrackList width={CONTAINER_WIDTH} tracks={tracks} />

      {/* ★ ドラッグ中のみゴーストを表示 */}
      {dragPreview.isVisible && <GhostNote x={dragPreview.x} trackIndex={dragPreview.trackIndex} />}
    </Container>
  );
});

export default TrackArea;
