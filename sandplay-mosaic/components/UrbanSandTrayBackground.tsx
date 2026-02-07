import React from 'react';
import { motion } from 'motion/react';

export default function UrbanSandTrayBackground() {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none -z-10 bg-gradient-to-br from-[#f5f5f5] via-[#f7f7f7] to-[#f8f8f8]">
      <svg className="absolute inset-0 w-full h-full" style={{ filter: 'blur(50px)' }}>
        <defs>
          <linearGradient id="urbanPinkMintTide1" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="rgba(249, 249, 249, 0.65)" />
            <stop offset="25%" stopColor="rgba(207, 207, 207, 0.75)" />
            <stop offset="45%" stopColor="rgba(188, 188, 188, 0.7)" />
            <stop offset="65%" stopColor="rgba(202, 202, 202, 0.7)" />
            <stop offset="85%" stopColor="rgba(218, 218, 218, 0.65)" />
            <stop offset="100%" stopColor="rgba(245, 245, 245, 0.5)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M-400,200 Q-100,150 200,180 T800,160 Q1100,150 1400,190 L1400,450 Q1100,380 800,420 T200,440 Q-100,460 -400,400 Z"
          fill="url(#urbanPinkMintTide1)"
          animate={{
            d: [
              "M-400,200 Q-100,150 200,180 T800,160 Q1100,150 1400,190 L1400,450 Q1100,380 800,420 T200,440 Q-100,460 -400,400 Z",
              "M-200,320 Q100,250 400,290 T1000,270 Q1300,260 1600,310 L1600,570 Q1300,480 1000,540 T400,560 Q100,580 -200,520 Z",
              "M100,160 Q400,110 700,140 T1300,120 Q1600,110 1900,150 L1900,410 Q1600,340 1300,380 T700,400 Q400,420 100,360 Z",
              "M-600,280 Q-200,200 300,240 T1100,220 Q1400,210 1800,260 L1800,520 Q1400,440 1100,490 T300,510 Q-200,530 -600,470 Z",
              "M-400,200 Q-100,150 200,180 T800,160 Q1100,150 1400,190 L1400,450 Q1100,380 800,420 T200,440 Q-100,460 -400,400 Z",
            ],
            opacity: [0, 0.2, 0.8, 0, 0.5, 1, 0.3, 0, 0.6, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", times: [0, 0.1, 0.25, 0.35, 0.5, 0.65, 0.75, 0.85, 0.95, 1] }}
        />
      </svg>
      <svg className="absolute inset-0 w-full h-full" style={{ filter: 'blur(60px)' }}>
        <defs>
          <linearGradient id="urbanPinkMintTide2" x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="rgba(245, 245, 245, 0.5)" />
            <stop offset="20%" stopColor="rgba(218, 218, 218, 0.65)" />
            <stop offset="45%" stopColor="rgba(192, 192, 192, 0.7)" />
            <stop offset="70%" stopColor="rgba(200, 200, 200, 0.7)" />
            <stop offset="90%" stopColor="rgba(230, 230, 230, 0.6)" />
            <stop offset="100%" stopColor="rgba(250, 250, 250, 0.45)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M1900,280 Q1600,220 1300,260 T700,240 Q400,230 100,280 L100,520 Q400,460 700,490 T1300,480 Q1600,470 1900,530 Z"
          fill="url(#urbanPinkMintTide2)"
          animate={{
            d: [
              "M1900,280 Q1600,220 1300,260 T700,240 Q400,230 100,280 L100,520 Q400,460 700,490 T1300,480 Q1600,470 1900,530 Z",
              "M2100,400 Q1800,340 1500,380 T900,360 Q600,350 300,400 L300,640 Q600,580 900,610 T1500,600 Q1800,590 2100,650 Z",
              "M1700,180 Q1400,120 1100,160 T500,140 Q200,130 -100,180 L-100,420 Q200,360 500,390 T1100,380 Q1400,370 1700,430 Z",
              "M1400,340 Q1100,280 800,320 T200,300 Q-100,290 -400,340 L-400,580 Q-100,520 200,550 T800,540 Q1100,530 1400,590 Z",
              "M1900,280 Q1600,220 1300,260 T700,240 Q400,230 100,280 L100,520 Q400,460 700,490 T1300,480 Q1600,470 1900,530 Z",
            ],
            opacity: [0.3, 0, 0.7, 1, 0.4, 0, 0.6, 0.9, 0.2, 0.3],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", times: [0, 0.12, 0.28, 0.42, 0.56, 0.68, 0.78, 0.88, 0.96, 1] }}
        />
      </svg>
      <svg className="absolute inset-0 w-full h-full" style={{ filter: 'blur(55px)' }}>
        <defs>
          <linearGradient id="urbanPurpleTide1" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="rgba(251, 251, 251, 0.45)" />
            <stop offset="20%" stopColor="rgba(217, 217, 217, 0.65)" />
            <stop offset="45%" stopColor="rgba(190, 190, 190, 0.7)" />
            <stop offset="65%" stopColor="rgba(198, 198, 198, 0.65)" />
            <stop offset="82%" stopColor="rgba(218, 218, 218, 0.6)" />
            <stop offset="95%" stopColor="rgba(238, 238, 238, 0.5)" />
            <stop offset="100%" stopColor="rgba(252, 252, 252, 0.4)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M-500,550 Q-150,470 300,520 T1000,500 Q1350,490 1700,550 L1700,900 Q1350,820 1000,870 T300,890 Q-150,910 -500,850 Z"
          fill="url(#urbanPurpleTide1)"
          animate={{
            d: [
              "M-500,550 Q-150,470 300,520 T1000,500 Q1350,490 1700,550 L1700,900 Q1350,820 1000,870 T300,890 Q-150,910 -500,850 Z",
              "M-300,650 Q50,570 500,620 T1200,600 Q1550,590 1900,650 L1900,1000 Q1550,920 1200,970 T500,990 Q50,1010 -300,950 Z",
              "M50,450 Q400,370 850,420 T1550,400 Q1900,390 2250,450 L2250,800 Q1900,720 1550,770 T850,790 Q400,810 50,750 Z",
              "M-700,600 Q-350,520 150,570 T850,550 Q1200,540 1550,600 L1550,950 Q1200,870 850,920 T150,940 Q-350,960 -700,900 Z",
              "M-500,550 Q-150,470 300,520 T1000,500 Q1350,490 1700,550 L1700,900 Q1350,820 1000,870 T300,890 Q-150,910 -500,850 Z",
            ],
            opacity: [0, 0.5, 0, 0.8, 1, 0.3, 0, 0.7, 0.4, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", times: [0, 0.15, 0.25, 0.4, 0.55, 0.65, 0.75, 0.85, 0.95, 1] }}
        />
      </svg>
      <svg className="absolute inset-0 w-full h-full" style={{ filter: 'blur(65px)' }}>
        <defs>
          <linearGradient id="urbanPurpleTide2" x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="rgba(252, 252, 252, 0.4)" />
            <stop offset="18%" stopColor="rgba(230, 230, 230, 0.55)" />
            <stop offset="40%" stopColor="rgba(198, 198, 198, 0.7)" />
            <stop offset="62%" stopColor="rgba(190, 190, 190, 0.7)" />
            <stop offset="82%" stopColor="rgba(219, 219, 219, 0.6)" />
            <stop offset="100%" stopColor="rgba(248, 248, 248, 0.45)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M2000,650 Q1600,560 1200,610 T400,590 Q50,580 -300,650 L-300,1000 Q50,910 400,960 T1200,980 Q1600,970 2000,1040 Z"
          fill="url(#urbanPurpleTide2)"
          animate={{
            d: [
              "M2000,650 Q1600,560 1200,610 T400,590 Q50,580 -300,650 L-300,1000 Q50,910 400,960 T1200,980 Q1600,970 2000,1040 Z",
              "M2200,750 Q1800,660 1400,710 T600,690 Q250,680 -100,750 L-100,1100 Q250,1010 600,1060 T1400,1080 Q1800,1070 2200,1140 Z",
              "M1750,550 Q1350,460 950,510 T150,490 Q-200,480 -550,550 L-550,900 Q-200,810 150,860 T950,880 Q1350,870 1750,940 Z",
              "M1450,700 Q1050,610 650,660 T-150,640 Q-500,630 -850,700 L-850,1050 Q-500,960 -150,1010 T650,1030 Q1050,1020 1450,1090 Z",
              "M2000,650 Q1600,560 1200,610 T400,590 Q50,580 -300,650 L-300,1000 Q50,910 400,960 T1200,980 Q1600,970 2000,1040 Z",
            ],
            opacity: [0.4, 1, 0.5, 0, 0.7, 0.2, 0, 0.9, 0.6, 0.4],
          }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", times: [0, 0.13, 0.27, 0.38, 0.52, 0.63, 0.73, 0.84, 0.94, 1] }}
        />
      </svg>
      <svg className="absolute inset-0 w-full h-full" style={{ filter: 'blur(70px)' }}>
        <defs>
          <linearGradient id="urbanPinkMintTide3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="rgba(249, 249, 249, 0.5)" />
            <stop offset="35%" stopColor="rgba(202, 202, 202, 0.65)" />
            <stop offset="60%" stopColor="rgba(190, 190, 190, 0.7)" />
            <stop offset="82%" stopColor="rgba(215, 215, 215, 0.6)" />
            <stop offset="100%" stopColor="rgba(246, 246, 246, 0.45)" />
          </linearGradient>
        </defs>
        <motion.ellipse
          cx="30%" cy="35%" rx="400" ry="250"
          fill="url(#urbanPinkMintTide3)"
          animate={{
            cx: ["30%", "65%", "20%", "75%", "40%", "30%"],
            cy: ["35%", "25%", "55%", "30%", "60%", "35%"],
            rx: [400, 500, 350, 480, 380, 400],
            ry: [250, 320, 220, 300, 240, 250],
            opacity: [0, 0.4, 0, 0.8, 0.3, 1, 0.5, 0, 0.7, 0],
          }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", times: [0, 0.18, 0.28, 0.45, 0.58, 0.68, 0.78, 0.88, 0.96, 1] }}
        />
      </svg>
      <svg className="absolute inset-0 w-full h-full" style={{ filter: 'blur(75px)' }}>
        <defs>
          <linearGradient id="urbanPurpleTide3" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="rgba(246, 246, 246, 0.45)" />
            <stop offset="30%" stopColor="rgba(214, 214, 214, 0.6)" />
            <stop offset="55%" stopColor="rgba(192, 192, 192, 0.7)" />
            <stop offset="78%" stopColor="rgba(205, 205, 205, 0.6)" />
            <stop offset="100%" stopColor="rgba(238, 238, 238, 0.5)" />
          </linearGradient>
        </defs>
        <motion.ellipse
          cx="70%" cy="65%" rx="450" ry="280"
          fill="url(#urbanPurpleTide3)"
          animate={{
            cx: ["70%", "25%", "80%", "35%", "60%", "70%"],
            cy: ["65%", "70%", "40%", "75%", "50%", "65%"],
            rx: [450, 520, 400, 490, 430, 450],
            ry: [280, 340, 250, 320, 270, 280],
            opacity: [0.2, 0, 0.6, 1, 0.4, 0, 0.8, 0.3, 0.2],
          }}
          transition={{ duration: 29, repeat: Infinity, ease: "easeInOut", times: [0, 0.14, 0.3, 0.48, 0.62, 0.72, 0.82, 0.92, 1] }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['-200% 0%', '200% 0%', '-200% 0%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
