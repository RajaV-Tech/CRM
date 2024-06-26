const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodeMailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');

const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const transporter = nodeMailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "7485c5001@smtp-brevo.com", 
    pass: "98vCAkyzMLfgWYFq" 
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const db = mysql.createPool({
  host: '193.203.184.74',
  port: '3306',
  user: 'u534462265_asglobal',
  password: 'ASGlobal@12345',
  database: 'u534462265_crm'
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Database connected successfully.");
    connection.release();
  }
});

const departmentController = require('./controllers/departmentController')(db);
app.use('/department', departmentController);

const roleController = require('./controllers/roleController')(db);
app.use('/role', roleController);

const languageController = require('./controllers/languageController')(db);
app.use('/language', languageController);

const employeeController = require('./controllers/employeeController')(db, transporter);
app.use('/employee', employeeController);

const leadsController = require('./controllers/leadsController')(db);
app.use('/leads', leadsController);

const purchaseController = require('./controllers/purchaseController')(db);
app.use('/purchase', purchaseController);

const productController = require('./controllers/productController')(db, storage);
app.use('/product', productController);

const salesController = require('./controllers/salesController')(db);
app.use('/sales', salesController);

const customerController = require('./controllers/customerController')(db);
app.use('/customer', customerController);

const customerPurchaseController = require('./controllers/customerPurchaseController')(db);
app.use('/cust_purch', customerPurchaseController);

const empAttendanceController = require('./controllers/empAttendanceController')(db);
app.use('/emp_attend', empAttendanceController);

// SSL options
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/krishnaindustries.cloud/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/krishnaindustries.cloud/fullchain.pem')
};

// Create HTTP server to redirect to HTTPS
const httpApp = express();
httpApp.get('*', (req, res) => {
  res.redirect(`https://${req.headers.host}${req.url}`);
});
httpApp.listen(80, () => {
  console.log('HTTP Server running on port 80 and redirecting to HTTPS');
});

// Create HTTPS server
https.createServer(sslOptions, app).listen(443, () => {
  console.log('HTTPS Server running on port 443');
});

app.listen(port, () => {
  console.log(`HTTP Server is running on ${port} and redirecting to HTTPS...`);
});
