import "./styles.css";

export const Opacity = (props: {
    currentValue: number;
    onChange: (newVal: number) => void;
}) => {
    const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.onChange(event.target.valueAsNumber / 100);
    };

    return (
        <div className='buttons-section'>
            <p className='title'>Opacity</p>
            <div className='range-wrap'>
                <input
                    className='opacity-range'
                    type='range'
                    min={0}
                    max={100}
                    step={10}
                    onChange={onValueChange}
                    value={props.currentValue * 100}
                />
                <div className='range-labels' aria-hidden='true'>
                    <span>0</span>
                    <span>100</span>
                </div>
            </div>
        </div>
    );
};
