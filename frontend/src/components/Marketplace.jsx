import React, { useEffect, useState } from "react";
import axios from "axios";
import TicketCard from "./TicketCard";
import { FiSearch, FiFilter } from 'react-icons/fi';

const tabs = [
  { id: "comprar", label: "Comprar" },
  { id: "alugar", label: "Alugar" },
  { id: "colecionavel", label: "Colecionáveis" },
];

const teams = [
  { id: 1, name: "São Paulo" },
  { id: 2, name: "Flamengo" },
  { id: 3, name: "Vasco" },
  { id: 4, name: "Palmeiras" },
  { id: 5, name: "Internacional" },
  { id: 6, name: "Fluminense" },
  { id: 7, name: "Corinthians" },
];

const sortOptions = [
  { id: "recent", label: "Mais recentes" },
  { id: "price_asc", label: "Menor preço" },
  { id: "price_desc", label: "Maior preço" },
];

const Marketplace = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("comprar");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

  const ticketIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

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
                const tokenData = await axios.get(ticket.tokenURI, { headers: { Authorization: undefined } });
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
    let filtered = tickets.filter(
      (ticket) =>
        ticket.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        ticket.type === activeTab
    );

    if (selectedTeam) {
      filtered = filtered.filter(ticket => ticket.clubId === parseInt(selectedTeam));
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return (a.details?.priceFanToken || 0) - (b.details?.priceFanToken || 0);
        case "price_desc":
          return (b.details?.priceFanToken || 0) - (a.details?.priceFanToken || 0);
        case "recent":
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    setFilteredTickets(filtered);
  }, [searchTerm, activeTab, tickets, selectedTeam, sortBy]);

  return (
    <div className="min-h-screen bg-[#111111]">


      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-12">

        {/* Filtros (Time, Ordenar) */}
        {showFilters && (
          <div className="bg-[#202020] rounded-2xl p-6 mb-6 shadow-lg">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-gray-400 mb-2 text-sm">Time</label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full px-4 py-2 bg-[#2B2B2B] text-white rounded-xl border border-white/10 focus:outline-none focus:border-[#FF595C]"
                >
                  <option value="">Todos os times</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-gray-400 mb-2 text-sm">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 bg-[#2B2B2B] text-white rounded-xl border border-white/10 focus:outline-none focus:border-[#FF595C]"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Comprar / Alugar / Colecionáveis */}
        <div className="flex space-x-1 mb-6 bg-[#202020] rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-[#FF595C] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#2B2B2B]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Área dos tickets */}
        <div className="bg-[#202020] rounded-2xl p-8 shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF595C]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Nenhum ingresso encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTickets.map((ticket, index) => (
                <TicketCard key={index} ticket={ticket} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
