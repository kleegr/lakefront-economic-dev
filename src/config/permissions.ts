import type { UserRole, PortalModule, PermissionAction } from '@/types';

const ALL: PermissionAction[] = ['view','create','edit','delete','publish','export'];
const CRUD: PermissionAction[] = ['view','create','edit','delete'];
const RO: PermissionAction[] = ['view'];
const RE: PermissionAction[] = ['view','export'];
const NO: PermissionAction[] = [];

export const ROLE_PERMISSIONS: Record<UserRole, Record<PortalModule, PermissionAction[]>> = {
  'super-admin': { dashboard:ALL,jobs:ALL,applications:ALL,businesses:ALL,services:ALL,investors:ALL,spaces:ALL,content:ALL,users:ALL,settings:ALL,audit:ALL },
  'econ-dev-admin': { dashboard:RO,jobs:CRUD,applications:CRUD,businesses:CRUD,services:CRUD,investors:CRUD,spaces:CRUD,content:[...CRUD,'publish'],users:RO,settings:RO,audit:RO },
  'hiring-manager': { dashboard:RO,jobs:CRUD,applications:CRUD,businesses:RO,services:RO,investors:NO,spaces:NO,content:NO,users:NO,settings:NO,audit:NO },
  'business-dev-manager': { dashboard:RO,jobs:RO,applications:RO,businesses:CRUD,services:CRUD,investors:CRUD,spaces:RO,content:NO,users:NO,settings:NO,audit:NO },
  'space-manager': { dashboard:RO,jobs:NO,applications:NO,businesses:RO,services:RO,investors:NO,spaces:CRUD,content:NO,users:NO,settings:NO,audit:NO },
  'content-manager': { dashboard:RO,jobs:RO,applications:NO,businesses:RO,services:RO,investors:NO,spaces:RO,content:[...CRUD,'publish'],users:NO,settings:NO,audit:NO },
  'analyst': { dashboard:RE,jobs:RE,applications:RE,businesses:RE,services:RE,investors:RE,spaces:RE,content:RO,users:NO,settings:NO,audit:RO },
};

export function hasPermission(role: UserRole, module: PortalModule, action: PermissionAction): boolean {
  return ROLE_PERMISSIONS[role]?.[module]?.includes(action) ?? false;
}

export function getModulesForRole(role: UserRole): PortalModule[] {
  return (Object.entries(ROLE_PERMISSIONS[role]) as [PortalModule, PermissionAction[]][])
    .filter(([_, a]) => a.length > 0).map(([m]) => m);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  'super-admin':'Super Admin','econ-dev-admin':'Economic Dev Admin','hiring-manager':'Hiring Manager',
  'business-dev-manager':'Business Dev Manager','space-manager':'Space Manager','content-manager':'Content Manager','analyst':'Analyst',
};
