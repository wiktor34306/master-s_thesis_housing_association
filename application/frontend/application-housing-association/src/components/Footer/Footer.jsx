import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../../getUserRole";
import config from "../../config"; 
import "./FooterStyle.css";

export const Footer = () => {
  const [housingAssociation, setHousingAssociation] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false); 
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
        if (!response.ok) {
          return [];
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setHousingAssociation(data[0]);
        } else if (!Array.isArray(data) && data) {
          setHousingAssociation(data);
        } else {
          setHousingAssociation({
            postcode: "Brak danych",
            city: "",
            name: "Brak danych",
            address: "Brak danych",
            phone_number: "Brak danych",
            email_address: "Brak danych",
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Błąd podczas pobierania danych spółdzielni:", error);
        setHousingAssociation({
          postcode: "Brak danych",
          city: "",
          name: "Brak danych",
          address: "Brak danych",
          phone_number: "Brak danych",
          email_address: "Brak danych",
        });
        setLoading(false);
      });
  }, []);

  const handleHomePageClick = () => {
    const { role } = getUserRole();
    if (role === "administrator") {
      navigate("/homepageadmin");
    } else if (role === "worker") {
      navigate("/homepageworker");
    } else if (role === "resident") {
      navigate("/homepageresident");
    } else {
      console.warn("Nieznana rola:", role);
      navigate("/");
    }
  };

  const handleEditDataClick = () => {
    const { role } = getUserRole();
    if (role === "administrator") {
      navigate("/edit-user-admin");
    } else if (role === "worker") {
      navigate("/edit-user-worker");
    } else if (role === "resident") {
      navigate("/edit-user-resident");
    } else {
      console.warn("Nieznana rola:", role);
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="footer">
        <div className="main_footer padding_of_footer">
          <p>Ładowanie stopki...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="footer">
      <div className="main_footer padding_of_footer">
        <div className="div_with_links">
          <div className="columns_with_links">
            <h4>Adres spółdzielni</h4>
            <p>
              {housingAssociation.postcode} {housingAssociation.city} <br />
              {housingAssociation.name} <br />
              ul. {housingAssociation.address} <br />
              <br />
            </p>
            <p>Telefon: {housingAssociation.phone_number}</p>
            <br />
            <p>Adres e-mail: {housingAssociation.email_address}</p>
          </div>
          <div className="columns_with_links">
            <h4>Menu</h4>
            <button className="footer-button-a" onClick={handleHomePageClick}>
              <p>Strona główna</p>
            </button>
    
            <button className="footer-button-a" onClick={handleEditDataClick}>
              <p>Edytuj moje dane</p>
            </button>
          </div>
        </div>
        <hr />
        <div className="right_div_below_line">
          <div className="left_div_below_line">
            <p>
              © {new Date().getFullYear()} Wiktor Markowicz. Wszelkie prawa zastrzeżone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
