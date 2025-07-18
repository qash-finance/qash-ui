/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery } from "@tanstack/react-query";
// import { getCounter } from "@/services/api/counter";

export function useCounter() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["getCounter"],
    // queryFn: () => getCounter(),
    queryFn: () => Promise.resolve(1),
  });

  return {
    data,
    isLoading,
    error,
  };
}
