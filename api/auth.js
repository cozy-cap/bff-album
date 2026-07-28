const ImageKit = require("imagekit");

module.exports = function (req, res) {
  // Essential CORS headers so your GitHub Pages domain isn't blocked from accessing this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle standard preflight browser checks
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const imagekit = new ImageKit({
      urlEndpoint: "https://ik.imagekit.io/cozycap",
      publicKey: "public_+bidkA27fJVGrKKq8xYge8xiSOU=",
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY
    });

    // Generates the token, expire, and signature using your hidden private key
    const result = imagekit.getAuthenticationParameters();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
