const CounterRow = ({ label, description, value, onIncrease, onDecrease }: { label: string, description: string, value: number, onIncrease: () => void, onDecrease: () => void }) => (
    <div className="counter-row">
        <div className="counter-label">
            <strong>{label}</strong>
            <span>{description}</span>
        </div>
        <div className="counter-buttons">
            <button onClick={onDecrease} disabled={value === 0}>−</button>
            <span>{value}</span>
            <button onClick={onIncrease}>+</button>
        </div>
    </div>
);
export default CounterRow;

