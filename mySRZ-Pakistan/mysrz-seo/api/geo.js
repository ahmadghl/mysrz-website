export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
             req.headers['x-real-ip'] || 
             req.socket.remoteAddress;
  
  try {
    const r = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
    const data = await r.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: 'geo lookup failed' });
  }
}
