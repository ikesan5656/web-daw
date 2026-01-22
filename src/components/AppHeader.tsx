import { Box, styled } from "@mui/material";
import { useTrackDataStore } from "../contexts/TrackDataStoreContext";

export const HeaderContainer = styled(Box)({
  padding: "0",
  margin: "0",
  background: "gray",
  width: "100%",
  height: 30,
  boxSizing: "border-box",
  display: "flex",
  flexFlow: "row",
  backgroundColor: "grey",
});

const AppHeader = () => {
  const { getTracksInfo, addTrack } = useTrackDataStore();
  const testClick = () => {
    /*playPiano(261.6); // ド
    playPiano(329.6); // ミ
    playPiano(392.0); // ソ*/
    addTrack();
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
