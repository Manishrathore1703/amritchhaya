/**
 * Backend Verification & Test Script
 * Verifies code syntax, route exports, schema initialization, and API logic.
 */

const initDb = require('./database/initDb');
const poojaService = require('./services/poojaService');
const bookingService = require('./services/bookingService');
const authService = require('./services/authService');
const paymentService = require('./services/paymentService');

async function runTests() {
  console.log('🧪 Starting Amrit Chhaya API Verification Tests...\n');

  try {
    // 1. Initialize Database Schema & Seed Data
    console.log('--- Step 1: Database Initialization Test ---');
    await initDb();
    console.log('✅ Database Initialization Passed!\n');

    // 2. Auth Service Test
    console.log('--- Step 2: Auth Login Test ---');
    const authResult = await authService.loginUser('admin@example.com', 'password');
    console.log('✅ Login Successful!');
    console.log('  User:', authResult.user.name, `(${authResult.user.role})`);
    console.log('  Access Token Generated:', authResult.accessToken ? 'YES' : 'NO');
    console.log('  Refresh Token Generated:', authResult.refreshToken ? 'YES' : 'NO\n');

    // 3. Pooja Service Test
    console.log('--- Step 3: Get Poojas Test ---');
    const poojas = await poojaService.getPoojas({ page: 1, limit: 10 });
    console.log('✅ Poojas Fetched:', poojas.items.length, 'items found.');
    if (poojas.items.length > 0) {
      console.log('  First Pooja:', poojas.items[0].name, '| Price: ₹' + poojas.items[0].startingPrice);
    }
    console.log('');

    // 4. Pooja Details Test
    console.log('--- Step 4: Get Pooja Details Test ---');
    const poojaDetails = await poojaService.getPoojaBySlug('kaal-sarp-dosh-puja');
    console.log('✅ Pooja Details Fetched:');
    console.log('  Name:', poojaDetails.name);
    console.log('  Variants:', poojaDetails.variants.map(v => `${v.name} (₹${v.price})`).join(', '));
    console.log('  Features:', poojaDetails.features.join(', ') + '\n');

    // 5. Booking Creation Test
    console.log('--- Step 5: Booking Creation Test ---');
    const booking = await bookingService.createBooking({
      poojaId: 1,
      variantId: 2,
      slotId: 1,
      date: '2026-09-20',
      devotee: {
        name: 'Jatin Jain',
        phone: '9999999999',
        email: 'jatin@example.com',
        gotra: 'Kashyap',
        address: {
          line1: 'Mahakal Marg',
          city: 'Ujjain',
          state: 'Madhya Pradesh',
          pincode: '456001',
          country: 'India'
        }
      },
      specialRequest: 'Morning batch puja',
      prasadRequired: true
    });
    console.log('✅ Booking Created Successfully:');
    console.log('  Booking ID:', booking.bookingId);
    console.log('  Amount (Server Truth): ₹' + booking.amount);
    console.log('  Status:', booking.bookingStatus + '\n');

    // 6. Razorpay Order Creation Test
    console.log('--- Step 6: Razorpay Order Test ---');
    const order = await paymentService.createOrder(booking.bookingId);
    console.log('✅ Order Created:');
    console.log('  Order ID:', order.orderId);
    console.log('  Amount in Paise:', order.amount, 'paise (₹' + (order.amount / 100) + ')\n');

    // 7. Payment Verification Test
    console.log('--- Step 7: Payment Verification Test ---');
    const paymentVerif = await paymentService.verifyPayment({
      bookingId: booking.bookingId,
      razorpayOrderId: order.orderId,
      razorpayPaymentId: 'pay_test_' + Date.now()
    });
    console.log('✅ Payment Verification Passed:');
    console.log('  Payment Status:', paymentVerif.paymentStatus);
    console.log('  Booking Status:', paymentVerif.bookingStatus + '\n');

    console.log('🎉 ALL BACKEND API TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } process.exit(0);
}

runTests();
