export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });

  try {
    const sensorData = req.body;
    
    // 1. Get your Private Key from Vercel (Ensure it has the 0x prefix)
    let rawKey = process.env.PRIVATE_KEY;
    const formattedKey = rawKey.startsWith('0x') ? rawKey : '0x' + rawKey;

    // 2. Your Exact Stream ID
    const streamId = "0x743b921B4a8553682399fa3C5C3f11b9aFb68938/dumaguete/climate-telemetry";

    // 3. The "Legacy" Gateway - This is often more stable for 502/504 errors
    // We manually encode the slash to %2F to ensure the URL is perfect
    const url = `https://streamr.network/api/v1/streams/${streamId.replace("/", "%2F")}/data`;

    // 4. Send the data to the Marketplace
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
      throw new Error(`Streamr Error: ${errorText}`);
    }

    return res.status(200).json({ 
      success: true, 
      message: "Success! Data is now live and monetized." 
    });

  } catch (error) {
    console.error("Relayer Crash:", error.message);
    return res.status(500).json({ error: error.message });
  }
}