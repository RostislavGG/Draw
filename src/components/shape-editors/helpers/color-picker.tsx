const ColorSwatch = (props: {
    color: string;
    onClick: (color: string) => void;
}) => {

    return (
        <button
            type="button"
            className="color-swatch"
            style={{ backgroundColor: props.color }}
            onClick={() => props.onClick(props.color)}
        >
            <span className="color-swatch__inner" aria-hidden="true" />
        </button>
    );
};

export const ColorPicker = (props: { currentColor: string, colorOptions: readonly string[], label: string, onColorChange: (newCol: string) => void }) => {
    const onColorClick = (newColor: string) => {
        props.onColorChange(newColor);
    }

    return <div className="buttons-section">
        <p className="title">{props.label}</p>
        <div className="color-picker-row">
            {props.colorOptions.map(opt => <ColorSwatch color={opt} onClick={() => onColorClick(opt)} />)}
            <div className="vertical-divider" />
            <ColorSwatch color={props.currentColor} onClick={() => { }} />
        </div>
    </div>
}