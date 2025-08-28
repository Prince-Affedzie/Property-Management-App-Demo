import { ChevronUp, ChevronDown } from 'lucide-react';

export default function StatCard({ stat }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
          {stat.icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {stat.isPositive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {stat.change}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold">{stat.value}</h2>
        <p className="text-sm text-gray-500">{stat.title}</p>
      </div>
    </div>
  );
}
