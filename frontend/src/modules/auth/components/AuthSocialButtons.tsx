'use client';
import React from 'react';
import CustomSocialButton from '@/shared/components/forms/theme-elements/CustomSocialButton';
import { Stack } from '@mui/system';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

interface AuthSocialButtonsProps {
  title?: string;
}

const AuthSocialButtons = ({ title = 'Sign in with' }: AuthSocialButtonsProps) => (
  <Stack direction="row" justifyContent="center" spacing={2} mt={3}>
    <CustomSocialButton>
      <Avatar
        src="/images/svgs/google-icon.svg"
        alt="Google"
        sx={{
          width: 16,
          height: 16,
          borderRadius: 0,
          mr: 1,
        }}
      />
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          whiteSpace: 'nowrap',
          mr: { sm: '3px' },
        }}
      >
        {title}{' '}
      </Box>{' '}
      Google
    </CustomSocialButton>
    <CustomSocialButton>
      <Avatar
        src="/images/svgs/facebook-icon.svg"
        alt="Facebook"
        sx={{
          width: 25,
          height: 25,
          borderRadius: 0,
          mr: 1,
        }}
      />
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          whiteSpace: 'nowrap',
          mr: { sm: '3px' },
        }}
      >
        {title}{' '}
      </Box>{' '}
      FB
    </CustomSocialButton>
  </Stack>
);

export default AuthSocialButtons;
