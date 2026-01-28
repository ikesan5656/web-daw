import { Box, styled } from "@mui/material";

const NotFoundPageContainer = styled(Box)({
  padding: 10,
  margin: "0",
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
  display: "flex",
  flexFlow: "column",
  backgroundColor: "grey",
  overflow: "hidden",
});

const NotFoundPage = () => {
  return <NotFoundPageContainer>NotFound</NotFoundPageContainer>;
};

export default NotFoundPage;
