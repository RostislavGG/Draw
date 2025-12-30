import { TRANSPARENT_COLOR } from "../../../constants/colors";

const CheckerSquare = () => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={24}
            height={24}
            viewBox='0 0 24 24'
            aria-label='Transparency checkerboard'
            role='img'
        >
            <defs>
                <pattern
                    id='checker-24'
                    width='12'
                    height='12'
                    patternUnits='userSpaceOnUse'
                >
                    <rect width='12' height='12' fill='#ffffff' />
                    <rect x='0' y='0' width='6' height='6' fill='#d9d9d9' />
                    <rect x='6' y='6' width='6' height='6' fill='#d9d9d9' />
                </pattern>
            </defs>

            <rect width='24' height='24' fill='url(#checker-24)' />
        </svg>
    );
};

const Square = (props: { color: string; onClick: (color: string) => void }) => {
    const getStyle = () => {
        if (props.color !== TRANSPARENT_COLOR) {
            return { backgroundColor: props.color };
        }

        return {};
    };

    const getBody = () => {
        if (props.color !== TRANSPARENT_COLOR) {
            return <span className='color-swatch__inner' aria-hidden='true' />;
        }

        return <CheckerSquare />;
    };

    return (
        <button
            type='button'
            className='color-swatch'
            style={getStyle()}
            onClick={() => props.onClick(props.color)}
        >
            {getBody()}
        </button>
    );
};

export const ColorsList = (props: {
    currentColor: string;
    colorOptions: readonly string[];
    label: string;
    onColorChange: (newCol: string) => void;
}) => {
    const onColorClick = (newColor: string) => {
        props.onColorChange(newColor);
    };

    return (
        <div className='buttons-section'>
            <p className='title'>{props.label}</p>
            <div className='colors-list'>
                {props.colorOptions.map((opt) => (
                    <Square
                        key={opt}
                        color={opt}
                        onClick={() => onColorClick(opt)}
                    />
                ))}
                <div className='vertical-divider' />
                <Square color={props.currentColor} onClick={() => {}} />
            </div>
        </div>
    );
};
