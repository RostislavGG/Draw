export const Edges = (props: { rounded: boolean, onChange: (newVal: boolean) => void }) => {
    return <div>
        <p>Edges</p>
        <div onClick={() => props.onChange(false)}>Sharp</div>
        <div onClick={() => props.onChange(true)}>Round</div>
    </div>
}