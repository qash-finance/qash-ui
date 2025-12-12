
import { useQuery } from "@tanstack/react-query";
import { apiServerWithAuth } from "./index";
import { TeamMembership } from "@/types/team-member";

// Query params for filtering team members
export interface TeamMemberSearchQuery {
	role?: string;
	isActive?: boolean;
	search?: string;
}

/**
 * Fetch all team members for a company (optionally filtered)
 * @param companyId Company ID
 * @param filters Optional filters: role, isActive, search
 */
export async function getCompanyTeamMembers(
	companyId: number,
	filters?: TeamMemberSearchQuery
): Promise<TeamMembership[]> {
	const params = new URLSearchParams();
	if (filters) {
		if (filters.role) params.append("role", filters.role);
		if (filters.isActive !== undefined) params.append("isActive", String(filters.isActive));
		if (filters.search) params.append("search", filters.search);
	}
	const url = `/companies/${companyId}/team-members${params.toString() ? `?${params}` : ""}`;
	return apiServerWithAuth.getData<TeamMembership[]>(url);
}

/**
 * React Query hook to fetch company team members
 */
export function useGetCompanyTeamMembers(
	companyId?: number,
	filters?: TeamMemberSearchQuery,
	options?: { enabled?: boolean }
) {
	return useQuery<TeamMembership[]>({
		queryKey: ["company", companyId, "team-members", filters],
		queryFn: () => {
			if (!companyId) throw new Error("companyId is required");
			return getCompanyTeamMembers(companyId, filters);
		},
		enabled: !!companyId && (options?.enabled !== false),
		staleTime: 0,
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
	});
}
