import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import axios from "axios";
import getClubGradient from "../../utils/getClubGradient";

const MyTicketsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // all, valid, expired

  // Funções para os botões (implementar lógica depois)
  const handleUseTicket = (ticketId, e) => {
    e.stopPropagation();
    console.log("Usar ingresso:", ticketId);
    // Lógica para usar o ingresso
  };

  const handleSellTicket = (ticketId, e) => {
    e.stopPropagation();
    console.log("Vender ingresso:", ticketId);
    // Lógica para vender o ingresso
    navigate(`/sell-ticket/${ticketId}`);
  };

  const handleRentTicket = (ticketId, e) => {
    e.stopPropagation();
    console.log("Alugar ingresso:", ticketId);
    // Lógica para alugar o ingresso
    navigate(`/rent-ticket/${ticketId}`);
  };

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `http://localhost:3001/ticket/${user.id}/tickets`
        );

        if (
          !response.data ||
          !response.data.success ||
          !Array.isArray(response.data.tickets)
        ) {
          throw new Error("Invalid data format received from server");
        }

        const ticketsWithDetails = await Promise.all(
          response.data.tickets.map(async (ticket) => {
            try {
              if (typeof ticket.tokenURI === "string") {
                const tokenData = await axios.get(ticket.tokenURI, {
                  headers: { Authorization: undefined },
                });
                return {
                  ...ticket,
                  tokenData: tokenData.data,
                  image: tokenData.data.image || "/default-fantoken.png",
                  name: tokenData.data.name || `Ingresso ${ticket.tokenId}`,
                };
              }

              return {
                ...ticket,
                image: "/default-fantoken.png",
                name: `Ingresso ${ticket.tokenId}`,
              };
            } catch (error) {
              console.error("Erro ao buscar detalhes do token:", error);
              return {
                ...ticket,
                image: "/default-fantoken.png",
                name: `Ingresso ${ticket.tokenId}`,
              };
            }
          })
        );

        setTickets(ticketsWithDetails);
      } catch (error) {
        console.error("Erro ao buscar ingressos:", error);
        setError(error.message || "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTickets();
  }, [user]);

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === "valid") return ticket.isValid;
    if (activeTab === "expired") return !ticket.isValid;
    return true;
  });

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A]">
        <Header />
        <div className="max-w-[1600px] mx-auto p-6">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-pulse text-white text-xl">Carregando seus ingressos...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1A1A1A]">
        <Header />
        <div className="max-w-[1600px] mx-auto p-6">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <p className="text-red-400 text-xl mb-4">Erro: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#FF595C] hover:bg-[#FF4C4F] text-white py-3 px-8 rounded-xl transition-all"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Header />
      <div className="max-w-[1600px] mx-auto p-6 pt-24">


        {/* Tabs e Filtros */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            {[
              { id: "all", label: "Todos" },
              { id: "valid", label: "Válidos" },
              { id: "expired", label: "Expirados" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[#FF595C] text-white"
                    : "bg-[#2B2B2B] text-gray-400 hover:bg-[#3B3B3B]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Ingressos */}
        {tickets.length === 0 ? (
          <div className="bg-[#2B2B2B] rounded-xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Nenhum ingresso encontrado
              </h3>
              <p className="text-gray-400 mb-6">
                Você ainda não possui nenhum ingresso em sua carteira.
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-[#FF595C] hover:bg-[#FF4C4F] text-white py-3 px-8 rounded-xl transition-all"
              >
                Explorar Ingressos
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.tokenId}
                onClick={() => navigate(`/ticket/${ticket.tokenId}`)}
                className="bg-[#2B2B2B] rounded-xl overflow-hidden cursor-pointer group hover:transform hover:scale-[1.02] transition-all duration-200"
              >
                {/* Imagem com Gradiente */}
                <div
                  className="aspect-square w-full relative"
                  style={{ background: getClubGradient(ticket.clubId) }}
                >
                  <img
                    src={ticket.image}
                    alt={ticket.name}
                    className="w-full h-full object-contain p-4"
                  />
                  {!ticket.isValid && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
                      Expirado
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold truncate">
                      {ticket.tokenData?.attributes?.[0]?.value || ticket.name}
                    </h3>
                    <span className="text-[#FF595C] text-sm">
                      #{ticket.tokenId}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Setor</span>
                      <span className="text-white">{ticket.sector || "N/I"}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Temporada</span>
                      <span className="text-white">
                        {/* Pega o ano da temporada e limpa para apenas o ano */}
                        {ticket.tokenData.attributes[2].value.match(/\d{4}/)?.[0] || "N/I"}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTicket(ticket.tokenId, e);
                      }}
                      className="bg-[#3B3B3B] hover:bg-[#4B4B4B] text-white py-2 px-3 rounded-xl text-sm font-medium transition-all"
                    >
                      Usar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSellTicket(ticket.tokenId, e);
                      }}
                      className="bg-[#3B3B3B] hover:bg-[#4B4B4B] text-white py-2 px-3 rounded-xl text-sm font-medium transition-all"
                    >
                      Vender
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRentTicket(ticket.tokenId, e);
                      }}
                      className="bg-[#3B3B3B] hover:bg-[#4B4B4B] text-white py-2 px-3 rounded-xl text-sm font-medium transition-all"
                    >
                      Alugar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;
