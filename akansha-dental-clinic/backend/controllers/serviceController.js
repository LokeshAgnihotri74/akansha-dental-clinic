const { query, getIsDbConnected } = require('../config/db');
const { getStore, saveStore } = require('../database/store');
const { success, error } = require('../utils/responseHelper');

const normalizeService = (s) => ({
  id: s.id,
  name: s.name,
  category: s.category || 'General Dentistry',
  price: s.price !== undefined ? s.price : (s.base_price || 399),
  base_price: s.base_price !== undefined ? s.base_price : (s.price || 399),
  durationMinutes: s.durationMinutes || s.duration_minutes || 30,
  duration_minutes: s.duration_minutes || s.durationMinutes || 30,
  description: s.description || '',
  active: s.active !== undefined ? s.active : (s.is_active !== undefined ? s.is_active : true),
  is_active: s.is_active !== undefined ? s.is_active : (s.active !== undefined ? s.active : true)
});

const getServices = async (req, res, next) => {
  try {
    const activeOnly = req.query.activeOnly !== 'false';

    // 1. Authoritative MySQL Read
    if (getIsDbConnected()) {
      try {
        const whereClause = activeOnly ? 'WHERE is_active = TRUE' : '';
        const rows = await query(`SELECT * FROM services ${whereClause} ORDER BY id ASC`);
        const list = (rows || []).map(normalizeService);
        return success(res, list, 'Dental services catalog retrieved from MySQL database.');
      } catch (dbErr) {
        console.warn('MySQL getServices error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    let list = (store.services || []).map(normalizeService);

    if (activeOnly) {
      list = list.filter(s => s.active);
    }

    return success(res, list, 'Dental services catalog retrieved.');
  } catch (err) {
    next(err);
  }
};

const getServiceById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    // 1. Authoritative MySQL Read
    if (getIsDbConnected()) {
      try {
        const rows = await query('SELECT * FROM services WHERE id = ? LIMIT 1', [id]);
        if (!rows || rows.length === 0) return error(res, `Service #${id} not found`, 404);
        return success(res, normalizeService(rows[0]), 'Treatment details retrieved from MySQL database.');
      } catch (dbErr) {
        console.warn('MySQL getServiceById error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const service = store.services.find(s => s.id === id);
    if (!service) return error(res, `Service #${id} not found`, 404);
    return success(res, normalizeService(service), 'Treatment details retrieved.');
  } catch (err) {
    next(err);
  }
};

const createService = async (req, res, next) => {
  try {
    const { name, category, price, base_price, durationMinutes, duration_minutes, description } = req.body;
    if (!name) return error(res, 'Service name is required', 400);

    const finalPrice = parseFloat(price !== undefined ? price : (base_price || 399));
    const finalDuration = parseInt(durationMinutes !== undefined ? durationMinutes : (duration_minutes || 30), 10);
    const finalCat = category || 'General Dentistry';

    // 1. Authoritative MySQL Insert
    if (getIsDbConnected()) {
      try {
        const result = await query(
          'INSERT INTO services (name, category, base_price, duration_minutes, description, is_active) VALUES (?, ?, ?, ?, ?, TRUE)',
          [name, finalCat, finalPrice, finalDuration, description || '']
        );
        const rows = await query('SELECT * FROM services WHERE id = ?', [result.insertId]);
        return success(res, normalizeService(rows[0]), 'Treatment added to MySQL catalog.', 201);
      } catch (dbErr) {
        console.warn('MySQL createService error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const newId = store.services.length > 0 ? Math.max(...store.services.map(s => s.id)) + 1 : 1;

    const newService = {
      id: newId,
      name,
      category: finalCat,
      price: finalPrice,
      base_price: finalPrice,
      durationMinutes: finalDuration,
      duration_minutes: finalDuration,
      description: description || '',
      active: true,
      is_active: true
    };

    store.services.push(newService);
    saveStore();

    return success(res, normalizeService(newService), 'Treatment added to catalog.', 201);
  } catch (err) {
    next(err);
  }
};

const updateService = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, category, price, base_price, durationMinutes, duration_minutes, description, isActive, is_active, active } = req.body;

    // 1. Authoritative MySQL Update
    if (getIsDbConnected()) {
      try {
        const existing = await query('SELECT * FROM services WHERE id = ?', [id]);
        if (!existing || existing.length === 0) return error(res, `Service #${id} not found`, 404);

        const newActive = isActive !== undefined ? isActive : (is_active !== undefined ? is_active : active);

        await query(
          `UPDATE services 
           SET name = COALESCE(?, name),
               category = COALESCE(?, category),
               base_price = COALESCE(?, base_price),
               duration_minutes = COALESCE(?, duration_minutes),
               description = COALESCE(?, description),
               is_active = COALESCE(?, is_active)
           WHERE id = ?`,
          [
            name || null,
            category || null,
            price !== undefined ? price : (base_price !== undefined ? base_price : null),
            durationMinutes !== undefined ? durationMinutes : (duration_minutes !== undefined ? duration_minutes : null),
            description !== undefined ? description : null,
            newActive !== undefined ? Boolean(newActive) : null,
            id
          ]
        );

        const rows = await query('SELECT * FROM services WHERE id = ?', [id]);
        return success(res, normalizeService(rows[0]), 'Treatment updated in MySQL database.');
      } catch (dbErr) {
        console.warn('MySQL updateService error:', dbErr.message);
      }
    }

    // 2. Local memory fallback
    const store = getStore();
    const service = store.services.find(s => s.id === id);
    if (!service) return error(res, `Service #${id} not found`, 404);

    Object.assign(service, req.body);
    saveStore();

    return success(res, normalizeService(service), 'Treatment updated.');
  } catch (err) {
    next(err);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (getIsDbConnected()) {
      try {
        await query('UPDATE services SET is_active = NOT is_active WHERE id = ?', [id]);
        const rows = await query('SELECT * FROM services WHERE id = ?', [id]);
        return success(res, normalizeService(rows[0]), 'Treatment status toggled in MySQL.');
      } catch (dbErr) {
        console.warn('MySQL toggleStatus error:', dbErr.message);
      }
    }

    const store = getStore();
    const service = store.services.find(s => s.id === id);
    if (!service) return error(res, `Service #${id} not found`, 404);

    service.active = !service.active;
    service.is_active = service.active;
    saveStore();

    return success(res, normalizeService(service), 'Treatment status toggled.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  toggleStatus
};
