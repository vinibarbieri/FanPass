const UserService = require("../services/userService");

class UserController {
  constructor(userService = new UserService()) {
    this.userService = userService;
  }

  async register(req, res) {
    try {
      const { name, email, password, cpf, walletType, publicKey } = req.body;
      if (!name || !email || !password || !cpf || !walletType) {
        return res.status(400).json({ error: "All fields are required" });
      }
      const user = await this.userService.register({
        name,
        email,
        password,
        cpf,
        walletType,
        publicKey,
      });
      return res.status(201).json(user);
    } catch (error) {
      console.error(`Error in register: ${error.message}`);
      return res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Verificar se o email e a senha foram fornecidos
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      // Chamar o método de login do userService para verificar as credenciais
      const user = await this.userService.login({ email, password });

      // Retornar a resposta com os dados do usuário e o token JWT
      return res.status(200).json({
        user: user.user, // Dados do usuário
        token: user.token, // Token JWT gerado
      });
    } catch (error) {
      console.error(`Error in login: ${error.message}`);
      return res.status(400).json({ error: error.message });
    }
  }

  async linkWallet(req, res) {
    try {
      const { id } = req.params;
      const { publicKey, walletType } = req.body;
      if (!publicKey || !walletType) {
        return res
          .status(400)
          .json({ error: "Public key and wallet type are required" });
      }
      const result = await this.userService.linkWallet(
        id,
        publicKey,
        walletType
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error(`Error linking wallet: ${error.message}`);
      return res.status(400).json({ error: error.message });
    }
  }

  // Método getUser
  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error(`Error in getUser: ${error.message}`);
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = UserController;
