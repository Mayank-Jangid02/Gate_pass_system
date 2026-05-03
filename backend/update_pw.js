import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

mongoose.connect('mongodb://127.0.0.1:27017/gatepass').then(async () => {
  const db = mongoose.connection.db;
  const hash = await bcrypt.hash('meera@123', 10);
  await db.collection('users').updateOne({email: 'meera@gmail.com'}, {$set: {password: hash}});
  console.log('Password updated for meera');
  
  const hash2 = await bcrypt.hash('akshay@123', 10);
  await db.collection('users').updateOne({email: 'akshay@gmail.com'}, {$set: {password: hash2}});
  console.log('Password updated for akshay');
  
  process.exit(0);
});
