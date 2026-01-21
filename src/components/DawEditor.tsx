import { Box, styled } from '@mui/material';
import { Stage, Container, Graphics, Text } from '@pixi/react';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import TrackList from './TrackList';
import PlayHeader from './PlayHeader';

const DawEditorContainer = styled(Box)({
  padding: "0",
  margin: "0",
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
  display: "flex",
  flexFlow: "column",
  backgroundColor: "cyan",
  //overflow: "hidden"
});

const totalHeight = 300;

const TrackContainer = styled(Box)({
  padding: "0",
  margin: "0",
  width: "100%",
  height: totalHeight,
  boxSizing: "border-box",
  display: "flex",
  flexFlow: "row",
  backgroundColor: "#1e1e1e"
});

const DawEditor = () => {

const containerRef = useRef<HTMLDivElement>(null);
  
  // 初期値は0にしておく
  const [size, setSize] = useState({ width: 0, height: 300 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // リサイズ監視用のオブザーバー
    // requestAnimationFrame を使うことで、ブラウザの描画フレームと同期させる
    let animationFrameId: number;

    const observer = new ResizeObserver((entries) => {
      // 既存の予定があればキャンセル（無駄な連打を防ぐ）
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      // 次の描画フレームでStateを更新する
      animationFrameId = requestAnimationFrame(() => {
        for (const entry of entries) {
          // 小数点以下のピクセルズレを防ぐため Math.floor または Math.round を推奨
          const newWidth = Math.floor(entry.contentRect.width);
          
          setSize((prev) => {
             // 実際に値が変わったときだけ更新してReactレンダリングを最小化
             if (prev.width === newWidth) return prev;
             return { ...prev, width: newWidth };
          });
        }
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return(
    <DawEditorContainer>
      <PlayHeader/>
      <TrackContainer ref={containerRef}>
        <Stage
          width={size.width} 
          height={totalHeight} 
          options={{ backgroundColor: 0x1e1e1e, antialias: true }}
          style={{ display: 'block', width: '100%', height: '100%' }}
        >
          <TrackList width={size.width}/>
        </Stage>
      </TrackContainer>
    </DawEditorContainer>
  )
}

export default DawEditor;