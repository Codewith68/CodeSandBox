import { useQuery } from "@tanstack/react-query"
import { getProjectTree } from "../../../apis/projects"

export const useProjectTree = (projectId) => {
    const{isLoading,isError,data :projectTree,error}=useQuery({
        queryKey: ['projectTree', projectId],
        queryFn: () => getProjectTree(projectId),
    });
    return {
        isLoading,
        isError,
        projectTree,
        error
    
    }
}