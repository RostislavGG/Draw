import { DEFAULT_FILL_COLOR_OPTIONS, DEFAULT_STROKE_COLOR_OPTIONS } from '../../constants/colors';

import { ShapeOptions } from '../../types';

import { ColorPicker } from './helpers/color-picker';
import { StrokeWidth } from './helpers/stroke-width';
import { Opacity } from './helpers/opacity';
import { Edges } from './helpers/edges';


export const DefaultEditor = ({ options, onChange }: { options: Partial<ShapeOptions>, onChange: (newOpts: Partial<ShapeOptions>) => void }) => {
    const res = [];

    const handleStrokeColorChange = (newCol: string) => {
        onChange({ strokeColor: newCol });
    }

    const handleFillColorChange = (newCol: string) => {
        onChange({ fillColor: newCol });
    }

    const handleStrokeWidthChange = (newWidth: number) => {
        onChange({ strokeWidth: newWidth });
    }

    const handleOpacityChange = (newVal: number) => {
        onChange({ opacity: newVal });
    }

    const handleEdgesChange = (newVal: boolean) => {
        onChange({ roundEdges: newVal });
    }

    if (options.strokeColor != null) {
        res.push(<ColorPicker colorOptions={DEFAULT_STROKE_COLOR_OPTIONS} currentColor={options.strokeColor} label="Stroke Color" onColorChange={handleStrokeColorChange} />)
    }

    if (options.fillColor != null) {
        res.push(<ColorPicker colorOptions={DEFAULT_FILL_COLOR_OPTIONS} currentColor={options.fillColor} label="Fill Color" onColorChange={handleFillColorChange} />)
    }

    if (options.strokeWidth != null) {
        res.push(<StrokeWidth currentWidth={options.strokeWidth} onChange={handleStrokeWidthChange} />)
    }

    if (options.roundEdges != null) {
        res.push(<Edges rounded={options.roundEdges} onChange={handleEdgesChange} />)
    }

    if (options.opacity != null) {
        res.push(<Opacity currentValue={options.opacity} onChange={handleOpacityChange} />)
    }

    return <div>
        {res}
    </div>
}