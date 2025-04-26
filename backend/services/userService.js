const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const createBiconomyWallet = require("../utils/biconomyWallet");

class UserService {
  async register({ name, email, password, cpf, walletType, publicKey }) {
    try {
      const existingUser = await User.findOne({ $or: [{ email }, { cpf }] });
      if (existingUser) {
        throw new Error("Email or CPF already in use");
      }
      let finalPublicKey;
      if (walletType === "generated") {
        // Gerar a carteira no backend
        finalPublicKey = await createBiconomyWallet(); // Assumindo que createBiconomyWallet gera uma chave pública válida
      } else if (walletType === "metamask") {
        finalPublicKey = publicKey;
      } else {
        throw new Error("Invalid wallet type");
      }

      if (!finalPublicKey) {
        throw new Error("Failed to generate valid wallet address");
      }

      const user = new User({
        name,
        email,
        password,
        cpf,
        publicKey: finalPublicKey, // Defina o publicKey com a chave pública gerada
      });

      await user.save();
      return { id: user._id, name, email, cpf, publicKey: finalPublicKey };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async login({ email, password }) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("User not found");
      }

      // Verificar a senha usando o método comparePassword
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        throw new Error("Invalid credentials");
      }

      // Gerar token JWT
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      return {
        user: { id: user._id, name: user.name, email: user.email },
        token,
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async linkWallet(userId, publicKey, walletType) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      let finalPublicKey;
      if (walletType === "generated") {
        // Gerar a carteira no backend
        finalPublicKey = await createBiconomyWallet();
      } else if (walletType === "metamask") {
        // Usar a carteira fornecida pelo MetaMask
        finalPublicKey = publicKey;
      } else {
        throw new Error("Invalid wallet type");
      }

      user.publicKey = finalPublicKey;
      await user.save();
      return {
        message: "Wallet linked successfully",
        publicKey: finalPublicKey,
      };
    } catch (error) {
      throw new Error(`Linking wallet failed: ${error.message}`);
    }
  }

  // Método getUserById
  async getUserById(id) {
    try {
      const user = await User.findById(id);
      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }
}

module.exports = UserService;
