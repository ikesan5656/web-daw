import './App.css'
import {
  Box,
  styled,
} from "@mui/material";
import AppHeader from './components/AppHeader';
import SplitArea from './components/SplitArea';
import Sidebar from './components/SIdebar';
import DawEditor from './components/DawEditor';


export const MainContainer = styled(Box)({
  padding: "0",
  margin: "0",
  background: "gray",
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
  display: "flex",
  flexFlow: "column"

});



function App() {

  return (
    <MainContainer>
      <AppHeader/>
      <SplitArea left={<Sidebar/>} right={<DawEditor/>}/>
    </MainContainer>
  )
}

export default App
