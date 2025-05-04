// services/fanTokenService.js
const axios = require("axios");

let cachedPrice = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

async function getFanTokenToBRLPrice() {
  const now = Date.now();

  if (cachedPrice && now - lastFetchTime < CACHE_DURATION) {
    return cachedPrice;
  }

  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=chiliz&vs_currencies=brl"
    );
    cachedPrice = response.data.chiliz.brl + 2;

    lastFetchTime = now;
    return cachedPrice;
  } catch (error) {
    console.error("Erro ao buscar preço do Fan Token:", error);
    throw error;
  }
}
module.exports = { getFanTokenToBRLPrice };
