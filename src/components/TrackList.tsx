import { Container, Graphics, Text } from "@pixi/react";
import { memo, useCallback, type ReactNode } from "react";
import * as PIXI from 'pixi.js';

// ==========================================
// 定数定義 (ここを変えれば全体が一括で変わります)
// ==========================================
const TRACK_HEIGHT = 50;  // トラックの高さ
const BORDER_HEIGHT = 3;  // 線の太さ（高さ）
const COLOR_BORDER = 0xffffff; // 線の色
const COLOR_BG = 0xd3d3d3;     // トラック背景色

// ==========================================
// 型定義
// ==========================================
interface TrackListProps {
  width: number;
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

interface TrackContentProps {
  trackName: string;
  color: number;
}

// ==========================================
// 1. セパレーターコンポーネント (線)
// 線ではなく「高さ5pxの長方形」として独立させたコンポーネント
// ==========================================
const TrackSeparator = memo(({ posY, width }: TrackSeparatorProps) => {
  const draw = useCallback((g: PIXI.Graphics) => {
    g.clear();
    g.beginFill(COLOR_BORDER);
    g.drawRect(0, 0, width, BORDER_HEIGHT);
    g.endFill();
  }, [width]);

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
  const drawBackground = useCallback((g: PIXI.Graphics) => {
    g.clear();
    g.beginFill(COLOR_BG);
    g.drawRect(0, 0, width, TRACK_HEIGHT);
    g.endFill();
  }, [width]);

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
const TrackContent = memo(({ trackName, color }: TrackContentProps) => {
  const drawRect = useCallback((g: PIXI.Graphics) => {
    g.clear();
    g.beginFill(color);
    // トラックの高さに合わせて描画
    g.drawRect(0, 0, 100, TRACK_HEIGHT); 
    g.endFill();
  }, [color]);

  return (
    <Container position={[0, 0]}>
      <Graphics draw={drawRect} />
      <Text
        text={trackName} 
        style={new PIXI.TextStyle({ 
          fill: 'white', 
          fontSize: 14,
        })} 
        // 基準点を「左・上下中央」に設定
        anchor={[0, 0.5]}
        // 左余白10px, 上下中央に配置
        x={10}
        y={TRACK_HEIGHT / 2}
      />
    </Container>
  );
});

// ==========================================
// 4. トラックリスト (配置管理)
// 積み木のように座標を計算して配置する
// ==========================================
const TrackList = memo(({ width }: TrackListProps) => {
  console.log("TrackList再描画");

  // --- 座標計算ロジック ---
  // 1. 一番上の線: Y=0
  const yLine1 = 0;
  
  // 2. トラック1: Y = (線の高さ)
  const yTrack1 = yLine1 + BORDER_HEIGHT;

  // 3. 真ん中の線: Y = (トラック1のY) + (トラックの高さ)
  const yLine2 = yTrack1 + TRACK_HEIGHT;

  // 4. トラック2: Y = (真ん中の線のY) + (線の高さ)
  const yTrack2 = yLine2 + BORDER_HEIGHT;

  // (必要なら) 5. 一番下の線
  const yLine3 = yTrack2 + TRACK_HEIGHT;

  return (
    <Container position={[0, 0]}>
      {/* 1. 最上部のセパレーター */}
      <TrackSeparator posY={yLine1} width={width} />

      {/* 2. 1つ目のトラック */}
      <TrackContainer posY={yTrack1} width={width}>
        <TrackContent trackName="Guitar" color={0xff0000} />
      </TrackContainer>

      {/* 3. 中間のセパレーター */}
      <TrackSeparator posY={yLine2} width={width} />

      {/* 4. 2つ目のトラック */}
      <TrackContainer posY={yTrack2} width={width}>
         <TrackContent trackName="Bass" color={0x0000ff} />
      </TrackContainer>

      {/* もし一番下にも線が必要ならここに追加 */}
      <TrackSeparator posY={yLine3} width={width} />
    </Container>
  );
})

export default TrackList;