import './EditorButton.css'


export const EditorButton = ({isActive}) => {

    function handelClick() {

    }
return(
  <>
<button
      className="editor-button"
      style={{
        color: isActive ? 'white' : '#303242',
        backgroundColor: isActive ? '#303252' : '#4a4859',
        borderTop:isActive ? '1px solid #f7b9dd' :'none',
        onClick:{handelClick}
      }}
    
    >
    file.js
    </button>
</>   
)
}