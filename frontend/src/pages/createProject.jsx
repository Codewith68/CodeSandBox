import { useNavigate } from "react-router-dom";
import { useCreateProject } from "../hooks/apis/mutations/useCreateProject"
import {Button, Col, Flex, Row} from "antd"

export const CreateProject =()=>{

    const {createProjectMutation,} =useCreateProject()
    const navigate= useNavigate();
       
    
    async function handelCreateProject(){
        console.log("going to trigger the api");    
        
        try {
           const response= await createProjectMutation();
            console.log("now we should redirect to the editor page ");
            navigate(`/project/${response.data}`)
        } catch (error) {
            console.log("error creating project ",error);
        }
    }


    return (
     <>
        <Row>
            <Col span={24}>
            <Flex justify="center" align="center">
                <Button
                    type="primary"
                    onClick={handelCreateProject}
             >
             create playground   
                </Button>
            </Flex>
            </Col>
        </Row>
    </>
    )
}