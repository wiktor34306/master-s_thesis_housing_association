import { NavbarWorker } from '../NavbarWorker/NavbarWorker';
import { Footer } from '../../Footer/Footer';
import './HomePageWorkerStyle.css';
import { AdvertisementGrid } from '../../AdvertisementGrid/AdvertisementGrid';

export const HomePageWorker = () => {
  return (
    <>
      <div className="start-window-worker-container">
        <div className="start-window-worker-navbar">
          <NavbarWorker />
        </div>

        <div className="start-window-worker-content">
          <div className="announcements-section">
            <h2>Ogłoszenia</h2>
            <AdvertisementGrid />
          </div>
        </div>

      </div>

      <div className="footer-start-window-worker">
        <Footer />
      </div>
    </>
  );
};
