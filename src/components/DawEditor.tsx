import { Box, styled } from "@mui/material";
import { Stage } from "@pixi/react";
import * as PIXI from "pixi.js";
import { useCallback, useRef, useState } from "react";
import TrackArea, {
  TRACK_HEIGHT,
  BORDER_HEIGHT,
  TRACK_AREA_OFFSET_Y,
  type DragPreviewState,
} from "./TrackArea";
import PlayHeader from "./PlayHeader";
import { useTrackDataStore } from "../contexts/TrackDataStoreContext";
import DawRuler from "./DawRuler";
import { useContainerSize } from "../hooks/useContainerSize";

// ... (スタイル定義 DawEditorContainer, TrackContainer はそのまま) ...
const DawEditorContainer = styled(Box)({
  padding: "0",
  margin: "0",
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
  display: "flex",
  flexFlow: "column",
  backgroundColor: "cyan",
  overflow: "hidden",
});

const TrackContainer = styled(Box)({
  padding: "0",
  margin: "0",
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
  display: "block",
  backgroundColor: "#1e1e1e",
  overflowY: "auto",
  overflowX: "hidden",
  position: "relative",
});

const DawEditor = () => {
  const { getTracksInfo } = useTrackDataStore();
  const tracks = getTracksInfo();

  const { ref: containerRef, size } = useContainerSize();
  const trackAreaPixiRef = useRef<PIXI.Container>(null);
  const [scrollTop, setScrollTop] = useState(0);
  // ★ドラッグプレビュー用のState
  const [dragPreview, setDragPreview] = useState<DragPreviewState>({
    isVisible: false,
    x: 0,
    trackIndex: 0,
  });

  const unitHeight = TRACK_HEIGHT + BORDER_HEIGHT;
  const contentHeight = TRACK_AREA_OFFSET_Y + tracks.size * unitHeight + 200;

  // ... (handleScroll, handleDragOver, handleDrop はそのまま) ...

  // 省略しましたが、前回の handleScroll などをここに記述してください
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";

      if (!containerRef.current || !trackAreaPixiRef.current) return;

      // 1. 座標取得 (Stage全体でのマウス位置)
      const rect = containerRef.current.getBoundingClientRect();
      const globalX = e.clientX - rect.left;
      const globalY = e.clientY - rect.top;

      // 2. toLocal変換 (スクロール等を加味したTrackArea内部座標)
      const globalPoint = new PIXI.Point(globalX, globalY);
      const localPoint = trackAreaPixiRef.current.toLocal(globalPoint);

      // 3. トラックインデックス計算
      // localPoint.y は TrackAreaの原点(0)からの距離。
      // TrackAreaはヘッダー(80px)の下から描画される前提になっている場合と、
      // Header込みで描画している場合がありますが、
      // 前回のTrackAreaの実装では `TrackList` は `posY={BORDER_HEIGHT + index * unit}` で配置されています。

      // ヘッダー部分(Y < 0)にいる場合は表示しない
      if (localPoint.y < 0) {
        setDragPreview((prev) => ({ ...prev, isVisible: false }));
        return;
      }

      const trackIndex = Math.floor(localPoint.y / unitHeight);

      // トラック数を超えている場合は一番下に合わせるか、表示しない
      const maxIndex = tracks.size - 1;
      const clampedIndex = Math.max(0, Math.min(trackIndex, maxIndex));

      // 4. State更新
      setDragPreview({
        isVisible: true,
        x: localPoint.x, // マウスのX座標に追従
        trackIndex: clampedIndex, // トラックの行にスナップ
      });
    },
    [tracks.size, unitHeight, containerRef, trackAreaPixiRef]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!containerRef.current || !trackAreaPixiRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const globalX = e.clientX - rect.left;
      const globalY = e.clientY - rect.top;
      const globalPoint = new PIXI.Point(globalX, globalY);
      const localPoint = trackAreaPixiRef.current.toLocal(globalPoint);
      const droppedY = localPoint.y;
      console.log(droppedY);
      setDragPreview((prev) => {
        return { ...prev, isVisible: false };
      });
      const trackIndex = Math.floor(localPoint.y / unitHeight);
      console.log(trackIndex);

      // ...以降のロジックは前回と同じ
    },
    [containerRef, unitHeight]
  );

  return (
    <DawEditorContainer>
      <PlayHeader />

      <TrackContainer
        ref={containerRef}
        onScroll={handleScroll}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* 1. ダミーの高さを持つdiv (スクロールバー生成用) */}
        <div style={{ height: contentHeight, width: "100%" }}>
          {/* 2. スティッキーコンテナ 
            【重要修正】
            height: "100%" ではなく、size.height (画面の高さ) を指定します。
            これで「中身は5000pxあるけど、表示窓は300pxだよ」とブラウザに伝わり、
            stickyが正しく機能して画面内に固定されます。
          */}
          <div
            style={{
              position: "sticky",
              top: 0,
              height: size.height, // ★ここを修正 (100% -> size.height)
              overflow: "hidden",
            }}
          >
            <Stage
              width={size.width}
              height={size.height}
              options={{ backgroundColor: 0x1e1e1e, antialias: true }}
              style={{ display: "block" }}
            >
              {/* 描画順序: TrackAreaを先に書く (奥) */}
              <TrackArea
                width={size.width}
                tracks={tracks}
                pixiRef={trackAreaPixiRef}
                scrollTop={scrollTop}
                dragPreview={dragPreview}
              />

              {/* 描画順序: Rulerを後に書く (手前・最前面) */}
              <DawRuler width={size.width} height={TRACK_AREA_OFFSET_Y} />
            </Stage>
          </div>
        </div>
      </TrackContainer>
    </DawEditorContainer>
  );
};

export default DawEditor;
