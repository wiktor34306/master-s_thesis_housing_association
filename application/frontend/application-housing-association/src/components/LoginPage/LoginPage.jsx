import { useState } from 'react';
import './LoginPageStyle.css';
import { FaUser, FaLock } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ajax } from "rxjs/ajax";
import { catchError, map } from "rxjs/operators";
import { of } from "rxjs";
import { getUserRole } from '../../getUserRole';
import config from '../../config';

export const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const loginData = { email, password };    
    const login$ = ajax.post(`${config.BASE_URL}/login`, loginData, {
      "Content-Type": "application/json",
    });

    login$
      .pipe(
        map((response) => {
          if (response.status === 400) {
            localStorage.removeItem('token');
            window.location.reload();
            navigate('/');
          }
          return response.response;
        }),
        catchError((error) => {
          
          const errMsg =
            (error?.response?.error) ||
            (error?.response?.message) ||
            error?.message ||
            "Błąd logowania";
          
          if (error.status === 401) {
            setError(errMsg);
            localStorage.removeItem('token');
            navigate('/');
            toast.error(errMsg, { theme: "colored", autoClose: 5000 });
          } else {
            setError("Nieprawidłowa odpowiedź serwera.");
            toast.error("Nieprawidłowa odpowiedź serwera.", { theme: "colored", autoClose: 5000 });
          }
          return of(null);
        })
      )
      .subscribe(
        (data) => {
          if (data) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userEmail", email);

            const userInfo = getUserRole();
            const { role } = userInfo;

            switch (role) {
              case 'administrator':
                navigate("/homepageadmin");
                break;
              case 'worker':
                navigate("/homepageworker");
                break;
              case 'resident':
                navigate("/homepageresident");
                break;
              default:
                console.log("Brak odpowiadającej roli.");
            }
            onLogin(role);
          } else {
          }
        },
        (error) => {
          console.error("Subscribe error:", error);
        }
      );
  };

  return (
    <div className="login-page-container">
      <div className="login-wrapper">
        <form onSubmit={handleSubmit}>
          <h1>Logowanie</h1>
          <div className="login-input-box">
            <input
              type="text"
              placeholder="Adres e-mail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FaUser className="login-form-icon" />
          </div>
          <div className="login-input-box">
            <input
              type="password"
              placeholder="Hasło"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FaLock className="login-form-icon" />
          </div>
          <button type="submit">Zaloguj</button>
        </form>
      </div>
    </div>
  );
};
