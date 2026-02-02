import { useAudio } from "@/contexts/AudioEngineContext";
import { Box, styled } from "@mui/material";
import { useEffect, useRef, useState, useCallback } from "react";

const PlayTimeCounterContainer = styled(Box)({
  padding: "0",
  margin: "0",
  width: 100,
  height: "100%",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}:${millis.toString().padStart(2, "0")}`;
};

const PlayTimeCounter = () => {
  const { isPlay, getCurrentTime } = useAudio();
  const [, setTick] = useState(0);
  const requestRef = useRef<number>();

  // update関数の実体を常に最新の状態で保持するためのRef
  const updateRef = useRef<() => void>(() => {});

  // update関数の定義
  const update = useCallback(() => {
    if (isPlay) {
      setTick((t) => t + 1);
      // 変数名「update」ではなく、Ref経由で自分自身を呼び出す
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
  }, [isPlay]); // update自体を依存に入れる必要がなくなります

  const timeSeconds = isPlay ? getCurrentTime() : 0;
  const displayTime = formatTime(timeSeconds);

  return (
    <PlayTimeCounterContainer>
      <p> {displayTime}</p>
    </PlayTimeCounterContainer>
  );
};

export default PlayTimeCounter;
