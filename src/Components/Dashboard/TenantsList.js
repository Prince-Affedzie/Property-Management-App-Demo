import TenantCard from '../units/TenantCard';

export default function TenantList({ tenants }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tenants.map((tenant) => (
        <TenantCard key={tenant.id} tenant={tenant} />
      ))}
    </div>
  );
}
