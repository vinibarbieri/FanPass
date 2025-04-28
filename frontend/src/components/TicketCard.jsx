import React from "react";
import { useNavigate } from "react-router-dom"; // Para navegação

const TicketCard = ({ ticket }) => {
  const navigate = useNavigate(); // Hook para navegação

  const fanTokenPrice = ticket.details?.priceFanToken;
  const conversionRate = 1.3; // 30% acréscimo padrão
  const cashPrice =
    ticket.priceConversion?.reais ||
    (fanTokenPrice ? (fanTokenPrice * conversionRate).toFixed(2) : null);
  const rate = ticket.priceConversion?.rate || conversionRate;

  const fanTokenImages = {
    1: "/sp.png",
    2: "/mengo.png",
    3: "/vasco.jpeg",
    4: "/palmeiras.png",
    5: "/inter.png",
    5: "/flu.png",
    5: "/corinthians.png",

    // adicione conforme necessário
  };

  const getFanTokenImage = (clubId) => {
    return fanTokenImages[clubId] || "/default-fantoken.png";
  };

  // Função para obter o gradiente baseado na cor do clube
  const getClubGradient = (clubId) => {
    const gradients = {
      1: "linear-gradient(180deg, #ec1c24, #9c1c1c)", // SP
      2: "linear-gradient(180deg, #f20000, #9b0000)", // Mengo
      3: "linear-gradient(180deg, #1a1a1a, #000000)", // Vasco
      4: "linear-gradient(180deg, #006437, #004d2c)", // Palmeiras
      5: "linear-gradient(180deg, #9e1b32, #7a0f23)", // Internacional
      6: "linear-gradient(180deg, #009c3b, #007a2d)", // Fluminense
      7: "linear-gradient(180deg, #1a1a1a, #000000)", // Corinthians

      // adicione conforme necessário
    };

    return gradients[clubId] || "linear-gradient(180deg, #333333, #111111)"; // cor padrão
  };

  return (
    <div
      onClick={() => navigate(`/purchase/${ticket.details.tokenId}`)} // Navegação ao clicar
      className="bg-[#202020] rounded-2xl shadow-lg p-0 w-full max-w-xs flex flex-col overflow-hidden hover:border-2 hover:border-gray-400 transition duration-300 ease-in-out"
    >
      {/* Fundo com o Degradê */}
      <div
        className="h-52 flex items-center justify-center"
        style={{ background: getClubGradient(ticket.clubId) }}
      >
        {/* Escudo ou imagem na frente do fundo degradê */}
        {ticket.image ? (
          <img
            src={ticket.image}
            alt={ticket.name}
            className="object-contain h-40"
          />
        ) : (
          <span className="text-white text-xl font-bold">{ticket.name}</span>
        )}
      </div>

      {/* Informações */}
      <div className="bg-[#1a1a1a] text-white p-4 space-y-2 text-left">
        <p className="text-lg font-semibold">{ticket.name}</p>

        {ticket.attributes?.map((attr, i) => (
          <p key={i} className="text-sm text-gray-300">
            {attr.value}
          </p>
        ))}

        <div className="flex justify-between text-xs text-gray-400 mt-4">
          <div>
            <p className="uppercase tracking-widest">Fan Tokens</p>
            <div className="flex items-center gap-2 text-base text-white">
              <img
                src={getFanTokenImage(ticket.clubId)}
                alt="Fan Token"
                className="w-5 h-5"
              />
              <span>{fanTokenPrice}</span>
            </div>

            <p className="uppercase tracking-widest mt-3">Preço (R$)</p>
            <p className="text-base text-white">
              R$ {cashPrice ? Number(cashPrice).toFixed(2) : "Indisponível"}
            </p>

            {rate && (
              <p className="text-xs text-gray-500 mt-1">
                (inclui 30% de acréscimo sobre cotação: 1 FT = R${" "}
                {rate.toFixed(3)})
              </p>
            )}
          </div>

          <div>
            <p className="uppercase tracking-widest">Maior Lance</p>
            <p className="text-base text-white">
              {ticket.highestBid
                ? `${ticket.highestBid} ${ticket.tokenSymbol}`
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
