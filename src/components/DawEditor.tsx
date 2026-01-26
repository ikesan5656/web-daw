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
import { TRACK_HEADER_WIDTH } from "../util/trackSettings";

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
  const { getTracksInfo, getTrackFromIndex, addNote } = useTrackDataStore();
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

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";

      if (!containerRef.current || !trackAreaPixiRef.current) return;

      // 1. 座標取得
      const rect = containerRef.current.getBoundingClientRect();
      const globalX = e.clientX - rect.left;
      const globalY = e.clientY - rect.top;

      // 2. toLocal変換
      const globalPoint = new PIXI.Point(globalX, globalY);
      const localPoint = trackAreaPixiRef.current.toLocal(globalPoint);

      // --- ここから範囲判定の追加 ---

      // TrackAreaのサイズを取得 (getBounds または直接のサイズ変数)
      // getBounds()を使うと、スクロールやスケールを加味した現在の実サイズが取れます
      //const bounds = trackAreaPixiRef.current.getBounds();

      // ローカル座標での幅と高さを判定基準にする場合
      // もし TrackArea に width/height プロパティを設定しているならそれを使います
      const areaWidth = trackAreaPixiRef.current.width;
      const areaHeight = tracks.size * unitHeight; // トラック全体の高さ

      const isOutside =
        localPoint.x < TRACK_HEADER_WIDTH ||
        localPoint.x > areaWidth ||
        localPoint.y < 0 ||
        localPoint.y > areaHeight;

      if (isOutside) {
        setDragPreview((prev) => (prev.isVisible ? { ...prev, isVisible: false } : prev));
        return;
      }

      // --- 範囲判定ここまで ---

      const trackIndex = Math.floor(localPoint.y / unitHeight);
      const maxIndex = tracks.size - 1;
      const clampedIndex = Math.max(0, Math.min(trackIndex, maxIndex));

      setDragPreview({
        isVisible: true,
        x: localPoint.x,
        trackIndex: clampedIndex,
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
      //const droppedY = localPoint.y;
      if (localPoint.x < TRACK_HEADER_WIDTH) {
        setDragPreview((prev) => {
          return { ...prev, isVisible: false };
        });
        return;
      }
      const droppedX = localPoint.x - TRACK_HEADER_WIDTH;
      console.log(droppedX);
      const trackIndex = Math.floor(localPoint.y / unitHeight);
      console.log(tracks.size);
      if (trackIndex > tracks.size - 1 || trackIndex < 0) {
        console.log("範囲外");
        return;
      }
      const currentTrack = getTrackFromIndex(trackIndex);
      setDragPreview((prev) => {
        return { ...prev, isVisible: false };
      });
      addNote(currentTrack.id, droppedX, "add_test");
    },
    [containerRef, unitHeight, getTrackFromIndex, addNote, tracks]
  );

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragPreview((prev) => {
      return { ...prev, isVisible: false };
    });
  }, []);

  return (
    <DawEditorContainer>
      <PlayHeader />

      <TrackContainer
        ref={containerRef}
        onScroll={handleScroll}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={onDragLeave}
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
