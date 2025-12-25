'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

interface SidebarItem {
  href?: string;
  label_en: string;
  label_th: string;
  icon?: string;
  isGroup?: boolean;
  submenu?: SidebarItem[];
}

const menuItems: SidebarItem[] = [
  {
    href: '/admin',
    label_en: 'Dashboard',
    label_th: 'แดชบอร์ด',
    icon: '📊',
  },
  {
    href: '/admin/bookings',
    label_en: 'Bookings',
    label_th: 'การจอง',
    icon: '📅',
  },
  {
    isGroup: true,
    label_en: 'Tour Management',
    label_th: 'จัดการทัวร์',
    icon: '🎯',
    submenu: [
      {
        href: '/admin/tour-packages',
        label_en: 'Tour Packages',
        label_th: 'แพ็คเกจทัวร์',
        icon: '🎫',
      },
      {
        href: '/admin/tour-locations',
        label_en: 'Locations',
        label_th: 'สถานที่',
        icon: '📍',
      },
    ],
  },
  {
    isGroup: true,
    label_en: 'Vehicle Management',
    label_th: 'จัดการยานพาหนะ',
    icon: '🚗',
    submenu: [
      {
        href: '/admin/vehicles',
        label_en: 'Vehicles',
        label_th: 'ยานพาหนะ',
        icon: '🚌',
      },
      {
        href: '/admin/rates',
        label_en: 'Rates',
        label_th: 'อัตราราคา',
        icon: '💰',
      },
    ],
  },
  {
    isGroup: true,
    label_en: 'Payment Management',
    label_th: 'จัดการการชำระเงิน',
    icon: '💸',
    submenu: [
      {
        href: '/admin/payments',
        label_en: 'Payments',
        label_th: 'การชำระเงิน',
        icon: '💳',
      },
      {
        href: '/admin/payment-gateways',
        label_en: 'Payment Gateways',
        label_th: 'เกตเวย์ชำระเงิน',
        icon: '🔐',
      },
      {
        href: '/admin/payment-reconciliation',
        label_en: 'Reconciliation',
        label_th: 'การสอบประมาณการ',
        icon: '📊',
      },
      {
        href: '/admin/payment-reminders',
        label_en: 'Reminders',
        label_th: 'การแจ้งเตือน',
        icon: '🔔',
      },
    ],
  },
  {
    isGroup: true,
    label_en: 'Content Management',
    label_th: 'จัดการเนื้อหา',
    icon: '📝',
    submenu: [
      {
        href: '/admin/content',
        label_en: 'Content & Pages',
        label_th: 'เนื้อหาและหน้าเว็บ',
        icon: '📄',
      },
    ],
  },
  {
    isGroup: true,
    label_en: 'Tools & Support',
    label_th: 'เครื่องมือและการสนับสนุน',
    icon: '🛠️',
    submenu: [
      {
        href: '/admin/agent-context',
        label_en: 'AI & Context',
        label_th: 'เอไอและบริบท',
        icon: '🤖',
      },
      {
        href: '/admin/documentation',
        label_en: 'Documentation',
        label_th: 'เอกสาร',
        icon: '📚',
      },
    ],
  },
  {
    href: '/admin/users',
    label_en: 'Users',
    label_th: 'ผู้ใช้งาน',
    icon: '👥',
  },
  {
    href: '/admin/sms',
    label_en: 'SMS',
    label_th: 'ข้อความ SMS',
    icon: '💬',
  },
  {
    isGroup: true,
    label_en: 'Settings',
    label_th: 'การตั้งค่า',
    icon: '⚙️',
    submenu: [
      {
        href: '/admin/theme',
        label_en: 'Theme Settings',
        label_th: 'การตั้งค่าธีม',
        icon: '🎨',
      },
      {
        href: '/admin/settings',
        label_en: 'General Settings',
        label_th: 'การตั้งค่าทั่วไป',
        icon: '⚙️',
      },
    ],
  },
];

export default function AdminSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Tour Management', 'Vehicle Management', 'Payment Management', 'Settings']);
  const pathname = usePathname();
  const { lang } = useLanguage();

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  const isGroupActive = (submenu?: SidebarItem[]) => {
    if (!submenu) return false;
    return submenu.some(item => isActive(item.href));
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  const renderMenuItem = (item: SidebarItem) => {
    const label = lang === 'en' ? item.label_en : item.label_th;
    const isGroupExpanded = expandedGroups.includes(item.label_en);
    const groupActive = isGroupActive(item.submenu);

    if (item.isGroup && item.submenu) {
      return (
        <li key={item.label_en}>
          <button
            onClick={() => toggleGroup(item.label_en)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
              groupActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title={isExpanded ? '' : label}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {isExpanded && (
                <span className="text-sm font-medium">{label}</span>
              )}
            </div>
            {isExpanded && (
              <span className="text-xs transition-transform" style={{
                transform: isGroupExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            )}
          </button>

          {/* Submenu */}
          {isExpanded && isGroupExpanded && item.submenu && (
            <ul className="mt-2 ml-2 space-y-1 border-l-2 border-slate-700 pl-2">
              {item.submenu.map(subitem => (
                <li key={subitem.href}>
                  <Link
                    href={subitem.href!}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                      isActive(subitem.href)
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{subitem.icon}</span>
                    <span className="font-medium">{lang === 'en' ? subitem.label_en : subitem.label_th}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.href}>
        <Link
          href={item.href!}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive(item.href)
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
          title={isExpanded ? '' : label}
        >
          <span className="text-xl flex-shrink-0">{item.icon}</span>
          {isExpanded && (
            <span className="text-sm font-medium">{label}</span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-slate-900 text-white shadow-lg transition-all duration-300 z-30 ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo/Header */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-slate-700">
          {isExpanded && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏝️</span>
              <span className="font-bold text-lg">Samui Admin</span>
            </div>
          )}
          {!isExpanded && <span className="text-2xl">🏝️</span>}
          
          {/* Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors ml-auto"
            title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-2">
            {menuItems.map((item) => renderMenuItem(item))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          {isExpanded && (
            <p className="text-xs text-slate-400 text-center">
              v1.0 © 2025
            </p>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}
