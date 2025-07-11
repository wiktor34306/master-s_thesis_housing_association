import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../../config";
import { NavbarAdmin } from "../NavbarAdmin/NavbarAdmin";
import { Footer } from "../../Footer/Footer";
import "./AddEventToCalendarAdminStyle.css";

export const AddEventToCalendarAdmin = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = JSON.parse(localStorage.getItem("userRole"))?.role || "administrator";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");

  const [housingAssociationId, setHousingAssociationId] = useState("");
  const [housingAssociations, setHousingAssociations] = useState([]);
  const [userHA, setUserHA] = useState(null);
  const [loadingUserHA, setLoadingUserHA] = useState(true);

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
          Authorization: "Bearer " + token,
        },
      })
        .then((response) => {
          if (response.status === 403) {
            console.warn(
              "[my-housing-association] Otrzymano 403 - główny administrator bez przypisanej spółdzielni"
            );
            setUserHA({ housing_association_id: null });
            setLoadingUserHA(false);
            return null;
          }
          return response.json();
        })
        .then((data) => {
          if (data) {
            if (Array.isArray(data)) {
              setUserHA(data[0]);
            } else {
              setUserHA(data);
            }
          } else {
          }
          setLoadingUserHA(false);
        })
        .catch((error) => {
          console.error("[my-housing-association] Błąd:", error);
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
          Authorization: "Bearer " + token,
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setHousingAssociations(data);
        })
        .catch((error) => {
          console.error("[get-all-housing-associations] Błąd:", error);
        });
    }
  }, [token, role, userHA]);

  const validateForm = () => {
    if (title.trim() === "" || description.trim() === "" || eventDate.trim() === "") {
      return { valid: false, error: "Proszę wypełnić wszystkie pola formularza." };
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
      console.error("[handleSubmit] Walidacja nie przeszła:", error);
      toast.error(error);
      return;
    }

    const finalHousingAssociationId =
      userHA && userHA.housing_association_id !== null
        ? userHA.housing_association_id
        : housingAssociationId;

    const payload = {
      title,
      description,
      event_date: eventDate,
      housing_association_id: finalHousingAssociationId,
    };

    try {
      const response = await fetch(`${config.BASE_URL}/add-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Wydarzenie dodane pomyślnie.");
        navigate("/browse-events-admin");
      } else {
        console.error("[handleSubmit] Błąd przy dodawaniu wydarzenia:", data.error);
        toast.error(data.error || "Błąd przy dodawaniu wydarzenia.");
      }
    } catch (error) {
      console.error("[handleSubmit] Wyjątek podczas dodawania wydarzenia:", error);
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
          <div className="ae-section">
            <div className="add-event-section-admin">
              <h2>Dodawanie wydarzenia do kalendarza</h2>
              <div className="form-add-event-admin">
                <div className="form-add-event-admin-container">
                  <form onSubmit={handleSubmit} className="add-advertisement-form">

                    <div className="form-group-add-event-admin">
                      <label htmlFor="title">Tytuł wydarzenia</label>
                      <br />
                      <input
                        type="text"
                        id="title"
                        className="input-form-add-event-admin"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                        }}
                        required
                        placeholder="Wpisz tytuł wydarzenia"
                      />
                    </div>

                    <div className="form-group-add-event-admin">
                      <label htmlFor="description">Opis wydarzenia</label>
                      <br />
                      <textarea
                        id="description-area-admin"
                        className="input-form-add-event-admin"
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                        }}
                        required
                        placeholder="Wpisz opis wydarzenia"
                      ></textarea>
                    </div>

                    <div className="form-group-add-event-admin">
                      <label htmlFor="eventDate">Data wydarzenia</label>
                      <br />
                      <input
                        type="datetime-local"
                        id="eventDate"
                        className="input-form-add-event-admin"
                        value={eventDate}
                        onChange={(e) => {
                          setEventDate(e.target.value);
                        }}
                        required
                      />
                    </div>

                    {userHA && userHA.housing_association_id === null ? (
                      <div className="form-group-add-event-admin">
                        <label htmlFor="housing_association_id">
                          Wybierz spółdzielnię
                        </label>
                        <br />
                        <select
                          id="housing_association_id"
                          className="input-form-add-event-admin"
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
                      userHA &&
                      userHA.housing_association_id !== null && (
                        <div className="form-group-add-event-admin">
                          <label>Spółdzielnia</label>
                          <br />
                          <div>
                            {userHA.name ? `${userHA.name} (${userHA.city})` : "Brak danych"}
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
                      <button type="submit" className="submit-button-form-add-event-admin">
                        Dodaj wydarzenie do kalendarza
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
