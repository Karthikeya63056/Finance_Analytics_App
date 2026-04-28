import React from 'react';
import { Dashboard } from '../../pages/Dashboard';
import { NavigationHub } from '../../components/v2/NavigationHub';

/**
 * DashboardWithNav — Wraps the original V1 Dashboard and appends
 * the V2 NavigationHub below it so all routes are explicitly visible.
 *
 * The original Dashboard component renders untouched.
 */
export default function DashboardWithNav() {
  return (
    <>
      {/* Original V1 Dashboard — renders 100% unchanged */}
      <Dashboard />

      {/* V2 Navigation Hub — explicit route cards */}
      <NavigationHub />
    </>
  );
}
