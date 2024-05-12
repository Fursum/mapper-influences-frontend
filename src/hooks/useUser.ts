import { getCurrentUser } from "@services/user";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["currentUser"],
    queryFn: () =>
      getCurrentUser().then((res) => {
        return res.data;
      }),
  });
