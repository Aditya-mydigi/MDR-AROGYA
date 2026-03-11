"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Calendar, Clock, ChevronRight } from "lucide-react";

export default function Header({
    title,
    onToggleSidebar,
    sidebarCollapsed,
}: {
    title: string;
    onToggleSidebar?: () => void;
    sidebarCollapsed?: boolean;
}) {
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = currentTime.toLocaleDateString("en-US", {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const formattedTime = currentTime.toLocaleTimeString("en-US", {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    return (
        <header className="flex justify-between items-center bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm sticky top-0 z-30 border-b border-gray-100">
            <div className="flex items-center gap-4">
                {/* Mobile Toggle Button */}
                {onToggleSidebar && (
                    <button
                        onClick={onToggleSidebar}
                        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-gray-600 border border-gray-100"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                )}
                
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <span>Pages</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-gray-600">{title}</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-[#0a3a7a] tracking-tight">{title}</h1>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                {/* Real-time Date & Time */}
                <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600 border-r border-gray-200 pr-4">
                        <Calendar className="h-4 w-4 text-[#0a3a7a]" />
                        <span className="text-sm font-semibold">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4 text-[#0a3a7a]" />
                        <span
                            className="text-sm font-bold tabular-nums"
                            suppressHydrationWarning
                        >
                            {formattedTime}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
