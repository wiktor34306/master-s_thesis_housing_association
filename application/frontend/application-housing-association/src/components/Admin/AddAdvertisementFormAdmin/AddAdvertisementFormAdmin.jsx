import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../../config";
import { NavbarAdmin } from "../NavbarAdmin/NavbarAdmin";
import { Footer } from "../../Footer/Footer";
import "./AddAdvertisementFormAdminStyle.css";

export const AddAdvertisementFormAdmin = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userHA, setUserHA] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [allHAs, setAllHAs] = useState([]);
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [housingAssociation, setHousingAssociation] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${config.BASE_URL}/what-is-my-housing-association`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data.housing_association === null) {
          setUserHA({ housing_association_id: null });
        } else {
          setUserHA(data.housing_association);
          setHousingAssociation(data.housing_association);
        }
        setLoadingProfile(false);
      })
      .catch((err) => {
        console.error("Błąd pobierania profilu:", err);
        setLoadingProfile(false);
      });
  }, []);

  useEffect(() => {
    if (userHA && userHA.housing_association_id === null) {
      const token = localStorage.getItem("token");
      fetch(`${config.BASE_URL}/get-all-housing-associations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          setAllHAs(data);
        })
        .catch((err) => {
          console.error("Błąd pobierania spółdzielni:", err);
        });
    }
  }, [userHA]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const finalHousingAssociationId =
      userHA && userHA.housing_association_id !== null
        ? userHA.housing_association_id
        : selectedAssociation?.housing_association_id;

    if (!finalHousingAssociationId) {
      toast.error("Wybierz spółdzielnię.");
      return;
    }

    const advertisementData = {
      title,
      content,
      housing_association_id: finalHousingAssociationId,
    };

    try {
      const response = await fetch(`${config.BASE_URL}/create-advertisement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(advertisementData),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Ogłoszenie dodane pomyślnie.");
        navigate("/homepageadmin");
      } else {
        toast.error(data.error || "Błąd przy dodawaniu ogłoszenia.");
      }
    } catch (error) {
      console.error("Błąd przy dodawaniu ogłoszenia:", error);
      toast.error("Wystąpił błąd. Spróbuj ponownie.");
    }
  };

  const HousingAssociationField = () => {
    if (loadingProfile) {
      return <p>Ładowanie profilu...</p>;
    }
    if (userHA && userHA.housing_association_id !== null) {
      return (
        <div>
          <p>
            {userHA.name} ({userHA.city})
          </p>
          <input type="hidden" value={userHA.housing_association_id} />
        </div>
      );
    }

    return (
      <select
        id="housing-association-select"
        value={selectedAssociation ? JSON.stringify(selectedAssociation) : ""}
        onChange={(e) => {
          try {
            const parsedHA = JSON.parse(e.target.value);
            setSelectedAssociation(parsedHA);
            setHousingAssociation(parsedHA);
          } catch (err) {
            console.error("Błąd parsowania:", err);
          }
        }}
        required
        className="input-form-advertisement-admin"
      >
        <option value="">Wybierz spółdzielnię</option>
        {allHAs.map((ha) => (
          <option key={ha.housing_association_id} value={JSON.stringify(ha)}>
            {ha.name} - {ha.city}
          </option>
        ))}
      </select>
    );
  };

  return (
    <>
      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarAdmin />
        </div>
        <div className="start-window-admin-content">
          <div className="announcements-section">
            <h2>Dodaj ogłoszenie</h2>
            <div className="form-add-adv-admin">
              <div className="form-add-adv-admin-container">
                <form onSubmit={handleSubmit} className="add-advertisement-form">
                  <div className="form-group-admin-advertisement">
                    <label htmlFor="title">Tytuł</label>
                    <br />
                    <input
                      type="text"
                      id="title"
                      className="input-form-advertisement-admin"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Wpisz tytuł ogłoszenia"
                    />
                  </div>
                  <div className="form-group-admin-advertisement">
                    <label htmlFor="content">Treść</label>
                    <br />
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="input-form-advertisement-admin"
                      required
                      placeholder="Wpisz treść ogłoszenia"
                    ></textarea>
                  </div>
                  <div className="form-group-admin-advertisement">
                    <label htmlFor="housing-association">Spółdzielnia</label>
                    <br />
                    <HousingAssociationField />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-button-form-add-advertisement">
                      Dodaj ogłoszenie
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
    </>
  );
};


