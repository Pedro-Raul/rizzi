import { Store, Users, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { statsService } from '../services/stats.service';

const About = () => {
  const [stats, setStats] = useState({ businesses: 0, users: 0, neighborhoods: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await statsService.getPublicStats();
      if (data) setStats(data);
    };
    fetchStats();
  }, []);

  const formatCount = (n) => new Intl.NumberFormat('es').format(n ?? 0);
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="bg-primary text-white py-24 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Quiénes Somos</h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90">
          Nacimos en el entorno de la UFPS con el propósito de diseñar soluciones que cierren la brecha de visibilidad para las micro y medianas empresas de nuestra comunidad.
        </p>
      </section>

      {/* Content Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-10">
          <div>
            <h2 className="text-3xl font-bold text-dark mb-4">Nuestra misión</h2>
            <p className="text-gray-600 leading-relaxed">
              Transformar el potencial de las comunidades locales mediante soluciones tecnológicas de alto impacto que cierren la brecha de visibilidad digital. Nos enfocamos en desarrollar plataformas intuitivas y accesibles que democraticen el acceso al comercio electrónico, permitiendo que pequeños ecosistemas operen con la eficiencia de las grandes plataformas globales.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-dark mb-4">Nuestra visión</h2>
            <p className="text-gray-600 leading-relaxed">
              Ser el referente en soluciones de visibilidad comercial para negocios locales, expandiendo nuestro modelo a diversas comunidades donde el comercio de barrio necesita digitalizarse de manera eficiente y escalable.
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gray-100 rounded-2xl p-8 md:p-10 space-y-8">
          {/* Stat Item 1 */}
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-green-700 shadow-sm shrink-0">
              <Store size={28} />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-dark">{formatCount(stats.businesses)}</h3>
              <p className="text-gray-500 font-medium text-sm mt-1">Negocios registrados</p>
            </div>
          </div>

          {/* Stat Item 2 */}
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-teal-300 flex items-center justify-center text-teal-800 shadow-sm shrink-0">
              <Users size={28} />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-dark">{formatCount(stats.users)}</h3>
              <p className="text-gray-500 font-medium text-sm mt-1">Usuarios activos</p>
            </div>
          </div>

          {/* Stat Item 3 */}
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/80 flex items-center justify-center text-white shadow-sm shrink-0">
              <MapPin size={28} />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-dark">{formatCount(stats.neighborhoods)}</h3>
              <p className="text-gray-500 font-medium text-sm mt-1">Barrios conectados</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
