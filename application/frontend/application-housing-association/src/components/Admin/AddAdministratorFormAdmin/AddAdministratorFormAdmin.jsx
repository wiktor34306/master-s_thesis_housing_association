import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../../config";
import { NavbarAdmin } from "../NavbarAdmin/NavbarAdmin";
import { Footer } from "../../Footer/Footer";
import "./AddAdministratorFormAdminStyle.css";

export const AddAdministratorFormAdmin = () => {
  const navigate = useNavigate();
  
  const [imie, setImie] = useState("");
  const [nazwisko, setNazwisko] = useState("");
  const [adresEmail, setAdresEmail] = useState("");
  const [haslo, setHaslo] = useState("");
  const [housingAssociationId, setHousingAssociationId] = useState("");
  const [housingAssociations, setHousingAssociations] = useState([]);
    const [userHA, setUserHA] = useState(null);
  const [loadingUserHA, setLoadingUserHA] = useState(true);

  const role = JSON.parse(localStorage.getItem("userRole"))?.role || "administrator"; 

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setLoadingUserHA(false);
      return;
    }

    if (role === "administrator") {
      fetch(`${config.BASE_URL}/my-housing-association`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
      })
        .then((response) => {
          if (response.status === 403) {
            console.warn("Otrzymano 403 – zakładam, że administrator jest główny (housing_association_id = null)");
            setUserHA({ housing_association_id: null });
            setLoadingUserHA(false);
            return []; 
          }
          return response.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            if (data.length > 0) {
              setUserHA(data[0]);
            } else {
              setUserHA({ housing_association_id: null });
            }
          } else {
            setUserHA(data);
          }
          setLoadingUserHA(false);
        })
        .catch((error) => {
          console.error("Błąd podczas pobierania danych spółdzielni:", error);
          setLoadingUserHA(false);
        });
    } else {
      setLoadingUserHA(false);
    }
  }, [token, role]);

  useEffect(() => {
    if (!token) {
      return;
    }
    if (role === "administrator" && userHA && userHA.housing_association_id === null) {
      fetch(`${config.BASE_URL}/get-all-housing-associations`, {
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
          setHousingAssociations(data);
        })
        .catch((error) => {
          console.error("Błąd przy pobieraniu listy spółdzielni:", error);
        });
    }
  }, [token, role, userHA]);

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
    if (userHA && userHA.housing_association_id === null && housingAssociationId.trim() === "") {
      return { valid: false, error: "Proszę wybrać spółdzielnię." };
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
    
    const finalHousingAssociationId =
      userHA && userHA.housing_association_id !== null
        ? userHA.housing_association_id
        : housingAssociationId;
        
    try {
      const response = await fetch(`${config.BASE_URL}/administrator-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        body: JSON.stringify({
          imie,
          nazwisko,
          adres_email: adresEmail,
          haslo,
          housing_association_id: finalHousingAssociationId,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Administrator zarejestrowany pomyślnie.");
        navigate("/browse-all-users-admin");
      } else {
        toast.error(data.error || "Błąd przy rejestracji administratora.");
      }
    } catch (error) {
      console.error("Błąd przy rejestrowaniu administratora:", error);
      toast.error("Wystąpił błąd. Spróbuj ponownie.");
    }
  };

  return (
    <>
      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarAdmin />
        </div>

        <div className="start-window-admin-content">
          <div className="aa-section">
            <div className="add-admin-section">
              <h2>Dodaj nowego administratora</h2>
              <div className="form-add-admin">
                <div className="form-add-admin-container">
                  <form onSubmit={handleSubmit} className="add-advertisement-form">
                    <div className="form-group-add-admin">
                      <label htmlFor="imie">Imię</label><br />
                      <input
                        type="text"
                        id="imie"
                        className="input-form-add-admin"
                        value={imie}
                        onChange={(e) => {
                          setImie(e.target.value);
                        }}
                        required
                        placeholder="Wpisz imię"
                      />
                    </div>

                    <div className="form-group-add-admin">
                      <label htmlFor="nazwisko">Nazwisko</label><br />
                      <input
                        type="text"
                        id="nazwisko"
                        className="input-form-add-admin"
                        value={nazwisko}
                        onChange={(e) => {
                          setNazwisko(e.target.value);
                        }}
                        required
                        placeholder="Wpisz nazwisko"
                      />
                    </div>

                    <div className="form-group-add-admin">
                      <label htmlFor="adres_email">Adres e-mail</label><br />
                      <input
                        type="email"
                        id="adres_email"
                        className="input-form-add-admin"
                        value={adresEmail}
                        onChange={(e) => {
                          setAdresEmail(e.target.value);
                        }}
                        required
                        placeholder="Wpisz adres e-mail"
                      />
                    </div>

                    <div className="form-group-add-admin">
                      <label htmlFor="haslo">Hasło</label><br />
                      <input
                        type="password"
                        id="haslo"
                        className="input-form-add-admin"
                        value={haslo}
                        onChange={(e) => {
                          setHaslo(e.target.value);
                        }}
                        required
                        placeholder="Wpisz hasło"
                      />
                    </div>

                    {userHA && userHA.housing_association_id === null ? (
                      <div className="form-group-add-admin">
                        <label htmlFor="housing_association_id">Wybierz spółdzielnię</label><br />
                        <select
                          id="housing_association_id"
                          className="input-form-add-admin"
                          value={housingAssociationId}
                          onChange={(e) => {
                            setHousingAssociationId(e.target.value);
                          }}
                          required
                        >
                          <option value="">Wybierz spółdzielnię</option>
                          {housingAssociations.map((ha) => (
                            <option
                              key={ha.housing_association_id}
                              value={ha.housing_association_id}
                            >
                              {ha.name} ({ha.city})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      userHA && userHA.housing_association_id !== null && (
                        <div className="form-group-add-admin">
                          <label>Spółdzielnia</label><br />
                          <div>
                            {userHA.name} ({userHA.city})
                          </div>
                 
                          <input
                            type="hidden"
                            id="housing_association_id"
                            value={userHA.housing_association_id}
                          />
                        </div>
                      )
                    )}

                    <div className="form-actions">
                      <button type="submit" className="submit-button-form-add-admin">
                        Dodaj administratora
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-start-window-admin">
        <Footer />
      </div>
    </>
  );
};
