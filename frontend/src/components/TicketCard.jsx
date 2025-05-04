import React from "react";
import { Link } from "react-router-dom";
import { FiClock, FiHeart } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import getClubGradient from "../../utils/getClubGradient";

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
    if (!price) return "0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
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

  const priceReal = details?.priceReal || 0;

  return (
    <Link
      to={`/purchase/${ticket?.details.tokenId}`}
      className="group bg-cinza rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 border border-white/5 hover:border-vermelho/50 hover:shadow-xl hover:shadow-vermelho/5"
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
          <FiHeart className="text-vermelho" />
          <span>{likes}</span>
        </div>
      </div>

      {/* Informações */}
      <div className="p-4">
        {/* Nome */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-white text-lg font-bold leading-tight line-clamp-2 flex-1">
            {name}
          </h3>
        </div>

        {/* Temporada */}
        <p className="text-gray-400 mb-3">Temporada {getSeason()}</p>

        {/* Preço */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-white">
            {formatPrice(ticket.priceConversion.reais)}
          </span>
        </div>

        {/* Lance Atual */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-m text-gray-400">
            Lance atual:{" "}
            <span className="text-white font-medium">
              {formatPrice(ticket.priceConversion.reais - 10)}
            </span>
          </span>
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
