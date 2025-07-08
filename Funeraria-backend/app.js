require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');
const FuneralHome = require('./models/FuneralHome');
const Service = require('./models/Service');
const funeralHomeRoutes = require('./routes/funeralHomeRoutes');
const serviceAdminRoutes = require('./routes/serviceAdminRoutes');
const cityRoutes = require('./routes/cityRoutes');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const orderRoutes = require('./routes/orderRoutes');
const OrderStatusLog = require('./models/OrderStatusLog');
const dashboardRoutes = require('./routes/dashboardRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Rulează seed automat doar în development
if (process.env.NODE_ENV === 'development') {
  require('./seed');
}

if (process.env.NODE_ENV !== 'test') {
  sequelize.authenticate()
    .then(() => {
      console.log('MySQL connection established via Sequelize.');
      return sequelize.sync();
    })
    .then(() => {
      console.log('Toate tabelele au fost verificate/actualizate.');
      console.log('JWT_SECRET:', process.env.JWT_SECRET);
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => console.error('Unable to connect to MySQL:', err));
}

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.use('/api/users', userRoutes);
app.use('/api/funeral-homes', funeralHomeRoutes);
app.use('/api/funeral-homes/me/services', serviceAdminRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Funeraria API',
      version: '1.0.0',
      description: 'Documentație API Funeraria (MVP)',
    },
    servers: [
      { url: 'http://localhost:3000' }
    ],
  },
  apis: ['./routes/*.js'], // va genera doc din comentarii JSDoc din rute
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});
console.log('END OF FILE');

module.exports = app;
