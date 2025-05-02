import React from "react";
import { Link } from "react-router-dom";
import { FiClock, FiHeart } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import getClubGradient from "../../utils/getClubGradient";
import getTokenSymbol from "../../utils/getTokenSymbol";
import getFanTokenImage from "../../utils/getFanTokenImage";

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
        </div>

        {/* Temporada */}
        <p className="text-gray-400 mb-3">Temporada {getSeason()}</p>

        {/* Preço */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img
              src={getFanTokenImage(clubId)}
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

        {/* Preço */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">

            <span className="text-m text-gray-400">
              Lance atual: <span className="text-white font-medium">{formatPrice(120)} {getTokenSymbol(1)}</span>
            </span>
            <img
              src={getFanTokenImage(clubId)}
              alt="Token"
              className="w-3 h-3"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/sp.png";
              }}
            />
          </div>
          <span className="text-sm text-gray-400">≈ R$ {priceRealMock}</span>
        </div>

        {/* Lance Atual */}
        {/* <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">

            <span className="text-xs text-gray-400">
              Lance atual: <span className="text-white font-medium">{formatPrice(120)}</span>
            </span>
            <img
              src={getTeamLogo(1)}
              alt="Token"
              className="w-3 h-3"
            />
          </div>
          <span className="text-xs text-gray-400">
            ≈ R$ 36,00
          </span>
        </div> */}

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
