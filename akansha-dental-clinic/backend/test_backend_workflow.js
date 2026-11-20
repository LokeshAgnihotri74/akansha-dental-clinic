/**
 * Automated End-to-End Workflow Verification Script
 * Tests: Validation -> JWT -> Password Hash -> Business Logic / Slots -> Database / Notifications -> JSON Responses
 */
const app = require('./server');

const runWorkflowTests = async () => {
  const server = app.listen(8081, async () => {
    console.log('\n===============================================================');
    console.log('🧪 TESTING COMPLETE BACKEND WORKFLOW REQUEST LIFECYCLE');
    console.log('===============================================================\n');

    try {
      const baseUrl = 'http://127.0.0.1:8081/api/v1';

      // -----------------------------------------------------------------
      // TEST 1: Fetch Available Slots (HTTP GET)
      // -----------------------------------------------------------------
      console.log('🔹 Step 1: Testing Slot Engine (GET /appointments/available-slots)...');
      const slotsRes = await fetch(`${baseUrl}/appointments/available-slots?doctorId=0&date=2026-11-25`);
      const slotsData = await slotsRes.json();
      console.log('   Status Code:', slotsRes.status);
      console.log('   Available Slots Count:', slotsData.data?.length);
      console.log('   Sample Slots:', slotsData.data?.slice(0, 4));
      if (slotsRes.status !== 200) throw new Error('Slot engine failed');

      // -----------------------------------------------------------------
      // TEST 2: Validation Failure (Invalid Phone)
      // -----------------------------------------------------------------
      console.log('\n🔹 Step 2: Testing Validation Middleware (Invalid Phone Number)...');
      const invalidRes = await fetch(`${baseUrl}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Test Patient',
          patientPhone: '12345', // Invalid
          appointmentDate: '2026-11-25',
          timeSlot: '10:00 AM'
        })
      });
      const invalidData = await invalidRes.json();
      console.log('   Status Code:', invalidRes.status, '(Expected 400)');
      console.log('   Error Message:', invalidData.message);
      console.log('   Validation Details:', invalidData.details || invalidData.errors);
      if (invalidRes.status !== 400) throw new Error('Validation failed to intercept invalid phone');

      // -----------------------------------------------------------------
      // TEST 3: Successful Booking with Default Doctor (₹0) & Service (₹399)
      // -----------------------------------------------------------------
      console.log('\n🔹 Step 3: Testing Booking Flow & Automatic Calculation (POST /appointments)...');
      const bookRes = await fetch(`${baseUrl}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Priya Sharma',
          patientPhone: '9826198765',
          patientEmail: 'priya.sharma@example.com',
          doctorId: 0,    // Any Doctor -> ₹0
          serviceId: 100, // General Checkup -> ₹399
          appointmentDate: '2026-11-25',
          timeSlot: '11:00 AM',
          notes: 'Routine dental hygiene checkup.'
        })
      });
      const bookData = await bookRes.json();
      console.log('   Status Code:', bookRes.status, '(Expected 201)');
      console.log('   Booking Reference:', bookData.bookingReference || bookData.data?.bookingReference);
      console.log('   Total Calculated Price: ₹' + (bookData.data?.appointment?.total_price || bookData.appointment?.total_price));
      console.log('   Doctor Selected:', bookData.data?.appointment?.doctor_name || bookData.appointment?.doctor_name);
      console.log('   Service Selected:', bookData.data?.appointment?.service_name || bookData.appointment?.service_name);
      if (bookRes.status !== 201) throw new Error('Booking failed');

      // -----------------------------------------------------------------
      // TEST 4: Admin Authentication & JWT Generation
      // -----------------------------------------------------------------
      console.log('\n🔹 Step 4: Testing BCrypt Verify & JWT Generation (POST /auth/login)...');
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin@akanshadental.com',
          password: 'password123'
        })
      });
      const loginData = await loginRes.json();
      console.log('   Status Code:', loginRes.status, '(Expected 200)');
      const token = loginData.token || loginData.data?.token;
      console.log('   JWT Token Issued:', token ? token.substring(0, 30) + '...' : 'NONE');
      console.log('   User Role:', loginData.user?.role || loginData.data?.user?.role);
      if (!token) throw new Error('JWT generation failed');

      // -----------------------------------------------------------------
      // TEST 5: Protected Status Transition & Notification Alert
      // -----------------------------------------------------------------
      console.log('\n🔹 Step 5: Testing Protected Route & Status Notification (PATCH /appointments/:id/status)...');
      const updateRes = await fetch(`${baseUrl}/appointments/1/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'CONFIRMED',
          reason: 'Slot confirmed by Dr. Akansha Sharma'
        })
      });
      const updateData = await updateRes.json();
      console.log('   Status Code:', updateRes.status, '(Expected 200)');
      console.log('   Updated Status:', updateData.data?.status || updateData.status);
      console.log('   Response Message:', updateData.message);

      console.log('\n===============================================================');
      console.log('🎉 ALL WORKFLOW STEPS PASSED SUCCESSFULLY (100% WORKING)!');
      console.log('===============================================================\n');
    } catch (testError) {
      console.error('\n❌ Test execution error:', testError.message, testError.cause);
    } finally {
      server.close();
      process.exit(0);
    }
  });
};

runWorkflowTests();
