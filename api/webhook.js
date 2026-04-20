import { Wallet } from 'ethers';
import { StreamrClient } from '@streamr/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST.' });
  }

  try {
    const sensorData = req.body;
    
    // 1. Pull the key and explicitly FORCE the 0x prefix if it is missing
    let rawKey = process.env.PRIVATE_KEY;
    if (!rawKey) throw new Error("Critical: Vault key missing.");
    const formattedKey = rawKey.startsWith('0x') ? rawKey : '0x' + rawKey;

    // Notice we are using the exact casing from your MetaMask generation
    const streamId = "0x743b921B4a8553682399fa3C5C3f11b9aFb68938/dumaguete/climate-telemetry";

    // 2. Initialize the Streamr Engine
    const streamr = new StreamrClient({
      auth: { privateKey: formattedKey }
    });

    // 3. Publish the data
    await streamr.publish(streamId, sensorData);
    
    // 4. CRITICAL: Destroy the node instance so Vercel doesn't crash/timeout
    await streamr.destroy();

    return res.status(200).json({ 
      success: true, 
      message: "Data Attested and Broadcasted to Streamr!"
    });

  } catch (error) {
    // 5. If it fails, send the EXACT error sentence back to the hardware
    console.error("Full Error:", error);
    return res.status(500).json({ 
      error: error.message 
    });
  }
}