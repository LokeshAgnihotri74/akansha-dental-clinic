const { query, getIsDbConnected } = require('../config/db');
const { success, error } = require('../utils/responseHelper');

let memoryServices = [
  {
    id: 100,
    name: 'General Dental Checkup & Consultation',
    category: 'Diagnostic & Preventative',
    base_price: 399.00,
    duration_minutes: 30,
    description: 'Comprehensive intraoral examination, digital X-ray screening, periodontal health score, and tailored treatment planning.',
    is_active: true
  },
  {
    id: 1,
    name: 'Immediate Dental Implants',
    category: 'Implantology & Surgery',
    base_price: 32990.00,
    duration_minutes: 60,
    description: 'Same-day precision implants, biological integration, and custom zirconia natural-feel crowns.',
    is_active: true
  },
  {
    id: 2,
    name: 'Single-Visit Root Canal Treatment',
    category: 'Endodontics',
    base_price: 3500.00,
    duration_minutes: 45,
    description: 'Rotary microscopic cleaning, painless apex locator disinfection, and hermetic bio-ceramic seal.',
    is_active: true
  },
  {
    id: 3,
    name: 'Clear Aligners & Invisible Braces',
    category: 'Orthodontics',
    base_price: 7000.00,
    duration_minutes: 40,
    description: 'Custom 3D scanned transparent aligners for discreet, comfortable teeth straightening.',
    is_active: true
  },
  {
    id: 4,
    name: 'Deep Teeth Cleaning & Ultrasonic Scaling',
    category: 'Preventive Dentistry',
    base_price: 1499.00,
    duration_minutes: 30,
    description: 'Removal of dental plaque, tartar, coffee/tobacco stains, and enamel fluoride polish.',
    is_active: true
  },
  {
    id: 5,
    name: 'Composite Aesthetic Tooth Fillings',
    category: 'Cosmetic Dentistry',
    base_price: 1200.00,
    duration_minutes: 30,
    description: 'Invisible tooth-colored bio-compatible resin restorations matching your natural tooth shade.',
    is_active: true
  },
  {
    id: 6,
    name: 'Wisdom Tooth Painless Extraction',
    category: 'Oral Surgery',
    base_price: 2500.00,
    duration_minutes: 45,
    description: 'Atraumatic surgical removal of impacted wisdom teeth with quick-healing socket preservation.',
    is_active: true
  },
  {
    id: 7,
    name: 'Full Mouth Rehabilitation',
    category: 'Advanced Prosthodontics',
    base_price: 45000.00,
    duration_minutes: 90,
    description: 'Complete structural restoration of severely worn, broken, or missing teeth with precision crowns.',
    is_active: true
  }
];

let nextServiceId = 8;

const getServices = async (req, res, next) => {
  try {
    const activeOnly = req.query.activeOnly !== 'false';
    let services = memoryServices;

    if (getIsDbConnected()) {
      try {
        let sql = 'SELECT * FROM services';
        if (activeOnly) sql += ' WHERE is_active = TRUE';
        sql += ' ORDER BY id ASC';
        const rows = await query(sql);
        if (rows && rows.length > 0) services = rows;
      } catch (err) {
        console.warn('DB getServices error:', err.message);
      }
    }

    if (activeOnly) {
      services = services.filter(s => s.is_active);
    }

    return success(res, services, 'Dental services catalog retrieved.');
  } catch (err) {
    next(err);
  }
};

const getServiceById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const service = memoryServices.find(s => s.id === id);
    if (!service) return error(res, `Service #${id} not found`, 404);
    return success(res, service, 'Treatment details retrieved.');
  } catch (err) {
    next(err);
  }
};

const createService = async (req, res, next) => {
  try {
    const { name, category, base_price, duration_minutes, description } = req.body;
    if (!name) return error(res, 'Service name is required', 400);

    const newService = {
      id: nextServiceId++,
      name,
      category: category || 'General Dentistry',
      base_price: parseFloat(base_price) || 0.00,
      duration_minutes: parseInt(duration_minutes, 10) || 30,
      description: description || '',
      is_active: true
    };

    memoryServices.push(newService);
    return success(res, newService, 'Treatment added to catalog.', 201);
  } catch (err) {
    next(err);
  }
};

const updateService = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const service = memoryServices.find(s => s.id === id);
    if (!service) return error(res, `Service #${id} not found`, 404);

    Object.assign(service, req.body);
    return success(res, service, 'Treatment updated.');
  } catch (err) {
    next(err);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const service = memoryServices.find(s => s.id === id);
    if (!service) return error(res, `Service #${id} not found`, 404);

    service.is_active = !service.is_active;
    return success(res, service, `Service status toggled to ${service.is_active ? 'Active' : 'Inactive'}.`);
  } catch (err) {
    next(err);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    memoryServices = memoryServices.filter(s => s.id !== id);
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
