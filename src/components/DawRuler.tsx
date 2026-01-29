import { PIXELS_PER_BEAT } from "@/util/projectSettings";
import { CONTAINER_WIDTH } from "@/util/trackSettings";
import { Container, Graphics } from "@pixi/react";
import * as PIXI from "pixi.js";
import { memo, useCallback } from "react";

interface DawRulerProps {
  width: number;
  height: number;
  scrollX: number;
}

const DawRuler = memo(({ width, height, scrollX }: DawRulerProps) => {
  // 左側のヘッダー幅 (TrackAreaの仕様に合わせる)
  const HEADER_WIDTH = 100;

  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();

      // 1. 背景色 (全幅で塗る)
      // これにより、スクロールしてきたトラックヘッダーも隠せます
      g.beginFill(0x222222);
      g.drawRect(0, 0, width, height);
      g.endFill();

      // 2. 下線
      g.lineStyle(2, 0x555555, 1);
      g.moveTo(0, height);
      g.lineTo(width, height);

      // 3. 目盛り (HEADER_WIDTH 分ずらして描画)
      g.lineStyle(1, 0x888888, 1);

      // 目盛りの開始位置
      const startX = HEADER_WIDTH;

      // 例えば 100px 間隔で描画
      for (let x = startX; x < width; x += PIXELS_PER_BEAT) {
        g.moveTo(x, height);
        g.lineTo(x, height - 20); // 少し長い線
      }
    },
    [width, height]
  );

  return (
    // positionを [0, 0] にして、画面左上から全体を覆うように配置
    <Container position={[-scrollX, 0]} scale={{ x: 1, y: 1 }} width={CONTAINER_WIDTH}>
      <Graphics draw={draw} />

      {/* 必要なら文字などを追加 
          例: 小節番号など
      */}
      {/* <Text text="1" x={HEADER_WIDTH + 5} y={10} ... /> */}
    </Container>
  );
});

export default DawRuler;
