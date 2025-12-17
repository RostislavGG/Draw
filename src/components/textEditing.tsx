import React from 'react'
import { Transformer } from '../utils/canvas';

type Props = {
    initialText: string
    anchor: {
        x: number;
        y: number;
    };
    transform: Transformer;
    cancel: () => void;
    commit: (text: string) => void;
}

export const TextEditor = (props: Props) => {
    const [text, setText] = React.useState(props.initialText);
    const ref = React.useRef<HTMLTextAreaElement>(null)

    React.useEffect(() => {
        setTimeout(() => {
            ref.current?.focus();
            ref.current?.select();
        }, 50)
    }, [])

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value);
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        event.stopPropagation();

        if (event.key === "Escape") {
            event.preventDefault();
            props.cancel();
        }
    }

    const commit = () => props.commit(text)

    const style: React.CSSProperties = {
        position: "absolute",
        left: props.anchor.x,
        top: props.anchor.y,
        transform: `scale(${props.transform.scale})`,
        transformOrigin: "top left",

        padding: 0,
        margin: 0,
        border: "1px solid rgba(0,0,0,0.25)",
        background: "white",
        outline: "none",
        resize: "none",
        overflow: "hidden",

        whiteSpace: "pre",
    };

    return <textarea ref={ref} style={style} value={text} onChange={handleTextChange} onBlur={commit} onKeyDown={handleKeyDown} />
}