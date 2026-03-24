'use client';
import { ApplicationListByType } from '@/components/portal/ApplicationListByType';
export default function EmployerAppsPage() {
  return <ApplicationListByType type="employer" title="Employer Applications" description="Businesses wanting to post jobs" />;
}
