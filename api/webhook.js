import { Wallet, hashMessage } from 'ethers';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });

  try {
    const sensorData = req.body;
    const privateKey = process.env.PRIVATE_KEY;
    const streamId = "0x743b921B4a8553682399fa3C5C3f11b9aFb68938/dumaguete/climate-telemetry";

    // 1. Initialize Wallet and Sign the data
    const wallet = new Wallet(privateKey);
    const message = JSON.stringify(sensorData);
    const signature = await wallet.signMessage(message);

    // 2. Prepare the payload for Streamr's HTTP Gateway
    const payload = {
        data: sensorData,
        signature: signature,
        address: wallet.address
    };

    // 3. Send to Streamr via standard Fetch (No heavy SDK needed)
    const streamrResponse = await fetch(`https://streamr.network/api/v1/streams/${encodeURIComponent(streamId)}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${privateKey}` // Uses your key to auth the publish
      },
      body: JSON.stringify(sensorData)
    });

    if (!streamrResponse.ok) {
        const errorText = await streamrResponse.text();
        throw new Error(`Streamr API Error: ${errorText}`);
    }

    return res.status(200).json({ 
      success: true, 
      message: "Data Attested and Broadcasted via HTTP Gateway!",
      signature: signature
    });

  } catch (error) {
    console.error("Relayer Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}