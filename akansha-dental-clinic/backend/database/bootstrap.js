/**
 * Automated Database Bootstrapper & One-Time Migration Engine
 * Ensures MySQL schema exists and imports initial records from persistent clinic store.
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const DATA_PATH = path.join(__dirname, 'clinic_data.json');
const TEMPLATE_PATH = path.join(__dirname, 'clinic_data.template.json');

/**
 * Bootstrap MySQL Database with schema and one-time data import
 * @param {import('mysql2/promise').Connection} connection 
 */
async function bootstrapDatabase(connection) {
  try {
    console.log('🔄 [DB Bootstrap] Verifying MySQL schema and constraints...');

    // 1. Run Schema DDL
    if (fs.existsSync(SCHEMA_PATH)) {
      const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
      // Split on semicolon, omitting DELIMITER or empty lines
      const statements = schemaSql
        .split(/;\s*[\r\n]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.toUpperCase().startsWith('USE ') && !s.toUpperCase().startsWith('CREATE DATABASE '));

      for (const sql of statements) {
        try {
          await connection.query(sql);
        } catch (stmtErr) {
          // If table or index exists, continue
          if (!stmtErr.message.includes('already exists') && !stmtErr.message.includes('Duplicate key')) {
            console.warn('   Bootstrap statement notice:', stmtErr.message.slice(0, 100));
          }
        }
      }
    }

    // 2. Ensure Roles Table
    try {
      const [roleRows] = await connection.query('SELECT COUNT(*) as count FROM roles');
      if (roleRows[0].count === 0) {
        console.log('🌱 [DB Bootstrap] Populating system security roles...');
        await connection.query(`
          INSERT INTO roles (id, name, description) VALUES
          (1, 'SUPER_ADMIN', 'Full clinical system and financial authority'),
          (2, 'ADMIN', 'Clinical doctor or operations manager'),
          (3, 'STAFF', 'Front-desk reception, appointment caller and inquiry coordinator')
          ON DUPLICATE KEY UPDATE name=name
        `);
      }
    } catch (err) {
      console.warn('Roles seed notice:', err.message);
    }

    // 3. Ensure Initial Super Admin in MySQL
    try {
      const [adminRows] = await connection.query('SELECT COUNT(*) as count FROM admins WHERE role = "SUPER_ADMIN"');
      if (adminRows[0].count === 0) {
        const email = (process.env.ADMIN_INITIAL_EMAIL || 'admin@akanshadental.com').trim().toLowerCase();
        const rawPassword = process.env.ADMIN_INITIAL_PASSWORD || 'SuperAdmin@Akansha2026!Secured';
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(rawPassword, salt);

        console.log(`🛡️ [DB Bootstrap] Initializing Super Admin in MySQL (${email})...`);
        await connection.query(
          `INSERT INTO admins (full_name, username, email, password_hash, phone, role, is_active)
           VALUES (?, ?, ?, ?, ?, 'SUPER_ADMIN', TRUE)
           ON DUPLICATE KEY UPDATE full_name=VALUES(full_name)`,
          ['Dr. Akansha Sharma (Chief Director)', email, email, hash, '+91 8130 406 405']
        );
      }
    } catch (err) {
      console.warn('Super Admin seed notice:', err.message);
    }

    // Load initial source data (from clinic_data.json or template)
    let sourceData = null;
    if (fs.existsSync(DATA_PATH)) {
      try {
        sourceData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
      } catch (e) {
        // ignore
      }
    }
    if (!sourceData && fs.existsSync(TEMPLATE_PATH)) {
      try {
        sourceData = JSON.parse(fs.readFileSync(TEMPLATE_PATH, 'utf8'));
      } catch (e) {
        // ignore
      }
    }

    if (!sourceData) {
      console.log('ℹ️ [DB Bootstrap] No local JSON file found for initial import.');
      return;
    }

    // 4. One-Time Import: Doctors & Schedules
    try {
      const [docRows] = await connection.query('SELECT COUNT(*) as count FROM doctors');
      if (docRows[0].count === 0 && Array.isArray(sourceData.doctors) && sourceData.doctors.length > 0) {
        console.log(`🩺 [DB Bootstrap] Importing ${sourceData.doctors.length} doctors into MySQL...`);
        for (const doc of sourceData.doctors) {
          const docName = doc.fullName || doc.name || 'Specialist Doctor';
          const [insertResult] = await connection.query(
            `INSERT INTO doctors (id, name, qualification, specialization, experience_years, consultation_fee, bio, image_url, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name=VALUES(name)`,
            [
              doc.id,
              docName,
              doc.qualification || 'BDS, MDS',
              doc.specialization || 'Dental Surgeon',
              doc.experienceYears || doc.experience_years || 5,
              doc.consultationFee !== undefined ? doc.consultationFee : (doc.consultation_fee || 500),
              doc.bio || '',
              doc.imageUrl || doc.image_url || null,
              doc.isActive !== false && doc.is_active !== false && doc.active !== false
            ]
          );

          // Insert Schedules
          if (Array.isArray(doc.schedules)) {
            for (const sched of doc.schedules) {
              const dayStr = (sched.dayOfWeek || sched.day_of_week || 'MONDAY').toUpperCase();
              const dayMap = { MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6, SUNDAY: 7 };
              const dayNum = dayMap[dayStr] || 1;

              // Convert e.g. '10:00 AM' to '10:00:00'
              const convertToTime24 = (tStr) => {
                if (!tStr) return '09:00:00';
                const m = tStr.trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
                if (!m) return '09:00:00';
                let h = parseInt(m[1], 10);
                const min = m[2];
                const mod = m[3] || 'AM';
                if (mod === 'PM' && h !== 12) h += 12;
                if (mod === 'AM' && h === 12) h = 0;
                return `${h < 10 ? '0' + h : h}:${min}:00`;
              };

              const startTime24 = convertToTime24(sched.startTime || sched.start_time);
              const endTime24 = convertToTime24(sched.endTime || sched.end_time);

              await connection.query(
                `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available)
                 VALUES (?, ?, ?, ?, ?)`,
                [doc.id, dayNum, startTime24, endTime24, sched.is_available !== false && sched.available !== false]
              );
            }
          }
        }
      }
    } catch (err) {
      console.warn('Doctors import notice:', err.message);
    }

    // 5. One-Time Import: Services Catalog
    try {
      const [srvRows] = await connection.query('SELECT COUNT(*) as count FROM services');
      if (srvRows[0].count === 0 && Array.isArray(sourceData.services) && sourceData.services.length > 0) {
        console.log(`🦷 [DB Bootstrap] Importing ${sourceData.services.length} services into MySQL...`);
        for (const srv of sourceData.services) {
          await connection.query(
            `INSERT INTO services (id, name, category, base_price, duration_minutes, description, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name=VALUES(name)`,
            [
              srv.id,
              srv.name,
              srv.category || 'General Dentistry',
              srv.price !== undefined ? srv.price : (srv.base_price || 399),
              srv.durationMinutes || srv.duration_minutes || 30,
              srv.description || '',
              srv.isActive !== false && srv.is_active !== false && srv.active !== false
            ]
          );
        }
      }
    } catch (err) {
      console.warn('Services import notice:', err.message);
    }

    // 6. One-Time Import: Clinic Settings
    try {
      const [settingsRows] = await connection.query('SELECT COUNT(*) as count FROM settings');
      if (settingsRows[0].count === 0 && Array.isArray(sourceData.settings) && sourceData.settings.length > 0) {
        console.log(`⚙️ [DB Bootstrap] Importing clinic settings into MySQL...`);
        for (const set of sourceData.settings) {
          await connection.query(
            `INSERT INTO settings (setting_key, setting_value, description)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)`,
            [set.key, String(set.value), set.description || '']
          );
        }
      }
    } catch (err) {
      console.warn('Settings import notice:', err.message);
    }

    // 7. One-Time Import: Existing Patients
    try {
      const [patRows] = await connection.query('SELECT COUNT(*) as count FROM patients');
      if (patRows[0].count === 0 && Array.isArray(sourceData.patients) && sourceData.patients.length > 0) {
        console.log(`👥 [DB Bootstrap] One-time import: migrating ${sourceData.patients.length} existing patients into MySQL...`);
        for (const p of sourceData.patients) {
          const patName = p.fullName || p.full_name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient';
          await connection.query(
            `INSERT INTO patients (id, full_name, phone, email, address, blood_group, medical_history)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE full_name=VALUES(full_name)`,
            [
              p.id,
              patName,
              p.phone,
              p.email || null,
              p.address || 'Not recorded',
              p.bloodGroup || p.blood_group || 'Not recorded',
              p.medicalHistory || p.medical_history || 'Not recorded'
            ]
          );
        }
      }
    } catch (err) {
      console.warn('Patients import notice:', err.message);
    }

    // 8. One-Time Import: Existing Appointments
    try {
      const [apptRows] = await connection.query('SELECT COUNT(*) as count FROM appointments');
      if (apptRows[0].count === 0 && Array.isArray(sourceData.appointments) && sourceData.appointments.length > 0) {
        console.log(`📅 [DB Bootstrap] One-time import: migrating ${sourceData.appointments.length} existing appointments into MySQL...`);
        for (const a of sourceData.appointments) {
          const ref = a.bookingReference || a.booking_reference || a.appointmentNumber || a.appointmentCode || `APT-2026-${a.id}`;
          const patId = a.patientId || a.patient_id || 1;
          const docId = a.doctorId || a.doctor_id || 0;
          const srvId = a.serviceId || a.service_id || 100;
          const apptDate = a.appointmentDate || a.appointment_date;
          const slot = a.timeSlot || a.time_slot;
          const status = a.status || 'PENDING';
          const price = a.totalPrice || a.total_price || a.servicePrice || 399;
          const notes = a.notes || null;

          if (apptDate && slot) {
            await connection.query(
              `INSERT INTO appointments (id, booking_reference, patient_id, doctor_id, service_id, appointment_date, time_slot, status, total_price, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE status=VALUES(status)`,
              [a.id, ref, patId, docId, srvId, apptDate, slot, status, price, notes]
            );
          }
        }
      }
    } catch (err) {
      console.warn('Appointments import notice:', err.message);
    }

    console.log('✅ [DB Bootstrap] MySQL database initialized and ready for production.');
  } catch (err) {
    console.error('❌ [DB Bootstrap Error]:', err.message);
  }
}

module.exports = {
  bootstrapDatabase
};
