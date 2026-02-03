import { Box, styled } from "@mui/material";
import PlaybackButton from "@/components/PlayBackButton";
import { useAudio } from "@/contexts/AudioEngineContext";
import PlayTimeCounter from "./PlayTimeCounter";

const PlayHeaderContainer = styled(Box)({
  padding: "0",
  margin: "0",
  background: "gray",
  width: "100%",
  height: 50,
  boxSizing: "border-box",
  display: "flex",
  flexFlow: "row",
  justifyContent: "center",
  backgroundColor: "orange",
});

const PlayHeader = () => {
  const { playBackAll, stopAll, getTracksInfo, isPlay } = useAudio();

  const onPlay = () => {
    if (isPlay) {
      stopAll();
    } else {
      const tracks = getTracksInfo();
      playBackAll(tracks);
    }
  };

  return (
    <PlayHeaderContainer>
      <PlayTimeCounter />
      <PlaybackButton onClick={onPlay} isPlay={isPlay} />
    </PlayHeaderContainer>
  );
};

export default PlayHeader;
