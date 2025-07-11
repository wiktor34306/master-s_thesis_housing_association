import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../../config";
import { NavbarWorker } from "../NavbarWorker/NavbarWorker";
import { Footer } from "../../Footer/Footer";
import "./AddEventToCalendarWorkerStyle.css";

export const AddEventToCalendarWorker = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [userHA, setUserHA] = useState(null);
  const [loadingUserHA, setLoadingUserHA] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoadingUserHA(false);
      return;
    }

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
  }, [token]);

  const validateForm = () => {
    if (title.trim() === "" || description.trim() === "" || eventDate.trim() === "") {
      return { valid: false, error: "Proszę wypełnić wszystkie pola formularza." };
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

    const finalHousingAssociationId = userHA?.housing_association_id;

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
        navigate("/browse-events-worker");
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
          <NavbarWorker />
        </div>

        <div className="start-window-admin-content">
          <div className="ae-section-worker">
            <div className="add-event-section-worker">
              <h2>Dodawanie wydarzenia do kalendarza</h2>
              <div className="form-add-event-worker">
                <div className="form-add-event-worker-container">
                  <form onSubmit={handleSubmit} className="add-advertisement-form">

                    <div className="form-group-add-event-worker">
                      <label htmlFor="title">Tytuł wydarzenia</label>
                      <br />
                      <input
                        type="text"
                        id="title"
                        className="input-form-add-event-worker"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                        }}
                        required
                        placeholder="Wpisz tytuł wydarzenia"
                      />
                    </div>

                    <div className="form-group-add-event-worker">
                      <label htmlFor="description">Opis wydarzenia</label>
                      <br />
                      <textarea
                        id="description-area-worker"
                        className="input-form-add-event-worker"
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                        }}
                        required
                        placeholder="Wpisz opis wydarzenia"
                      ></textarea>
                    </div>

                    <div className="form-group-add-event-worker">
                      <label htmlFor="eventDate">Data wydarzenia</label>
                      <br />
                      <input
                        type="datetime-local"
                        id="eventDate"
                        className="input-form-add-event-worker"
                        value={eventDate}
                        onChange={(e) => {
                          setEventDate(e.target.value);
                        }}
                        required
                      />
                    </div>

                    {userHA && userHA.housing_association_id && (
                      <div className="form-group-add-event-worker">
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
                    )}

                    <div className="form-actions">
                      <button type="submit" className="submit-button-form-add-event-worker">
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
