import React from 'react';

export default function Badge({ status, text, className = '' }) {
  const normalized = (status || text || 'PENDING').toUpperCase();
  let badgeClass = 'badge-pending';

  switch (normalized) {
    case 'CONFIRMED':
    case 'RESOLVED':
    case 'ACTIVE':
      badgeClass = 'badge-confirmed';
      break;
    case 'COMPLETED':
    case 'IN_REVIEW':
      badgeClass = 'badge-completed';
      break;
    case 'CANCELLED':
    case 'INACTIVE':
      badgeClass = 'badge-cancelled';
      break;
    default:
      badgeClass = 'badge-pending';
  }

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {text || normalized}
    </span>
  );
}
