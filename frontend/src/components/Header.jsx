import { FiSearch, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="fixed top-0 w-full bg-background border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Esquerda: Logo + Links */}
        <div className="flex items-center gap-6">
          {/* Logo e nome */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="FanPass" className="w-8 h-8" />
            <span className="text-white text-lg font-bold">FanPass</span>
          </Link>

          {/* Separador */}
          <div className="h-6 w-px bg-gray-600" />

          {/* Páginas */}
          <nav className="flex gap-6 text-gray-300 font-medium">
            <Link to="/" className="hover:text-white transition">
              Mercado
            </Link>
            <Link to="/meus-ingressos" className="hover:text-white transition">
              Meus Ingressos
            </Link>
            <Link to="/meus-descontos" className="hover:text-white transition">
              Meus Descontos
            </Link>
          </nav>
        </div>

        {/* Centro: Search */}
        <div className="flex-1 mx-12">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ingresso..."
              className="w-full pl-12 pr-4 py-2 bg-cinza text-white placeholder-gray-400 rounded-xl border border-white/10 focus:outline-none focus:border-vermelho transition-all"
            />
          </div>
        </div>

        {/* Direita: Ícone de Perfil */}
        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className="bg-cinza p-2 rounded-xl hover:bg-cinza-claro transition"
          >
            <FiUser className="text-white text-xl" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
