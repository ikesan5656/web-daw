import { PIXELS_PER_BAR, PIXELS_PER_BEAT } from "@/util/projectSettings";
import { TRACK_HEADER_WIDTH } from "@/util/trackSettings";
import { Container, Graphics, Text } from "@pixi/react";
import * as PIXI from "pixi.js";
import { memo, useCallback, useMemo } from "react";

interface DawRulerProps {
  width: number;
  height: number;
  scrollX: number;
}

// テキストスタイルはコンポーネントの外で定義（再レンダリング対策）
const rulerTextStyle = new PIXI.TextStyle({
  fill: "#888888",
  fontSize: 12,
  fontFamily: "Arial",
});

const BarNumbers = memo(({ scrollX, zoom }: { scrollX: number; zoom: number }) => {
  const BAR_WIDTH = PIXELS_PER_BAR * zoom;

  const items = useMemo(() => {
    // スクロール位置に基づいて、画面内に表示すべき最初の小節を計算
    const startBar = Math.floor(scrollX / BAR_WIDTH);
    const endBar = startBar + 30; // 画面幅に応じて調整

    console.log("小節個数", endBar - startBar);

    return Array.from({ length: Math.max(0, endBar - startBar) }, (_, i) => {
      const barIdx = startBar + i;
      return {
        id: barIdx,
        text: `${barIdx + 1}`,
        // Containerが -scrollX 動いているので、ここは絶対座標で計算
        x: barIdx * BAR_WIDTH + TRACK_HEADER_WIDTH + 5, // +5は少し余分に描画
        y: 20,
      };
    });
  }, [scrollX, BAR_WIDTH]);

  return (
    <>
      {items.map((item) => (
        <Text key={item.id} text={item.text} x={item.x} y={item.y} style={rulerTextStyle} />
      ))}
    </>
  );
});

const DawRuler = memo(({ width, height, scrollX }: DawRulerProps) => {
  // 背景などの「動かない」部分
  const drawBackground = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(0x222222);
      g.drawRect(0, 0, width, height); // 画面幅いっぱい
      g.endFill();

      g.lineStyle(2, 0x444444, 1);
      g.moveTo(0, height);
      g.lineTo(width, height);
    },
    [width, height]
  );

  // 目盛りなどの「動く」部分
  const drawTicks = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.lineStyle(1, 0x666666, 1);

      // 描画範囲を制限（カリング）
      const startBeat = Math.floor(scrollX / PIXELS_PER_BEAT);
      const endBeat = startBeat + Math.ceil(width / PIXELS_PER_BEAT) + 1;

      for (let i = startBeat; i <= endBeat; i++) {
        const x = i * PIXELS_PER_BEAT + TRACK_HEADER_WIDTH;
        const isBar = i % 4 === 0; // 4拍ごとに長い線（小節）
        const tickHeight = isBar ? 20 : 10;

        g.moveTo(x, height);
        g.lineTo(x, height - tickHeight);
      }
    },
    [scrollX, width, height]
  );

  return (
    <Container height={height}>
      {/* 背景は固定 (scrollXの影響を受けない) */}
      <Graphics draw={drawBackground} />

      {/* 目盛りと文字はスクロールに合わせて動く Container に入れる */}
      <Container x={-scrollX}>
        <Graphics draw={drawTicks} />
        <BarNumbers scrollX={scrollX} zoom={1} />
      </Container>

      {/* トラックヘッダー部分の背景（文字がヘッダーに重なるのを防ぐ被せ） */}
      <Graphics
        draw={(g) => {
          g.clear();
          g.beginFill(0x222222);
          g.drawRect(0, 0, TRACK_HEADER_WIDTH, height);
          g.endFill();
          g.lineStyle(2, 0x444444, 1);
          g.moveTo(0, height);
          g.lineTo(TRACK_HEADER_WIDTH, height);
        }}
      />
    </Container>
  );
});

export default DawRuler;
