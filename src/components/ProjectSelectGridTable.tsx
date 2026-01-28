import { useAudio } from "@/contexts/AudioEngineContext";
import { Project } from "@/types/project";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ProjectRow {
  project: Project;
  isHeader?: boolean;
}

const ProjectRow = (props: ProjectRow) => {
  const { project, isHeader } = props;

  const navigate = useNavigate();
  const { initialize } = useAudio();

  const onClick = (id: string) => {
    initialize();
    navigate(`/edit/${id}`);
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 1,
        // ヘッダーの場合は背景色を変える
        backgroundColor: isHeader ? "#f5f5f5" : "white",
        fontWeight: isHeader ? "bold" : "normal",
      }}
    >
      <Grid container spacing={2} alignItems={"center"}>
        <Grid size={2}>
          <Typography variant={isHeader ? "subtitle2" : "body2"}>画像</Typography>
        </Grid>
        <Grid size={4}>
          <Typography variant={isHeader ? "subtitle2" : "body2"}>{project.name}</Typography>
        </Grid>
        <Grid size={6}>
          <Button
            onClick={() => {
              onClick(project.id);
            }}
          >
            クリック
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

const projects: Project[] = [
  { id: "1", name: "test1", imagePath: "/test" },
  { id: "2", name: "test2", imagePath: "/test" },
];

const ProjectSelectGridTable = () => {
  return (
    <Box>
      {projects.map((project) => (
        <ProjectRow key={project.id} project={project} />
      ))}
    </Box>
  );
};

export default ProjectSelectGridTable;
