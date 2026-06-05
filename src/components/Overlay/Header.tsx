import { useNavigation } from '@navigation/useNavigation';

import { CharacterPortrait } from './CharacterPortrait';
import { VisitStatus } from './VisitStatus';

import './header.css';

export interface HeaderProps {
  className?: string;
  onLevelBadgeDoubleClick?: () => void;
}

export function Header({ className, onLevelBadgeDoubleClick }: HeaderProps = {}) {
  const { page } = useNavigation();

  const classes =
    'overlay-header w-full bg-gradient-to-b from-button-bg to-transparent' +
    (className ? ' ' + className : '');

  return (
    <div className={classes}>
      <div className="overlay-header__bar pointer-events-none w-full min-w-0">
        <CharacterPortrait
          className="pointer-events-auto justify-self-start"
          {...(onLevelBadgeDoubleClick ? { onLevelBadgeDoubleClick } : {})}
        />
        <h1 className="page-title">{page.title}</h1>
        <VisitStatus className="justify-self-end" />
      </div>
    </div>
  );
}
