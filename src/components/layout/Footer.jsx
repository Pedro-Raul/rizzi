const Footer = () => {
  return (
    <footer className="bg-primary py-8 px-6 md:px-12 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center text-white/85 text-sm">
        <p>&copy; {new Date().getFullYear()} Plataforma Local. Todos los derechos reservados.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Términos</a>
          <a href="#" className="hover:text-white transition-colors">Privacidad</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
