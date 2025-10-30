import CounterRow from "./CounterRow";

const GuestCounter = ({ adults, setAdults, children, setChildren, infants, setInfants, onDone }: { adults: number, setAdults: (value: number) => void, children: number, setChildren: (value: number) => void, infants: number, setInfants: (value: number) => void, onDone: () => void }) => {
    return (
        <div className="guest-counter-panel">
            <CounterRow
                label="Adults"
                description="12+ years"
                value={adults}
                onIncrease={() => setAdults(adults + 1)}
                onDecrease={() => setAdults(Math.max(0, adults - 1))}
            />
            <CounterRow
                label="Children"
                description="2-11 years"
                value={children}
                onIncrease={() => setChildren(children + 1)}
                onDecrease={() => setChildren(Math.max(0, children - 1))}
            />
            <CounterRow
                label="Infants"
                description="Under 2 years"
                value={infants}
                onIncrease={() => setInfants(infants + 1)}
                onDecrease={() => setInfants(Math.max(0, infants - 1))}
            />
            <button className="done-button" onClick={onDone}>
                Done
            </button>
        </div>
    );
};
export default GuestCounter;