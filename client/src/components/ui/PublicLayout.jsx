import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

const PublicLayout = ({ children }) => (
  <div className="public-layout">
    <SiteHeader />
    <main className="public-main">{children}</main>
    <SiteFooter />
  </div>
);

export default PublicLayout;
