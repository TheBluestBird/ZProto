import { Panel } from '@components/Panel';
import { navBarPages } from '@navigation/navBar';
import { useNavigation } from '@navigation/useNavigation';

import { Header } from './Header';
import { NavItem } from './NavItem';

export interface OverlayProps {
  className?: string;
  onLevelBadgeDoubleClick?: () => void;
}

export function Overlay({ className, onLevelBadgeDoubleClick }: OverlayProps = {}) {
  const { navigate, isActive } = useNavigation();

  const classes =
    'pointer-events-none fixed inset-0 z-10 flex flex-col justify-between' +
    (className ? ' ' + className : '');

  return (
    <div className={classes}>
      <header className="pointer-events-none w-full">
        <Header {...(onLevelBadgeDoubleClick ? { onLevelBadgeDoubleClick } : {})} />
      </header>

      <footer className="pointer-events-none flex w-full items-end justify-center pb-0 sm:pb-4">
        <div className="pointer-events-auto w-full origin-bottom sm:w-auto sm:scale-70">
          <Panel layout="horizontal" className="w-full">
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
