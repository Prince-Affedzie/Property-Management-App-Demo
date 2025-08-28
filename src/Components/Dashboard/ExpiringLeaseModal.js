import { X } from 'lucide-react';

export default function ExpiringLeasesModal({ leases, isOpen, onClose }) {
  if (!isOpen) return null;

  const getUrgencyColor = (daysLeft) => {
    if (daysLeft <= 7) return 'text-red-600 bg-red-50 border-red-100';
    if (daysLeft <= 14) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-blue-600 bg-blue-50 border-blue-100';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div 
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={onClose}
          ></div>
        </div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                All Expiring Leases ({leases.length})
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {leases.map((lease, index) => (
                <div 
                  key={index} 
                  className={`border rounded-md p-3 ${getUrgencyColor(lease.daysLeft)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{lease.tenantName}</h4>
                      <p className="text-sm text-gray-600">{lease.apartmentTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {lease.daysLeft} day{lease.daysLeft !== 1 ? 's' : ''} left
                      </p>
                      <p className="text-sm text-gray-500">
                        Expires: {new Date(lease.expirationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                 {/* <div className="mt-2 flex justify-end space-x-2">
                    <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">
                      Renew Lease
                    </button>
                    <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                      Contact Tenant
                    </button>
                  </div> */}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}