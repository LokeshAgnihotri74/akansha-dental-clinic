const { query, getIsDbConnected } = require('../config/db');
const { getStore, saveStore } = require('../database/store');
const { success, error } = require('../utils/responseHelper');

const DEFAULT_SETTINGS = [
  { id: 1, key: 'clinic_name', value: 'Akansha Dental Clinic & Implant Center', description: 'Primary hospital name displayed across the website and invoices.' },
  { id: 2, key: 'clinic_phone', value: '+91 8130 406 405', description: 'Main reception telephone for appointments and queries.' },
  { id: 3, key: 'clinic_emergency_phone', value: '+91 9399354201', description: '24/7 Dental trauma and acute toothache emergency line.' },
  { id: 4, key: 'clinic_email', value: 'support@akanshadental.com', description: 'Official clinical support and administrative email address.' },
  { id: 5, key: 'clinic_address', value: 'Raj Business Park, RA-5, Minal Shopping St, Minal Residency, Bhopal, Madhya Pradesh 462041', description: 'Physical clinic location for patient visits and maps.' },
  { id: 6, key: 'clinic_hours_weekday', value: '10:00 AM – 08:30 PM', description: 'Standard Monday to Saturday operational outpatient hours.' },
  { id: 7, key: 'clinic_hours_weekend', value: '10:00 AM – 01:00 PM (Emergency by Call)', description: 'Sunday emergency schedule.' },
  { id: 8, key: 'sterility_protocol', value: 'Class-B Autoclave & UV Sanitized Protocol', description: 'Hospital sterilization and infection prevention standard.' },
  { id: 9, key: 'online_booking_enabled', value: 'true', description: 'Whether online appointment self-reservation engine is enabled.' },
  { id: 10, key: 'sms_notifications_enabled', value: 'true', description: 'Automated SMS/WhatsApp notifications on booking and contact requests.' }
];

const getSettings = async (req, res, next) => {
  try {
    // 1. Authoritative MySQL Read
    if (getIsDbConnected()) {
      try {
        const rows = await query('SELECT id, setting_key as `key`, setting_value as `value`, description FROM settings ORDER BY id ASC');
        if (rows && rows.length > 0) {
          return success(res, rows, 'Clinic settings retrieved from MySQL database.');
        }
      } catch (dbErr) {
        console.warn('MySQL getSettings error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    if (!store.settings || store.settings.length === 0) {
      store.settings = DEFAULT_SETTINGS;
      saveStore();
    }
    return success(res, store.settings, 'Clinic settings retrieved.');
  } catch (err) {
    next(err);
  }
};

const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return error(res, 'Setting value is required.', 400);
    }

    const valStr = String(value);

    // 1. Authoritative MySQL Upsert
    if (getIsDbConnected()) {
      try {
        await query(
          'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
          [key, valStr]
        );
        return success(res, { key, value: valStr }, `Setting '${key}' updated successfully in MySQL database.`);
      } catch (dbErr) {
        console.warn('MySQL updateSetting error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    if (!store.settings || store.settings.length === 0) {
      store.settings = [...DEFAULT_SETTINGS];
    }

    const item = store.settings.find(s => s.key === key);
    if (item) {
      item.value = valStr;
    } else {
      store.settings.push({
        id: store.settings.length + 1,
        key,
        value: valStr,
        description: `Custom configured key: ${key}`
      });
    }

    saveStore();
    return success(res, { key, value: valStr }, `Setting '${key}' updated successfully.`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings,
  updateSetting
};
