'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import FullScreenErrorLayout from '@/shared/components/layout/FullScreenErrorLayout';

export default function NotFound() {
  const t = useTranslations();

  const title = t.has('PageNotFoundTitle')
    ? t('PageNotFoundTitle')
    : '404 — Page Not Found';

  const subtitle = t.has('PageNotFoundSubtitle')
    ? t('PageNotFoundSubtitle')
    : 'The page you are looking for might have been moved, deleted, or does not exist. Please check the URL or return to the dashboard.';

  const backToDashboard = t.has('BackToDashboard')
    ? t('BackToDashboard')
    : 'Back to Dashboard';

  const goBack = t.has('GoBack') ? t('GoBack') : 'Go Back';

  const needHelp = t.has('NeedHelpQuestion')
    ? t('NeedHelpQuestion')
    : 'Need help or experiencing an issue?';

  const visitHelp = t.has('VisitHelpCenter')
    ? t('VisitHelpCenter')
    : 'Visit Help Center';

  return (
    <FullScreenErrorLayout
      statusCode="404"
      title={title}
      subtitle={subtitle}
      illustrationSrc="/images/backgrounds/errorimg.svg"
      illustrationAlt="404 — Page Not Found"
      primaryActionLabel={backToDashboard}
      primaryActionHref="/"
      secondaryActionLabel={goBack}
      showHelpLink={false}
    />
  );
}
