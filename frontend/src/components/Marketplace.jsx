import React, { useEffect, useState } from "react";
import axios from "axios";
import TicketCard from "./TicketCard";

const tabs = [
  { id: "comprar", label: "Comprar" },
  { id: "alugar", label: "Alugar" },
  { id: "colecionavel", label: "Colecionáveis" },
];

const Marketplace = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("comprar");

  const ticketIds = [2, 3, 4];

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const responses = await Promise.all(
          ticketIds.map((id) => axios.get(`http://localhost:3001/ticket/${id}`))
        );

        const ticketsData = await Promise.all(
          responses.map(async (response) => {
            const ticket = response.data;
            if (ticket.tokenURI) {
              try {
                const tokenData = await axios.get(ticket.tokenURI, {
                  headers: {
                    // Remova qualquer header global indesejado aqui
                    Authorization: undefined,
                  },
                });

                return {
                  ...ticket,
                  name: tokenData.data.name,
                  description: tokenData.data.description,
                  image: tokenData.data.image,
                  attributes: tokenData.data.attributes,
                  type: tokenData.data.type || "comprar",
                };
              } catch {
                return ticket;
              }
            }
            return ticket;
          })
        );

        setTickets(ticketsData);
      } catch {
        setError("Ocorreu um erro ao buscar os ingressos.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = tickets.filter(
      (ticket) =>
        ticket.name?.toLowerCase().includes(lowerSearch) &&
        ticket.type === activeTab
    );
    setFilteredTickets(filtered);
  }, [searchTerm, activeTab, tickets]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#1a1a1a] text-white px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Título */}
        <h1 className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight mb-8 text-white/90">
          Mercado de Ingressos
        </h1>

        {/* Campo de busca refinado */}
        <div className="mb-10 flex justify-center">
          <input
            type="text"
            placeholder="Buscar ingresso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-lg px-6 py-4 bg-white/10 text-white placeholder-gray-300 rounded-full border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
          />
        </div>

        {/* Tabs estilizadas */}
        <div className="relative mb-6 flex justify-center">
          <div className="flex space-x-8 border-b border-white/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 text-lg font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "text-red-500 border-b-4 border-red-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Área dos tickets com fundo mais claro e largura completa */}
      <div className="w-full rounded-2xl bg-white/15 backdrop-blur-lg p-6">
        {loading && (
          <p className="text-center text-lg text-gray-300 animate-pulse">
            Carregando ingressos...
          </p>
        )}
        {error && (
          <p className="text-center text-red-400 font-medium">{error}</p>
        )}

        {!loading && !error && (
          <>
            {filteredTickets.length === 0 ? (
              <p className="text-center text-gray-300">
                Nenhum ingresso disponível nesta categoria.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredTickets.map((ticket, index) => (
                  <TicketCard key={index} ticket={ticket} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
