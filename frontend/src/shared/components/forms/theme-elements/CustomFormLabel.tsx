import React from 'react';
import { styled }  from "@mui/system";
import { Typography } from '@mui/material';

const CustomFormLabel = styled((props: any) => (
  <Typography
    variant="subtitle2"
    fontWeight={600}
    {...props}
    component="label"
    htmlFor={props.htmlFor}
  />
))(({ theme }) => ({
  marginBottom: '10px',
  marginTop: '12px',
  fontSize: '0.875rem',
  color: theme.palette.text.primary,
  display: 'block',
  '&:first-of-type': {
    marginTop: 0,
  },
}));

export default CustomFormLabel;
