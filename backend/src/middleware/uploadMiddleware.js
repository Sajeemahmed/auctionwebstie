// src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const playersDir = path.join(uploadsDir, 'players');
const excelDir = path.join(uploadsDir, 'excel');
const teamsDir = path.join(uploadsDir, 'teams');  // NEW
const sponsorsDir = path.join(uploadsDir, 'sponsors');  // NEW

[uploadsDir, playersDir, excelDir, teamsDir, sponsorsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage for player photos
const playerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, playersDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'player-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage for team logos  -- NEW
const teamLogoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, teamsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'team-logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage for sponsor logos  -- NEW
const sponsorLogoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, sponsorsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'sponsor-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage for Excel files
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, excelDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'players-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
};

// File filter for Excel
const excelFilter = (req, file, cb) => {
  const allowedTypes = /xlsx|xls|csv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only Excel/CSV files are allowed (xlsx, xls, csv)'));
  }
};

// Upload middleware
const uploadPlayerPhoto = multer({
  storage: playerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
}).single('photo');

const uploadTeamLogo = multer({  // NEW
  storage: teamLogoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
}).single('logo');

const uploadSponsorLogo = multer({  // NEW
  storage: sponsorLogoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
}).single('sponsorLogo');

const uploadExcel = multer({
  storage: excelStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: excelFilter
}).single('file');

module.exports = {
  uploadPlayerPhoto,
  uploadTeamLogo,      // NEW
  uploadSponsorLogo,   // NEW
  uploadExcel
};