import { useMutation } from "@tanstack/react-query";
import { openProjectApi } from "../../../apis/projects";

export const useOpenProject = () => {
    const { mutateAsync, isPending, isSuccess, error } = useMutation({
        mutationFn: openProjectApi,
        onSuccess: (data) => {
            console.log("Project opened successfully", data);
        },
        onError: (err) => {
            console.log("Error opening project", err);
        },
    });
    return {
        openProjectMutation: mutateAsync,
        isPending,
        isSuccess,
        error,
    };
};
