import { Container, Graphics, Text } from "@pixi/react";
import { Fragment, memo, useCallback, type ReactNode } from "react";
import * as PIXI from "pixi.js";
import { type AudioTrack } from "../contexts/TrackDataStoreContext";

// ==========================================
// 定数定義 (ここを変えれば全体が一括で変わります)
// ==========================================
const TRACK_HEIGHT = 50; // トラックの高さ
const BORDER_HEIGHT = 3; // 線の太さ（高さ）
const COLOR_BORDER = 0xffffff; // 線の色
const COLOR_BG = 0xd3d3d3; // トラック背景色

// ==========================================
// 型定義
// ==========================================
interface TrackAreaProps {
  width: number;
  tracks: Map<string, AudioTrack>;
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
}

interface TrackListProps {
  width: number;
  tracks: Map<string, AudioTrack>;
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
// 枠線描画の責務を削除し、背景と子要素の表示に専念
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
      {/* コンテンツ (TrackContent) */}
      {children}
    </Container>
  );
});

// ==========================================
// 3. トラックコンテンツ (中身)
// 位置合わせは親に任せ、ここではローカル座標(0,0)基準で描画
// ==========================================
const TrackNote = memo(({ noteName, color, posX }: TrackNoteProps) => {
  const drawRect = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(color);
      // トラックの高さに合わせて描画
      g.drawRect(0, 0, 100, TRACK_HEIGHT);
      g.endFill();
    },
    [color]
  );

  return (
    <Container position={[posX, 0]}>
      <Graphics draw={drawRect} />
      <Text
        text={noteName}
        style={
          new PIXI.TextStyle({
            fill: "white",
            fontSize: 14,
          })
        }
        // 基準点を「左・上下中央」に設定
        anchor={[0, 0.5]}
        // 左余白10px, 上下中央に配置
        x={10}
        y={TRACK_HEIGHT / 2}
      />
    </Container>
  );
});

const TrackHeader = memo(({ trackName, color }: TrackHeaderProps) => {
  console.log(`${trackName}再描画`);
  const drawRect = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(color);
      // トラックの高さに合わせて描画
      g.drawRect(0, 0, 100, TRACK_HEIGHT);
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
            fontSize: 14,
          })
        }
        // 基準点を「左・上下中央」に設定
        anchor={[0, 0.5]}
        // 左余白10px, 上下中央に配置
        x={10}
        y={TRACK_HEIGHT / 2}
      />
    </Container>
  );
});

const TrackList = memo(({ width, tracks }: TrackListProps) => {
  // 1セットの高さ
  const unitHeight = TRACK_HEIGHT + BORDER_HEIGHT;

  return (
    <Container>
      {Array.from(tracks.values()).map((track, index) => {
        // Y座標の計算
        // スタート位置は「一番上の線(3px)」の直下から始まるため、BORDER_HEIGHT を初期オフセットとして足す
        const trackY = BORDER_HEIGHT + index * unitHeight;

        // 下線の位置 = トラックの位置 + トラックの高さ
        const bottomLineY = trackY + TRACK_HEIGHT;

        return (
          <Fragment key={track.id || index}>
            {/* 1. トラック本体 */}
            <TrackContainer posY={trackY} width={width}>
              <TrackHeader trackName={track.trackName} color={0x000000} />
              <Container position={[100, 0]}>
                {/* Map の values（値）を配列に変換してから map する */}
                {Array.from(track.notes.values()).map((note) => {
                  return (
                    <TrackNote
                      key={note.id}
                      noteName={note.noteName}
                      color={0xff0000}
                      posX={note.posX}
                    />
                  );
                })}
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

const TrackArea = memo(({ width, tracks }: TrackAreaProps) => {
  // 一番上の線: Y=0
  const Y_TOP_LINE = 0;

  return (
    <Container position={[0, 80]}>
      {/* 1. 最上部のセパレーター */}
      <TrackSeparator posY={Y_TOP_LINE} width={width} />

      <TrackList width={width} tracks={tracks} />
    </Container>
  );
});

export default TrackArea;
