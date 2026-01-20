import { useCreateProject } from "../hooks/apis/mutations/useCreateProject"
import {Button, Col, Flex, Row} from "antd"

export const CreateProject =()=>{

    const {createProjectMutation,} =useCreateProject()
    async function handelCreateProject(){
        console.log("going to trigger the api");
        try {
            await createProjectMutation();
            console.log("now we should redirect to the editor page ");
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