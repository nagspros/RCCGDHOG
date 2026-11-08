interface RccgLogoProps {
  className?: string;
  size?: number;
}

export function RccgLogo({ className = '', size = 42 }: RccgLogoProps) {
  return (
    <div className={`shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img src="/assets/rccg-logo.png" alt="RCCG logo" width={size} height={size} className="size-full object-contain" />
    </div>
  );
}
