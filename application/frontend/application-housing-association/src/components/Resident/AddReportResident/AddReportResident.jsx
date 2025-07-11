import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../../../config';
import { Footer } from '../../Footer/Footer';
import './AddReportResidentStyle.css';
import { NavbarResident } from '../NavbarResident/NavbarResident';

export const AddReportResident = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${config.BASE_URL}/add-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Zgłoszenie dodane pomyślnie.");
        navigate("/browse-your-reports-resident");
      } else {
        toast.error(data.error || "Błąd przy dodawaniu zgłoszenia.");
      }
    } catch (error) {
      console.error("Błąd przy dodawaniu zgłoszenia:", error);
      toast.error("Wystąpił błąd. Spróbuj ponownie.");
    }
  };

return (
    <>
      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarResident />
        </div>
 
        <div className="start-window-admin-content">
          <div className="ar-form-section">
          <div className="add-report-form-section">
            <h2>Dodaj zgłoszenie</h2>
            <div className="form-add-report-resident">
              <div className="form-add-report-form-resident-container">
                <form onSubmit={handleSubmit} className="add-ha-form">
                  <div className="form-group-report-resident">
                   <label htmlFor="report-title">Tytuł zgłoszenia</label><br />
                    <input
                        type="text"
                        className="input-add-report-form-resident input-title-input-report-resident"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Wpisz tytuł zgłoszenia"
                        required
                    />
                    </div>
                  <div className="form-group-report-resident">
                 <label htmlFor="report-description">Opis zgłoszenia</label><br />
                    <textarea
                    className="input-add-report-form-resident input-textarea-report-resident"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Opisz usterkę"
                    required
                    />
                </div>
                  <div className="form-actions-ha-admin">
                    <button type="submit" className="submit-button-form-report-resident">
                      Dodaj zgłoszenie
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
