import { IconButton } from "@mui/material";
import { ReactNode } from "react";

interface CustomIconButtonProps {
  label: string;
  children: ReactNode;
  onClick: () => void;
}

const CustomIconButton = (props: CustomIconButtonProps) => {
  const { label, children, onClick } = props;

  return (
    <IconButton aria-label={label} onClick={onClick}>
      {children}
    </IconButton>
  );
};

export default CustomIconButton;
