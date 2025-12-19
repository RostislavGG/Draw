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