export const Opacity = (props: { currentValue: number, onChange: (newVal: number) => void }) => {
    const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.onChange(event.target.valueAsNumber / 100);
    }

    return <div>
        <p>Opacity</p>
        <input type="range" min={0} max={100} step={10} onChange={onValueChange} value={props.currentValue * 100} />
    </div>
}