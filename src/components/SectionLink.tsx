import type { ReactNode } from 'react';

export function SectionLink({ id, children, className, onJump }: {
  id: string;
  children: ReactNode;
  className?: string;
  onJump?: () => void;
}) {
  return (
    <a className={className} href={`#${id}`} onClick={event => {
      event.preventDefault();
      onJump?.();
      document.getElementById(id)?.focus();
    }}>
      {children}
    </a>
  );
}
