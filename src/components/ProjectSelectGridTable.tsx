import { Box, Button, Grid, Paper, Typography } from "@mui/material";

interface Project {
  id: number;
  name: string;
  imagePath: string;
}

interface ProjectRow {
  project: Project;
  isHeader?: boolean;
}

const ProjectRow = (props: ProjectRow) => {
  const { project, isHeader } = props;

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
          <Button>クリック</Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

const projects: Project[] = [
  { id: 1, name: "test1", imagePath: "/test" },
  { id: 1, name: "test1", imagePath: "/test" },
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
