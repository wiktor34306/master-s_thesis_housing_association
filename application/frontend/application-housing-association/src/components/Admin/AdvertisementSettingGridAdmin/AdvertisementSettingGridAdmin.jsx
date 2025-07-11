import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import config from "../../../config";
import { NavbarAdmin } from "../NavbarAdmin/NavbarAdmin";
import { Footer } from "../../Footer/Footer";
import { EditAdvertisementModalAdmin } from "../EditAdvertisementAdmin/EditAdvertisementModalAdmin";
import "./AdvertisementSettingGridAdminStyle.css";
import { ConfirmationOfAdRemovalModalAdmin } from "../ConfirmationOfAdRemovalModalAdmin/ConfirmationOfAdRemovalModalAdmin";

export const AdvertisementSettingGridAdmin = () => {
  const [ads, setAds] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAdId, setDeletingAdId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 10; 
  const token = localStorage.getItem("token");

  const [userHA, setUserHA] = useState(null);
  const [loadingUserHA, setLoadingUserHA] = useState(true);

  const role = JSON.parse(localStorage.getItem("userRole"))?.role || "administrator"; 

  useEffect(() => {
    if (!token) {
      setLoadingUserHA(false);
      return;
    }
    if (role === "administrator") {
      fetch(`${config.BASE_URL}/my-housing-association`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
      })
        .then((response) => {
          if (response.status === 403) {
            console.warn("Otrzymano 403 – zakładam, że administrator jest główny (housing_association_id = null)");
            setUserHA({ housing_association_id: null });
            setLoadingUserHA(false);
            return []; 
          }
          return response.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            if (data.length > 0) {
              setUserHA(data[0]);
            } else {
              setUserHA({ housing_association_id: null });
            }
          } else {
            setUserHA(data);
          }
          setLoadingUserHA(false);
        })
        .catch((error) => {
          console.error("Błąd podczas pobierania danych spółdzielni:", error);
          setLoadingUserHA(false);
        });
    } else {
      setLoadingUserHA(false);
    }
  }, [token, role]);

  useEffect(() => {
    if (!token) {
      return;
    }
    if (role === "administrator" && loadingUserHA) {
      return;
    }

    let endpoint = `${config.BASE_URL}/advertisement-for-association`;
    if (role === "administrator") {
      if (userHA) {
        if (userHA.housing_association_id === null) {
          endpoint = `${config.BASE_URL}/get-all-advertisements`;
        } else {
          endpoint = `${config.BASE_URL}/advertisement-for-association`;
        }
      }
    }

    const fetchAds = async () => {
      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
          },
        });
        if (!response.ok) {
          toast.error("Błąd przy pobieraniu ogłoszeń");
          return;
        }
        const data = await response.json();
        setAds(data);
      } catch (error) {
        console.error("Błąd przy pobieraniu ogłoszeń:", error);
        toast.error("Wystąpił błąd przy pobieraniu ogłoszeń");
      }
    };

    fetchAds();
  }, [token, role, userHA, loadingUserHA]);

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setIsEditModalOpen(true);
  };

  // Funkcja aktualizująca stan ogłoszeń po edycji
  const handleEditSuccess = (updatedAd) => {
    setAds((prevAds) =>
      prevAds.map((ad) =>
        ad.advertisement_id === updatedAd.advertisement_id ? updatedAd : ad
      )
    );
    setIsEditModalOpen(false);
    setEditingAd(null);
  };

  const openDeleteModal = (adId) => {
    setDeletingAdId(adId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setAds((prevAds) =>
      prevAds.filter((ad) => ad.advertisement_id !== deletingAdId)
    );
    setIsDeleteModalOpen(false);
    setDeletingAdId(null);
  };

  const indexOfLastAd = currentPage * adsPerPage;
  const indexOfFirstAd = indexOfLastAd - adsPerPage;
  const currentAds = ads.slice(indexOfFirstAd, indexOfLastAd);
  const totalPages = Math.ceil(ads.length / adsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const AdCard = ({ ad }) => {
    const [expanded, setExpanded] = useState(false);
    const truncatedContent =
      ad.content.length > 80 ? ad.content.substring(0, 80) + "..." : ad.content;
    const formattedDate = new Date(ad.date_of_creation).toLocaleString();

    return (
      <div className="ad-card-setting-grid-admin">
        <h3>{ad.title}</h3>
        <p>{expanded ? ad.content : truncatedContent}</p>
        <p className="ad-meta-administrator">
          data utworzenia: {formattedDate} <br />
          autor: {ad.first_name} {ad.surname} - {ad.role}
        </p>
        <div className="ad-button-row">
          <button
            onClick={() => setExpanded(!expanded)}
            className="toggle-button"
          >
            {expanded ? "Pokaż mniej" : "Pokaż więcej"}
          </button>
          {expanded && (
            <>
              <button
                onClick={() => handleEdit(ad)}
                className="submit-button-form-advertisement"
              >
                Edytuj
              </button>
              <button
                onClick={() => openDeleteModal(ad.advertisement_id)}
                className="submit-button-form-advertisement"
              >
                Usuń
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarAdmin />
        </div>
        <div className="start-window-admin-content">
          <div className="announcements-section">
            <h2>Przeglądanie ogłoszeń</h2>
            <div className="adv-sett-grid-admin">
              <div className="adv-sett-grid-admin-container">
                {currentAds.length === 0 ? (
                  <p>Brak ogłoszeń do wyświetlenia</p>
                ) : (
                  currentAds.map((ad) => (
                    <AdCard key={ad.advertisement_id} ad={ad} />
                  ))
                )}
              </div>
            </div>
            <div className="pagination-advertisement-setting-grid">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                (number) => (
                  <button
                    id="number-of-pagination-adv-sett-grid-admin"
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`page-button ${
                      number === currentPage ? "active" : ""
                    }`}
                  >
                    {number}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && editingAd && (
        <EditAdvertisementModalAdmin
          isOpen={isEditModalOpen}
          handleClose={() => setIsEditModalOpen(false)}
          advertisement={editingAd}
          onSave={handleEditSuccess}
        />
      )}

      {isDeleteModalOpen && deletingAdId && (
        <ConfirmationOfAdRemovalModalAdmin
          isOpen={isDeleteModalOpen}
          handleClose={() => setIsDeleteModalOpen(false)}
          advertisementId={deletingAdId}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}

      <div className="footer-start-window-admin">
        <Footer />
      </div>
    </>
  );
};
