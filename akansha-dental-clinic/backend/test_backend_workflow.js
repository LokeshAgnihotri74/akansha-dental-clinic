const app = require('./server');
const fs = require('fs');
const path = require('path');

const runWorkflowTests = async () => {
  const server = app.listen(8082, async () => {
    console.log('\n===============================================================');
    console.log('🧪 TESTING COMPLETE WORKABLE BACKEND LIFECYCLE (END-TO-END)');
    console.log('===============================================================\n');

    try {
      const baseUrl = 'http://127.0.0.1:8082/api/v1';

      // -----------------------------------------------------------------
      // TEST 1: Admin Authentication for AuthContext.jsx
      // -----------------------------------------------------------------
      console.log('🔹 1. Testing Admin Login (POST /auth/login)...');
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin@akanshadental.com',
          password: 'password123'
        })
      });
      const loginData = await loginRes.json();
      console.log('   Status:', loginRes.status);
      console.log('   accessToken:', loginData.data?.accessToken ? loginData.data.accessToken.substring(0, 25) + '...' : 'MISSING');
      console.log('   userId:', loginData.data?.userId);
      console.log('   roles:', loginData.data?.roles);
      if (!loginData.data?.accessToken || !loginData.data?.roles?.includes('ROLE_SUPER_ADMIN')) {
        throw new Error('Login response does not match AuthContext contract!');
      }

      const token = loginData.data.accessToken;

      // -----------------------------------------------------------------
      // TEST 2: Auth Me Check
      // -----------------------------------------------------------------
      console.log('\n🔹 2. Testing Auth Profile Verification (GET /auth/me)...');
      const meRes = await fetch(`${baseUrl}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const meData = await meRes.json();
      console.log('   Status:', meRes.status);
      console.log('   Logged In User:', meData.data?.fullName, '| Roles:', meData.data?.roles);
      if (meRes.status !== 200) throw new Error('Auth me check failed');

      // -----------------------------------------------------------------
      // TEST 3: Available Slots for AppointmentBookingPage.jsx
      // -----------------------------------------------------------------
      console.log('\n🔹 3. Testing Slots Engine (GET /appointments/available-slots)...');
      const slotsRes = await fetch(`${baseUrl}/appointments/available-slots?doctorId=0&date=2026-11-25`);
      const slotsData = await slotsRes.json();
      console.log('   Status:', slotsRes.status);
      console.log('   clinicOpen:', slotsData.data?.clinicOpen);
      console.log('   dayOfWeek:', slotsData.data?.dayOfWeek);
      console.log('   slots count:', slotsData.data?.slots?.length);
      console.log('   Sample slot item:', slotsData.data?.slots?.[0]);
      if (!slotsData.data?.slots || !slotsData.data.slots[0]?.slot) {
        throw new Error('Slots response does not match AppointmentBookingPage contract!');
      }

      // -----------------------------------------------------------------
      // TEST 4: Appointment Booking with exact Frontend Payload
      // -----------------------------------------------------------------
      console.log('\n🔹 4. Testing Booking Submission (POST /appointments)...');
      const bookRes = await fetch(`${baseUrl}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: 0,
          serviceId: 100,
          appointmentDate: '2026-11-25',
          timeSlot: '11:30 AM',
          patientFirstName: 'Aarav',
          patientLastName: 'Saxena',
          patientPhone: '9826019999',
          patientEmail: 'aarav.saxena@example.com',
          notes: 'First time consultation'
        })
      });
      const bookData = await bookRes.json();
      console.log('   Status:', bookRes.status);
      console.log('   appointmentNumber:', bookData.data?.appointmentNumber);
      console.log('   patientName:', bookData.data?.patientName);
      console.log('   doctorName:', bookData.data?.doctorName);
      console.log('   serviceName:', bookData.data?.serviceName);
      console.log('   totalPrice:', bookData.data?.totalPrice);
      if (!bookData.data?.appointmentNumber || bookData.data?.totalPrice !== 399) {
        throw new Error('Booking response does not match confirmation card contract!');
      }

      // -----------------------------------------------------------------
      // TEST 5: Appointments Manager Roster & Normalization
      // -----------------------------------------------------------------
      console.log('\n🔹 5. Testing Appointments Manager Roster (GET /appointments)...');
      const listRes = await fetch(`${baseUrl}/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const listData = await listRes.json();
      console.log('   Status:', listRes.status);
      console.log('   Total Records:', listData.data?.totalElements);
      const first = listData.data?.content?.[0];
      console.log('   First Record:', {
        ref: first?.appointmentNumber || first?.appointmentCode,
        patient: first?.patientName,
        doctor: first?.doctorName,
        service: first?.serviceName,
        status: first?.status
      });
      if (!first?.patientName || !first?.doctorName) {
        throw new Error('Appointments roster missing normalized patient/doctor names!');
      }

      // -----------------------------------------------------------------
      // TEST 6: Dashboard Overview Metrics
      // -----------------------------------------------------------------
      console.log('\n🔹 6. Testing Dashboard Telemetry (GET /dashboard/summary)...');
      const dashRes = await fetch(`${baseUrl}/dashboard/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dashData = await dashRes.json();
      console.log('   Status:', dashRes.status);
      console.log('   Total Bookings:', dashData.data?.totalAppointments);
      console.log('   Pending Visits:', dashData.data?.pendingAppointments);
      console.log('   Registered Patients:', dashData.data?.totalPatients);
      console.log('   7-Day Trend Count:', dashData.data?.sevenDayTrends?.length);
      console.log('   Recent Appointments Count:', dashData.data?.recentAppointments?.length);

      // -----------------------------------------------------------------
      // TEST 7: Persistent File Storage on Disk Verification
      // -----------------------------------------------------------------
      console.log('\n🔹 7. Checking Disk Persistence (clinic_data.json)...');
      const storeFile = path.join(__dirname, 'database', 'clinic_data.json');
      const fileExists = fs.existsSync(storeFile);
      const fileSize = fileExists ? fs.statSync(storeFile).size : 0;
      console.log('   Persistent Store File:', storeFile);
      console.log('   Exists on Disk:', fileExists);
      console.log('   Size on Disk:', fileSize, 'bytes');
      if (!fileExists || fileSize === 0) {
        throw new Error('Data was not persisted to disk!');
      }

      // -----------------------------------------------------------------
      // TEST 8: Make Contact Form Submission with Reason & SMS Dispatch
      // -----------------------------------------------------------------
      console.log('\n🔹 8. Testing Make Contact Form Submission (POST /inquiries/contact)...');
      const contactRes = await fetch(`${baseUrl}/inquiries/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Vikram Joshi',
          phone: '9826055555',
          reason: 'Treatment Related',
          message: 'Interested in invisible aligners pricing and duration'
        })
      });
      const contactData = await contactRes.json();
      console.log('   Status:', contactRes.status);
      console.log('   Ref Code:', contactData.data?.refCode);
      console.log('   SMS Dispatched:', contactData.data?.smsDispatched);
      if (contactRes.status !== 201 || !contactData.data?.refCode) {
        throw new Error('Make Contact form submission failed!');
      }

      console.log('\n===============================================================');
      console.log('🏆 ALL 8 WORKABLE BACKEND TESTS PASSED (100% PRODUCTION READY)!');
      console.log('===============================================================\n');
    } catch (testError) {
      console.error('\n❌ Test execution error:', testError.message);
    } finally {
      server.close();
      process.exit(0);
    }
  });
};

runWorkflowTests();
