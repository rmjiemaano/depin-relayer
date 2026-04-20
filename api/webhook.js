import { Wallet } from 'ethers';
import { StreamrClient } from '@streamr/sdk';

export default async function handler(req, res) {
  // 1. Block unauthorized request types
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const sensorData = req.body;
    console.log("ESP32 Telemetry Received:", sensorData);

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("Critical: Vault key missing.");

    // 2. Your specific Dumaguete Data Stream
    const streamId = "0x743b921b4a8553682399fa3c5c3f11b9afb68938/dumaguete/climate-telemetry";

    // 3. Initialize the Streamr Node
    const streamr = new StreamrClient({
      auth: { privateKey: privateKey }
    });

    // 4. Cryptographically Sign and Broadcast to the Global Network
    await streamr.publish(streamId, sensorData);
    console.log("Successfully broadcasted to Streamr Network!");

    // 5. Send success verification back to your ESP32
    const wallet = new Wallet(privateKey);
    return res.status(200).json({ 
      success: true, 
      message: "Data Attested and Broadcasted to Streamr",
      streamId: streamId,
      nodeAddress: wallet.address
    });

  } catch (error) {
    console.error("Relayer/Streamr Error:", error);
    return res.status(500).json({ error: "Internal Server Error during broadcast." });
  }
}