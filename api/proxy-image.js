export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Only allow image hosts used by the app
  const allowed = ['fimgs.net', 'supabase.co'];
  const isAllowed = allowed.some(host => url.includes(host));
  if (!isAllowed) {
    return res.status(403).json({ error: 'Host not allowed' });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({ error: `Upstream returned ${response.status}` });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
