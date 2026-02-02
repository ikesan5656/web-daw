import { Box, styled } from "@mui/material";
import { useAudio } from "@/contexts/AudioEngineContext";

export const HeaderContainer = styled(Box)({
  padding: "0",
  margin: "0",
  width: "100%",
  height: 30,
  boxSizing: "border-box",
  display: "flex",
  flexFlow: "row",
  backgroundColor: "cyan",
});

const AppHeader = () => {
  const { addTrack, playNote, getTracksInfo, getCurrentTime } = useAudio();
  const testClick = () => {
    //initialize();
    /*playPiano(261.6); // ド
    playPiano(329.6); // ミ
    playPiano(392.0); // ソ*/
    //const ctx = getContext();
    //if (!ctx) return;
    /*const newTrackNode = ctx.createGain();
    addTrack(newTrackNode);*/
    addTrack();
  };

  const test2 = () => {
    //console.log(getTracksInfo());
    const tracks = getTracksInfo();
    // 1. 最初のトラックを取り出す
    const firstTrack = tracks.values().next().value;

    if (firstTrack) {
      // 2. そのトラックの中の最初のノートを取り出す
      const firstNote = firstTrack.notes.values().next().value;

      if (firstNote) {
        console.log("最初のノートを見つけました:", firstNote);
        if (firstNote.audioBuffer)
          playNote(firstNote.audioBuffer, firstNote.when, 0, firstTrack.trackNode);
      } else {
        console.log("トラックはありますが、ノートが登録されていません。");
      }
    } else {
      console.log("トラックが一つもありません。");
    }
    //const targetNote = tracks.
    //playNote()
  };

  const checkTime = () => {
    console.log(getCurrentTime());
  };

  return (
    <HeaderContainer>
      <button onClick={testClick}>add</button>
      <button onClick={test2}>info</button>
      <button onClick={checkTime}>checktime</button>
    </HeaderContainer>
  );
};

export default AppHeader;
