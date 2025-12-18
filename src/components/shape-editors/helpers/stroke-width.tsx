import { DEAFULT_STROKE_WIDTHS } from "../../../constants/stroke"

export const StrokeWidth = (props: { currentWidth: number, onChange: (newVal: number) => void }) => {
    const getStyle = (value: number) => {
        return {
            width: 30,
            height: 30,
            border: value === props.currentWidth ? "2px solid orange" : "none"
        }
    }

    return <div>
        <p>Stroke Width</p>
        <div style={getStyle(DEAFULT_STROKE_WIDTHS.SMALL)} onClick={() => props.onChange(DEAFULT_STROKE_WIDTHS.SMALL)}>Small</div>
        <div style={getStyle(DEAFULT_STROKE_WIDTHS.MEDIUM)} onClick={() => props.onChange(DEAFULT_STROKE_WIDTHS.MEDIUM)}>Medium</div>
        <div style={getStyle(DEAFULT_STROKE_WIDTHS.LARGE)} onClick={() => props.onChange(DEAFULT_STROKE_WIDTHS.LARGE)}>Large</div>
    </div>
}