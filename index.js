const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Endpoint to save referral data
app.post('/referrals', async (req, res) => {
  const { name, email, referredBy } = req.body;

  // Validation
  if (!name || !email || !referredBy) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newReferral = await prisma.referral.create({
      data: {
        name,
        email,
        referredBy,
      },
    });

    // Send referral email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'You have been referred!',
      text: `Hello ${name},\n\nYou have been referred by ${referredBy}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: 'Failed to send referral email' });
      }
      res.status(201).json(newReferral);
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save referral' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

