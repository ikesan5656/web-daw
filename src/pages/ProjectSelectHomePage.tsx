import { Box, styled } from "@mui/material";
import ProjectSelectGridTable from "../components/ProjectSelectGridTable";

const ProjectSelectHomePageContainer = styled(Box)({
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

const ProjectSelectHomePage = () => {
  return (
    <ProjectSelectHomePageContainer>
      <ProjectSelectGridTable />
    </ProjectSelectHomePageContainer>
  );
};

export default ProjectSelectHomePage;
