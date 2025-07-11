import { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import config from '../../../config';
import "./EditHousingAssociationDetailAdminStyle.css";

export const EditHousingAssociationDetailAdmin = ({ isOpen, handleClose, housingAssociation, onSave }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  useEffect(() => {
    if (isOpen && housingAssociation) {
      setName(housingAssociation.name || '');
      setAddress(housingAssociation.address || '');
      setCity(housingAssociation.city || '');
      setPostcode(housingAssociation.postcode || '');
      setPhoneNumber(housingAssociation.phone_number || '');
      setEmailAddress(housingAssociation.email_address || '');
    }
  }, [isOpen, housingAssociation]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        housing_association_id: housingAssociation.housing_association_id,
        name,
        address,
        city,
        postcode,
        phone_number: phoneNumber,
        email_address: emailAddress
      };

      const response = await fetch(`${config.BASE_URL}/edit-my-housing-association`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Dane spółdzielni zaktualizowane pomyślnie.");
        if (onSave) onSave(data.housingAssociation);
        handleClose();
      } else {
        toast.error(data.error || "Błąd przy aktualizacji danych spółdzielni.");
      }
    } catch (error) {
      console.error("Błąd podczas edycji spółdzielni:", error);
      toast.error("Wystąpił błąd podczas edycji spółdzielni.");
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="edit-housing-association-modal-title"
      aria-describedby="edit-housing-association-modal-description"
    >
      <Box className="edit-housing-association-modal-admin">
        <h2 id="edit-housing-association-modal-title">Edytuj dane spółdzielni</h2>
        <form onSubmit={handleSubmit} className="edit-housing-association-form-admin">
          <div className="form-group-admin-housing">
            <label htmlFor="edit-name">Nazwa</label>
            <input 
              type="text"
              className="input-form-edit-ha-detail-admin" 
              id="edit-name"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              placeholder="Wpisz nazwę spółdzielni"
            />
          </div>
          <div className="form-group-admin-housing">
            <label htmlFor="edit-address">Adres</label>
            <input 
              type="text" 
              className="input-form-edit-ha-detail-admin" 
              id="edit-address"
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              required 
              placeholder="Wpisz adres"
            />
          </div>
          <div className="form-group-admin-housing">
            <label htmlFor="edit-city">Miasto</label>
            <input 
              type="text" 
              className="input-form-edit-ha-detail-admin" 
              id="edit-city"
              value={city}
              onChange={(e) => setCity(e.target.value)} 
              required 
              placeholder="Wpisz miasto"
            />
          </div>
          <div className="form-group-admin-housing">
            <label htmlFor="edit-postcode">Kod pocztowy</label>
            <input 
              type="text" 
              className="input-form-edit-ha-detail-admin" 
              id="edit-postcode"
              value={postcode} 
              onChange={(e) => setPostcode(e.target.value)} 
              required 
              placeholder="Wpisz kod pocztowy"
            />
          </div>
          <div className="form-group-admin-housing">
            <label htmlFor="edit-phone">Telefon</label>
            <input 
              type="text" 
              className="input-form-edit-ha-detail-admin" 
              id="edit-phone"
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
              required 
              placeholder="Wpisz numer telefonu"
            />
          </div>
          <div className="form-group-admin-housing">
            <label htmlFor="edit-email">E-mail</label>
            <input 
              type="email" 
              className="input-form-edit-ha-detail-admin" 
              id="edit-email"
              value={emailAddress} 
              onChange={(e) => setEmailAddress(e.target.value)} 
              required 
              placeholder="Wpisz adres e-mail"
            />
          </div>
          <div className="modal-buttons-edit-ha-detail-admin">
            <Button 
              id="edit-ha-accept-button-admin"
              type="submit"
              variant="contained"
              className="save-button"
            >
              Zapisz
            </Button>
            <Button 
              id="edit-ha-accept-button-admin"
              variant="contained"
              onClick={handleClose}
              className="cancel-button"
            >
              Anuluj
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};
