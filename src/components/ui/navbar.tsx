
"use client";

import Link from 'next/link';
import { Wand2, DraftingCompass, Bot } from 'lucide-react'; // Added Bot icon
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'InstaGenius Pro', icon: Wand2 },
    { href: '/logo-designer', label: 'AI Logo Designer', icon: DraftingCompass },
  ];

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
            <Bot className="h-7 w-7" />
            <span className="text-xl font-bold">Deepak AI</span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 mr-0 sm:mr-2", isActive ? "text-primary-foreground" : "text-primary")} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
