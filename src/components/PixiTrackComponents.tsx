import { memo, useCallback } from "react";
import * as PIXI from "pixi.js";
import { Container, Graphics } from "@pixi/react";
import { TRACK_BORDER_HEIGHT, TRACK_COLOR_BORDER } from "@/util/trackSettings";

// セパレーター（線）用のProps
interface TrackSeparatorProps {
  posY: number;
  width: number;
}

// ==========================================
// 1. セパレーターコンポーネント (線)
// ==========================================
export const TrackSeparator = memo(({ posY, width }: TrackSeparatorProps) => {
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(TRACK_COLOR_BORDER);
      g.drawRect(0, 0, width, TRACK_BORDER_HEIGHT);
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
