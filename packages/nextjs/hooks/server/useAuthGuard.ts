"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/services/auth/context";

const PUBLIC_ROUTES = ["/login", "/onboarding", "/payment", "/invoice-review", "/mobile"];

export function useAuthGuard(redirectTo: string = "/login") {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if still loading
    if (isLoading) return;

    // Check if current route is public
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

    // Allow /invoice-review for any authenticated user (even if missing company/team)
    if (isAuthenticated && pathname?.startsWith("/invoice-review")) {
      return;
    }

    if (isAuthenticated && pathname?.startsWith("/mobile")) {
      return;
    }

    // Redirect to login if not authenticated and not on a public route
    if (!isAuthenticated && !isPublicRoute) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, pathname, router, redirectTo]);

  return {
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated || PUBLIC_ROUTES.some(route => pathname?.startsWith(route)),
  };
}

