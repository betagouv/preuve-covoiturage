// System configuration
const PORT = process.env.PORT || 8080;
const mongoUrl = process.env.DB_ENDPOINT || 'mongodb://mongo/pdc-collector?authSource=admin';
const secret = process.env.JWT_SECRET || 'not-so-secret';

console.log(`ENV : ${process.env.NODE_ENV}`);
console.log(`PORT : ${PORT}`);
console.log(`MONGO : ${mongoUrl}`);

module.exports = {
  mongoUrl,
  PORT,
  secret,
};
