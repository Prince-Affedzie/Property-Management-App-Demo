import UnitCard from "../units/UnitCard";

export default function PropertyList({ units }) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Apartment Units</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.slice(0,6).map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </div>
    </div>
  );
}
