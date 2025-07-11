import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../../config";
import { NavbarWorker } from "../NavbarWorker/NavbarWorker";
import { Footer } from "../../Footer/Footer";
import "./AddResidentFormWorkerStyle.css";

export const AddResidentFormWorker = () => {
  const navigate = useNavigate();

  const [imie, setImie] = useState("");
  const [nazwisko, setNazwisko] = useState("");
  const [adresEmail, setAdresEmail] = useState("");
  const [haslo, setHaslo] = useState("");

  const [userHA, setUserHA] = useState(null);
  const [loadingUserHA, setLoadingUserHA] = useState(true);

  const [street, setStreet] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

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
          console.warn("Otrzymano 403 – brak przypisanej spółdzielni");
          setUserHA({ housing_association_id: null });
          setLoadingUserHA(false);
          return [];
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUserHA(data[0]);
        } else if (data && !Array.isArray(data)) {
          setUserHA(data);
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

    if (!userHA || !userHA.housing_association_id) {
      toast.error("Brak przypisanej spółdzielni.");
      return;
    }

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
          housing_association_id: userHA.housing_association_id,
          street,
          building_number: buildingNumber,
          apartment_number: apartmentNumber,
          phone_number: phoneNumber,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Rekord mieszkańca dodany pomyślnie.");
        navigate("/browse-all-users-worker");
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
          <NavbarWorker />
        </div>
        <div className="start-window-admin-content">
          <div className="ar-section-worker">
            <div className="add-resident-section-worker">
              <h2>Dodaj nowego mieszkańca spółdzielni</h2>
              <div className="form-add-resident-worker">
                <div className="form-add-resident-container-worker">
                  <form onSubmit={handleSubmit} className="add-advertisement-form">
      
                    <div className="form-group-add-resident-worker">
                      <label htmlFor="imie">Imię</label>
                      <br />
                      <input
                        type="text"
                        id="imie"
                        className="input-form-add-resident-worker"
                        value={imie}
                        onChange={(e) => {
                          setImie(e.target.value);
                        }}
                        required
                        placeholder="Wpisz imię"
                      />
                    </div>
                    <div className="form-group-add-resident-worker">
                      <label htmlFor="nazwisko">Nazwisko</label>
                      <br />
                      <input
                        type="text"
                        id="nazwisko"
                        className="input-form-add-resident-worker"
                        value={nazwisko}
                        onChange={(e) => {
                          setNazwisko(e.target.value);
                        }}
                        required
                        placeholder="Wpisz nazwisko"
                      />
                    </div>
                    <div className="form-group-add-resident-worker">
                      <label htmlFor="adres_email">Adres e-mail</label>
                      <br />
                      <input
                        type="email"
                        id="adres_email"
                        className="input-form-add-resident-worker"
                        value={adresEmail}
                        onChange={(e) => {
                          setAdresEmail(e.target.value);
                        }}
                        required
                        placeholder="Wpisz adres e-mail"
                      />
                    </div>
                    <div className="form-group-add-resident-worker">
                      <label htmlFor="haslo">Hasło</label>
                      <br />
                      <input
                        type="password"
                        id="haslo"
                        className="input-form-add-resident-worker"
                        value={haslo}
                        onChange={(e) => {
                          setHaslo(e.target.value);
                        }}
                        required
                        placeholder="Wpisz hasło"
                      />
                    </div>

                    {userHA && userHA.housing_association_id && (
                      <div className="form-group-add-resident-worker">
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

                    <div className="form-group-add-resident-worker">
                      <label htmlFor="street">Ulica</label>
                      <br />
                      <input
                        type="text"
                        id="street"
                        className="input-form-add-resident-worker"
                        value={street}
                        onChange={(e) => {
                          setStreet(e.target.value);
                        }}
                        required
                        placeholder="Wpisz ulicę"
                      />
                    </div>
                    <div className="form-group-add-resident-worker">
                      <label htmlFor="building_number">Numer budynku</label>
                      <br />
                      <input
                        type="text"
                        id="building_number"
                        className="input-form-add-resident-worker"
                        value={buildingNumber}
                        onChange={(e) => {
                          setBuildingNumber(e.target.value);
                        }}
                        required
                        placeholder="Wpisz numer budynku"
                      />
                    </div>
                    <div className="form-group-add-resident-worker">
                      <label htmlFor="apartment_number">Numer mieszkania</label>
                      <br />
                      <input
                        type="text"
                        id="apartment_number"
                        className="input-form-add-resident-worker"
                        value={apartmentNumber}
                        onChange={(e) => {
                          setApartmentNumber(e.target.value);
                        }}
                        placeholder="Wpisz numer mieszkania"
                      />
                    </div>
                    <div className="form-group-add-resident-worker">
                      <label htmlFor="phone_number">Telefon</label>
                      <br />
                      <input
                        type="text"
                        id="phone_number"
                        className="input-form-add-resident-worker"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                        }}
                        required
                        placeholder="Wpisz numer telefonu"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="submit-button-form-add-resident-worker">
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
