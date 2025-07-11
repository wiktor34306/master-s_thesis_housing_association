import { useState, useEffect } from 'react';
import './BrowseAllUsersWorkerStyle.css';
import { Footer } from '../../Footer/Footer';
import config from '../../../config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { NavbarWorker } from '../NavbarWorker/NavbarWorker';
import { ConfirmationOfUserRemovalModalWorker } from '../ConfirmationOfUserRemovalModalWorker/ConfirmationOfUserRemovalModalWorker';

export const BrowseAllUsersWorker = () => {
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
          <NavbarWorker />
        </div>
        <div className="start-window-admin-content">
          <div className="browseallusers-worker-container">
            <div className="browseallusers-worker-element">
              <h1>Zobacz wszystkich użytkowników</h1>
              <div className="browseallusers-search-worker">
                <label>Wyszukaj:</label>
                <input
                  type="text"
                  className="input-search-style-browseallusers-worker"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="browseallusers-table-worker-all-users-worker">
                <table className="browseallusers-table-worker">
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
                        <tr key={id} className="browseallusers-tr-worker">
                          <td className="browseallusers-td-worker">{user.first_name || '-'}</td>
                          <td className="browseallusers-td-worker">{user.surname || '-'}</td>
                          <td className="browseallusers-td-worker">{user.email_address || '-'}</td>
                          <td className="browseallusers-td-worker">{user.role || '-'}</td>
                          <td className="browseallusers-td-worker">{user.name || '-'}</td>
                          <td className="browseallusers-td-worker">{user.street || '-'}</td>
                          <td className="browseallusers-td-worker">{user.building_number || '-'}</td>
                          <td className="browseallusers-td-worker">{user.apartment_number || '-'}</td>
                          <td className="browseallusers-td-worker">{user.phone_number || '-'}</td>
                          <td className="browseallusers-td-worker">

                            <button className="browseallusers-btn-action-worker" onClick={() => openDeleteModal(id)}>
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

      <div className="footer-browseallusers-worker">
        <Footer />
      </div>

      {isModalOpen && (
        <ConfirmationOfUserRemovalModalWorker
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