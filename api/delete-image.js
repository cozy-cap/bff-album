const ImageKit = require("imagekit");

module.exports = async function (req, res) {
  // Essential CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight checks
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Grab the fileId from the URL query string
  const fileId = req.query.fileId;
  if (!fileId) return res.status(400).json({ error: "No fileId provided" });

  try {
    const imagekit = new ImageKit({
      urlEndpoint: "https://ik.imagekit.io/cozycap",
      publicKey: "public_+bidkA27fJVGrKKq8xYge8xiSOU=",
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY
    });

    // Tell ImageKit to delete the specific file
    await imagekit.deleteFile(fileId);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
