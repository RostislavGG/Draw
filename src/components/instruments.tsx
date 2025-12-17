import { Shape } from '../shapes/base';

import "./styles.css";

export const Instruments = (props: { shape: Shape | null }) => {
    return <div className='instruments-panel'>
        <p>Shape is {props.shape?.id ?? "Null"}</p>
    </div>
}