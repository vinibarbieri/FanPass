import React from "react";
import { Link } from "react-router-dom";
import { FiClock, FiHeart } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const TicketCard = ({ ticket }) => {
  const {
    id,
    name = "Ingresso sem nome",
    image = "/vg.jpeg",
    details = {},
    createdAt = new Date().toISOString(),
    attributes = [],
    type = "comprar",
    clubId = 1,
    likes = Math.floor(Math.random() * 50),
  } = ticket;

  const formatPrice = (price) => {
    if (!price) return "0";
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getTeamLogo = (clubId) => {
    const logos = {
      1: "/sp.png",
      2: "/mengo.png",
      3: "/vasco.png",
      4: "/palmeiras.png",
      5: "/inter.png",
      6: "/flu.png",
      7: "/corinthians.png",
    };
    return logos[clubId] || "/sp.png";
  };

  const getTokenSymbol = (clubId) => {
    const symbols = {
      1: "SPFC",
      2: "FLA",
      3: "VAS",
      4: "PAL",
      5: "INT",
      6: "FLU",
      7: "COR",
    };
    return symbols[clubId] || "TOKEN";
  };

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

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch (error) {
      return "Data indisponível";
    }
  };

  const getSeason = () => {
    const temporadaAttr = attributes.find(
      (attr) => attr.trait_type === "Validade"
    );
    if (temporadaAttr) {
      const year = temporadaAttr.value.match(/\d{4}/)?.[0];
      return year || "Ano indefinido";
    }
    return "Ano indefinido";
  };

  const priceFanToken = details?.priceFanToken || 0;
  const priceRealMock = (priceFanToken * 0.3).toFixed(2);

  return (
    <Link
      to={`/purchase/${ticket?.details.tokenId}`}
      className="group bg-[#2B2B2B] rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 border border-white/5 hover:border-[#FF595C]/50 hover:shadow-xl hover:shadow-[#FF595C]/5"
    >
      {/* Imagem com fundo gradiente específico */}
      <div
        className="relative aspect-[4/3] flex items-center justify-center overflow-hidden"
        style={{ background: getClubGradient(clubId) }}
      >
        <img
          src={image}
          alt={name}
          className="object-contain max-h-48 w-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/vg.jpeg";
          }}
        />

        {/* Badge tipo */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/10">
          {type === "comprar"
            ? "Venda"
            : type === "alugar"
            ? "Aluguel"
            : "Colecionável"}
        </div>

        {/* Likes */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/10">
          <FiHeart className="text-[#FF595C]" />
          <span>{likes}</span>
        </div>
      </div>

      {/* Informações */}
      <div className="p-4">
        {/* Nome + logo */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-white text-lg font-bold leading-tight line-clamp-2 flex-1">
            {name}
          </h3>
          <img
            src={getTeamLogo(clubId)}
            alt="Team logo"
            className="w-6 h-6 rounded-full bg-white/5 p-0.5"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/sp.png";
            }}
          />
        </div>

        {/* Temporada */}
        <p className="text-gray-400 mb-3">Temporada {getSeason()}</p>

        {/* Preço */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img
              src={getTeamLogo(clubId)}
              alt="Token"
              className="w-5 h-5"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/sp.png";
              }}
            />
            <span className="text-lg font-bold text-white">
              {formatPrice(priceFanToken)} {getTokenSymbol(clubId)}
            </span>
          </div>
          <span className="text-sm text-gray-400">≈ R$ {priceRealMock}</span>
        </div>

        {/* Tempo */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FiClock />
          <span>{formatDate(createdAt)}</span>
        </div>
      </div>
    </Link>
  );
};

export default TicketCard;
