import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProjectSelectHomePage from "../pages/ProjectSelectHomePage";
import EditorPage from "../pages/EditorPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectSelectHomePage />} />
        <Route path="/edit" element={<EditorPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
