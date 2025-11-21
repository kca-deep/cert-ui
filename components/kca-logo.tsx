import { FileText } from 'lucide-react';

export function KcaLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
        <FileText className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-semibold leading-tight">
          <span className="text-blue-600">KCA-i</span>
        </span>
        <span className="text-xs text-muted-foreground">RAG 기반 챗봇</span>
      </div>
    </div>
  );
}
