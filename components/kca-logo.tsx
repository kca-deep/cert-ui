'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function KcaLogo({ className, size = 'default', useAvatar = false }: { className?: string; size?: 'default' | 'large' | 'small'; useAvatar?: boolean }) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 현재 테마 결정 (dark 또는 light)
  const currentTheme = mounted ? (resolvedTheme || theme) : 'light';
  const sizeClasses = {
    small: 'h-8 w-8',
    default: 'h-10 w-10',
    large: 'h-20 w-20',
  };

  // small 크기이고 useAvatar가 true일 때는 AI 아바타 이미지 사용
  if (size === 'small' && useAvatar) {
    // 모든 테마에서 동일한 이미지 사용
    const avatarSrc = '/kca_ai_avatar_black.png';

    return (
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-400 blur-md opacity-30" />
        <div className="relative rounded-full p-0.5 bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-400">
          <div className="rounded-full p-0.5 bg-background">
            <Image
              src={avatarSrc}
              alt="KCA AI Avatar"
              width={134}
              height={134}
              className="h-11 w-11 object-cover rounded-full shadow-lg"
              priority
              quality={100}
            />
          </div>
        </div>
      </div>
    );
  }

  // small 크기일 때는 기본 로고 이미지만 표시
  if (size === 'small') {
    return (
      <div className={className}>
        <Image
          src="/kca_logo.png"
          alt="KCA Logo"
          width={32}
          height={32}
          className="h-8 w-8 object-contain rounded-lg"
          priority
        />
      </div>
    );
  }

  // large 크기일 때는 AI 아바타를 크게 표시 (초기 화면용)
  if (size === 'large') {
    // useAvatar가 true면 원형 프로필만 표시
    if (useAvatar) {
      return (
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
          {/* 신경망 노드 SVG - 사방으로 퍼져나가는 효과 */}
          <svg 
            className="absolute pointer-events-none"
            style={{ 
              width: '300%',
              height: '100%',
              left: '-100%',
              top: '0',
              overflow: 'visible'
            }}
            viewBox="0 0 600 200"
          >
            {/* 그라데이션 정의 */}
            <defs>
              <radialGradient id="nodeGradient">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="lineGradient1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineGradient2">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineGradient3">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* 신경망 - 한 방향으로만 뻗어나가는 효과 */}
            
            {/* 중심에서 외곽으로 (12개) - 라인 */}
            <g>
              <line x1="300" y1="100" x2="300" y2="100" stroke="url(#lineGradient1)" strokeWidth="1.5">
                <animate attributeName="x2" values="300;285" dur="8s" repeatCount="indefinite" />
                <animate attributeName="y2" values="100;5" dur="8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.6;0" dur="8s" repeatCount="indefinite" />
              </line>
              <circle r="2" fill="#06b6d4">
                <animate attributeName="cx" values="300;285" dur="8s" repeatCount="indefinite" />
                <animate attributeName="cy" values="100;5" dur="8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.8;0" dur="8s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="300" y1="100" x2="300" y2="100" stroke="url(#lineGradient1)" strokeWidth="1.5">
                <animate attributeName="x2" values="300;330" dur="5.5s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="y2" values="100;195" dur="5.5s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.6;0" dur="5.5s" begin="0.8s" repeatCount="indefinite" />
              </line>
              <circle r="2" fill="#06b6d4">
                <animate attributeName="cx" values="300;330" dur="5.5s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="cy" values="100;195" dur="5.5s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.8;0" dur="5.5s" begin="0.8s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="300" y1="100" x2="300" y2="100" stroke="url(#lineGradient2)" strokeWidth="1.5">
                <animate attributeName="x2" values="300;150" dur="10s" begin="1.6s" repeatCount="indefinite" />
                <animate attributeName="y2" values="100;80" dur="10s" begin="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.5;0" dur="10s" begin="1.6s" repeatCount="indefinite" />
              </line>
              <circle r="1.8" fill="#3b82f6">
                <animate attributeName="cx" values="300;150" dur="10s" begin="1.6s" repeatCount="indefinite" />
                <animate attributeName="cy" values="100;80" dur="10s" begin="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.7;0" dur="10s" begin="1.6s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="300" y1="100" x2="300" y2="100" stroke="url(#lineGradient2)" strokeWidth="1.5">
                <animate attributeName="x2" values="300;450" dur="6.5s" begin="2.4s" repeatCount="indefinite" />
                <animate attributeName="y2" values="100;120" dur="6.5s" begin="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.5;0" dur="6.5s" begin="2.4s" repeatCount="indefinite" />
              </line>
              <circle r="1.8" fill="#3b82f6">
                <animate attributeName="cx" values="300;450" dur="6.5s" begin="2.4s" repeatCount="indefinite" />
                <animate attributeName="cy" values="100;120" dur="6.5s" begin="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.7;0" dur="6.5s" begin="2.4s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="300" y1="100" x2="300" y2="100" stroke="url(#lineGradient3)" strokeWidth="1.2">
                <animate attributeName="x2" values="300;220" dur="12s" begin="0.4s" repeatCount="indefinite" />
                <animate attributeName="y2" values="100;25" dur="12s" begin="0.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.5;0" dur="12s" begin="0.4s" repeatCount="indefinite" />
              </line>
              <circle r="1.5" fill="#8b5cf6">
                <animate attributeName="cx" values="300;220" dur="12s" begin="0.4s" repeatCount="indefinite" />
                <animate attributeName="cy" values="100;25" dur="12s" begin="0.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.6;0" dur="12s" begin="0.4s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="300" y1="100" x2="300" y2="100" stroke="url(#lineGradient3)" strokeWidth="1.2">
                <animate attributeName="x2" values="300;380" dur="7s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="y2" values="100;30" dur="7s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.5;0" dur="7s" begin="1.2s" repeatCount="indefinite" />
              </line>
              <circle r="1.5" fill="#8b5cf6">
                <animate attributeName="cx" values="300;380" dur="7s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="cy" values="100;30" dur="7s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.6;0" dur="7s" begin="1.2s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="300" y1="100" x2="300" y2="100" stroke="url(#lineGradient3)" strokeWidth="1.2">
                <animate attributeName="x2" values="300;215" dur="9s" begin="2s" repeatCount="indefinite" />
                <animate attributeName="y2" values="100;170" dur="9s" begin="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.5;0" dur="9s" begin="2s" repeatCount="indefinite" />
              </line>
              <circle r="1.5" fill="#8b5cf6">
                <animate attributeName="cx" values="300;215" dur="9s" begin="2s" repeatCount="indefinite" />
                <animate attributeName="cy" values="100;170" dur="9s" begin="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.6;0" dur="9s" begin="2s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="300" y1="100" x2="300" y2="100" stroke="url(#lineGradient3)" strokeWidth="1.2">
                <animate attributeName="x2" values="300;385" dur="11s" begin="2.8s" repeatCount="indefinite" />
                <animate attributeName="y2" values="100;175" dur="11s" begin="2.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.5;0" dur="11s" begin="2.8s" repeatCount="indefinite" />
              </line>
              <circle r="1.5" fill="#8b5cf6">
                <animate attributeName="cx" values="300;385" dur="11s" begin="2.8s" repeatCount="indefinite" />
                <animate attributeName="cy" values="100;175" dur="11s" begin="2.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.6;0" dur="11s" begin="2.8s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="300" y1="100" x2="300" y2="100" stroke="url(#lineGradient1)" strokeWidth="1">
                <animate attributeName="x2" values="300;120" dur="6s" begin="1s" repeatCount="indefinite" />
                <animate attributeName="y2" values="100;40" dur="6s" begin="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.4;0" dur="6s" begin="1s" repeatCount="indefinite" />
              </line>
              <circle r="1.3" fill="#06b6d4">
                <animate attributeName="cx" values="300;120" dur="6s" begin="1s" repeatCount="indefinite" />
                <animate attributeName="cy" values="100;40" dur="6s" begin="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.5;0" dur="6s" begin="1s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="300" y1="100" x2="300" y2="100" stroke="url(#lineGradient1)" strokeWidth="1">
                <animate attributeName="x2" values="300;480" dur="8.5s" begin="1.8s" repeatCount="indefinite" />
                <animate attributeName="y2" values="100;160" dur="8.5s" begin="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.4;0" dur="8.5s" begin="1.8s" repeatCount="indefinite" />
              </line>
              <circle r="1.3" fill="#06b6d4">
                <animate attributeName="cx" values="300;480" dur="8.5s" begin="1.8s" repeatCount="indefinite" />
                <animate attributeName="cy" values="100;160" dur="8.5s" begin="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.5;0" dur="8.5s" begin="1.8s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="300" y1="100" x2="300" y2="100" stroke="url(#lineGradient2)" strokeWidth="1">
                <animate attributeName="x2" values="300;100" dur="10.5s" begin="2.6s" repeatCount="indefinite" />
                <animate attributeName="y2" values="100;150" dur="10.5s" begin="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.4;0" dur="10.5s" begin="2.6s" repeatCount="indefinite" />
              </line>
              <circle r="1.3" fill="#3b82f6">
                <animate attributeName="cx" values="300;100" dur="10.5s" begin="2.6s" repeatCount="indefinite" />
                <animate attributeName="cy" values="100;150" dur="10.5s" begin="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.5;0" dur="10.5s" begin="2.6s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="300" y1="100" x2="300" y2="100" stroke="url(#lineGradient2)" strokeWidth="1">
                <animate attributeName="x2" values="300;500" dur="7.5s" begin="3.4s" repeatCount="indefinite" />
                <animate attributeName="y2" values="100;50" dur="7.5s" begin="3.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.4;0" dur="7.5s" begin="3.4s" repeatCount="indefinite" />
              </line>
              <circle r="1.3" fill="#3b82f6">
                <animate attributeName="cx" values="300;500" dur="7.5s" begin="3.4s" repeatCount="indefinite" />
                <animate attributeName="cy" values="100;50" dur="7.5s" begin="3.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.5;0" dur="7.5s" begin="3.4s" repeatCount="indefinite" />
              </circle>
            </g>

            {/* 외곽에서 중심으로 (12개) - 라인과 노드 그룹 */}
            <g>
              <line x1="50" y1="60" x2="50" y2="60" stroke="url(#lineGradient1)" strokeWidth="1.5">
                <animate attributeName="x1" values="50;300" dur="9s" repeatCount="indefinite" />
                <animate attributeName="y1" values="60;100" dur="9s" repeatCount="indefinite" />
                <animate attributeName="x2" values="50;300" dur="9s" repeatCount="indefinite" />
                <animate attributeName="y2" values="60;100" dur="9s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="9s" repeatCount="indefinite" />
              </line>
              <circle r="1.8" fill="#06b6d4">
                <animate attributeName="cx" values="50;300" dur="9s" repeatCount="indefinite" />
                <animate attributeName="cy" values="60;100" dur="9s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="9s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="550" y1="140" x2="550" y2="140" stroke="url(#lineGradient1)" strokeWidth="1.5">
                <animate attributeName="x1" values="550;300" dur="7.5s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="y1" values="140;100" dur="7.5s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="x2" values="550;300" dur="7.5s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="y2" values="140;100" dur="7.5s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="7.5s" begin="0.6s" repeatCount="indefinite" />
              </line>
              <circle r="1.8" fill="#06b6d4">
                <animate attributeName="cx" values="550;300" dur="7.5s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="cy" values="140;100" dur="7.5s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="7.5s" begin="0.6s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="40" y1="170" x2="40" y2="170" stroke="url(#lineGradient2)" strokeWidth="1.5">
                <animate attributeName="x1" values="40;300" dur="11s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="y1" values="170;100" dur="11s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="x2" values="40;300" dur="11s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="y2" values="170;100" dur="11s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="11s" begin="1.2s" repeatCount="indefinite" />
              </line>
              <circle r="1.8" fill="#3b82f6">
                <animate attributeName="cx" values="40;300" dur="11s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="cy" values="170;100" dur="11s" begin="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="11s" begin="1.2s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="560" y1="30" x2="560" y2="30" stroke="url(#lineGradient2)" strokeWidth="1.5">
                <animate attributeName="x1" values="560;300" dur="6s" begin="1.8s" repeatCount="indefinite" />
                <animate attributeName="y1" values="30;100" dur="6s" begin="1.8s" repeatCount="indefinite" />
                <animate attributeName="x2" values="560;300" dur="6s" begin="1.8s" repeatCount="indefinite" />
                <animate attributeName="y2" values="30;100" dur="6s" begin="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="6s" begin="1.8s" repeatCount="indefinite" />
              </line>
              <circle r="1.8" fill="#3b82f6">
                <animate attributeName="cx" values="560;300" dur="6s" begin="1.8s" repeatCount="indefinite" />
                <animate attributeName="cy" values="30;100" dur="6s" begin="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="6s" begin="1.8s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="60" y1="10" x2="60" y2="10" stroke="url(#lineGradient3)" strokeWidth="1.2">
                <animate attributeName="x1" values="60;300" dur="10.5s" begin="0.4s" repeatCount="indefinite" />
                <animate attributeName="y1" values="10;100" dur="10.5s" begin="0.4s" repeatCount="indefinite" />
                <animate attributeName="x2" values="60;300" dur="10.5s" begin="0.4s" repeatCount="indefinite" />
                <animate attributeName="y2" values="10;100" dur="10.5s" begin="0.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="10.5s" begin="0.4s" repeatCount="indefinite" />
              </line>
              <circle r="1.5" fill="#8b5cf6">
                <animate attributeName="cx" values="60;300" dur="10.5s" begin="0.4s" repeatCount="indefinite" />
                <animate attributeName="cy" values="10;100" dur="10.5s" begin="0.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="10.5s" begin="0.4s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="570" y1="190" x2="570" y2="190" stroke="url(#lineGradient3)" strokeWidth="1.2">
                <animate attributeName="x1" values="570;300" dur="8s" begin="1s" repeatCount="indefinite" />
                <animate attributeName="y1" values="190;100" dur="8s" begin="1s" repeatCount="indefinite" />
                <animate attributeName="x2" values="570;300" dur="8s" begin="1s" repeatCount="indefinite" />
                <animate attributeName="y2" values="190;100" dur="8s" begin="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="8s" begin="1s" repeatCount="indefinite" />
              </line>
              <circle r="1.5" fill="#8b5cf6">
                <animate attributeName="cx" values="570;300" dur="8s" begin="1s" repeatCount="indefinite" />
                <animate attributeName="cy" values="190;100" dur="8s" begin="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="8s" begin="1s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="80" y1="185" x2="80" y2="185" stroke="url(#lineGradient3)" strokeWidth="1.2">
                <animate attributeName="x1" values="80;300" dur="12s" begin="1.6s" repeatCount="indefinite" />
                <animate attributeName="y1" values="185;100" dur="12s" begin="1.6s" repeatCount="indefinite" />
                <animate attributeName="x2" values="80;300" dur="12s" begin="1.6s" repeatCount="indefinite" />
                <animate attributeName="y2" values="185;100" dur="12s" begin="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="12s" begin="1.6s" repeatCount="indefinite" />
              </line>
              <circle r="1.5" fill="#8b5cf6">
                <animate attributeName="cx" values="80;300" dur="12s" begin="1.6s" repeatCount="indefinite" />
                <animate attributeName="cy" values="185;100" dur="12s" begin="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="12s" begin="1.6s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="540" y1="5" x2="540" y2="5" stroke="url(#lineGradient3)" strokeWidth="1.2">
                <animate attributeName="x1" values="540;300" dur="5.5s" begin="2.2s" repeatCount="indefinite" />
                <animate attributeName="y1" values="5;100" dur="5.5s" begin="2.2s" repeatCount="indefinite" />
                <animate attributeName="x2" values="540;300" dur="5.5s" begin="2.2s" repeatCount="indefinite" />
                <animate attributeName="y2" values="5;100" dur="5.5s" begin="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="5.5s" begin="2.2s" repeatCount="indefinite" />
              </line>
              <circle r="1.5" fill="#8b5cf6">
                <animate attributeName="cx" values="540;300" dur="5.5s" begin="2.2s" repeatCount="indefinite" />
                <animate attributeName="cy" values="5;100" dur="5.5s" begin="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="5.5s" begin="2.2s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="140" y1="10" x2="140" y2="10" stroke="url(#lineGradient1)" strokeWidth="1.2">
                <animate attributeName="x1" values="140;300" dur="7s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="y1" values="10;100" dur="7s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="x2" values="140;300" dur="7s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="y2" values="10;100" dur="7s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="7s" begin="0.8s" repeatCount="indefinite" />
              </line>
              <circle r="1.5" fill="#06b6d4">
                <animate attributeName="cx" values="140;300" dur="7s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="cy" values="10;100" dur="7s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="7s" begin="0.8s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="490" y1="190" x2="490" y2="190" stroke="url(#lineGradient1)" strokeWidth="1.2">
                <animate attributeName="x1" values="490;300" dur="9.5s" begin="1.4s" repeatCount="indefinite" />
                <animate attributeName="y1" values="190;100" dur="9.5s" begin="1.4s" repeatCount="indefinite" />
                <animate attributeName="x2" values="490;300" dur="9.5s" begin="1.4s" repeatCount="indefinite" />
                <animate attributeName="y2" values="190;100" dur="9.5s" begin="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="9.5s" begin="1.4s" repeatCount="indefinite" />
              </line>
              <circle r="1.5" fill="#06b6d4">
                <animate attributeName="cx" values="490;300" dur="9.5s" begin="1.4s" repeatCount="indefinite" />
                <animate attributeName="cy" values="190;100" dur="9.5s" begin="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="9.5s" begin="1.4s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="130" y1="180" x2="130" y2="180" stroke="url(#lineGradient2)" strokeWidth="1.2">
                <animate attributeName="x1" values="130;300" dur="11.5s" begin="2s" repeatCount="indefinite" />
                <animate attributeName="y1" values="180;100" dur="11.5s" begin="2s" repeatCount="indefinite" />
                <animate attributeName="x2" values="130;300" dur="11.5s" begin="2s" repeatCount="indefinite" />
                <animate attributeName="y2" values="180;100" dur="11.5s" begin="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="11.5s" begin="2s" repeatCount="indefinite" />
              </line>
              <circle r="1.5" fill="#3b82f6">
                <animate attributeName="cx" values="130;300" dur="11.5s" begin="2s" repeatCount="indefinite" />
                <animate attributeName="cy" values="180;100" dur="11.5s" begin="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="11.5s" begin="2s" repeatCount="indefinite" />
              </circle>
            </g>
            <g>
              <line x1="510" y1="20" x2="510" y2="20" stroke="url(#lineGradient2)" strokeWidth="1.2">
                <animate attributeName="x1" values="510;300" dur="6.5s" begin="2.6s" repeatCount="indefinite" />
                <animate attributeName="y1" values="20;100" dur="6.5s" begin="2.6s" repeatCount="indefinite" />
                <animate attributeName="x2" values="510;300" dur="6.5s" begin="2.6s" repeatCount="indefinite" />
                <animate attributeName="y2" values="20;100" dur="6.5s" begin="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="6.5s" begin="2.6s" repeatCount="indefinite" />
              </line>
              <circle r="1.5" fill="#3b82f6">
                <animate attributeName="cx" values="510;300" dur="6.5s" begin="2.6s" repeatCount="indefinite" />
                <animate attributeName="cy" values="20;100" dur="6.5s" begin="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="6.5s" begin="2.6s" repeatCount="indefinite" />
              </circle>
            </g>

            {/* 중심 노드 */}
            <circle cx="300" cy="100" r="4" fill="url(#nodeGradient)" opacity="0.9">
              <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>

          {/* 중앙 프로필 이미지 */}
          <div className="relative z-10">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-400 blur-xl opacity-40 animate-pulse" />
            <div className="relative rounded-full p-1 bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-400">
              <div className="rounded-full p-1 bg-background">
                <Image
                  src="/kca_ai_avatar_black.png"
                  alt="KCA AI Avatar"
                  width={256}
                  height={256}
                  className="h-16 w-16 sm:h-24 sm:w-24 object-cover rounded-full shadow-2xl"
                  priority
                  quality={100}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 기본 large 크기 (텍스트 포함)
  return (
      <div className={`flex flex-col items-center gap-6 ${className}`}>
        <Image
          src="/kca_ai_avatar_2.png"
          alt="KCA AI Avatar"
          width={320}
          height={320}
          className="h-80 w-80 object-cover rounded-3xl shadow-2xl"
          priority
        />
        <div className="flex flex-col items-center">
          <span className="text-4xl font-bold tracking-tight text-foreground leading-none">
            KCA CERT-AI
      </span>
          <span className="text-lg text-muted-foreground leading-none mt-2">
            국가기술자격 검정 도우미
        </span>
      </div>
      </div>
    );
  }

  // default 크기 (헤더용) - 텍스트만 표시
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-2xl font-bold tracking-tight leading-none mb-1">
        <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 bg-clip-text text-transparent dark:from-blue-400 dark:via-cyan-300 dark:to-blue-300 animate-gradient">
          KCA 자격검정
        </span>
      </span>
      <span className="text-base font-semibold tracking-tight leading-none">
        <span className="bg-gradient-to-r from-slate-600 to-slate-500 bg-clip-text text-transparent dark:from-slate-400 dark:to-slate-300">
          AI 챗봇서비스
        </span>
        <span className="ml-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 text-white dark:from-purple-400 dark:via-violet-400 dark:to-purple-500">
          시범운영
        </span>
      </span>
    </div>
  );
}
