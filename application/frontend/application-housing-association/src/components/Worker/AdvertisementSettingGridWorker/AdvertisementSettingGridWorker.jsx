import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import config from "../../../config";
import { NavbarWorker } from "../NavbarWorker/NavbarWorker";
import { Footer } from "../../Footer/Footer";
import { EditAdvertisementModalWorker } from "../EditAdvertisementModalWorker/EditAdvertisementModalWorker";
import "./AdvertisementSettingGridWorkerStyle.css";
import { ConfirmationOfAdRemovalModalWorker } from "../ConfirmationOfAdRemovalModalWorker/ConfirmationOfAdRemovalModalWorker";

export const AdvertisementSettingGridWorker = () => {
  const [ads, setAds] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAdId, setDeletingAdId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 10;
  const token = localStorage.getItem("token");

  const fetchAds = async () => {
    if (!token) {
      return;
    }
    const endpoint = `${config.BASE_URL}/advertisement-which-I-added`;
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

  useEffect(() => {
    fetchAds();
  }, [token]);

  const indexOfLastAd = currentPage * adsPerPage;
  const indexOfFirstAd = indexOfLastAd - adsPerPage;
  const currentAds = ads.slice(indexOfFirstAd, indexOfLastAd);
  const totalPages = Math.ceil(ads.length / adsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setIsEditModalOpen(true);
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

  const AdCard = ({ ad }) => {
    const [expanded, setExpanded] = useState(false);
    const truncatedContent =
      ad.content.length > 80 ? ad.content.substring(0, 80) + "..." : ad.content;
    const formattedDate = new Date(ad.date_of_creation).toLocaleString();

    return (
      <div className="ad-card-setting-grid-worker">
        <h3>{ad.title}</h3>
        <p>{expanded ? ad.content : truncatedContent}</p>
        <p className="ad-meta-worker">
          data utworzenia: {formattedDate} <br />
          autor: {ad.first_name} {ad.surname} - {ad.role}
        </p>
        <div className="ad-button-row-worker">
          <button
            onClick={() => setExpanded(!expanded)}
            className="toggle-button-worker"
          >
            {expanded ? "Pokaż mniej" : "Pokaż więcej"}
          </button>
          {expanded && (
            <>
              <button
                onClick={() => handleEdit(ad)}
                className="submit-button-form-advertisement-worker"
              >
                Edytuj
              </button>
              <button
                onClick={() => openDeleteModal(ad.advertisement_id)}
                className="submit-button-form-advertisement-worker"
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
          <NavbarWorker />
        </div>
        <div className="start-window-admin-content">
          <div className="announcements-section-worker">
            <h2>Przeglądanie ogłoszeń</h2>
            <div className="adv-sett-grid-worker">
              <div className="adv-sett-grid-worker-container">
                {currentAds.length === 0 ? (
                  <p>Brak ogłoszeń do wyświetlenia</p>
                ) : (
                  currentAds.map((ad) => (
                    <AdCard key={ad.advertisement_id} ad={ad} />
                  ))
                )}
              </div>
            </div>
            <div className="pagination-advertisement-setting-grid-worker">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                (number) => (
                  <button
                    id="number-of-pagination-adv-sett-grid-worker"
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
        <EditAdvertisementModalWorker
          isOpen={isEditModalOpen}
          handleClose={() => setIsEditModalOpen(false)}
          advertisement={editingAd}
          onUpdate={fetchAds}
        />
      )}

      {isDeleteModalOpen && deletingAdId && (
        <ConfirmationOfAdRemovalModalWorker
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
