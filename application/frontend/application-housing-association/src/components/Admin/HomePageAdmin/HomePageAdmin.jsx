import { NavbarAdmin } from '../NavbarAdmin/NavbarAdmin';
import { Footer } from '../../Footer/Footer';
import './HomePageAdminStyle.css';
import { AdvertisementGrid } from '../../AdvertisementGrid/AdvertisementGrid';

export const HomePageAdmin = () => {
  return (
    <>
      <div className="start-window-admin-container">
  
        <div className="start-window-admin-navbar">
          <NavbarAdmin />
        </div>


        <div className="start-window-admin-content">

          <div className="announcements-section">
            <h2>Ogłoszenia</h2>
            <AdvertisementGrid />
          </div>
        </div>
      </div>

      <div className="footer-start-window-admin">
        <Footer />
      </div>
    </>
  );
};
