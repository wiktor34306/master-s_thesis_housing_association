import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';
import { NavbarWorker } from '../NavbarWorker/NavbarWorker';
import { Footer } from '../../Footer/Footer';
import './AddAdvertisementFormWorkerStyle.css';

export const AddAdvertisementFormWorker = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [workerHA, setWorkerHA] = useState(null);
  const [loadingHA, setLoadingHA] = useState(true);

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
        if (data.housing_association) {
          setWorkerHA(data.housing_association);
        } else {
          setWorkerHA(null);
          toast.error("Brak przypisanej spółdzielni dla pracownika.", { theme: "colored" });
        }
        setLoadingHA(false);
      })
      .catch((err) => {
        console.error("Błąd pobierania spółdzielni:", err);
        setLoadingHA(false);
        toast.error("Nie udało się pobrać danych spółdzielni.", { theme: "colored" });
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!workerHA) {
      toast.error("Brak danych spółdzielni – nie można dodać ogłoszenia.");
      return;
    }

    const finalHousingAssociationId = workerHA.housing_association_id;
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
        navigate("/homepageworker");
      } else {
        toast.error(data.error || "Błąd przy dodawaniu ogłoszenia.", { theme: "colored" });
      }
    } catch (error) {
      console.error("Błąd przy dodawaniu ogłoszenia:", error);
      toast.error("Wystąpił błąd. Spróbuj ponownie.", { theme: "colored" });
    }
  };

  return (
    <>
      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarWorker />
        </div>

        <div className="start-window-admin-content">
          <div className="announcements-section-worker">
            <h2>Dodaj ogłoszenie</h2>
            <div className="form-add-adv-worker">
              <div className="form-add-adv-worker-container">
                <form onSubmit={handleSubmit} className="add-advertisement-form">
                
                  <div className="form-group-worker-advertisement">
                    <label htmlFor="title">Tytuł</label>
                    <br />
                    <input
                      type="text"
                      id="title-worker"
                      className="input-form-advertisement-worker"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Wpisz tytuł ogłoszenia"
                    />
                  </div>

                  <div className="form-group-worker-advertisement">
                    <label htmlFor="content">Treść</label>
                    <br />
                    <textarea
                      id="content-worker"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="input-form-advertisement-worker"
                      required
                      placeholder="Wpisz treść ogłoszenia"
                    ></textarea>
                  </div>

                    {loadingHA ? (
                    <p>Ładowanie spółdzielni...</p>
                  ) : (
                    workerHA && (
                      <div className="readonly-housing-association">
                        <p>Spółdzielnia <br />{workerHA.name} ({workerHA.city})</p><br />
                      </div>
                    )
                  )}

                  <div className="form-actions">
                    <button type="submit" className="submit-button-form-advertisement-worker">
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
