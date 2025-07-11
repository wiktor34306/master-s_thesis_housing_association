import { useState, useEffect } from 'react';
import { FaBars } from "react-icons/fa6";
import config from '../../../config';
import LogoIcon from '../../../assets/Logo_Housing_associat_wb.png';
import { Link, useNavigate } from 'react-router-dom';
import { getName } from '../../../getName';
import './NavbarResidentStyle.css';

export const NavbarResident = () => {
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
          console.error("[NavbarWorker] Błąd pobierania danych spółdzielni:", error);
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
        <div className="resident-navbar-container">
          <div className="resident-navbar">
            <div className="resident-navbar-logo">
              <Link to="/homepageresident">
                <img src={LogoIcon} alt="Logo" width="160" height="60" />
              </Link>
            </div>

            <div className="resident-navbar-center"></div>

            <div className="resident-navbar-menu">
              <nav>
                <ul className={isOpen ? "resident-nav-link active" : "resident-nav-link"}>                
                  <li>
                    <a href="#">Konto</a>
                    <ul className="resident-submenu">
                      <li>
                        <Link to="/edit-user-resident" onClick={() => setIsOpen(false)}>
                          Przeglądaj swoje dane
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#">Kalendarz</a>
                    <ul className="resident-submenu">
                      <li>
                        <Link to="/browse-events-resident" onClick={() => setIsOpen(false)}>
                          Przeglądaj wydarzenia
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#">Zgłoszenia</a>
                    <ul className="resident-submenu">
                      <li>
                        <li>
                          <Link to="/add-report-resident">Dodaj zgłoszenie</Link>
                        </li>
                        </li>
                        <li>
                          <li>
                            <Link to="/browse-your-reports-resident">Przeglądaj zgłoszenia</Link>
                          </li>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#">Ogłoszenia</a>
                    <ul className="resident-submenu">
                      <li>
                        <Link to="/add-advertisement-form-resident" onClick={() => setIsOpen(false)}>
                          Dodaj ogłoszenie
                        </Link>
                      </li>
                      <li>
                        <Link to="/advertisement-setting-grid-resident" onClick={() => setIsOpen(false)}>
                          Przeglądaj ogłoszenia
                        </Link>
                      </li>
                    </ul>
                  </li>
                    <li>
                      <a href="#">Dokumenty</a>
                      <ul className="resident-submenu">
                        <li>
                          <Link to="/browse-my-invoices-resident" onClick={() => setIsOpen(false)}>
                            Przeglądaj dokumenty
                          </Link>
                        </li>
                      </ul>
                    </li>
                  <li>
                    <a href="#">Użytkownik</a>
                    <ul className="resident-submenu">
                      <li>
                        <p className="welcome-user-resident">Witaj, {userName}</p>
                      </li>
                      <li>
                        <Link to="/edit-user-resident" onClick={() => setIsOpen(false)}>
                          Przeglądaj moje dane
                        </Link>
                      </li>
                      <li>
                        <button onClick={handleLogout} className="welcome-user-resident logout-button-resident">
                          Wyloguj się
                        </button>
                      </li>
                    </ul>
                  </li>
                </ul>
                <div className="resident-navbar-icon" onClick={toggleMenu}>
                  <FaBars />
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>
 
      {isOpen && (
        <div 
          className="navbar-overlay-resident" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};
