export function KcaLogo({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent leading-none">
        KCA
      </span>
      <div className="flex items-center gap-0.5">
        <span className="text-sm font-bold tracking-tight text-foreground leading-none">
          CERT
        </span>
        <span className="text-sm font-bold tracking-tight text-foreground leading-none">
          -AI
        </span>
      </div>
    </div>
  );
}
