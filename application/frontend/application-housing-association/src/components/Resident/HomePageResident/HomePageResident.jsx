import { NavbarResident } from '../NavbarResident/NavbarResident';
import { Footer } from '../../Footer/Footer';
import './HomePageResidentStyle.css';
import { AdvertisementGrid } from '../../AdvertisementGrid/AdvertisementGrid';
import { NotificationToastResident } from '../NotificationToastResident/NotificationToastResident';

export const HomePageResident = () => {
  return (
    <>
      <NotificationToastResident />

      <div className="start-window-admin-container">
        <div className="start-window-admin-navbar">
          <NavbarResident />
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
