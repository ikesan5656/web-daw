import * as PIXI from "pixi.js";
import { Container, Graphics } from "@pixi/react";
import { useCallback } from "react";
import { RULER_BAR_HEIGHT, TRACK_AREA_OFFSET_Y, TRACK_HEADER_WIDTH } from "@/util/trackSettings";

interface PlaybackHeadProps {
  x: number;
  height: number;
}

const PlaybackHead = (props: PlaybackHeadProps) => {
  const { x, height } = props;

  const drawHead = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      // まずは白で、太めに設定（見落とし防止）
      g.lineStyle(3, 0x0000ff, 1);

      // 【重要】Container自体を y={height} で動かすなら、
      // Graphicsの中では 0 から描き始める必要があります。
      g.moveTo(0, 0);
      g.lineTo(0, height); // 100pxの垂直線
    },
    [height] // 中身の形は変わらないので空でOK
  );

  return (
    // position={[x, y]} で指定。
    // もし親要素の端にいるなら、x={x + 50} などにして内側へ寄せてみてください。
    <Container position={[x + TRACK_HEADER_WIDTH, TRACK_AREA_OFFSET_Y - RULER_BAR_HEIGHT]}>
      <Graphics draw={drawHead} />
    </Container>
  );
};

export default PlaybackHead;
