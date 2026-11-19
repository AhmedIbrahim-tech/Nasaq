import React from 'react';
import { styled } from '@mui/material/styles';
import { TextField } from '@mui/material';

const CustomTextField = styled((props: any) => <TextField {...props} />)(({ theme }) => ({
  '& .MuiOutlinedInput-input::-webkit-input-placeholder': {
    color: theme.palette.text.secondary,
    opacity: '0.8',
  },
  '& .MuiOutlinedInput-input.Mui-disabled::-webkit-input-placeholder': {
    color: theme.palette.text.secondary,
    opacity: '1',
  },
  '& .Mui-disabled .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.grey[200],
  },
  '& .MuiOutlinedInput-input:-webkit-autofill, & .MuiOutlinedInput-input:-webkit-autofill:hover, & .MuiOutlinedInput-input:-webkit-autofill:focus, & .MuiOutlinedInput-input:-webkit-autofill:active, & .MuiOutlinedInput-input:autofill': {
    WebkitTextFillColor: `${theme.palette.text.primary} !important`,
    caretColor: theme.palette.text.primary,
    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset !important`,
    boxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset !important`,
    transition: 'background-color 5000000s ease-in-out 0s',
  },
}));

export default CustomTextField;
