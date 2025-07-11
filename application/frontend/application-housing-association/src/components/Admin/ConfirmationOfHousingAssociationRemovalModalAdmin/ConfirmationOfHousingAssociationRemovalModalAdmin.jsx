import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import config from '../../../config';
import './ConfirmationOfHousingAssociationRemovalModalAdminStyle.css';

export const ConfirmationOfHousingAssociationRemovalModalAdmin = ({ 
  isOpen, 
  handleClose, 
  housingAssociationId, 
  onDeleteSuccess 
}) => {

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `${config.BASE_URL}/delete-housing-association/${housingAssociationId}`,
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
        toast.success(data.message || "Spółdzielnia usunięta pomyślnie.");
        handleClose();
        if (onDeleteSuccess) {
          onDeleteSuccess(); 
        }
      } else {
        console.error("Błąd przy usuwaniu spółdzielni:", data);
        toast.error(data.error || "Błąd przy usuwaniu spółdzielni.");
      }
    } catch (error) {
      console.error("Błąd przy usuwaniu spółdzielni:", error);
      toast.error("Wystąpił błąd przy usuwaniu spółdzielni.");
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="confirm-delete-housing-association-title"
      aria-describedby="confirm-delete-housing-association-description"
    >
      <Box className="confirm-delete-ha-admin-modal">
        <h2 id="confirm-delete-housing-association-title">
          Czy na pewno chcesz usunąć tę spółdzielnię?
        </h2>
        <div className="confirmation-buttons-ha-removal-admin">
          <Button
            id="confirm-yes-button-remove-ha-admin"
            variant="contained"
            color="primary"
            onClick={handleConfirmDelete}
          >
            Tak
          </Button>
          <Button
            id="confirm-yes-button-remove-ha-admin"
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