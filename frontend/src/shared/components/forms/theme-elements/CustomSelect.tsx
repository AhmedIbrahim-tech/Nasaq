'use client';
import React from 'react';
import { styled } from '@mui/material/styles';
import Select, { SelectProps } from '@mui/material/Select';

export const CustomSelect = styled(({ MenuProps, ...props }: SelectProps) => (
  <Select
    MenuProps={{
      disableScrollLock: true,
      ...MenuProps,
    }}
    {...props}
  />
))(() => ({}));

export default CustomSelect;
