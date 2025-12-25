'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSystemSettings } from '@/lib/hooks/useSystemSettings';

type SettingsTab = 'general' | 'business' | 'notifications' | 'security' | 'api' | 'system';

interface Setting {
  id: string;
  label_en: string;
  label_th: string;
  description_en: string;
  description_th: string;
  type: 'toggle' | 'input' | 'select' | 'textarea';
  value: string | boolean;
  options?: { label: string; value: string }[];
  key: string;
}

export default function SettingsPage() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { settings, loading, error, updateSetting } = useSystemSettings();
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      const values: Record<string, any> = {};
      Object.entries(settings).forEach(([key, setting]) => {
        if (setting && setting.value !== undefined) {
          values[key] = setting.value;
        }
      });
      setFormValues(values);
    }
  }, [settings]);

  const generalSettings: Setting[] = [
    {
      id: 'siteName',
      key: 'siteName',
      label_en: 'Site Name',
      label_th: 'ชื่อเว็บไซต์',
      description_en: 'Your business website name',
      description_th: 'ชื่อเว็บไซต์ของคุณ',
      type: 'input',
      value: formValues['siteName'] ?? 'Samui Transfers',
    },
    {
      id: 'timezone',
      key: 'timezone',
      label_en: 'Timezone',
      label_th: 'เขตเวลา',
      description_en: 'Default timezone for the system',
      description_th: 'เขตเวลาเริ่มต้นของระบบ',
      type: 'select',
      value: formValues['timezone'] ?? 'Asia/Bangkok',
      options: [
        { label: 'Asia/Bangkok (UTC+7)', value: 'Asia/Bangkok' },
        { label: 'UTC', value: 'UTC' },
        { label: 'Asia/Singapore (UTC+8)', value: 'Asia/Singapore' },
      ],
    },
    {
      id: 'language',
      key: 'defaultLanguage',
      label_en: 'Default Language',
      label_th: 'ภาษาเริ่มต้น',
      description_en: 'Default language for new users',
      description_th: 'ภาษาเริ่มต้นสำหรับผู้ใช้ใหม่',
      type: 'select',
      value: formValues['defaultLanguage'] ?? 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'ไทย (Thai)', value: 'th' },
      ],
    },
  ];

  const businessSettings: Setting[] = [
    {
      id: 'companyName',
      key: 'companyName',
      label_en: 'Company Name',
      label_th: 'ชื่อบริษัท',
      description_en: 'Legal business name',
      description_th: 'ชื่อทางกฎหมายของธุรกิจ',
      type: 'input',
      value: formValues['companyName'] ?? 'Samui Transfers Co., Ltd',
    },
    {
      id: 'email',
      key: 'supportEmail',
      label_en: 'Support Email',
      label_th: 'อีเมลสนับสนุน',
      description_en: 'Customer support email address',
      description_th: 'ที่อยู่อีเมลสนับสนุนลูกค้า',
      type: 'input',
      value: formValues['supportEmail'] ?? 'support@samuitransfers.com',
    },
    {
      id: 'phone',
      key: 'supportPhone',
      label_en: 'Support Phone',
      label_th: 'โทรศัพท์สนับสนุน',
      description_en: 'Customer support phone number',
      description_th: 'เบอร์โทรศัพท์สนับสนุนลูกค้า',
      type: 'input',
      value: formValues['supportPhone'] ?? '+66 1 2345 6789',
    },
    {
      id: 'address',
      key: 'businessAddress',
      label_en: 'Business Address',
      label_th: 'ที่อยู่ธุรกิจ',
      description_en: 'Main office address',
      description_th: 'ที่อยู่สำนักงานหลัก',
      type: 'textarea',
      value: formValues['businessAddress'] ?? 'Samui, Surat Thani 84140, Thailand',
    },
  ];

  const notificationSettings: Setting[] = [
    {
      id: 'emailNotifications',
      key: 'emailNotifications',
      label_en: 'Email Notifications',
      label_th: 'การแจ้งเตือนทางอีเมล',
      description_en: 'Receive email for important events',
      description_th: 'รับอีเมลสำหรับเหตุการณ์ที่สำคัญ',
      type: 'toggle',
      value: formValues['emailNotifications'] ?? true,
    },
    {
      id: 'smsNotifications',
      key: 'smsNotifications',
      label_en: 'SMS Notifications',
      label_th: 'การแจ้งเตือน SMS',
      description_en: 'Receive SMS alerts for critical issues',
      description_th: 'รับการแจ้งเตือน SMS สำหรับปัญหาที่สำคัญ',
      type: 'toggle',
      value: formValues['smsNotifications'] ?? true,
    },
    {
      id: 'bookingAlerts',
      key: 'bookingAlerts',
      label_en: 'New Booking Alerts',
      label_th: 'การแจ้งเตือนการจองใหม่',
      description_en: 'Get notified when new bookings arrive',
      description_th: 'รับการแจ้งเตือนเมื่อมีการจองใหม่',
      type: 'toggle',
      value: formValues['bookingAlerts'] ?? true,
    },
    {
      id: 'paymentAlerts',
      key: 'paymentAlerts',
      label_en: 'Payment Alerts',
      label_th: 'การแจ้งเตือนการชำระเงิน',
      description_en: 'Notify on payment transactions',
      description_th: 'แจ้งเตือนเกี่ยวกับธุรกรรมการชำระเงิน',
      type: 'toggle',
      value: formValues['paymentAlerts'] ?? true,
    },
  ];

  const securitySettings: Setting[] = [
    {
      id: 'twoFactor',
      key: 'twoFactorAuth',
      label_en: 'Two-Factor Authentication',
      label_th: 'การยืนยันตัวตนสองชั้น',
      description_en: 'Enable 2FA for admin accounts',
      description_th: 'เปิดใช้งาน 2FA สำหรับบัญชีแอดมิน',
      type: 'toggle',
      value: formValues['twoFactorAuth'] ?? true,
    },
    {
      id: 'sessionTimeout',
      key: 'sessionTimeout',
      label_en: 'Session Timeout (minutes)',
      label_th: 'หมดเวลาเซッชัน (นาที)',
      description_en: 'Auto logout after inactivity',
      description_th: 'ออกจากระบบอัตโนมัติเมื่อไม่มีกิจกรรม',
      type: 'input',
      value: formValues['sessionTimeout'] ?? '30',
    },
    {
      id: 'passwordPolicy',
      key: 'passwordPolicy',
      label_en: 'Enforce Strong Passwords',
      label_th: 'บังคับใช้รหัสผ่านที่แข็งแกร่ง',
      description_en: 'Require complex passwords for all users',
      description_th: 'ต้องใช้รหัสผ่านที่ซับซ้อนสำหรับผู้ใช้ทั้งหมด',
      type: 'toggle',
      value: formValues['passwordPolicy'] ?? true,
    },
    {
      id: 'ipWhitelist',
      key: 'ipWhitelist',
      label_en: 'IP Whitelist',
      label_th: 'รายการที่อนุญาต IP',
      description_en: 'Allow access only from specific IPs',
      description_th: 'อนุญาตการเข้าถึงจาก IP ที่เฉพาะเจาะจงเท่านั้น',
      type: 'toggle',
      value: formValues['ipWhitelist'] ?? false,
    },
  ];

  const apiSettings: Setting[] = [
    {
      id: 'apiEnabled',
      key: 'apiEnabled',
      label_en: 'Enable API Access',
      label_th: 'เปิดใช้งานการเข้าถึง API',
      description_en: 'Allow third-party API access',
      description_th: 'อนุญาตการเข้าถึง API ของบุคคลที่สาม',
      type: 'toggle',
      value: formValues['apiEnabled'] ?? true,
    },
    {
      id: 'apiRateLimit',
      key: 'apiRateLimit',
      label_en: 'API Rate Limit (req/min)',
      label_th: 'ขีด จำกัด อัตรา API (req/นาที)',
      description_en: 'Maximum API requests per minute',
      description_th: 'จำนวนคำขอ API สูงสุดต่อนาที',
      type: 'input',
      value: formValues['apiRateLimit'] ?? '1000',
    },
    {
      id: 'webhooks',
      key: 'webhooksEnabled',
      label_en: 'Enable Webhooks',
      label_th: 'เปิดใช้งาน Webhooks',
      description_en: 'Allow webhook integrations',
      description_th: 'อนุญาตการรวมเข้า Webhook',
      type: 'toggle',
      value: formValues['webhooksEnabled'] ?? true,
    },
  ];

  const systemSettings: Setting[] = [
    {
      id: 'maintenance',
      key: 'maintenanceMode',
      label_en: 'Maintenance Mode',
      label_th: 'โหมดบำรุงรักษา',
      description_en: 'Put site in maintenance mode',
      description_th: 'ปิดเว็บไซต์ไว้สำหรับบำรุงรักษา',
      type: 'toggle',
      value: formValues['maintenanceMode'] ?? false,
    },
    {
      id: 'debugMode',
      key: 'debugMode',
      label_en: 'Debug Mode',
      label_th: 'โหมดดีบัก',
      description_en: 'Enable detailed error logging',
      description_th: 'เปิดใช้งานการบันทึกข้อผิดพลาดโดยละเอียด',
      type: 'toggle',
      value: formValues['debugMode'] ?? false,
    },
    {
      id: 'backups',
      key: 'autoBackups',
      label_en: 'Auto Backups',
      label_th: 'การสำรองข้อมูลอัตโนมัติ',
      description_en: 'Enable automatic database backups',
      description_th: 'เปิดใช้งานการสำรองข้อมูลฐานข้อมูลอัตโนมัติ',
      type: 'toggle',
      value: formValues['autoBackups'] ?? true,
    },
    {
      id: 'logsRetention',
      key: 'logsRetention',
      label_en: 'Logs Retention (days)',
      label_th: 'การเก็บรักษาบันทึก (วัน)',
      description_en: 'How many days to keep logs',
      description_th: 'จำนวนวันที่จะเก็บบันทึก',
      type: 'input',
      value: formValues['logsRetention'] ?? '90',
    },
  ];

  const tabs: { id: SettingsTab; label_en: string; label_th: string; icon: string }[] = [
    { id: 'general', label_en: 'General', label_th: 'ทั่วไป', icon: '⚙️' },
    { id: 'business', label_en: 'Business', label_th: 'ธุรกิจ', icon: '🏢' },
    { id: 'notifications', label_en: 'Notifications', label_th: 'การแจ้งเตือน', icon: '🔔' },
    { id: 'security', label_en: 'Security', label_th: 'ความปลอดภัย', icon: '🔒' },
    { id: 'api', label_en: 'API', label_th: 'API', icon: '🔌' },
    { id: 'system', label_en: 'System', label_th: 'ระบบ', icon: '💾' },
  ];

  const handleSettingChange = async (settingKey: string, value: any, type: string = 'string') => {
    setFormValues(prev => ({
      ...prev,
      [settingKey]: value,
    }));

    try {
      await updateSetting(settingKey, value, type);
      setSuccessMessage(lang === 'en' ? `${settingKey} updated!` : `อัปเดต ${settingKey} สำเร็จ!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update setting:', err);
    }
  };

  const getSettings = (tab: SettingsTab): Setting[] => {
    switch (tab) {
      case 'general':
        return generalSettings;
      case 'business':
        return businessSettings;
      case 'notifications':
        return notificationSettings;
      case 'security':
        return securitySettings;
      case 'api':
        return apiSettings;
      case 'system':
        return systemSettings;
      default:
        return [];
    }
  };

  const renderSetting = (setting: Setting) => {
    const label = lang === 'en' ? setting.label_en : setting.label_th;
    const description = lang === 'en' ? setting.description_en : setting.description_th;
    const currentValue = formValues[setting.key] !== undefined ? formValues[setting.key] : setting.value;

    switch (setting.type) {
      case 'toggle':
        return (
          <div key={setting.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
            <div>
              <h4 className="font-medium text-slate-900">{label}</h4>
              <p className="text-sm text-slate-600">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentValue === true || currentValue === 'true'}
                onChange={(e) => handleSettingChange(setting.key, e.target.checked, 'boolean')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        );

      case 'input':
        return (
          <div key={setting.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
            <label className="block mb-2">
              <h4 className="font-medium text-slate-900">{label}</h4>
              <p className="text-sm text-slate-600 mb-2">{description}</p>
            </label>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => handleSettingChange(setting.key, e.target.value, setting.type)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'select':
        return (
          <div key={setting.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
            <label className="block mb-2">
              <h4 className="font-medium text-slate-900">{label}</h4>
              <p className="text-sm text-slate-600 mb-2">{description}</p>
            </label>
            <select
              value={currentValue}
              onChange={(e) => handleSettingChange(setting.key, e.target.value, 'string')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {setting.options?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'textarea':
        return (
          <div key={setting.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
            <label className="block mb-2">
              <h4 className="font-medium text-slate-900">{label}</h4>
              <p className="text-sm text-slate-600 mb-2">{description}</p>
            </label>
            <textarea
              value={currentValue}
              onChange={(e) => handleSettingChange(setting.key, e.target.value, 'string')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const currentSettings = getSettings(activeTab);
  const currentTab = tabs.find(t => t.id === activeTab);
  const tabLabel = lang === 'en' ? currentTab?.label_en : currentTab?.label_th;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600">{lang === 'en' ? 'Loading settings...' : 'กำลังโหลดการตั้งค่า...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
          {lang === 'en' ? 'Settings' : 'การตั้งค่า'}
        </h1>
        <p className="text-slate-600">
          {lang === 'en' 
            ? 'Manage your system configuration and preferences - changes apply immediately'
            : 'จัดการการกำหนดค่าระบบและการตั้งค่า - การเปลี่ยนแปลงใช้ได้ทันที'}
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✓ {successMessage}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          ✕ {error}
        </div>
      )}

      <div className="border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-1 md:gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
              title={lang === 'en' ? tab.label_en : tab.label_th}
            >
              <span className="mr-2">{tab.icon}</span>
              <span className="hidden sm:inline">{lang === 'en' ? tab.label_en : tab.label_th}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">{tabLabel}</h2>
        <div className="space-y-4">
          {currentSettings.map(setting => renderSetting(setting))}
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 {lang === 'en' ? 'Real-time Sync:' : 'ซิงค์แบบเรียลไทม์:'}</strong> {' '}
          {lang === 'en' 
            ? 'All changes are automatically saved and applied immediately to the system.'
            : 'การเปลี่ยนแปลงทั้งหมดได้รับการบันทึกอัตโนมัติและใช้ได้ทันทีในระบบ'}
        </p>
      </div>
    </div>
  );
}
