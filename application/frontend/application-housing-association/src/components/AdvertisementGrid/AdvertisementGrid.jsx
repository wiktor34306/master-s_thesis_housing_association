import { useState, useEffect } from "react";
import config from "../../config";
import { getUserRole } from "../../getUserRole";
import "./AdvertisementGridStyle.css";

export const AdvertisementGrid = () => {
  const [ads, setAds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 8;
  const token = localStorage.getItem("token");
  const { role } = getUserRole();

  const roleMapping = {
    administrator: "administrator",
    worker: "pracownik spółdzielni",
    resident: "mieszkaniec",
  };

  const [userHA, setUserHA] = useState(null);
  const [loadingUserHA, setLoadingUserHA] = useState(true);

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
            console.warn("Otrzymano 403 – zakładam, że administrator jest głównym (housing_association_id = null)");
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
      } else {
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
          console.error("Błąd: odpowiedź nie OK przy fetchu ogłoszeń.");
          return;
        }
        const data = await response.json();
        setAds(data);
      } catch (error) {
        console.error("Błąd podczas pobierania ogłoszeń:", error);
      }
    };

    fetchAds();
  }, [token, role, userHA, loadingUserHA]);

  const truncateText = (text, limit = 80) => {
    return text.length <= limit ? text : text.substring(0, limit) + "...";
  };

const AdCard = ({ ad }) => {
  const cooperativeName = ad.cooperative_name;
  const cooperativeCity = ad.cooperative_city;

  const cooperativeInfo =
    cooperativeName && cooperativeCity
      ? `Dla: ${cooperativeName} - ${cooperativeCity}`
      : "";

  const [expanded, setExpanded] = useState(false);
  const formattedDate = new Date(ad.date_of_creation).toLocaleString();
  const mappedRole = roleMapping[ad.role] || ad.role;

  return (
    <div className="ad-card">
      <h3>{ad.title}</h3>
      <p>{expanded ? ad.content : truncateText(ad.content)}</p>
      <p className="ad-meta-administrator">
     
        {cooperativeInfo && (
          <>
            <span>{cooperativeInfo}</span>
            <br />
          </>
        )}
        data utworzenia: {formattedDate} <br />
        autor: {ad.first_name} {ad.surname} - {mappedRole}
      </p>
      <button onClick={() => setExpanded(!expanded)}>
        {expanded ? "Pokaż mniej" : "Pokaż więcej"}
      </button>
    </div>
  );
};

  const indexOfLastAd = currentPage * adsPerPage;
  const indexOfFirstAd = indexOfLastAd - adsPerPage;
  const currentAds = ads.slice(indexOfFirstAd, indexOfLastAd);
  const totalPages = Math.ceil(ads.length / adsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="ads-grid-container">
      <div className="ads-grid">
        {currentAds.length === 0 ? (
          <p>Brak ogłoszeń do wyświetlenia</p>
        ) : (
          currentAds.map((ad) => (
            <AdCard key={ad.advertisement_id} ad={ad} />
          ))
        )}
      </div>
      <div className="pagination-advertisement-grid-admin">
        {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((number) => (
          <button
            id="number-of-pagination-adv-grid-admin"
            key={number}
            onClick={() => handlePageChange(number)}
            className={`page-button ${number === currentPage ? "active" : ""}`}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
};
