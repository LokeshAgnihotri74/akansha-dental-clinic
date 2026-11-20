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
    const store = getStore();

    if (!name) return error(res, 'Service name is required', 400);

    const newId = store.services.length > 0 ? Math.max(...store.services.map(s => s.id)) + 1 : 1;
    const finalPrice = parseFloat(price !== undefined ? price : (base_price || 399));
    const finalDuration = parseInt(durationMinutes !== undefined ? durationMinutes : (duration_minutes || 30), 10);

    const newService = {
      id: newId,
      name,
      category: category || 'General Dentistry',
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
    const store = getStore();
    const service = store.services.find(s => s.id === id);
    if (!service) return error(res, `Service #${id} not found`, 404);

    service.active = !service.active;
    service.is_active = service.active;
    saveStore();

    return success(res, normalizeService(service), `Service status toggled.`);
  } catch (err) {
    next(err);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const store = getStore();

    store.services = store.services.filter(s => s.id !== id);
    saveStore();

    return success(res, null, `Service #${id} deleted.`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  toggleStatus,
  deleteService
};
