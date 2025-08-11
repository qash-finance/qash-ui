"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 780;

      setIsMobile(isMobileDevice);
      setIsLoading(false);

      // Redirect to mobile page if on mobile and not already on mobile page
      if (isMobileDevice && pathname !== "/mobile") {
        router.push("/mobile");
      }
      // Redirect to home if not mobile and on mobile page
      if (!isMobileDevice && pathname === "/mobile") {
        router.push("/");
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [router, pathname]);

  return { isMobile, isLoading };
}
