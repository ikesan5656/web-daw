import * as PIXI from "pixi.js";
import { Container, Graphics, Text } from "@pixi/react";
import { Fragment, memo, ReactNode, useCallback } from "react";
import { TrackSeparator } from "./PixiTrackComponents";
import {
  TRACK_AREA_OFFSET_Y,
  TRACK_BORDER_HEIGHT,
  TRACK_COLOR_BG,
  TRACK_CONTAINER_WIDTH,
  TRACK_HEADER_WIDTH,
  TRACK_HEIGHT,
} from "@/util/trackSettings";
import { AudioTrack } from "@/types/project";

interface TrackHeaderAreaProps {
  tracks: Map<string, AudioTrack>;
  width: number;
  height: number;
  scrollTop: number; // ★追加: 親からのスクロール量
}

/*interface TrackHeaderListProps {
  width: number;
  tracks: Map<string, AudioTrack>;
}*/

interface TrackHeaderListProps {
  width: number;
  tracks: Map<string, AudioTrack>;
}

interface TrackHeaderContainerProps {
  posY: number;
  width: number;
  children?: ReactNode;
}

interface TrackHeaderProps {
  trackName: string;
  color: number;
}

const TrackHeaderContainer = memo(({ posY, width, children }: TrackHeaderContainerProps) => {
  const drawBackground = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(TRACK_COLOR_BG);
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

const TrackHeaderList = memo((props: TrackHeaderListProps) => {
  const { width, tracks } = props;
  const unitHeight = TRACK_HEIGHT + TRACK_BORDER_HEIGHT;

  return (
    <Container>
      {Array.from(tracks.values()).map((track, index) => {
        const trackY = TRACK_BORDER_HEIGHT + index * unitHeight;
        const bottomLineY = trackY + TRACK_HEIGHT;

        return (
          <Fragment key={track.id || index}>
            <TrackHeaderContainer posY={trackY} width={width}>
              <TrackHeader trackName={track.trackName} color={0x000000} />
            </TrackHeaderContainer>
            {/* 2. トラックの下にある線を描画 */}
            <TrackSeparator posY={bottomLineY} width={width} />
          </Fragment>
        );
      })}
    </Container>
  );
});

const TrackHeaderArea = memo((props: TrackHeaderAreaProps) => {
  const { tracks, width, height, scrollTop } = props;

  const currentY = TRACK_AREA_OFFSET_Y - scrollTop;

  // 上部の隠れる部分
  const drawBackground = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(0x222222);
      g.drawRect(0, 0, width, TRACK_AREA_OFFSET_Y);
      g.endFill();

      g.lineStyle(2, 0x444444, 1);
      g.moveTo(0, TRACK_AREA_OFFSET_Y);
      g.lineTo(width, TRACK_AREA_OFFSET_Y);
    },
    [width]
  );

  return (
    <Container
      width={width}
      height={height}
      //options={{ backgroundColor: 0x1e1e1e, antialias: true }}
      //style={{ display: "block" }}
      scale={1}
    >
      <Container position={[0, currentY]} eventMode="static" scale={{ x: 1, y: 1 }}>
        {/* 1. 最上部のセパレーター */}
        <TrackSeparator posY={0} width={TRACK_HEADER_WIDTH} />

        {/* 2. トラックリスト */}
        <TrackHeaderList width={TRACK_CONTAINER_WIDTH} tracks={tracks} />
        <Container />
      </Container>
      {/* 背景は固定 (scrollXの影響を受けない) */}
      <Container>
        <Graphics draw={drawBackground} />
      </Container>
    </Container>
  );
});

export default TrackHeaderArea;
