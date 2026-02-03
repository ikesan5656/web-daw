// src/components/PlaybackHead.tsx
import { useAudio } from "@/contexts/AudioEngineContext";
import { TRACK_AREA_OFFSET_Y, TRACK_HEADER_WIDTH } from "@/util/trackSettings";
import { convertStartTimeToPosition } from "@/util/projectSettings";
import { Container, Graphics } from "@pixi/react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";

interface PlaybackHeadProps {
  scrollX: number;
}

const PlaybackHead = (props: PlaybackHeadProps) => {
  const { scrollX } = props;
  const { isPlay, getCurrentTime } = useAudio();
  const [, setTick] = useState(0);
  const requestRef = useRef<number>();

  // update関数の実体を常に最新の状態で保持するためのRef
  const updateRef = useRef<() => void>(() => {});

  // 再描画ループ
  const update = useCallback(() => {
    if (isPlay) {
      setTick((t) => t + 1);
      requestRef.current = requestAnimationFrame(updateRef.current);
    }
  }, [isPlay]);

  // updateが更新されるたびにRefの中身を同期する
  useEffect(() => {
    updateRef.current = update;
  }, [update]);

  useEffect(() => {
    if (isPlay) {
      requestRef.current = requestAnimationFrame(updateRef.current);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlay]);

  const draw = useCallback((g: PIXI.Graphics) => {
    g.clear();
    // 再生棒の線
    g.lineStyle(2, 0xff0000, 1);
    g.moveTo(0, 0);
    g.lineTo(0, 2000); // 画面下部まで届く長さ

    // 上部の三角形（ヘッド）
    g.beginFill(0xff0000);
    g.drawPolygon([new PIXI.Point(-8, 0), new PIXI.Point(8, 0), new PIXI.Point(0, 12)]);
    g.endFill();
  }, []);

  // 秒数をピクセルに変換 (convertStartTimeToPosition を利用)
  const currentTime = isPlay ? getCurrentTime() : 0;
  const x = convertStartTimeToPosition(currentTime) + TRACK_HEADER_WIDTH;
  const currentX = x + TRACK_HEADER_WIDTH - scrollX;
  const isVisible = currentX >= TRACK_HEADER_WIDTH;

  return (
    <Container x={currentX} y={TRACK_AREA_OFFSET_Y - 15} visible={isVisible}>
      <Graphics draw={draw} />
    </Container>
  );
};

export default PlaybackHead;
