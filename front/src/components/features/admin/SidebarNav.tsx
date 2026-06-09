import { NavLink } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  return (
    <aside className="md:sticky md:top-[5rem]">
      <nav>
        <ul className="m-0 flex list-none gap-2 overflow-x-auto p-0 md:flex-col md:gap-0.5 md:overflow-visible">
          {items.map(({ to, icon: Icon, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--primary-soft)] text-primary'
                      : 'text-muted-foreground hover:bg-[var(--button-neutral-bg)] hover:text-foreground',
                  )
                }
              >
                <Icon aria-hidden="true" className="size-4" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
