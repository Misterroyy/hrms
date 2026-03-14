export default function Spinner({ size = 'lg', text = 'Loading...' }) {
    if (size === 'sm') return <div className="spinner-sm" />;
    return (
        <div className="state-box">
            <div className="spinner" />
            <p>{text}</p>
        </div>
    );
}
