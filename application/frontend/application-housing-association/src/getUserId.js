import { jwtDecode } from 'jwt-decode';

export const getUserId = () => {
    if (!localStorage.getItem('token')) {
      return '';
    }

    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    return decodedToken.user_id ?? '';
  };