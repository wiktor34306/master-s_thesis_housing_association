import { jwtDecode } from 'jwt-decode';

export const getName = () => {
  if(!localStorage.getItem('token')) {
    return 
  }
  const token = localStorage.getItem('token');
  const decodedToken = jwtDecode(token);
  return decodedToken.first_name ?? ''
}