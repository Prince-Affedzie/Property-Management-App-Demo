import React from 'react';
import PropTypes from 'prop-types';

const StatusBadge = ({ status }) => {
  // Determine styling based on status
  const getStatusStyles = () => {
    switch (status) {
      case 'Available':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          dotColor: 'bg-green-500',
        };
      case 'Occupied':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          dotColor: 'bg-red-500',
        };
      case 'Maintenance':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          dotColor: 'bg-yellow-500',
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          dotColor: 'bg-gray-500',
        };
    }
  };

  const { bgColor, textColor, dotColor } = getStatusStyles();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      <span className={`w-2 h-2 mr-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['Available', 'Occupied', 'Maintenance', '']).isRequired,
};

export default StatusBadge;