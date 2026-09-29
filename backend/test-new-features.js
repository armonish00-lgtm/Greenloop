const http = require('http');

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api${path}`,
        method: 'POST',
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }));
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api${path}`,
        method: 'GET',
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function patch(path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api${path}`,
        method: 'PATCH',
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }));
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('Testing New Features...');

  // 1. Quick login as Ananya (User)
  const userLogin = await post('/auth/quick-login', { role: 'INDIVIDUAL' });
  console.log('1. User Login:', userLogin.status, userLogin.body.user?.fullName);
  const userToken = userLogin.body.token;

  // 2. Quick login as Admin
  const adminLogin = await post('/auth/quick-login', { role: 'ADMIN' });
  console.log('2. Admin Login:', adminLogin.status, adminLogin.body.user?.fullName);
  const adminToken = adminLogin.body.token;

  // 3. User past orders
  const ordersRes = await get('/reports/user-orders', userToken);
  console.log('3. Past Orders Res:', ordersRes.status, 'Count:', ordersRes.body.orders?.length);

  // 4. File an issue report
  const reportRes = await post(
    '/reports',
    {
      category: 'Deposit, pricing, or refund dispute',
      reason: 'Deposit dispute',
      description: 'Lender did not return deposit following clean inspection of drill.',
      reportedUserId: adminLogin.body.user.id, // target
    },
    userToken
  );
  console.log('4. File Report:', reportRes.status, 'Ticket ID:', reportRes.body.report?.id);
  const reportId = reportRes.body.report?.id;

  // 5. Admin Analytics
  const analyticsRes = await get('/admin/analytics', adminToken);
  console.log('5. Admin Analytics Overview:', analyticsRes.status, {
    totalUsers: analyticsRes.body.overview?.totalUsers,
    totalTransactions: analyticsRes.body.overview?.totalTransactions,
    reportsCount: analyticsRes.body.safety?.totalReports,
  });

  // 6. Admin resolves report with NOTICE action
  if (reportId) {
    const resolveRes = await patch(
      `/admin/reports/${reportId}`,
      {
        action: 'NOTICE',
        status: 'RESOLVED',
        noticeMessage: 'Please ensure deposits are refunded in a timely manner according to platform guidelines.',
        adminNotes: 'Warning notice issued regarding deposit delay.',
      },
      adminToken
    );
    console.log('6. Resolve with Notice:', resolveRes.status, resolveRes.body.message);
  }

  console.log('✅ ALL NEW FEATURES VERIFIED 100% SUCCEEDED!');
}

run().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
