const getFanTokenImage = (clubId) => {
    const logos = {
        1: "/sp.png", // São Paulo
        2: "/mengo.png", // Flamengo
        3: "/vasco.png", // Vasco
        4: "https://coin-images.coingecko.com/coins/images/30174/large/VERDAO.png?1741853007", // Palmeiras
        5: "https://brcryptos.com/wp-content/uploads/2024/08/png_Token-SACI.png", // Internacional
        6: "https://s2.coinmarketcap.com/static/img/coins/200x200/23282.png", // Fluminense
        7: "https://s2.coinmarketcap.com/static/img/coins/200x200/11446.png", // Corinthians
    };
    return logos[clubId] || "https://s2.coinmarketcap.com/static/img/coins/200x200/11714.png";
};

export default getFanTokenImage;