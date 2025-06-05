import Header from './Header';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4">{children}</main>
    </>
  );
};

export default Layout;
