'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import FullScreenErrorLayout from '@/shared/components/layout/FullScreenErrorLayout';

export default function ErrorPage() {
  const t = useTranslations();

  const title = t.has('SystemErrorTitle')
    ? t('SystemErrorTitle')
    : '500 — System Error';

  const subtitle = t.has('SystemErrorSubtitle')
    ? t('SystemErrorSubtitle')
    : (t.has('InternalServerError')
      ? t('InternalServerError')
      : 'An unexpected error occurred while processing your request. Please try again or return to the dashboard.');

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
      statusCode="500"
      title={title}
      subtitle={subtitle}
      illustrationSrc="/images/backgrounds/errorimg.svg"
      illustrationAlt="500 — System Error"
      primaryActionLabel={backToDashboard}
      primaryActionHref="/"
      secondaryActionLabel={goBack}
      showHelpLink={false}
    />
  );
}
