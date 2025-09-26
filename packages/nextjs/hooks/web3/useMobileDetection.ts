"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type UseMobileDetectionOptions = {
  disableRedirect?: boolean;
};

export function useMobileDetection(options: UseMobileDetectionOptions = {}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 780;

      setIsMobile(isMobileDevice);
      setIsLoading(false);

      if (!options.disableRedirect) {
        // Redirect to mobile page if on mobile and not already on mobile page
        if (isMobileDevice && pathname !== "/mobile") {
          router.push("/mobile");
        }
        // Redirect to home if not mobile and on mobile page
        if (!isMobileDevice && pathname === "/mobile") {
          router.push("/");
        }
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [router, pathname, options.disableRedirect]);

  return { isMobile, isLoading };
}
