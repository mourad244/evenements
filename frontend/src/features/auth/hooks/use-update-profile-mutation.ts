import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProfile, type UpdateProfilePayload } from "../api/update-profile";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile"], updated);
      // Also refresh the current-user cache so the navbar reflects the new name
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    }
  });
}
