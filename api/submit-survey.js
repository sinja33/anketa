// api/submit-survey.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    // Add server-side timestamp and metadata
    const surveyResponse = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      ...data
    };

    // Basic validation
    if (!data.ime || !data.starost) {
      return res.status(400).json({ 
        error: 'Ime in starost sta obvezna polja' 
      });
    }

    // Log the response (in production, save to database)
    console.log('Survey response received:', surveyResponse);
    
    // Here you can integrate with various services:
    
    // Option 1: Google Sheets
    /*
    const { GoogleSpreadsheet } = require('google-spreadsheet');
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow(surveyResponse);
    */

    // Option 2: Airtable
    /*
    const Airtable = require('airtable');
    const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);
    await base('Survey Responses').create([
      {
        fields: surveyResponse
      }
    ]);
    */

    // Option 3: MongoDB Atlas
    /*
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('vr-survey');
    const collection = db.collection('responses');
    await collection.insertOne(surveyResponse);
    await client.close();
    */

    // Option 4: Vercel KV (Redis)
    /*
    const { kv } = require('@vercel/kv');
    await kv.set(`survey:${surveyResponse.id}`, JSON.stringify(surveyResponse));
    */

    // For now, just return success
    res.status(200).json({ 
      success: true, 
      message: 'Anketa je bila uspešno oddana!',
      id: surveyResponse.id
    });

  } catch (error) {
    console.error('Error processing survey:', error);
    
    res.status(500).json({ 
      error: 'Prišlo je do napake pri obdelavi ankete',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}