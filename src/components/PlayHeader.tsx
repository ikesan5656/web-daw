import { Box, styled } from "@mui/material";

const PlayHeaderContainer = styled(Box)({
  padding: "0",
  margin: "0",
  background: "gray",
  width: "100%",
  height: 50,
  boxSizing: "border-box",
  display: "flex",
  flexFlow: "row",
  backgroundColor: "orange"
});

const PlayHeader = () => {

  return(
    <PlayHeaderContainer/>
  )
}

export default PlayHeader;