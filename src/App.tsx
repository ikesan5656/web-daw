import "./App.css";
import { Box, styled } from "@mui/material";
import AppHeader from "./components/AppHeader";
import AudioEngineProvider from "./contexts/AudioEngineContext";
import AppRoutes from "./components/AppRoutes";

export const MainContainer = styled(Box)({
  padding: "0",
  margin: "0",
  background: "gray",
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
  display: "flex",
  flexFlow: "column",
});

function App() {
  return (
    <MainContainer>
      <AudioEngineProvider>
        <AppHeader />
        <AppRoutes />
      </AudioEngineProvider>
    </MainContainer>
  );
}

export default App;
