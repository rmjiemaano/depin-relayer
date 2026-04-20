export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });

  try {
    const sensorData = req.body;
    
    // 1. Get the key and ensure it has the 0x prefix
    let rawKey = process.env.PRIVATE_KEY;
    if (!rawKey) throw new Error("Private Key missing in Vercel settings.");
    const formattedKey = rawKey.startsWith('0x') ? rawKey : '0x' + rawKey;

    // 2. The EXACT Stream ID
    const streamId = "0x743b921B4a8553682399fa3C5C3f11b9aFb68938/dumaguete/climate-telemetry";

    // 3. The Professional Encoding Fix
    // This converts ALL slashes correctly so Streamr won't throw a 502
    const encodedId = encodeURIComponent(streamId);
    const url = `https://streamr.network/api/v1/streams/${encodedId}/data`;

    // 4. Send the data
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${formattedKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sensorData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Streamr Rejected Request: ${errorText}`);
    }

    return res.status(200).json({ 
      success: true, 
      message: "Data is now live on the marketplace!" 
    });

  } catch (error) {
    console.error("Relayer Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}