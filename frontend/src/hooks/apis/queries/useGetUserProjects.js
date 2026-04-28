import { useQuery } from "@tanstack/react-query";
import { getUserProjectsApi } from "../../../apis/projects";

export const useGetUserProjects = () => {
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["userProjects"],
        queryFn: getUserProjectsApi,
        staleTime: 30000, // 30 seconds
    });

    return {
        projects: data?.data || [],
        isLoading,
        isError,
        error,
        refetch,
    };
};
