const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const https = require('https');
const serverless = require('serverless-http');

// Simple Mobile Demo Server
// - Serves login and home pages under /mobile/*
// - Runs on a different port than the API (default 3002)
// - On login, sets httpOnly cookies (EmpID, CompanyID) and redirects to /mobile/home

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static files (if we add any assets later)
app.use('/mobile/static', express.static(path.join(__dirname, 'static')));

// Helper to forward cookies to API server
function buildCookieHeader(req) {
  const c = req.cookies || {};
  const pairs = [];
  if (c.EmpID) pairs.push(`EmpID=${encodeURIComponent(c.EmpID)}`);
  if (c.empid) pairs.push(`empid=${encodeURIComponent(c.empid)}`);
  if (c.CompanyID) pairs.push(`CompanyID=${encodeURIComponent(c.CompanyID)}`);
  if (c.companyid) pairs.push(`companyid=${encodeURIComponent(c.companyid)}`);
  return pairs.join('; ');
}


// Redirect base to login for convenience
app.get(['/mobile', '/'], (req, res) => {
  res.redirect('/mobile/login');
});

app.get('/mobile/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/mobile/login', (req, res) => {
  try {
    const empid = (req.body.empid || '').trim();
    const companyid = (req.body.companyid || '').trim();

    if (!empid || !companyid) {
      return res.status(400).send(`
        <html>
          <head><title>Login Error</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Missing fields</h2>
            <p>Please provide both Emp ID and Company ID.</p>
            <p><a href="/mobile/login">Back to Login</a></p>
          </body>
        </html>
      `);
    }

    // Set httpOnly cookies so the backend can read them.
    // Note: Cookies are domain-scoped (not port-specific). These cookies will be available to the API server as well.
    const cookieOpts = {
      httpOnly: true,
      sameSite: 'none',
      secure: true, // enable when serving over HTTPS
      path: '/',
      // maxAge: 2 * 60 * 60 * 1000 // 2 hours (optional)
    };

    // Set both common casings to be extra-compatible with backend normalization
    res.cookie('EmpID', empid, cookieOpts);
    res.cookie('empid', empid, cookieOpts);
    res.cookie('CompanyID', companyid, cookieOpts);
    res.cookie('companyid', companyid, cookieOpts);

    res.redirect('/mobile/home');
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).send('Internal error while logging in.');
  }
});

app.get('/mobile/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});
// Profile pages
app.get('/mobile/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'));
});
app.get('/mobile/calendar', (req, res) => {
  res.sendFile(path.join(__dirname, 'calendar.html'));
});
app.get('/mobile/checkin', (req, res) => {
  res.sendFile(path.join(__dirname, 'checkin.html'));
});

// Workflow page
app.get('/mobile/workflow', (req, res) => {
  res.sendFile(path.join(__dirname, 'workflow.html'));
});
  app.get('/mobile/leave/transactions', (req, res) => {
    res.sendFile(path.join(__dirname, 'leave_transactions.html'));
  });
  app.get('/mobile/leave/details', (req, res) => {
    res.sendFile(path.join(__dirname, 'leave_details.html'));
  });

  // Document pages
  app.get('/mobile/document/transactions', (req, res) => {
    res.sendFile(path.join(__dirname, 'document_transactions.html'));
  });
  app.get('/mobile/document/details', (req, res) => {
    res.sendFile(path.join(__dirname, 'document_details.html'));
  });

  // Excuse pages
  app.get('/mobile/excuse/transactions', (req, res) => {
    res.sendFile(path.join(__dirname, 'excuse_transactions.html'));
  });
  app.get('/mobile/excuse/details', (req, res) => {
    res.sendFile(path.join(__dirname, 'excuse_details.html'));
  });
  
  // Reimbursement pages
  app.get('/mobile/reimbursement/transactions', (req, res) => {
    res.sendFile(path.join(__dirname, 'reimbursement_transactions.html'));
  });
  app.get('/mobile/reimbursement/details', (req, res) => {
    res.sendFile(path.join(__dirname, 'reimbursement_details.html'));
  });

// Flight Ticket pages
app.get('/mobile/flight/transactions', (req, res) => {
  res.sendFile(path.join(__dirname, 'flight_transactions.html'));
});
app.get('/mobile/flight/details', (req, res) => {
  res.sendFile(path.join(__dirname, 'flight_details.html'));
});

// Business Trip pages
app.get('/mobile/business/transactions', (req, res) => {
  res.sendFile(path.join(__dirname, 'business_transactions.html'));
});
app.get('/mobile/business/details', (req, res) => {
  res.sendFile(path.join(__dirname, 'business_details.html'));
});
// On-Behalf pages
app.get('/mobile/onbehalf/leave', (req, res) => {
  res.sendFile(path.join(__dirname, 'onbehalf_leave.html'));
});
app.get('/mobile/onbehalf/excuse', (req, res) => {
  res.sendFile(path.join(__dirname, 'onbehalf_excuse.html'));
});
app.get('/mobile/onbehalf/document', (req, res) => {
  res.sendFile(path.join(__dirname, 'onbehalf_document.html'));
});
app.get('/mobile/onbehalf/reimbursement', (req, res) => {
  res.sendFile(path.join(__dirname, 'onbehalf_reimbursement.html'));
});
app.get('/mobile/onbehalf/flight', (req, res) => {
  res.sendFile(path.join(__dirname, 'onbehalf_flight.html'));
});
app.get('/mobile/onbehalf/business', (req, res) => {
  res.sendFile(path.join(__dirname, 'onbehalf_business.html'));
});

// Approval pages (Pending Transactions)
app.get('/mobile/approvals/leave/pending', (req, res) => {
  res.sendFile(path.join(__dirname, 'pending_leave_transactions.html'));
});
app.get('/mobile/approvals/excuse/pending', (req, res) => {
  res.sendFile(path.join(__dirname, 'pending_excuse_transactions.html'));
});
app.get('/mobile/approvals/document/pending', (req, res) => {
  res.sendFile(path.join(__dirname, 'pending_document_transactions.html'));
});
app.get('/mobile/approvals/reimbursement/pending', (req, res) => {
  res.sendFile(path.join(__dirname, 'pending_reimbursement_transactions.html'));
});
app.get('/mobile/approvals/flight/pending', (req, res) => {
  res.sendFile(path.join(__dirname, 'pending_flight_transactions.html'));
});
app.get('/mobile/approvals/business/pending', (req, res) => {
  res.sendFile(path.join(__dirname, 'pending_business_transactions.html'));
});

// Teams pages
app.get('/mobile/team/hierarchy', (req, res) => {
  res.sendFile(path.join(__dirname, 'team_hierarchy.html'));
});
app.get('/mobile/team/calendar', (req, res) => {
  res.sendFile(path.join(__dirname, 'team_calendar.html'));
});

module.exports = app;
module.exports.handler = serverless(app);
