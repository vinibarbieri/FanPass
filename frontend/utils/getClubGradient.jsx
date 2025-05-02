const getClubGradient = (clubId) => {
  const gradients = {
    1: "linear-gradient(180deg, #7a0f23, #3a0a11)", // São Paulo (vermelho escuro para bordô)
    2: "linear-gradient(180deg, #8b0000, #4b0000)", // Flamengo (vermelho sangue escuro)
    3: "linear-gradient(180deg, #2c2c2c, #111111)", // Vasco (cinza chumbo)
    4: "linear-gradient(180deg, #00582c, #00331b)", // Palmeiras (verde floresta fechado)
    5: "linear-gradient(180deg, #7a1020, #400a10)", // Internacional (vinho escuro)
    6: "linear-gradient(180deg, #007b3b, #004d23)", // Fluminense (verde escuro)
    7: "linear-gradient(180deg, #2c2c2c, #111111)", // Corinthians (cinza escuro igual Vasco)
  };

  return gradients[clubId] || "linear-gradient(180deg, #2B2B2B, #1A1A1A)";
};

export default getClubGradient;