import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';
import { Footer } from '../../Footer/Footer';
import './AddWorkerFormWorkerStyle.css';
import { NavbarWorker } from '../NavbarWorker/NavbarWorker';

export const AddWorkerFormWorker = () => {
  const navigate = useNavigate();
  
  const [imie, setImie] = useState("");
  const [nazwisko, setNazwisko] = useState("");
  const [adresEmail, setAdresEmail] = useState("");
  const [haslo, setHaslo] = useState("");

  const [userHA, setUserHA] = useState(null);
  const [, setLoadingUserHA] = useState(true);
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setLoadingUserHA(false);
      return;
    }
    fetch(`${config.BASE_URL}/my-housing-association`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUserHA(data[0]);
        } else if (data && !Array.isArray(data)) {
          setUserHA(data);
        } else {
          setUserHA(null);
        }
        setLoadingUserHA(false);
      })
      .catch((error) => {
        console.error("Błąd podczas pobierania danych przypisanej spółdzielni:", error);
        setLoadingUserHA(false);
      });
  }, [token]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    if (
      imie.trim() === "" ||
      nazwisko.trim() === "" ||
      adresEmail.trim() === "" ||
      haslo.trim() === ""
    ) {
      return { valid: false, error: "Proszę wypełnić wszystkie pola formularza." };
    }
    if (!validateEmail(adresEmail)) {
      return { valid: false, error: "Adres e-mail jest niepoprawny." };
    }
    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { valid, error } = validateForm();
    if (!valid) {
      toast.error(error);
      return;
    }
    
    if (!userHA || !userHA.housing_association_id) {
      toast.error("Brak przypisanej spółdzielni.");
      return;
    }

    try {
      const response = await fetch(`${config.BASE_URL}/worker-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        body: JSON.stringify({
          first_name: imie,
          surname: nazwisko,
          email_address: adresEmail,
          password: haslo,
          housing_association_id: userHA.housing_association_id,
        }),
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || "Pracownik został dodany pomyślnie.");
        navigate("/browse-all-users-worker");
      } else {
        toast.error(data.error || "Błąd przy rejestracji pracownika.");
      }
    } catch (error) {
      console.error("Błąd przy rejestrowaniu pracownika:", error);
      toast.error("Wystąpił błąd. Spróbuj ponownie.");
    }
  };

  return (
    <>
      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarWorker />
        </div>

        <div className="start-window-admin-content">
          <div className="aw-section-worker">
            <div className="add-worker-section-worker">
              <h2>Dodaj nowego pracownika spółdzielni</h2>
              <div className="form-add-worker">
                <div className="form-add-worker-container">
                  <form onSubmit={handleSubmit} className="add-advertisement-form">
                    <div className="form-group-add-worker-worker">
                      <label htmlFor="imie">Imię</label>
                      <br />
                      <input
                        type="text"
                        id="imie"
                        className="input-form-add-worker-worker"
                        value={imie}
                        onChange={(e) => {
                          setImie(e.target.value);
                        }}
                        required
                        placeholder="Wpisz imię"
                      />
                    </div>

                    <div className="form-group-add-worker-worker">
                      <label htmlFor="nazwisko">Nazwisko</label>
                      <br />
                      <input
                        type="text"
                        id="nazwisko"
                        className="input-form-add-worker-worker"
                        value={nazwisko}
                        onChange={(e) => {
                          setNazwisko(e.target.value);
                        }}
                        required
                        placeholder="Wpisz nazwisko"
                      />
                    </div>

                    <div className="form-group-add-worker-worker">
                      <label htmlFor="adres_email">Adres e-mail</label>
                      <br />
                      <input
                        type="email"
                        id="adres_email"
                        className="input-form-add-worker-worker"
                        value={adresEmail}
                        onChange={(e) => {
                          setAdresEmail(e.target.value);
                        }}
                        required
                        placeholder="Wpisz adres e-mail"
                      />
                    </div>

                    <div className="form-group-add-worker-worker">
                      <label htmlFor="haslo">Hasło</label>
                      <br />
                      <input
                        type="password"
                        id="haslo"
                        className="input-form-add-worker-worker"
                        value={haslo}
                        onChange={(e) => {
                          setHaslo(e.target.value);
                        }}
                        required
                        placeholder="Wpisz hasło"
                      />
                    </div>
                    
                    {userHA && userHA.housing_association_id && (
                      <div className="form-group-add-worker-worker">
                        <label>Spółdzielnia</label>
                        <br />
                        <div>
                          {userHA.name} ({userHA.city})
                        </div>
                        <input
                          type="hidden"
                          id="housing_association_id"
                          value={userHA.housing_association_id}
                        />
                      </div>
                    )}

                    <div className="form-actions">
                      <button type="submit" className="submit-button-form-add-worker-worker">
                        Dodaj pracownika
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-start-window-admin">
          <Footer />
        </div>
      </div>
    </>
  );
};

