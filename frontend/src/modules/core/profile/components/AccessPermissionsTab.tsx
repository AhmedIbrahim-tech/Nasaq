'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import {
  IconShieldLock,
  IconBuilding,
  IconGitBranch,
  IconSearch,
  IconChevronDown,
  IconCheck,
  IconInfoCircle,
  IconLock,
  IconShoppingCart,
  IconTruck,
  IconPackage,
  IconBuildingBank,
  IconReceipt2,
  IconUsers,
  IconCoins,
  IconReportAnalytics,
  IconSettings,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { RoleNames } from '@/shared/constants/roles';
import type { CurrentUserResponse, AuthUserResponse } from '@/modules/auth/types';

interface AccessPermissionsTabProps {
  user: (CurrentUserResponse | AuthUserResponse) | null;
  roles: string[];
}

interface PermissionDomainGroup {
  id: string;
  titleKey: string;
  icon: React.ReactNode;
  permissions: string[];
}

export function AccessPermissionsTab({ user, roles }: AccessPermissionsTabProps) {
  const t = useTranslations();
  const theme = useTheme();

  const isPlatformSuperAdmin = false;
  const isPlatformStaff = false;
  const isPlatformUser = false;

  const companies: any[] = [];
  const branches: any[] = [];

  const [searchQuery, setSearchQuery] = useState('');

  const permissionsList: string[] = [];
  const permissionsLoading = false;

  // Filter permissions by query
  const filteredPermissions = useMemo(() => {
    if (!searchQuery.trim()) return permissionsList;
    const q = searchQuery.toLowerCase().trim();
    return permissionsList.filter((p) => p.toLowerCase().includes(q));
  }, [permissionsList, searchQuery]);

  // Group permissions by domain
  const domainGroups = useMemo<PermissionDomainGroup[]>(() => {
    const groups: { [key: string]: PermissionDomainGroup } = {
      sales: {
        id: 'sales',
        titleKey: 'PermissionDomainSales',
        icon: <IconShoppingCart size={20} />,
        permissions: [],
      },
      procurement: {
        id: 'procurement',
        titleKey: 'PermissionDomainProcurement',
        icon: <IconTruck size={20} />,
        permissions: [],
      },
      inventory: {
        id: 'inventory',
        titleKey: 'PermissionDomainInventory',
        icon: <IconPackage size={20} />,
        permissions: [],
      },
      finance: {
        id: 'finance',
        titleKey: 'PermissionDomainFinance',
        icon: <IconBuildingBank size={20} />,
        permissions: [],
      },
      expenses: {
        id: 'expenses',
        titleKey: 'PermissionDomainExpenses',
        icon: <IconReceipt2 size={20} />,
        permissions: [],
      },
      hr: {
        id: 'hr',
        titleKey: 'PermissionDomainHR',
        icon: <IconUsers size={20} />,
        permissions: [],
      },
      contributors: {
        id: 'contributors',
        titleKey: 'PermissionDomainContributors',
        icon: <IconCoins size={20} />,
        permissions: [],
      },
      reports: {
        id: 'reports',
        titleKey: 'PermissionDomainReports',
        icon: <IconReportAnalytics size={20} />,
        permissions: [],
      },
      admin: {
        id: 'admin',
        titleKey: 'PermissionDomainAdmin',
        icon: <IconSettings size={20} />,
        permissions: [],
      },
    };

    if (isPlatformUser) {
      groups.platform = {
        id: 'platform',
        titleKey: 'PermissionDomainPlatform',
        icon: <IconShieldLock size={20} />,
        permissions: [],
      };
    }

    filteredPermissions.forEach((perm) => {
      if (perm.startsWith('Permissions.Sales.')) {
        groups.sales.permissions.push(perm);
      } else if (perm.startsWith('Permissions.Purchases.') || perm.startsWith('Permissions.Suppliers.')) {
        groups.procurement.permissions.push(perm);
      } else if (perm.startsWith('Permissions.Inventory.')) {
        groups.inventory.permissions.push(perm);
      } else if (perm.startsWith('Permissions.Treasury.') || perm.startsWith('Permissions.BankAccounts.')) {
        groups.finance.permissions.push(perm);
      } else if (perm.startsWith('Permissions.Expenses.')) {
        groups.expenses.permissions.push(perm);
      } else if (perm.startsWith('Permissions.Employees.') || perm.startsWith('Permissions.Salaries.')) {
        groups.hr.permissions.push(perm);
      } else if (perm.startsWith('Permissions.Contributors.')) {
        groups.contributors.permissions.push(perm);
      } else if (perm.startsWith('Permissions.Reports.')) {
        groups.reports.permissions.push(perm);
      } else if (perm.startsWith('Permissions.Users.') || perm.startsWith('Permissions.Roles.')) {
        groups.admin.permissions.push(perm);
      } else if (perm.startsWith('Permissions.Platform.')) {
        if (groups.platform) groups.platform.permissions.push(perm);
      } else {
        groups.admin.permissions.push(perm);
      }
    });

    return Object.values(groups).filter((g) => g.permissions.length > 0);
  }, [filteredPermissions, isPlatformUser]);

  return (
    <Stack spacing={3}>
      {/* Read-Only Notice Banner */}
      <Alert
        severity="info"
        icon={<IconInfoCircle size={20} />}
        sx={{ borderRadius: '10px' }}
      >
        {t('ReadOnly Permissions Notice')}
      </Alert>

      <Grid container spacing={3}>
        {/* Assigned Roles Card */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                }}
              >
                <IconShieldLock size={20} />
              </Box>
              <Typography variant="h6" fontWeight={600}>
                {t('Assigned Roles')}
              </Typography>
            </Stack>

            <Stack spacing={1.5}>
              {roles.map((role) => (
                <Box
                  key={role}
                  sx={{
                    p: 2,
                    borderRadius: '8px',
                    bgcolor: 'action.hover',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {t.has(role) ? t(role) : role}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {role === RoleNames.SuperAdmin
                          ? (t.has('PlatformRootAuthority') ? t('PlatformRootAuthority') : 'Root Administrator')
                          : role === RoleNames.Admin
                          ? (t.has('FullAdminAccess') ? t('FullAdminAccess') : 'Administrator')
                          : (t.has('StandardAccess') ? t('StandardAccess') : 'Standard User')}
                      </Typography>
                    </Box>
                    <Chip
                      label={t.has('Active') ? t('Active') : 'Active'}
                      size="small"
                      color="success"
                      sx={{ fontWeight: 600, height: 22 }}
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Authorized Organizational Scope */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'info.light',
                  color: 'info.main',
                }}
              >
                <IconBuilding size={20} />
              </Box>
              <Typography variant="h6" fontWeight={600}>
                {t('Organizational Scope')}
              </Typography>
            </Stack>

            {isPlatformUser ? (
              <Box sx={{ p: 2, borderRadius: '8px', bgcolor: 'action.hover' }}>
                <Typography variant="subtitle2" fontWeight={600} color="secondary.main">
                  {t('Platform Account Scope')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {t('PlatformSuperAdminSecurityDesc')}
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2} divider={<Divider />}>
                {/* Authorized Companies */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                    {t('Authorized Companies')} ({companies.length})
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {companies.length > 0 ? (
                      companies.map((c: any) => (
                        <Chip
                          key={c.value}
                          label={c.label}
                          size="small"
                          color="default"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      ))
                    ) : (
                      <Chip label={t('All Companies Authorized')} size="small" variant="outlined" />
                    )}
                  </Stack>
                </Box>

                {/* Authorized Branches */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                    {t('Authorized Branches')} ({branches.length})
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {branches.length > 0 ? (
                      branches.map((b: any) => (
                        <Chip
                          key={b.value}
                          label={b.label}
                          size="small"
                          color="default"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      ))
                    ) : (
                      <Chip label={t('All Branches Authorized')} size="small" variant="outlined" />
                    )}
                  </Stack>
                </Box>
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Effective Permissions Breakdown */}
      <Card
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          mb={2.5}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h6" fontWeight={600}>
                {t('Effective Permissions')}
              </Typography>
              <Chip
                label={`${permissionsList.length} ${t('Total Permissions Count')}`}
                size="small"
                color="primary"
                sx={{ fontWeight: 600 }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {t.has('Authoritative permissions granted by backend')
                ? t('Authoritative permissions granted by backend')
                : 'Authoritative granted permissions derived from your assigned security roles.'}
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder={t('Search Permissions')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: { sm: 260 } }}
          />
        </Stack>

        {permissionsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : domainGroups.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t.has('No permissions found') ? t('No permissions found') : 'No matching permissions found.'}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {domainGroups.map((group) => (
              <Accordion
                key={group.id}
                defaultExpanded={domainGroups.length <= 4 || Boolean(searchQuery)}
                disableGutters
                elevation={0}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '10px !important',
                  '&:before': { display: 'none' },
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary
                  expandIcon={<IconChevronDown size={18} />}
                  sx={{
                    bgcolor: 'action.hover',
                    px: 2,
                    py: 1,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', pr: 1 }}>
                    <Box sx={{ color: 'primary.main', display: 'flex' }}>
                      {group.icon}
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1 }}>
                      {t(group.titleKey)}
                    </Typography>
                    <Chip
                      label={group.permissions.length}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600, height: 22 }}
                    />
                  </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 2 }}>
                  <Grid container spacing={1.5}>
                    {group.permissions.map((perm) => {
                      const simpleName = perm.split('.').pop() || perm;
                      return (
                        <Grid key={perm} size={{ xs: 12, sm: 6, md: 4 }}>
                          <Box
                            sx={{
                              p: 1.25,
                              borderRadius: '6px',
                              bgcolor: 'background.paper',
                              border: `1px solid ${theme.palette.divider}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1,
                            }}
                          >
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {t.has(simpleName) ? t(simpleName) : simpleName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                                display="block"
                                sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                              >
                                {perm}
                              </Typography>
                            </Box>
                            <Box sx={{ color: 'success.main', display: 'flex' }}>
                              <IconCheck size={16} />
                            </Box>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Card>
    </Stack>
  );
}
