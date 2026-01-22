import { FaCss3, FaFile, FaHtml5, FaJs } from "react-icons/fa"
import { GrReactjs } from "react-icons/gr"
import { SiGitignoredotio } from "react-icons/si";
import { ImSvg } from "react-icons/im";


export const Fileicon =({extension})=>{
    const iconStyle={
        height:"20px",
        width:"20px",
    }
    const iconMapper={
        "js":<FaJs  color="yellow"style={iconStyle}/>,
        "jsx":<GrReactjs color="#61dbfa"style={iconStyle}/>,
        "css":<FaCss3 color="#3c99dc"style={iconStyle}/>,
        "html":<FaHtml5 color="#e34f26"style={iconStyle}/>,
        "gitignore":<SiGitignoredotio color="#f0c674"style={iconStyle}/>,
        "svg":<ImSvg color="#f06674"style={iconStyle}/>,

        "default":<FaFile color ="#564fdc"style={iconStyle}/>
    }
    return(
        <>
        {iconMapper[extension] || iconMapper["default"]}
        </>
    )
}