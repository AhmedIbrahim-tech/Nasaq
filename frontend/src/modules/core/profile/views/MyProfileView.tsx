'use client';

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import {
  IconUser,
  IconUserEdit,
  IconKey,
  IconPalette,
  IconShieldLock,
  IconMapPin,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import PageContainer from '@/shared/components/container/PageContainer';
import Breadcrumb from '@/shared/layouts/dashboard/shared/breadcrumb/Breadcrumb';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { meThunk } from '@/modules/auth/slices/thunks/me.thunk';
import { setError } from '@/modules/auth/slices/auth.slice';
import { useLogout } from '@/modules/auth/hooks/useLogout';
import { ProfileHeader } from '../components/ProfileHeader';
import { OverviewTab } from '../components/OverviewTab';
import { PersonalInfoTab } from '../components/PersonalInfoTab';
import { PersonalLocationTab } from '../components/PersonalLocationTab';
import { SecurityTab } from '../components/SecurityTab';
import { PreferencesTab } from '../components/PreferencesTab';
import { AccessPermissionsTab } from '../components/AccessPermissionsTab';

export function MyProfileView() {
  const t = useTranslations();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { logout, isLoggingOut } = useLogout();
  const isPreviewActive = false;

  const user = useAppSelector((state) => state.auth.user);
  const roles = useAppSelector((state) => state.auth.roles) || [];
  const loading = useAppSelector((state) => state.auth.loading);
  const authError = useAppSelector((state) => state.auth.error);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const accessTokenExpiresAtUtc = useAppSelector((state) => state.auth.accessTokenExpiresAtUtc);


  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!user) {
      dispatch(meThunk());
    }
  }, [dispatch, user]);

  const handleRefresh = async () => {
    try {
      await dispatch(meThunk()).unwrap();
    } catch {
      // Handled via authError Alert
    }
  };

  const BCrumb = [
    { to: '/', title: t.has('Home') ? t('Home') : 'Home' },
    { title: t.has('Account & Support') ? t('Account & Support') : 'Account & Support' },
    { title: t('My Profile') },
  ];

  return (
    <PageContainer
      title={t('My Profile')}
      description={t.has('Manage your personal account settings, contact information, and security preferences.')
        ? t('Manage your personal account settings, contact information, and security preferences.')
        : 'Manage your personal account settings, contact information, and security preferences.'}
    >
      <Breadcrumb title={t('My Profile')} items={BCrumb} />

      <Stack spacing={3} sx={{ mt: 3 }}>
        {authError && (
          <Alert
            severity="warning"
            onClose={() => dispatch(setError(null))}
            sx={{ borderRadius: '8px' }}
          >
            {authError}
          </Alert>
        )}

        {/* Profile Header Identity Banner */}
        <ProfileHeader
          user={user}
          roles={roles}
          accessToken={accessToken}
          selectedCompanyName={null}
          selectedBranchName={null}
          isLoading={loading === 'pending'}
          isLoggingOut={isLoggingOut}
          isPreviewActive={isPreviewActive}
          onRefresh={handleRefresh}
          onLogout={logout}
          onNavigateToTab={(tabIndex) => setActiveTab(tabIndex)}
        />

        {/* Navigation Tabs Bar */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            px: { xs: 1, sm: 2 },
            bgcolor: 'background.paper',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            textColor="primary"
            indicatorColor="primary"
            sx={{
              minHeight: 52,
              '& .MuiTab-root': {
                minHeight: 52,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                gap: 1,
              },
            }}
          >
            <Tab
              icon={<IconUser size={18} />}
              iconPosition="start"
              label={t.has('Overview') ? t('Overview') : 'Overview'}
            />
            <Tab
              icon={<IconUserEdit size={18} />}
              iconPosition="start"
              label={t('Personal Information')}
            />
            <Tab
              icon={<IconMapPin size={18} />}
              iconPosition="start"
              label={t.has('Approved Location') ? t('Approved Location') : 'Approved Location'}
            />
            <Tab
              icon={<IconKey size={18} />}
              iconPosition="start"
              label={t.has('Security') ? t('Security') : 'Security'}
            />
            <Tab
              icon={<IconPalette size={18} />}
              iconPosition="start"
              label={t('Preferences')}
            />
            <Tab
              icon={<IconShieldLock size={18} />}
              iconPosition="start"
              label={t('Access & Permissions')}
            />
          </Tabs>
        </Card>

        {/* Active Tab Content Area */}
        <Box>
          {activeTab === 0 && (
            <OverviewTab
              user={user}
              roles={roles}
              selectedCompanyName={null}
              selectedBranchName={null}
              tenantId={null}
              onNavigateToTab={(tabIndex) => setActiveTab(tabIndex)}
            />
          )}

          {activeTab === 1 && (
            <PersonalInfoTab
              user={user}
              accessToken={accessToken}
              isPreviewActive={isPreviewActive}
            />
          )}

          {activeTab === 2 && <PersonalLocationTab />}

          {activeTab === 3 && (
            <SecurityTab
              accessToken={accessToken}
              accessTokenExpiresAtUtc={accessTokenExpiresAtUtc}
              isPreviewActive={isPreviewActive}
            />
          )}

          {activeTab === 4 && <PreferencesTab />}

          {activeTab === 5 && <AccessPermissionsTab user={user} roles={roles} />}
        </Box>
      </Stack>
    </PageContainer>
  );
}
