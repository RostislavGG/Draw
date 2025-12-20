import { FONT_SIZES } from "../../../constants/font"

import { IconButton } from "./icon-button"
import { LIcon, MIcon, SIcon, XLIcon } from "./stroke-icons"

export const FontSize = (props: { currentSize: number, onChange: (newVal: number) => void }) => {
    return <div className="buttons-section">
        <p className="title">Font Size</p>
        <div className="modes-container-row">
            <IconButton
                selected={props.currentSize === FONT_SIZES.SMALL}
                onClick={() => props.onChange(FONT_SIZES.SMALL)}
                Icon={SIcon}
                tooltip="Small"
            />
            <IconButton
                selected={props.currentSize === FONT_SIZES.MEDIUM}
                onClick={() => props.onChange(FONT_SIZES.MEDIUM)}
                Icon={MIcon}
                tooltip="Medium"
            />
            <IconButton
                selected={props.currentSize === FONT_SIZES.LARGE}
                onClick={() => props.onChange(FONT_SIZES.LARGE)}
                Icon={LIcon}
                tooltip="Large"
            />
            <IconButton
                selected={props.currentSize === FONT_SIZES.EXTRA_LARGE}
                onClick={() => props.onChange(FONT_SIZES.EXTRA_LARGE)}
                Icon={XLIcon}
                tooltip="Extra Large"
            />
        </div>
    </div>
}