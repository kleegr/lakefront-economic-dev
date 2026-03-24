'use client';
import { ApplicationListByType } from '@/components/portal/ApplicationListByType';
export default function EmployeeAppsPage() {
  return <ApplicationListByType type="employee" title="Employee Applications" description="Job seekers and employee applicants" />;
}
