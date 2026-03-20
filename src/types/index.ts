export interface GHLContact { id:string; firstName:string; lastName:string; email:string; phone?:string; tags?:string[]; customFields?:Record<string,unknown>; companyName?:string; dateAdded?:string; dateUpdated?:string; }
export interface GHLCompany { id:string; name:string; phone?:string; email?:string; website?:string; address?:string; city?:string; state?:string; description?:string; tags?:string[]; customFields?:Record<string,unknown>; }
export interface GHLOpportunity { id:string; name:string; pipelineId:string; pipelineStageId:string; status:string; contactId:string; companyId?:string; monetaryValue?:number; customFields?:Record<string,unknown>; dateAdded?:string; dateUpdated?:string; }

export type JobType = 'full-time'|'part-time'|'contract'|'seasonal'|'internship';
export type WorkMode = 'on-site'|'remote'|'hybrid';
export type JobStatus = 'draft'|'published'|'closed'|'archived';
export interface JobOpening { id:string; title:string; slug:string; description:string; requirements?:string; benefits?:string; employerName:string; employerId?:string; category:string; type:JobType; workMode:WorkMode; location:string; salaryMin?:number; salaryMax?:number; salaryType?:'hourly'|'annual'; status:JobStatus; isPublic:boolean; postedDate:string; closingDate?:string; applicationCount?:number; }

export type ApplicationStatus = 'new'|'reviewing'|'interview'|'offer'|'hired'|'rejected'|'withdrawn';
export interface JobApplication { id:string; jobId:string; jobTitle:string; contactId:string; applicantName:string; applicantEmail:string; applicantPhone?:string; resumeUrl?:string; coverLetter?:string; status:ApplicationStatus; notes?:string; dateApplied:string; dateUpdated?:string; }

export type BusinessStatus = 'inquiry'|'application'|'review'|'approved'|'active'|'inactive'|'rejected';
export type BusinessCategory = 'retail'|'food-beverage'|'professional-services'|'healthcare'|'education'|'religious'|'community'|'other';
export interface Business { id:string; name:string; slug:string; description:string; category:BusinessCategory; subcategory?:string; contactName:string; contactEmail:string; contactPhone?:string; website?:string; logoUrl?:string; imageUrl?:string; address?:string; status:BusinessStatus; isPublic:boolean; tags?:string[]; companyId?:string; spaceId?:string; }

export type ProviderCategory = 'construction'|'maintenance'|'landscaping'|'security'|'cleaning'|'technology'|'consulting'|'catering'|'other';
export interface ServiceProvider { id:string; name:string; description:string; category:ProviderCategory; contactName:string; contactEmail:string; contactPhone?:string; website?:string; logoUrl?:string; status:'inquiry'|'vetting'|'approved'|'active'|'suspended'; isPublic:boolean; companyId?:string; }

export type InvestorStatus = 'inquiry'|'contacted'|'meeting'|'due-diligence'|'committed'|'closed'|'declined';
export interface InvestorLead { id:string; contactName:string; contactEmail:string; contactPhone?:string; companyName?:string; investmentInterest:string; investmentRange?:string; status:InvestorStatus; notes?:string; contactId:string; companyId?:string; opportunityId?:string; dateSubmitted:string; }

export type SpaceType = 'retail'|'office'|'warehouse'|'mixed-use'|'community';
export type SpaceStatus = 'available'|'reserved'|'leased'|'under-construction'|'maintenance';
export interface CommercialSpace { id:string; name:string; slug:string; description:string; type:SpaceType; sqft:number; pricePerSqft?:number; monthlyRate?:number; address?:string; building?:string; floor?:string; unit?:string; amenities?:string[]; imageUrl?:string; status:SpaceStatus; isPublic:boolean; assignedBusinessId?:string; }

export type UserRole = 'super-admin'|'econ-dev-admin'|'hiring-manager'|'business-dev-manager'|'space-manager'|'content-manager'|'analyst';
export interface PortalUser { id:string; email:string; name:string; role:UserRole; isActive:boolean; lastLogin?:string; createdAt:string; }
export type PortalModule = 'dashboard'|'jobs'|'applications'|'businesses'|'services'|'investors'|'spaces'|'content'|'users'|'settings'|'audit';
export type PermissionAction = 'view'|'create'|'edit'|'delete'|'publish'|'export';
export interface RolePermissions { role:UserRole; modules:Record<PortalModule,PermissionAction[]>; }
export interface ApiResponse<T> { success:boolean; data?:T; error?:string; message?:string; }
export interface PaginatedResponse<T> { items:T[]; total:number; page:number; pageSize:number; totalPages:number; }
export interface SearchFilters { query?:string; category?:string; type?:string; status?:string; workMode?:string; page?:number; pageSize?:number; sortBy?:string; sortOrder?:'asc'|'desc'; }
