import Image from 'next/image';

export function KcaLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/kca_logo.png"
        alt="KCA"
        width={60}
        height={24}
        className="h-auto"
      />
      <span className="text-xl font-extrabold tracking-tight text-foreground">국가기술자격검정</span>
    </div>
  );
}
