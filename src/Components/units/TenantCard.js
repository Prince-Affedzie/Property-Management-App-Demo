export default function TenantCard({ tenant }) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition">
        <img
          src={tenant.imageUrl}
          alt={tenant.name}
          className="w-14 h-14 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{tenant.tenantName}</h3>
          <p className="text-sm text-gray-500">{tenant.unit}</p>
          <p className="text-sm text-gray-500">{tenant.tenantPhone}</p>
          <p className="text-sm text-gray-500">{tenant.email}</p>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            tenant.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {tenant.status}
        </span>
      </div>
    );
  }
  