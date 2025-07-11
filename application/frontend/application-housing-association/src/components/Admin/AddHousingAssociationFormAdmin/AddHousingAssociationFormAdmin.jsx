import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';
import { NavbarAdmin } from '../NavbarAdmin/NavbarAdmin';
import { Footer } from '../../Footer/Footer';
import './AddHousingAssociationFormAdminStyle.css';

export const AddHousingAssociationFormAdmin = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${config.BASE_URL}/housing-association-registration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            name,
            address,
            city,
            postcode,
            phone_number: phoneNumber,
            email_address: emailAddress,
          }),
        }
      );
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || "Spółdzielnia mieszkaniowa dodana pomyślnie.");
        navigate("/browse-housing-association-admin"); 
      } else {
        toast.error(data.error || "Błąd przy dodawaniu spółdzielni.");
      }
    } catch (error) {
      console.error("Błąd przy dodawaniu spółdzielni:", error);
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
          <div className="ha-form-section">
          <div className="housing-association-form-section">
            <h2>Dodaj nową spółdzielnię mieszkaniową</h2>
            <div className="form-add-ha-admin">
              <div className="form-add-ha-form-admin-container">
                <form onSubmit={handleSubmit} className="add-ha-form">
                  <div className="form-group-ha-admin">
                    <label htmlFor="name">Nazwa spółdzielni</label>
                    <br />
                    <input
                      type="text"
                      id="input-add-ha-form-admin"
                      className="input-form-ha-admin"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Wpisz nazwę spółdzielni (np. Spółdzielnia Akademicka)"
                    />
                  </div>
                  <div className="form-group-ha-admin">
                    <label htmlFor="address">Adres</label>
                    <br />
                    <input
                      type="text"
                      id="input-add-ha-form-admin"
                      className="input-form-ha-admin"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      placeholder="Wpisz adres spółdzielni (np. Lipska 1)"
                    />
                  </div>
                  <div className="form-group-ha-admin">
                    <label htmlFor="postcode">Kod pocztowy</label>
                    <br />
                    <input
                      type="text"
                      id="input-add-ha-form-admin"
                      className="input-form-ha-admin"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      required
                      placeholder="Wpisz kod pocztowy"
                    />
                  </div>
                  <div className="form-group-ha-admin">
                    <label htmlFor="city">Miasto</label>
                    <br />
                    <input
                      type="text"
                      id="input-add-ha-form-admin"
                      className="input-form-ha-admin"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="Wpisz miasto"
                    />
                  </div>
                  <div className="form-group-ha-admin">
                    <label htmlFor="phoneNumber">Numer telefonu</label>
                    <br />
                    <input
                      type="text"
                      id="input-add-ha-form-admin"
                      className="input-form-ha-admin"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      placeholder="Wpisz numer telefonu"
                    />
                  </div>
                  <div className="form-group-ha-admin">
                    <label htmlFor="emailAddress">Adres e-mail</label>
                    <br />
                    <input
                      type="email"
                      id="input-add-ha-form-admin"
                      className="input-form-ha-admin"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      required
                      placeholder="Wpisz adres e-mail"
                    />
                  </div>
                  <div className="form-actions-ha-admin">
                    <button type="submit" className="submit-button-form-ha-admin">
                      Dodaj spółdzielnię
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