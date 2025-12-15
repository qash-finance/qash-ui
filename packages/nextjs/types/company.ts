export interface CompanyInfo {
	id: number;
	uuid?: string;
	createdAt?: string;
	updatedAt?: string;
	companyName?: string;
	registrationNumber?: string;
	companyType?: string;
	taxId?: string | null;
	notificationEmail?: string | null;
	country?: string;
	address1?: string;
	address2?: string | null;
	city?: string;
	postalCode?: string;
	verificationStatus?: string;
	isActive?: boolean;
	metadata?: Record<string, any> | null;
}  