// mongo-auth-strategy.js
const mongoose = require('mongoose');
const { RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');

const MONGO_URI = 'mongodb+srv://Groupe09:mYvZrJ52UcszJyoe@cluster0.7d8cr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // ou votre URI Mongo Atlas
const SESSION_ID = 'charbel-session';

// 1. Connect to MongoDB first
const connectToMongo = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB connecté");
  } catch (err) {
    console.error("❌ Erreur MongoDB:", err);
    process.exit(1);
  }
};

// 2. Créez le store après la connexion
const getAuthStrategy = () => {
  const store = new MongoStore({
    mongoose, // important : passer mongoose ici
    session: SESSION_ID
  });

  return new RemoteAuth({
    store,
    backupSyncIntervalMs: 300000,
  });
};

module.exports = {
  connectToMongo,
  getAuthStrategy
};
