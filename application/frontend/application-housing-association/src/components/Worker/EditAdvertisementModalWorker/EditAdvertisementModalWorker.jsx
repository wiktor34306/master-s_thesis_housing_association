import { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import config from '../../../config';
import './EditAdvertisementModalWorkerStyle.css';

export const EditAdvertisementModalWorker = ({ isOpen, handleClose, advertisement, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (advertisement) {
      setTitle(advertisement.title || '');
      setContent(advertisement.content || '');
    }
  }, [advertisement]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${config.BASE_URL}/advertisement/${advertisement.advertisement_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({ title, content }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Ogłoszenie zaktualizowane pomyślnie.");
        if (onUpdate) {
          onUpdate();
        }
        handleClose();
      } else {
        toast.error(data.error || "Błąd przy aktualizacji ogłoszenia.");
      }
    } catch (error) {
      console.error("Błąd przy aktualizacji ogłoszenia:", error);
      toast.error("Wystąpił błąd przy aktualizacji ogłoszenia.");
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="edit-advertisement-modal-title"
      aria-describedby="edit-advertisement-modal-description"
    >
      <Box className="edit-advertisement-modal-worker">
        <h2 id="edit-advertisement-modal-title">Edytuj ogłoszenie</h2>
        <form onSubmit={handleSubmit} className="edit-advertisement-form">
          <div className="form-group-admin-advertisement">
            <label htmlFor="edit-title">Tytuł</label>
            <input
              type="text"
              id="edit-title"
              className="input-form-edit-advertisement-worker"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Wpisz tytuł ogłoszenia"
            />
          </div>
          <div className="form-group-admin-advertisement">
            <label htmlFor="edit-content">Treść</label>
            <textarea
              id="edit-content"
              className="input-form-edit-advertisement-worker"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Wpisz treść ogłoszenia"
            ></textarea>
          </div>
          <div className="edit-adv-form-actions-worker">
            <Button 
              id="edit-accept-button-worker"
              type="submit"
              className="submit-button-form-advertisement"
              variant="contained"
            >
              Zapisz
            </Button>
            <Button 
              id="edit-accept-button-worker"
              variant="contained"
              onClick={handleClose}
              className="submit-button-form-advertisement"
            >
              Anuluj
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};
