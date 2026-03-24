'use client';
import { ApplicationListByType } from '@/components/portal/ApplicationListByType';
export default function SpaceAppsPage() {
  return <ApplicationListByType type="space_rental" title="Space Rental Applications" description="Businesses wanting to rent space" />;
}
