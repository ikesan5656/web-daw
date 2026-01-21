import { Box, styled } from "@mui/material";

export const HeaderContainer = styled(Box)({
  padding: "0",
  margin: "0",
  background: "gray",
  width: "100%",
  height: 30,
  boxSizing: "border-box",
  display: "flex",
  flexFlow: "row",
  backgroundColor: "grey"
});

const AppHeader = () => {
  return(
    <HeaderContainer/>
  )
}

export default AppHeader;