const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function seedSettings() {
  const defaultSettings = [
    // General Settings
    { key: 'siteName', value: 'Samui Transfers', type: 'string', label_en: 'Site Name', label_th: 'ชื่อเว็บไซต์', description_en: 'Your business website name', description_th: 'ชื่อเว็บไซต์ของคุณ', category: 'general' },
    { key: 'timezone', value: 'Asia/Bangkok', type: 'string', label_en: 'Timezone', label_th: 'เขตเวลา', description_en: 'Default timezone for the system', description_th: 'เขตเวลาเริ่มต้นของระบบ', category: 'general' },
    { key: 'defaultLanguage', value: 'en', type: 'string', label_en: 'Default Language', label_th: 'ภาษาเริ่มต้น', description_en: 'Default language for new users', description_th: 'ภาษาเริ่มต้นสำหรับผู้ใช้ใหม่', category: 'general' },
    // Business Settings
    { key: 'companyName', value: 'Samui Transfers Co., Ltd', type: 'string', label_en: 'Company Name', label_th: 'ชื่อบริษัท', description_en: 'Legal business name', description_th: 'ชื่อทางกฎหมายของธุรกิจ', category: 'business' },
    { key: 'supportEmail', value: 'support@samuitransfers.com', type: 'string', label_en: 'Support Email', label_th: 'อีเมลสนับสนุน', description_en: 'Customer support email address', description_th: 'ที่อยู่อีเมลสนับสนุนลูกค้า', category: 'business' },
    { key: 'supportPhone', value: '+66 1 2345 6789', type: 'string', label_en: 'Support Phone', label_th: 'โทรศัพท์สนับสนุน', description_en: 'Customer support phone number', description_th: 'เบอร์โทรศัพท์สนับสนุนลูกค้า', category: 'business' },
    { key: 'businessAddress', value: 'Samui, Surat Thani 84140, Thailand', type: 'string', label_en: 'Business Address', label_th: 'ที่อยู่ธุรกิจ', description_en: 'Main office address', description_th: 'ที่อยู่สำนักงานหลัก', category: 'business' },
    // Notification Settings
    { key: 'emailNotifications', value: 'true', type: 'boolean', label_en: 'Email Notifications', label_th: 'การแจ้งเตือนทางอีเมล', description_en: 'Receive email for important events', description_th: 'รับอีเมลสำหรับเหตุการณ์ที่สำคัญ', category: 'notifications' },
    { key: 'smsNotifications', value: 'true', type: 'boolean', label_en: 'SMS Notifications', label_th: 'การแจ้งเตือน SMS', description_en: 'Receive SMS alerts for critical issues', description_th: 'รับการแจ้งเตือน SMS สำหรับปัญหาที่สำคัญ', category: 'notifications' },
    { key: 'bookingAlerts', value: 'true', type: 'boolean', label_en: 'New Booking Alerts', label_th: 'การแจ้งเตือนการจองใหม่', description_en: 'Get notified when new bookings arrive', description_th: 'รับการแจ้งเตือนเมื่อมีการจองใหม่', category: 'notifications' },
    { key: 'paymentAlerts', value: 'true', type: 'boolean', label_en: 'Payment Alerts', label_th: 'การแจ้งเตือนการชำระเงิน', description_en: 'Notify on payment transactions', description_th: 'แจ้งเตือนเกี่ยวกับธุรกรรมการชำระเงิน', category: 'notifications' },
    // Security Settings
    { key: 'twoFactorAuth', value: 'true', type: 'boolean', label_en: 'Two-Factor Authentication', label_th: 'การยืนยันตัวตนสองชั้น', description_en: 'Enable 2FA for admin accounts', description_th: 'เปิดใช้งาน 2FA สำหรับบัญชีแอดมิน', category: 'security' },
    { key: 'sessionTimeout', value: '30', type: 'number', label_en: 'Session Timeout (minutes)', label_th: 'หมดเวลาเซッชัน (นาที)', description_en: 'Auto logout after inactivity', description_th: 'ออกจากระบบอัตโนมัติเมื่อไม่มีกิจกรรม', category: 'security' },
    { key: 'passwordPolicy', value: 'true', type: 'boolean', label_en: 'Enforce Strong Passwords', label_th: 'บังคับใช้รหัสผ่านที่แข็งแกร่ง', description_en: 'Require complex passwords for all users', description_th: 'ต้องใช้รหัสผ่านที่ซับซ้อนสำหรับผู้ใช้ทั้งหมด', category: 'security' },
    { key: 'ipWhitelist', value: 'false', type: 'boolean', label_en: 'IP Whitelist', label_th: 'รายการที่อนุญาต IP', description_en: 'Allow access only from specific IPs', description_th: 'อนุญาตการเข้าถึงจาก IP ที่เฉพาะเจาะจงเท่านั้น', category: 'security' },
    // API Settings
    { key: 'apiEnabled', value: 'true', type: 'boolean', label_en: 'Enable API Access', label_th: 'เปิดใช้งานการเข้าถึง API', description_en: 'Allow third-party API access', description_th: 'อนุญาตการเข้าถึง API ของบุคคลที่สาม', category: 'api' },
    { key: 'apiRateLimit', value: '1000', type: 'number', label_en: 'API Rate Limit (req/min)', label_th: 'ขีด จำกัด อัตรา API (req/นาที)', description_en: 'Maximum API requests per minute', description_th: 'จำนวนคำขอ API สูงสุดต่อนาที', category: 'api' },
    { key: 'webhooksEnabled', value: 'true', type: 'boolean', label_en: 'Enable Webhooks', label_th: 'เปิดใช้งาน Webhooks', description_en: 'Allow webhook integrations', description_th: 'อนุญาตการรวมเข้า Webhook', category: 'api' },
    // System Settings
    { key: 'maintenanceMode', value: 'false', type: 'boolean', label_en: 'Maintenance Mode', label_th: 'โหมดบำรุงรักษา', description_en: 'Put site in maintenance mode', description_th: 'ปิดเว็บไซต์ไว้สำหรับบำรุงรักษา', category: 'system' },
    { key: 'debugMode', value: 'false', type: 'boolean', label_en: 'Debug Mode', label_th: 'โหมดดีบัก', description_en: 'Enable detailed error logging', description_th: 'เปิดใช้งานการบันทึกข้อผิดพลาดโดยละเอียด', category: 'system' },
    { key: 'autoBackups', value: 'true', type: 'boolean', label_en: 'Auto Backups', label_th: 'การสำรองข้อมูลอัตโนมัติ', description_en: 'Enable automatic database backups', description_th: 'เปิดใช้งานการสำรองข้อมูลฐานข้อมูลอัตโนมัติ', category: 'system' },
    { key: 'logsRetention', value: '90', type: 'number', label_en: 'Logs Retention (days)', label_th: 'การเก็บรักษาบันทึก (วัน)', description_en: 'How many days to keep logs', description_th: 'จำนวนวันที่จะเก็บบันทึก', category: 'system' },
  ];

  console.log('Seeding system settings...');

  for (const setting of defaultSettings) {
    try {
      await db.systemSettings.upsert({
        where: { key: setting.key },
        update: setting,
        create: setting,
      });
      console.log(`✓ Seeded setting: ${setting.key}`);
    } catch (error) {
      console.error(`✗ Failed to seed setting ${setting.key}:`, error);
    }
  }

  console.log('✓ System settings seeded successfully!');
}

seedSettings()
  .catch(error => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
