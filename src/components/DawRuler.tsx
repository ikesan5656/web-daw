import { Container, Graphics } from "@pixi/react";
import * as PIXI from "pixi.js";
import { memo, useCallback } from "react";

interface DawRulerProps {
  width: number;
  height: number;
}

const DawRuler = memo((props: DawRulerProps) => {
  const { width, height } = props;

  const drawRect = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(0x00ff000);
      // トラックの高さに合わせて描画
      g.drawRect(0, 0, 100, height);
      g.endFill();
    },
    [height]
  );

  return (
    <Container position={[100, 0]} width={width} height={height}>
      <Graphics draw={drawRect} />
    </Container>
  );
});

export default DawRuler;
