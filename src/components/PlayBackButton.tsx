import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import CustomIconButton from "./common/CustomIconButton";

interface PlayBackButtonProps {
  onClick: () => void;
  isPlay: boolean;
}

const PlaybackButton = (props: PlayBackButtonProps) => {
  const { onClick, isPlay } = props;

  return (
    <CustomIconButton label="play" onClick={onClick}>
      {isPlay ? <StopIcon /> : <PlayArrowIcon />}
    </CustomIconButton>
  );
};

export default PlaybackButton;
