export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });

  try {
    const sensorData = req.body;
    
    // 1. Format the Private Key
    let rawKey = process.env.PRIVATE_KEY;
    if (!rawKey) throw new Error("Private Key missing in Vercel settings.");
    const formattedKey = rawKey.startsWith('0x') ? rawKey : '0x' + rawKey;

    // 2. The Stream ID (Forcing lowercase to match Hub Registry)
    const rawStreamId = "0x743b921b4a8553682399fa3c5c3f11b9afb68938/dumaguete/climate-telemetry";
    const encodedId = encodeURIComponent(rawStreamId.toLowerCase());
    const url = `https://streamr.network/api/v1/streams/${encodedId}/data`;

    console.log(`[Diagnostic] Publishing to: ${url}`);

    // 3. The Transmission with extra headers for Nginx bypass
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${formattedKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ESP32-DePIN-Relayer/1.0 (Vercel)'
      },
      body: JSON.stringify(sensorData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // This will send the real reason (e.g., "Stream not found") back to your ESP32
      throw new Error(`Streamr Rejected: ${response.status} - ${errorText.substring(0, 100)}`);
    }

    return res.status(200).json({ 
      success: true, 
      message: "Success! Data is now live and monetized." 
    });

  } catch (error) {
    console.error("Critical Failure:", error.message);
    return res.status(500).json({ error: error.message });
  }
}