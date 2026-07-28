const ImageKit = require("imagekit");

module.exports = async function (req, res) {
  // Essential CORS headers so GitHub Pages can read the response
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const imagekit = new ImageKit({
      urlEndpoint: "https://ik.imagekit.io/cozycap",
      publicKey: "public_+bidkA27fJVGrKKq8xYge8xiSOU=",
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY
    });

    // Fetch up to 100 files from your ImageKit account
    const files = await imagekit.listFiles({
        limit: 100, 
        // tags: ["bff-album"] // Optional: Uncomment if you only want images with a specific tag
    });

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
