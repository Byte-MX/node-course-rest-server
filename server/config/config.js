// ==========================
// Puerto
//===========================

process.env.PORT = process.env.PORT || 3000;

// ==========================
// Entorno
//===========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ==========================
// Vencimiento del Token
//===========================
// 60 segundos
// * 60 minutos
// * 24 para 1 día
// * x para x días, etc.)
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// ==========================
// Semilla de autenticación
//===========================
process.env.SEMILLA_TOKEN = process.env.SEMILLA_TOKEN || 'Este-seed-es-utilizado-solamente-para-desarrollo!';

// ==========================
// Base de datos
//===========================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

// ==========================
// Google Client ID
//===========================
process.env.CLIENT_ID = process.env.CLIENT_ID || '461980514461-2ffa5482hmq0c4dene10m6ctra8fjtib.apps.googleusercontent.com';