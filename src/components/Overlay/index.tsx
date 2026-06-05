import { Panel } from '@components/Panel';
import { navBarPages } from '@navigation/navBar';
import { useNavigation } from '@navigation/useNavigation';

import { Header } from './Header';
import { NavItem } from './NavItem';
import { TimeOfDayToggle } from './TimeOfDayToggle';

export interface OverlayProps {
  className?: string;
}

export function Overlay({ className }: OverlayProps = {}) {
  const { navigate, isActive } = useNavigation();

  const classes =
    'pointer-events-none fixed inset-0 z-10 flex flex-col justify-between' +
    (className ? ' ' + className : '');

  return (
    <div className={classes}>
      <header className="pointer-events-none w-full">
        <Header />
      </header>

      <div className="header-scale pointer-events-none absolute bottom-3 left-3 origin-bottom-left">
        <TimeOfDayToggle />
      </div>

      <footer className="pointer-events-none flex items-end justify-center pb-4">
        <div className="pointer-events-auto origin-bottom scale-70">
          <Panel layout="horizontal">
            {navBarPages.map((page) => (
              <NavItem
                key={page.id}
                icon={page.icon}
                title={page.title}
                active={isActive(page.id)}
                onClick={() => { navigate(page.id); }}
              />
            ))}
          </Panel>
        </div>
      </footer>
    </div>
  );
}
