import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';

export const DoubleLoopShutterScrollbar: React.FC = () => {
    const [location] = useLocation();
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [recoilOffset, setRecoilOffset] = useState(0);
    const trackRef = useRef<HTMLDivElement>(null);

    const physicsRef = useRef({ offset: 0, velocity: 0, animFrame: 0 });
    const lastYRef = useRef(0);

    const updateScroll = useCallback(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight <= 0) {
            setScrollProgress(0);
            return;
        }
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
    }, []);

    useEffect(() => {
        if (physicsRef.current.animFrame) {
            cancelAnimationFrame(physicsRef.current.animFrame);
        }
        physicsRef.current.offset = 0;
        physicsRef.current.velocity = 0;
        setRecoilOffset(0);

        const timer = setTimeout(() => {
            updateScroll();
        }, 0);

        return () => clearTimeout(timer);
    }, [location, updateScroll]);

    useEffect(() => {
        window.addEventListener('scroll', updateScroll, { passive: true });
        return () => window.removeEventListener('scroll', updateScroll);
    }, [updateScroll]);

    const scrollToRatio = (clientY: number) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const offsetY = clientY - rect.top;
        const ratio = Math.min(1, Math.max(0, offsetY / rect.height));
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: ratio * totalHeight, behavior: 'auto' });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        lastYRef.current = e.clientY;

        if (physicsRef.current.animFrame) {
            cancelAnimationFrame(physicsRef.current.animFrame);
        }

        physicsRef.current.offset = 6;
        setRecoilOffset(6);

        scrollToRatio(e.clientY);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const deltaY = e.clientY - lastYRef.current;
                lastYRef.current = e.clientY;

                const tension = Math.min(16, Math.max(-16, physicsRef.current.offset + deltaY * 0.35));
                physicsRef.current.offset = tension;
                setRecoilOffset(tension);

                scrollToRatio(e.clientY);
            }
        };

        const handleMouseUp = () => {
            if (!isDragging) return;
            setIsDragging(false);

            let offset = physicsRef.current.offset;
            let velocity = offset > 0 ? -8 : 8;
            const stiffness = 0.18;
            const damping = 0.75;

            const animateSpring = () => {
                const force = -stiffness * offset - (1 - damping) * velocity;
                velocity += force;
                offset += velocity;

                physicsRef.current.offset = offset;
                physicsRef.current.velocity = velocity;
                setRecoilOffset(offset);

                if (Math.abs(offset) > 0.1 || Math.abs(velocity) > 0.1) {
                    physicsRef.current.animFrame = requestAnimationFrame(animateSpring);
                } else {
                    physicsRef.current.offset = 0;
                    setRecoilOffset(0);
                }
            };

            physicsRef.current.animFrame = requestAnimationFrame(animateSpring);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            ref={trackRef}
            onMouseDown={handleMouseDown}
            className={`fixed right-3 top-12 bottom-12 w-7 hidden md:flex flex-col items-center z-50 cursor-pointer select-none group transition-opacity duration-300 ${
                isDragging ? 'opacity-100' : 'opacity-50 hover:opacity-100'
            }`}
        >
            {/* Top Headrail Mounting Bracket (30% Smaller) */}
            <svg width="28" height="10" viewBox="0 0 40 14" className="flex-shrink-0">
                <rect x="4" y="0" width="32" height="8" rx="2" fill="#334155" />
                <rect x="6" y="2" width="28" height="4" rx="1" fill="#64748b" />
                <circle cx="12" cy="11" r="2.5" fill="#475569" />
                <circle cx="28" cy="11" r="2.5" fill="#475569" />
            </svg>

            {/* SVG Beaded Chain Loop Container */}
            <div className="relative flex-1 w-full overflow-hidden">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        {/* 3D Sphere Bead Gradient */}
                        <radialGradient id="whiteBead" cx="35%" cy="30%" r="65%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="45%" stopColor="#f1f5f9" />
                            <stop offset="85%" stopColor="#cbd5e1" />
                            <stop offset="100%" stopColor="#94a3b8" />
                        </radialGradient>

                        {/* Scaled-down 28px-wide Pattern */}
                        <pattern id="doubleBeadPattern" width="28" height="7" patternUnits="userSpaceOnUse">
                            {/* Left Strand */}
                            <line x1="8" y1="0" x2="8" y2="7" stroke="#cbd5e1" strokeWidth="1" />
                            <circle cx="8" cy="3.5" r="2.1" fill="url(#whiteBead)" stroke="#94a3b8" strokeWidth="0.4" />

                            {/* Right Strand */}
                            <line x1="20" y1="0" x2="20" y2="7" stroke="#94a3b8" strokeWidth="0.8" />
                            <circle cx="20" cy="3.5" r="2" fill="url(#whiteBead)" opacity="0.85" />
                        </pattern>
                    </defs>

                    {/* Render Pattern */}
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#doubleBeadPattern)" />
                </svg>

                {/* Blind Pull Tassel / Bell Handle (30% Smaller) */}
                <div
                    className="absolute left-[8px] flex flex-col items-center justify-center group-hover:scale-105"
                    style={{
                        top: `${scrollProgress}%`,
                        transform: `translate(-50%, ${recoilOffset}px) scale(${isDragging ? 1.12 : 1})`,
                        transition: isDragging ? 'transform 0.05s ease-out' : 'none',
                    }}
                >
                    <svg width="15" height="24" viewBox="0 0 22 34">
                        <defs>
                            <linearGradient id="tasselGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f8fafc" />
                                <stop offset="30%" stopColor="#ffffff" />
                                <stop offset="70%" stopColor="#e2e8f0" />
                                <stop offset="100%" stopColor="#cbd5e1" />
                            </linearGradient>
                        </defs>

                        <rect x="9.5" y="0" width="3" height="4" fill="#64748b" rx="1" />
                        <path d="M 6 4 L 16 4 C 17 4, 17 7, 16 7 L 6 7 C 5 7, 5 4, 6 4 Z" fill="url(#tasselGrad)" stroke="#cbd5e1" strokeWidth="0.5" />
                        <path d="M 6 7 C 8 10, 3 20, 3 25 C 3 30, 7 32, 11 32 C 15 32, 19 30, 19 25 C 19 20, 14 10, 16 7 Z" fill="url(#tasselGrad)" stroke="#cbd5e1" strokeWidth="0.5" />
                    </svg>
                </div>
            </div>

            {/* Bottom Wall Safety Bracket (30% Smaller) */}
            <svg width="28" height="11" viewBox="0 0 40 16" className="flex-shrink-0">
                <rect x="10" y="0" width="20" height="12" rx="2" fill="#ffffff" fillOpacity="0.4" stroke="#94a3b8" strokeWidth="1" />
                <circle cx="20" cy="6" r="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
            </svg>
        </div>
    );
};