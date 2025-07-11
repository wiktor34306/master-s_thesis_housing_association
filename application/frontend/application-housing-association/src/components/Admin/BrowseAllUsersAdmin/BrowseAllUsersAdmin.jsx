import { useState, useEffect } from 'react';
import './BrowseAllUsersAdminStyle.css';
import { NavbarAdmin } from '../NavbarAdmin/NavbarAdmin';
import { Footer } from '../../Footer/Footer';
import config from '../../../config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ConfirmationOfUserRemovalModalAdmin } from '../ConfirmationOfUserRemovalModalAdmin/ConfirmationOfUserRemovalModalAdmin';

export const BrowseAllUsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${config.BASE_URL}/get-all-users`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: "Bearer " + token,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.error("Błąd autoryzacji:", response.status);
          localStorage.removeItem('token');
          navigate('/');
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Błąd pobierania danych:', error);
      toast.error('Błąd pobierania danych');
    }
  };

  const filteredUsers = users.filter(user =>
    (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.surname && user.surname.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const openDeleteModal = (userId) => {
    if (!userId) {
      console.error("Identyfikator użytkownika jest undefined", userId);
      return;
    }
    setUserIdToDelete(userId);
    setIsModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    const updatedUsers = users.filter(u => (u.user_id || u.id) !== userIdToDelete);
    setUsers(updatedUsers);
  };

  return (
    <>
      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarAdmin />
        </div>
        <div className="start-window-admin-content">
          <div className="browseallusers-admin-container">
            <div className="browseallusers-admin-element">
              <h1>Zobacz wszystkich użytkowników</h1>
              <div className="browseallusers-search">
                <label>Wyszukaj:</label>
                <input
                  type="text"
                  className="input-search-style-browseallusers"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="browseallusers-table-admin-all-users">
                <table className="browseallusers-table-admin">
                  <thead>
                    <tr>
                      <th>Imię</th>
                      <th>Nazwisko</th>
                      <th>Adres e-mail</th>
                      <th>Rola</th>
                      <th>Spółdzielnia</th>
                      <th>Ulica</th>
                      <th>Numer budynku</th>
                      <th>Numer mieszkania</th>
                      <th>Telefon</th>
                      <th>Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const id = user.user_id;
                      return (
                        <tr key={id} className="browseallusers-tr">
                          <td className="browseallusers-td">{user.first_name || '-'}</td>
                          <td className="browseallusers-td">{user.surname || '-'}</td>
                          <td className="browseallusers-td">{user.email_address || '-'}</td>
                          <td className="browseallusers-td">{user.role || '-'}</td>
                          <td className="browseallusers-td">{user.name || '-'}</td>
                          <td className="browseallusers-td">{user.street || '-'}</td>
                          <td className="browseallusers-td">{user.building_number || '-'}</td>
                          <td className="browseallusers-td">{user.apartment_number || '-'}</td>
                          <td className="browseallusers-td">{user.phone_number || '-'}</td>
                          <td className="browseallusers-td">
             
                            <button className="browseallusers-btn-action" onClick={() => openDeleteModal(id)}>
                              Usuń
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-browseallusers-admin">
        <Footer />
      </div>

      {isModalOpen && (
        <ConfirmationOfUserRemovalModalAdmin
          isOpen={isModalOpen}
          handleClose={() => {
            setIsModalOpen(false);
          }}
          userId={userIdToDelete}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
};