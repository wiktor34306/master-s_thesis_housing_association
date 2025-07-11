import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import config from '../../../config';
import './ConfirmationOfAdRemovalModalResidentStyle.css';

export const ConfirmationOfAdRemovalModalResident = ({ 
  isOpen, 
  handleClose, 
  advertisementId, 
  onDeleteSuccess 
}) => {

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `${config.BASE_URL}/advertisement/${advertisementId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Ogłoszenie usunięte pomyślnie.");
        handleClose();
        if (onDeleteSuccess) {
          onDeleteSuccess(); 
        }
      } else {
        toast.error(data.error || "Błąd przy usuwaniu ogłoszenia.");
      }
    } catch (error) {
      console.error("Błąd przy usuwaniu ogłoszenia:", error);
      toast.error("Wystąpił błąd przy usuwaniu ogłoszenia.");
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="confirm-delete-advertisement-title"
      aria-describedby="confirm-delete-advertisement-description"
    >
      <Box className="confirm-delete-advertisement-resident-modal">
        <h2 id="confirm-delete-advertisement-title">
          Czy na pewno chcesz usunąć to ogłoszenie?
        </h2>
        <div className="confirmation-buttons-resident">
          <Button
            id="confirm-yes-button-remove-adv-resident"
            variant="contained"
            color="primary"
            onClick={handleConfirmDelete}
          >
            Tak
          </Button>
          <Button
            id="confirm-yes-button-remove-adv-resident"
            variant="contained"
            color="secondary"
            onClick={handleClose}
          >
            Anuluj
          </Button>
        </div>
      </Box>
    </Modal>
  );
};
