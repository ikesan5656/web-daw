import * as PIXI from "pixi.js";
import { Container } from "@pixi/react";
import { useCallback } from "react";

const PlaybackHead = () => {
  const drawHead = useCallback((g: PIXI.Graphics) => {
    g.clear();
    g.lineStyle(1, 0x666666, 1);
  }, []);
  return <Container></Container>;
};

export default PlaybackHead;
