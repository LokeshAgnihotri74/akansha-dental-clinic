const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const { testConnection, getIsDbConnected } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const patientRoutes = require('./routes/patientRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const auditRoutes = require('./routes/auditRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow local development, vercel/netlify previews, and production domains
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// System Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Akansha Dental Clinic REST API',
    version: '1.0.0',
    database: getIsDbConnected() ? 'CONNECTED' : 'STANDBY_MEMORY_FALLBACK',
    timestamp: new Date().toISOString()
  });
});

// Mount API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/admins', adminRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server and Test Database Connection
const startServer = async () => {
  await testConnection();

  return app.listen(PORT, () => {
    console.log(`\n===========================================================`);
    console.log(`🏥 AKANSHA DENTAL CLINIC & IMPLANT CENTER — REST API`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`📡 Healthcheck:      http://localhost:${PORT}/api/health`);
    console.log(`🔗 Frontend Proxy:   http://localhost:5173/api/v1`);
    console.log(`===========================================================\n`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
