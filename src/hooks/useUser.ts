import { getCurrentUser, getFullUser } from "@services/user";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["currentUser"],
    queryFn: () =>
      getCurrentUser().then((res) => {
        return res.data;
      }),
  });

export const useFullUser = (userId: string | undefined) => {
  const { data: currentUser, isLoading } = useCurrentUser();

  return useQuery({
    queryKey: ["fullUser", userId],
    enabled: !isLoading,
    queryFn: () => {
      const id = userId || currentUser?.id.toString();

      if (!id) throw new Error("No user id provided and no current user found");

      return getFullUser(id).then((res) => {
        return res.data;
      });
    },
  });
};
