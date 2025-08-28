import { Building2 } from 'lucide-react';

export default function UnitCard({ unit }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
          <Building2 size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Unit {unit.title}</h3>
          <p className="text-sm text-gray-500">{unit.location}</p>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <p>Status: <span className={`font-medium ${unit.status === 'Occupied' ? 'text-green-500' : 'text-yellow-500'}`}>{unit.status}</span></p>
        <p>Rent: ₵{unit.price}/month</p>
        {unit.tenant && <p>Tenant: {unit.tenant}</p>}
      </div>
    </div>
  );
}
