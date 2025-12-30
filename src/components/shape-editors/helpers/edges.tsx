import { TbBorderCornerRounded } from "react-icons/tb";
import { TbBorderCornerSquare } from "react-icons/tb";

import { IconButton } from "./icon-button";

import "./styles.css";

export const Edges = (props: {
    rounded: boolean;
    onChange: (newVal: boolean) => void;
}) => {
    return (
        <div className='buttons-section'>
            <p className='title'>Edges</p>
            <div className='modes-container-row'>
                <IconButton
                    selected={props.rounded === false}
                    tooltip='Sharp'
                    onClick={() => props.onChange(false)}
                    Icon={TbBorderCornerSquare}
                />
                <IconButton
                    selected={props.rounded === true}
                    tooltip='Round'
                    onClick={() => props.onChange(true)}
                    Icon={TbBorderCornerRounded}
                />
            </div>
        </div>
    );
};
