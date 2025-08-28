// api/submit-survey.js
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

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
    
    // Basic validation
    if (!data.ime || !data.starost) {
      return res.status(400).json({ 
        error: 'Ime in starost sta obvezna polja' 
      });
    }

    // Prepare data for Google Sheets
    const surveyResponse = {
      Časovni_žig: new Date().toLocaleString('sl-SI', { timeZone: 'Europe/Ljubljana' }),
      ID: Date.now().toString(),
      Ime: data.ime || '',
      Starost: data.starost || '',
      Datum: data.datum || '',
      Spol: data.spol || '',
      VR_izkušnje: data.vr_izkusnje || '',
      VR_opis: data.vr_opis || '',
      
      // Implementacija pogovora (1-5)
      Q1_Pogovor_organičen: data.q1_pogovor_organicen || '',
      Q2_Skulptura_razumela: data.q2_skulptura_razumela || '',
      Q3_Odgovori_smiselni: data.q3_odgovori_smiselni || '',
      Q4_Hitro_reagiral: data.q4_hitro_reagiral || '',
      
      // Animacije (1-5)
      Q5_Animacije_naravno: data.q5_animacije_naravno || '',
      Q6_Animacije_pripomogle: data.q6_animacije_pripomogle || '',
      Q7_Telesne_animacije: data.q7_telesne_animacije || '',
      Q8_Lip_sync_pripomogle: data.q8_lip_sync_pripomogle || '',
      Q9_Lip_sync_naraven: data.q9_lip_sync_naraven || '',
      
      // Uporabniška izkušnja (1-5)
      Q10_Lip_sync_ustnic: data.q10_lip_sync_ustnic || '',
      Q11_Animacije_telesa: data.q11_animacije_telesa || '',
      Q12_Spomin_skulpture: data.q12_spomin_skulpture || '',
      Q13_Mašilni_avdio: data.q13_masilni_avdio || '',
      Q14_Efekt_mreže: data.q14_efekt_mreze || '',
      Q15_Interaktivni_elementi: data.q15_interaktivni_elementi || '',
      Q16_Uporabniški_vmesnik: data.q16_uporabniski_vmesnik || '',
      
      // Odprta vprašanja
      Odprto1_Razstava: data.odprto1_razstava || '',
      Odprto2_Aspekti_pritegnili: data.odprto2_aspekti_pritegnili || '',
      Odprto3_Manjkajo_aspekti: data.odprto3_manjkajo_aspekti || '',
      Odprto4_Predlogi: data.odprto4_predlogi || '',
      
      // Metadata
      IP: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
      User_Agent: req.headers['user-agent'] || 'unknown'
    };

    // Google Sheets setup
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      console.error('Missing Google Sheets environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error - missing Google Sheets credentials' 
      });
    }

    // Initialize Google Sheets
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    
    // Load document info
    await doc.loadInfo();
    console.log('Connected to Google Sheet:', doc.title);
    
    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];
    
    // Check if headers exist, if not create them
    const headers = await sheet.getHeaderRow();
    if (headers.length === 0) {
      await sheet.setHeaderRow(Object.keys(surveyResponse));
    }
    
    // Add the survey response as a new row
    await sheet.addRow(surveyResponse);
    
    console.log('Survey response saved to Google Sheets:', surveyResponse.ID);

    res.status(200).json({ 
      success: true, 
      message: 'Anketa je bila uspešno oddana in shranjena!',
      id: surveyResponse.ID
    });

  } catch (error) {
    console.error('Error processing survey:', error);
    
    res.status(500).json({ 
      error: 'Prišlo je do napake pri obdelavi ankete',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}