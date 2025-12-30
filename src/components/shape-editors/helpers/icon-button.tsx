import React from "react";

import "./styles.css";

type AnyIcon = React.ComponentType<{ className?: string }>;

export const IconButton = (props: {
    selected: boolean;
    onClick: () => void;
    Icon: AnyIcon;
    tooltip?: string;
}) => {
    return (
        <button
            type='button'
            className='icon-button'
            title={props.tooltip}
            data-selected={props.selected ? "true" : "false"}
            aria-pressed={props.selected}
            onClick={props.onClick}
            tabIndex={-1}
        >
            <props.Icon className='icon-button__icon' />
        </button>
    );
};
