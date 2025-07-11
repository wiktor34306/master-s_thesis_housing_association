import UserDAO from '../DAO/userDAO';
import PasswordDAO from '../DAO/passwordDAO';
import TokenDAO from '../DAO/tokenDAO';
import applicationException from '../service/applicationException';
import bcrypt from 'bcrypt';

function create(context) {
  async function authenticate(email, password) {
    let userData;
    try {
      const user = await UserDAO.getUserByEmail(email);
      if (!user) {
        throw applicationException.new(
          applicationException.UNAUTHORIZED,
          'Użytkownik z tym adresem e-mail nie istnieje'
        );
      }
      userData = user;

      const isPasswordValid = await bcrypt.compare(password, userData.password);
      if (!isPasswordValid) {
        throw applicationException.new(
          applicationException.UNAUTHORIZED,
          'Nieprawidłowe hasło'
        );
      }
      const token = await TokenDAO.createToken(userData);
      return token;
    } catch (error) {
      console.error('Błąd w user.manager, authenticate:', error);
      throw error;
    }
  }

  async function createNewOrUpdate(userData) {
    const user = await UserDAO.createNewOrUpdate(userData);
    if (userData.password) {
      await PasswordDAO.createOrUpdate({
        user_id: user.user_id,
        password: userData.password
      });
    }
    return user;
  }

    async function removeHashSession(tokenValue) {
      const result = await TokenDAO.remove(tokenValue);
      return result;
  }

  return {
    authenticate,
    createNewOrUpdate,
    removeHashSession
  };
}

export const userManager = create();
