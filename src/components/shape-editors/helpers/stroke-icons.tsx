type IconProps = { className?: string };

export const StrokeSmallIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const StrokeMediumIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
);

export const StrokeBoldIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
);

export const SIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <text
            x="12"
            y="12"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="currentColor"
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
            fontSize="24"
            fontWeight="500"
        >
            S
        </text>
    </svg>
);

export const MIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <text
            x="12"
            y="12"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="currentColor"
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
            fontSize="24"
            fontWeight="500"
        >
            M
        </text>
    </svg>
);

export const LIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <text
            x="12"
            y="12"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="currentColor"
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
            fontSize="24"
            fontWeight="500"
        >
            L
        </text>
    </svg>
);

export const XLIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <text
            x="13"
            y="12"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="currentColor"
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
            fontSize="24"
            fontWeight="400"
        >
            XL
        </text>
    </svg>
);