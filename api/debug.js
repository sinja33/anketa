export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const envCheck = {
      GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID ? 'SET' : 'MISSING',
      GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'SET' : 'MISSING',
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'not set'
    };

    res.status(200).json({
      message: 'Debug endpoint working!',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      method: req.method,
      headers: req.headers
    });
  } catch (error) {
    res.status(500).json({
      error: 'Debug endpoint error',
      message: error.message
    });
  }
}