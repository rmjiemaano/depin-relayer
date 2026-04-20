import { Wallet } from 'ethers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST.' });
  }

  try {
    const sensorData = req.body;

    // Pulls key from Vercel securely
    const privateKey = process.env.PRIVATE_KEY; 
    if (!privateKey) throw new Error("Key missing.");

    const wallet = new Wallet(privateKey);
    const payloadString = JSON.stringify(sensorData);
    const signature = await wallet.signMessage(payloadString);

    return res.status(200).json({ 
      success: true, 
      walletAddress: wallet.address,
      signature: signature 
    });

  } catch (error) {
    return res.status(500).json({ error: "Crypto Error" });
  }
}