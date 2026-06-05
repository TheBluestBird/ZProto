import { Button } from '@components/Button';

export interface NavItemProps {
  icon: string;
  title: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function NavItem({
  icon,
  title,
  active = false,
  onClick,
}: NavItemProps) {
  return (
    <Button layout="vertical" active={active} onClick={onClick}>
      <img
        className="block size-icon shrink-0 object-contain pt-2"
        src={icon}
        alt=""
        decoding="async"
      />
      <h2 className="hidden sm:block pb-2 px-2">{title}</h2>
    </Button>
  );
}
