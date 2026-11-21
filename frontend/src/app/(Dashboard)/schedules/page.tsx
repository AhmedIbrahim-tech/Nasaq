import React from 'react';
import SchedulesView from '@/modules/schedules/views/SchedulesView';

export const metadata = {
  title: 'Work Schedules & Shifts — NASAQ',
  description: 'Manage workforce shifts, weekly schedules, and employee schedule assignments',
};

export default function SchedulesPage() {
  return <SchedulesView />;
}
