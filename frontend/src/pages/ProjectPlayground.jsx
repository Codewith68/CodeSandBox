import { useParams } from "react-router-dom";
import { EditorComponent } from "../components/molecules/EditorComponent/EditorComponent";
import { EditorButton } from "../components/atoms/EditorButton/EditorButton";

export const ProjectPlayground = () => {

const{projectId}=useParams();
    
    return (
        <>
        project Id is:{projectId}
        <EditorComponent/>
        <EditorButton isActive={false}/>
        <EditorButton isActive={true}/>
        </>
    )
}