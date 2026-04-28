import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProjectApi } from "../../../apis/projects";

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, isSuccess, error } = useMutation({
        mutationFn: deleteProjectApi,
        onSuccess: () => {
            console.log("Project deleted successfully");
            // Invalidate the projects list so it refetches
            queryClient.invalidateQueries({ queryKey: ["userProjects"] });
        },
        onError: (err) => {
            console.log("Error deleting project", err);
        },
    });
    return {
        deleteProjectMutation: mutateAsync,
        isPending,
        isSuccess,
        error,
    };
};
