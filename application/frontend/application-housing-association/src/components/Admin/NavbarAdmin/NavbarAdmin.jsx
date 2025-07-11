import { useState, useEffect } from 'react';
import { FaBars } from "react-icons/fa6";
import config from '../../../config';
import LogoIcon from '../../../assets/Logo_Housing_associat_wb.png';
import './NavbarAdminStyle.css';
import { Link, useNavigate } from 'react-router-dom';
import { getName } from '../../../getName';

export const NavbarAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [hasHousingAssociation, setHasHousingAssociation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setUserName(getName() || "Użytkownik");

    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${config.BASE_URL}/what-is-my-housing-association`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setHasHousingAssociation(!!data.housing_association);
        })
        .catch((error) => {
          console.error("[NavbarAdmin] Błąd pobierania danych spółdzielni:", error);
          setHasHousingAssociation(false);
        });
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const response = await fetch(`${config.BASE_URL}/logout`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });
      if (response.ok) {
        localStorage.removeItem("token");
        navigate("/");
      } else if (response.status === 401) {
        console.warn("[LOGOUT] 401 Unauthorized - token mógł wygasnąć. Usuwam token i przekierowuję.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        console.error("[LOGOUT] Błąd podczas wylogowywania. Status:", response.status);
      }
    } catch (error) {
      console.error("[LOGOUT] Wyjątek podczas wylogowywania:", error);
    }
  };

  return (
    <>
      <header>
        <div className="admin-navbar-container">
          <div className="admin-navbar">
            <div className="admin-navbar-logo">
              <Link to="/homepageadmin">
                <img src={LogoIcon} alt="Logo" width="160" height="60" />
              </Link>
            </div>

            <div className="admin-navbar-center"></div>

            <div className="admin-navbar-menu">
              <nav>
                <ul className={isOpen ? "admin-nav-link active" : "admin-nav-link"}>

                  { !hasHousingAssociation && (
                    <li>
                      <a href="#">Spółdzielnia</a>
                      <ul className="admin-submenu">
                        <li>
                          <Link to="/add-housing-association-form-admin" onClick={() => setIsOpen(false)}>
                            Dodaj spółdzielnię
                          </Link>
                        </li>
                        <li>
                          <Link to="/browse-housing-association-admin" onClick={() => setIsOpen(false)}>
                            Przeglądaj dodane spółdzielnie
                          </Link>
                        </li>
                      </ul>
                    </li>
                  )}
                  
                  <li>
                    <a href="#">Konto</a>
                    <ul className="admin-submenu">
                      <li>
                        <Link to="/add-administrator-form-admin" onClick={() => setIsOpen(false)}>
                          Dodaj administratora
                        </Link>
                      </li>
                      <li>
                        <Link to="/add-worker-form-admin" onClick={() => setIsOpen(false)}>
                          Dodaj pracownika spółdzielni
                        </Link>
                      </li>
                      <li>
                        <Link to="/add-resident-form-admin" onClick={() => setIsOpen(false)}>
                          Dodaj mieszkańca spółdzielni
                        </Link>
                      </li>
                      <li>
                        <Link to="/browse-all-users-admin" onClick={() => setIsOpen(false)}>
                          Wyświetl wszystkie konta
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#">Kalendarz</a>
                    <ul className="admin-submenu">
                      <li>
                        <Link to="/add-event-to-calendar-admin" onClick={() => setIsOpen(false)}>
                          Dodaj wydarzenie
                        </Link>
                      </li>
                      <li>
                        <Link to="/browse-events-admin" onClick={() => setIsOpen(false)}>
                          Przeglądaj wydarzenia
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#">Zgłoszenia</a>
                    <ul className="admin-submenu">
                      <li>
                        <Link to="/browse-reports-admin" onClick={() => setIsOpen(false)}>
                          Przeglądaj zgłoszenia
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#">Ogłoszenia</a>
                    <ul className="admin-submenu">
                      <li>
                        <Link to="/admin-add-advertisement" onClick={() => setIsOpen(false)}>
                          Dodaj ogłoszenie
                        </Link>
                      </li>
                      <li>
                        <Link to="/advertisement-setting-grid-admin" onClick={() => setIsOpen(false)}>
                          Przeglądaj ogłoszenia
                        </Link>
                      </li>
                    </ul>
                  </li>
                  
                  { hasHousingAssociation && (
                    <li>
                      <a href="#">Dokumenty</a>
                      <ul className="admin-submenu">
                        <li>
                          <Link to="/generate-invoice-pdf-admin" onClick={() => setIsOpen(false)}>
                            Dodaj dokument
                          </Link>
                        </li>
                        <li>
                          <Link to="/browse-all-invoices-admin" onClick={() => setIsOpen(false)}>
                            Przeglądaj dokumenty
                          </Link>
                        </li>
                      </ul>
                    </li>
                  )}
                  <li>
                    <a href="#">Użytkownik</a>
                    <ul className="admin-submenu">
                      <li>
                        <p className="welcome-user">Witaj, {userName}</p>
                      </li>
                      <li>
                        <Link to="/edit-user-admin" onClick={() => setIsOpen(false)}>
                          Przeglądaj moje dane
                        </Link>
                      </li>
                      <li>
                        <button onClick={handleLogout} className="welcome-user logout-button">
                          Wyloguj się
                        </button>
                      </li>
                    </ul>
                  </li>
                </ul>
                <div className="admin-navbar-icon" onClick={toggleMenu}>
                  <FaBars />
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>
 
      {isOpen && (
        <div 
          className="navbar-overlay" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

