import { jwtDecode } from 'jwt-decode';

export const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return {};
  }
  try {
    const decodedToken = jwtDecode(token);
    const role = decodedToken.role ?? '';
    return { role };
  } catch (error) {
    console.error("Błąd dekodowania tokena:", error);
    return {};
  }
};
