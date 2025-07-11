import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../../config";
import { NavbarAdmin } from "../NavbarAdmin/NavbarAdmin";
import { Footer } from "../../Footer/Footer";
import "./AddResidentFormAdminStyle.css";

export const AddResidentFormAdmin = () => {
  const navigate = useNavigate();

  const [imie, setImie] = useState("");
  const [nazwisko, setNazwisko] = useState("");
  const [adresEmail, setAdresEmail] = useState("");
  const [haslo, setHaslo] = useState("");
  const [housingAssociationId, setHousingAssociationId] = useState("");
  const [housingAssociations, setHousingAssociations] = useState([]);

  const [street, setStreet] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [userHA, setUserHA] = useState(null);
  const [loadingUserHA, setLoadingUserHA] = useState(true);

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
        if (response.status === 403) {
          console.warn("Otrzymano 403 – administrator główny, brak przypisanej spółdzielni");
          setUserHA({ housing_association_id: null });
          setLoadingUserHA(false);
          return []; 
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUserHA(data[0]);
          if (data[0].housing_association_id !== null) {
            setHousingAssociationId(data[0].housing_association_id);
          }
        } else if (data && !Array.isArray(data)) {
          setUserHA(data);
          if (data.housing_association_id !== null) {
            setHousingAssociationId(data.housing_association_id);
          }
        } else {
          setUserHA({ housing_association_id: null });
        }
        setLoadingUserHA(false);
      })
      .catch((error) => {
        console.error("Błąd podczas pobierania danych spółdzielni:", error);
        setLoadingUserHA(false);
      });
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    if (userHA && userHA.housing_association_id === null) {
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
  }, [token, userHA]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const regex = /^\d+$/;
    return regex.test(phone);
  };

  const validateForm = () => {
    if (
      imie.trim() === "" ||
      nazwisko.trim() === "" ||
      adresEmail.trim() === "" ||
      haslo.trim() === "" ||
      housingAssociationId.toString().trim() === "" ||
      street.trim() === "" ||
      buildingNumber.trim() === "" ||
      phoneNumber.trim() === ""
    ) {
      return { valid: false, error: "Proszę wypełnić wszystkie pola formularza." };
    }
    if (!validateEmail(adresEmail)) {
      return { valid: false, error: "Adres e-mail jest niepoprawny." };
    }
    if (!validatePhoneNumber(phoneNumber)) {
      return { valid: false, error: "Numer telefonu musi zawierać wyłącznie cyfry." };
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
      const response = await fetch(`${config.BASE_URL}/resident-registration`, {
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
          housing_association_id: finalHousingAssociationId,
          street,
          building_number: buildingNumber,
          apartment_number: apartmentNumber,
          phone_number: phoneNumber,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Rekord mieszkańca dodany pomyślnie.");
        navigate("/browse-all-users-admin");
      } else {
        toast.error(data.error || "Błąd przy rejestracji mieszkańca.");
      }
    } catch (error) {
      console.error("Błąd podczas rejestracji mieszkańca:", error);
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
          <div className="ar-section">
            <div className="add-resident-section">
              <h2>Dodaj nowego mieszkańca spółdzielni</h2>
              <div className="form-add-resident-admin">
                <div className="form-add-resident-container-admin">
                  <form onSubmit={handleSubmit} className="add-advertisement-form">

                    <div className="form-group-add-resident-admin">
                      <label htmlFor="imie">Imię</label><br />
                      <input
                        type="text"
                        id="imie"
                        className="input-form-add-resident-admin"
                        value={imie}
                        onChange={(e) => {
                          setImie(e.target.value);
                        }}
                        required
                        placeholder="Wpisz imię"
                      />
                    </div>
                    <div className="form-group-add-resident-admin">
                      <label htmlFor="nazwisko">Nazwisko</label><br />
                      <input
                        type="text"
                        id="nazwisko"
                        className="input-form-add-resident-admin"
                        value={nazwisko}
                        onChange={(e) => {
                          setNazwisko(e.target.value);
                        }}
                        required
                        placeholder="Wpisz nazwisko"
                      />
                    </div>
                    <div className="form-group-add-resident-admin">
                      <label htmlFor="adres_email">Adres e-mail</label><br />
                      <input
                        type="email"
                        id="adres_email"
                        className="input-form-add-resident-admin"
                        value={adresEmail}
                        onChange={(e) => {
                          setAdresEmail(e.target.value);
                        }}
                        required
                        placeholder="Wpisz adres e-mail"
                      />
                    </div>
                    <div className="form-group-add-resident-admin">
                      <label htmlFor="haslo">Hasło</label><br />
                      <input
                        type="password"
                        id="haslo"
                        className="input-form-add-resident-admin"
                        value={haslo}
                        onChange={(e) => {
                          setHaslo(e.target.value);
                        }}
                        required
                        placeholder="Wpisz hasło"
                      />
                    </div>

                    {userHA && userHA.housing_association_id === null ? (
                      <div className="form-group-add-resident-admin">
                        <label htmlFor="housing_association_id">Wybierz spółdzielnię</label><br />
                        <select
                          id="housing_association_id"
                          className="input-form-add-resident-admin"
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
                        <div className="form-group-add-resident-admin">
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

                    <div className="form-group-add-resident-admin">
                      <label htmlFor="street">Ulica</label><br />
                      <input
                        type="text"
                        id="street"
                        className="input-form-add-resident-admin"
                        value={street}
                        onChange={(e) => {
                          setStreet(e.target.value);
                        }}
                        required
                        placeholder="Wpisz ulicę"
                      />
                    </div>
                    <div className="form-group-add-resident-admin">
                      <label htmlFor="building_number">Numer budynku</label><br />
                      <input
                        type="text"
                        id="building_number"
                        className="input-form-add-resident-admin"
                        value={buildingNumber}
                        onChange={(e) => {
                          setBuildingNumber(e.target.value);
                        }}
                        required
                        placeholder="Wpisz numer budynku"
                      />
                    </div>
                    <div className="form-group-add-resident-admin">
                      <label htmlFor="apartment_number">Numer mieszkania</label><br />
                      <input
                        type="text"
                        id="apartment_number"
                        className="input-form-add-resident-admin"
                        value={apartmentNumber}
                        onChange={(e) => {
                          setApartmentNumber(e.target.value);
                        }}
                        placeholder="Wpisz numer mieszkania"
                      />
                    </div>
                    <div className="form-group-add-resident-admin">
                      <label htmlFor="phone_number">Telefon</label><br />
                      <input
                        type="text"
                        id="phone_number"
                        className="input-form-add-resident-admin"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                        }}
                        required
                        placeholder="Wpisz numer telefonu"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="submit-button-form-add-resident-admin">
                        Dodaj mieszkańca
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
