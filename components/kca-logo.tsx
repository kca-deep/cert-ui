import { FileText } from 'lucide-react';

export function KcaLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10a37f]">
        <FileText className="h-4 w-4 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-semibold leading-tight text-white">
          국가기술자격검정
        </span>
        <span className="text-xs text-gray-400">AI 상담</span>
      </div>
    </div>
  );
}
