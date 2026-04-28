import { useMutation } from "@tanstack/react-query";
import { createProjectApi } from "../../../apis/projects";

export const useCreateProject = () => {
    const { mutateAsync, isPending, isSuccess, error } = useMutation({
        mutationFn: createProjectApi,
        onSuccess: (data) => {
            console.log("Project created successfully", data);
        },
        onError: (err) => {
            console.log("Error creating project", err);
        },
    });
    return {
        createProjectMutation: mutateAsync,
        isPending,
        isSuccess,
        error,
    };
};