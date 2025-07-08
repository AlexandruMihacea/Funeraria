const sequelize = require('./config/database');
const User = require('./models/User');
const FuneralHome = require('./models/FuneralHome');
const Service = require('./models/Service');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const OrderStatusLog = require('./models/OrderStatusLog');
const bcrypt = require('bcryptjs');

async function seed() {
  // Șterge datele din tabele în ordinea corectă (copil -> părinte), fără truncate, doar destroy cu individualHooks
  await OrderStatusLog.destroy({ where: {}, cascade: true, individualHooks: true });
  await OrderItem.destroy({ where: {}, cascade: true, individualHooks: true });
  await Order.destroy({ where: {}, cascade: true, individualHooks: true });
  await Service.destroy({ where: {}, cascade: true, individualHooks: true });
  await FuneralHome.destroy({ where: {}, cascade: true, individualHooks: true });
  await User.destroy({ where: {}, cascade: true, individualHooks: true });

  // Parole în clar
  const adminPassword = 'admin123';
  const user1Password = '12345678';
  const user2Password = 'user123';
  const user3Password = 'user123';
  const fhUser1Password = '12345678';
  const fhUser2Password = 'fh123';

  // Hash-uire parole
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const user1Hash = await bcrypt.hash(user1Password, 10);
  const user2Hash = await bcrypt.hash(user2Password, 10);
  const user3Hash = await bcrypt.hash(user3Password, 10);
  const fhUser1Hash = await bcrypt.hash(fhUser1Password, 10);
  const fhUser2Hash = await bcrypt.hash(fhUser2Password, 10);

  const admin = await User.create({ name: 'Admin', email: 'admin@funeraria.com', password: adminHash, role: 'admin', address: 'Str. Admin 1', city: 'Bucuresti', judet: 'Bucuresti' });
  // Useri funeral_home
  const fhUser1 = await User.create({ name: 'Casa Albastra', email: 'casa1@gmail.com', password: fhUser1Hash, role: 'funeral_home', address: 'Str. Albastra 1', city: 'Cluj', judet: 'Cluj' });
  const fhUser2 = await User.create({ name: 'Casa Funerara Pantelimon', email: 'fh2@funeraria.com', password: fhUser2Hash, role: 'funeral_home', address: 'Str. Roz 2', city: 'Timisoara', judet: 'Timis' });

  // 1. Creează useri
  const users = await Promise.all([
    User.create({ name: 'Alex Mihacea', email: 'alex@gmail.com', password: user1Hash, role: 'user', address: 'Str. Lalelelor 10', city: 'Bucuresti', judet: 'Ilfov' }),
    User.create({ name: 'User Two', email: 'user2@funeraria.com', password: user2Hash, role: 'user', address: 'Str. Trandafirilor 20', city: 'Cluj', judet: 'Cluj' }),
    User.create({ name: 'User Three', email: 'user3@funeraria.com', password: user3Hash, role: 'user', address: 'Str. Zambilelor 30', city: 'Timisoara', judet: 'Timis' })
  ]);

  // 2. Creează case funerare asociate cu userii funeral_home
  const funeralHome1 = await FuneralHome.create({ name: 'Casa Albastra', address: 'Str. Lalelelor 1', city: 'Bucuresti', phone: '0711111111', email: 'cf1@funeraria.com', userId: fhUser1.id });
  const funeralHome2 = await FuneralHome.create({ name: 'Casa Funerara Pantelimon', address: 'Str. Trandafirilor 2', city: 'Cluj', phone: '0722222222', email: 'cf2@funeraria.com', userId: fhUser2.id });

  // 3. Creează servicii pentru fiecare casă
  const serviceNames = ['Transport', 'Sicriu', 'Coronita', 'Inmormantare', 'Incinerare'];
  const servicesFH1 = await Promise.all(serviceNames.map((name, i) => Service.create({ name, description: `${name} descriere`, price: 100 + i * 50, funeralHomeId: funeralHome1.id })));
  const servicesFH2 = await Promise.all(serviceNames.map((name, i) => Service.create({ name, description: `${name} descriere`, price: 120 + i * 60, funeralHomeId: funeralHome2.id })));

  // 4. Creează comenzi pentru fiecare user
  for (const user of users) {
    for (let c = 0; c < 2; c++) {
      // Fiecare comandă are servicii diferite, alternând între case funerare
      const fh = c % 2 === 0 ? funeralHome1 : funeralHome2;
      const serviceList = c % 2 === 0 ? servicesFH1 : servicesFH2;
      const order = await Order.create({
        userId: user.id,
        funeralHomeId: fh.id,
        address: `Adresa user ${user.id} comanda ${c+1}`,
        contactName: user.name,
        contactPhone: '0700000000',
        contactEmail: user.email,
        status: 'pending',
        total: 0
      });
      // Adaugă servicii la comandă
      let total = 0;
      for (let s = 0; s < 3; s++) {
        const service = serviceList[(c + s) % serviceList.length];
        await OrderItem.create({
          orderId: order.id,
          serviceId: service.id,
          name: service.name,
          price: service.price,
          quantity: 1
        });
        total += parseFloat(service.price);
      }
      // Update total comandă
      order.total = total;
      await order.save();
      // Status log: pending -> paid -> completed
      await OrderStatusLog.create({ orderId: order.id, status: 'pending', changedBy: user.id });
      await OrderStatusLog.create({ orderId: order.id, status: 'paid', changedBy: user.id });
      await OrderStatusLog.create({ orderId: order.id, status: 'completed', changedBy: user.id });
      // Update status comandă
      order.status = 'completed';
      await order.save();
    }
  }

  console.log('Seed complet!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); }); 