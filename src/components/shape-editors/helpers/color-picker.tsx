export const ColorPicker = (props: { currentColor: string, colorOptions: readonly string[], label: string, onColorChange: (newCol: string) => void }) => {
    const onColorClick = (newColor: string) => {
        props.onColorChange(newColor);
    }

    return <div>
        <p>{props.label}</p>
        {props.colorOptions.map(opt => <button key={opt} style={{ width: 20, height: 20, backgroundColor: opt }} onClick={() => onColorClick(opt)}></button>)}
        <button style={{ width: 20, height: 20, backgroundColor: props.currentColor }}></button>
    </div>
}