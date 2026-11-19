import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import Box from '@mui/material/Box'
import { SxProps } from '@mui/system';
import { styled } from '@mui/material/styles'
import { useMediaQuery } from "@mui/material";

const SimpleBarStyle = styled(SimpleBar)(() => ({
  maxHeight: "100%",
  '& .simplebar-content': {
    overflowX: 'hidden !important',
  },
}));

interface PropsType {
  children: React.ReactElement | React.ReactNode;
  sx: SxProps;
}

const Scrollbar = (props: PropsType) => {
  const { children, sx, ...other } = props;
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down('lg'));

  if (lgDown) {
    return <Box sx={{ overflowY: "auto", overflowX: "hidden", maxHeight: "100%" }}>{children}</Box>;
  }

  return (
    <SimpleBarStyle sx={sx} {...other}>
      {children}
    </SimpleBarStyle>
  );
};

export default Scrollbar;
