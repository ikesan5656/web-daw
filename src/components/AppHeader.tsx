import { Box, styled } from "@mui/material";
import { useAudio } from "../contexts/AudioEngineContext";

export const HeaderContainer = styled(Box)({
  padding: "0",
  margin: "0",
  background: "gray",
  width: "100%",
  height: 30,
  boxSizing: "border-box",
  display: "flex",
  flexFlow: "row",
  backgroundColor: "cyan",
});

const AppHeader = () => {
  const { getTracksInfo, initialize } = useAudio();
  const testClick = () => {
    initialize();
    /*playPiano(261.6); // ド
    playPiano(329.6); // ミ
    playPiano(392.0); // ソ*/
    //const ctx = getContext();
    //if (!ctx) return;
    /*const newTrackNode = ctx.createGain();
    addTrack(newTrackNode);*/
  };

  const test2 = () => {
    console.log(getTracksInfo());
  };

  return (
    <HeaderContainer>
      <button onClick={testClick}>add</button>
      <button onClick={test2}>info</button>
    </HeaderContainer>
  );
};

export default AppHeader;
