import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import config from '../../../config';
import './ConfirmationOfUserRemovalModalAdminStyle.css';

export const ConfirmationOfUserRemovalModalAdmin = ({ 
  isOpen, 
  handleClose, 
  userId, 
  onDeleteSuccess 
}) => {

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `${config.BASE_URL}/delete-user/${userId}`,
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
        toast.success(data.message || "Użytkownik został usunięty pomyślnie.");
        handleClose();
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } else {
        toast.error(data.error || "Błąd przy usuwaniu użytkownika.");
      }
    } catch (error) {
      console.error("Błąd przy usuwaniu użytkownika:", error);
      toast.error("Wystąpił błąd przy usuwaniu użytkownika.");
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="confirm-delete-user-title"
      aria-describedby="confirm-delete-user-description"
    >
      <Box className="confirm-delete-user-admin-modal">
        <h2 id="confirm-delete-user-title">
          Czy na pewno chcesz usunąć tego użytkownika?
        </h2>
        <div className="confirmation-buttons-delete-user">
          <Button
            id="confirm-yes-button-remove-user-admin"
            variant="contained"
            color="primary"
            onClick={handleConfirmDelete}
          >
            Tak
          </Button>
          <Button
            id="confirm-yes-button-remove-user-admin"
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
