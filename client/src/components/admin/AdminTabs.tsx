import { NavLink } from 'react-router-dom';

const adminTabs = [
  { label: 'Projects', to: '/admin/projects' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Pending Approvals', to: '/admin/pending' },
  { label: 'Archive', to: '/admin/archive' },
  { label: 'Filter Settings', to: '/admin/filters' },
];

export function AdminTabs() {
  return (
    <div className="flex items-center gap-6 border-b border-surface-container-high pb-4">
      {adminTabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${
              isActive
                ? 'text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
