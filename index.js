const { Client, RemoteAuth } = require('whatsapp-web.js');
const mongoose = require('mongoose');
const { MongoStore } = require('wwebjs-mongo');
const qrcode = require('qrcode-terminal');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const QRCode = require('qrcode');
const express = require('express');

const GEMINI_API_KEY = 'AIzaSyCdRtUKHW2fDpeWw5NvWGfiCnT9auIxjBU';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const MONGO_URI = 'mongodb+srv://Groupe09:mYvZrJ52UcszJyoe@cluster0.7d8cr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI).then(async () => {
  console.log("✅ MongoDB connecté");

  const store = new MongoStore({ mongoose, session: 'botwhatsapp-session' });

  const client = new Client({
    authStrategy: new RemoteAuth({
      store,
      backupSyncIntervalMs: 300000,
    }),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
  });
  client.on('qr', (qr) => {
    console.log("📱 Scanne ce QR Code dans WhatsApp Web (ASCII) :");
  
    require('qrcode').toString(qr, { type: 'terminal' }, (err, asciiQR) => {
      if (err) {
        console.error("❌ Erreur lors de la génération du QR code ASCII :", err);
      } else {
        console.log(asciiQR);
      }
    });
  
    // Bonus : lien image (utile si vous utilisez un terminal distant ou Web)
    require('qrcode').toDataURL(qr, (err, url) => {
      if (!err) {
        console.log("\n📷 QR Code en image :");
        console.log(url);
      }
    });
  });
  

  client.on('ready', () => {
    console.log('✅ Le bot est connecté et prêt !');
  });

  client.on('message', async (message) => {
    const userMessage = message.body.trim();
    console.log("Message reçu :", userMessage);

    if (!userMessage.toLowerCase().startsWith("gemini ")) return;

    const question = userMessage.slice(7).trim();

    try {
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: question }] }]
        })
      });

      const data = await response.json();
      const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      message.reply(botReply || "Je n'ai pas pu générer de réponse 😕.");

    } catch (err) {
      console.error("Erreur Gemini:", err);
      message.reply("Une erreur est survenue avec l'IA.");
    }
  });

  client.initialize();
}).catch(err => console.error('❌ Erreur MongoDB:', err));

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (_, res) => res.send("Bot is running ✅"));
app.listen(PORT, () => console.log(`✅ Express server running on port ${PORT}`));
