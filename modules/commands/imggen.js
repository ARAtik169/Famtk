const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "imggen",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "JARiF",
  usePrefix: true,
  description: "Meta AI Image Generator.",
  commandCategory: "image ai",
  cooldowns: 5
};

module.exports.run = async function ({ args, event, api }) {
  try {
    const prompt = args.join(" ");

    const waitingMessage = await api.sendMessage("Please wait...", event.threadID);

    const url = `https://project-meta.onrender.com/meta?prompt=${encodeURIComponent(prompt)}`;

    const response = await axios.get(url);
    const data = response.data;

    if (!data || data.length === 0) {
      throw new Error("Empty response or no images generated.");
    }

    const imgData = [];

    for (let i = 0; i < data.length; i++) {
      const imgUrl = data[i];
      const imgResponse = await axios.get(imgUrl, { responseType: 'arraybuffer' });
      const imgPath = path.join(__dirname, 'cache', `${i + 1}.jpg`);
      await fs.outputFile(imgPath, imgResponse.data);
      imgData.push(fs.createReadStream(imgPath));
    }

    await api.sendMessage({
      body: `✅ | Generated`,
      attachment: imgData
    }, event.threadID);

  } catch (error) {
    console.error(error);
    await api.sendMessage(`Generation failed!\nError: ${error.message}`, event.threadID);
  }
};