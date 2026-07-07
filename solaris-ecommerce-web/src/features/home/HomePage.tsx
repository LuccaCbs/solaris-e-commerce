const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Solaris E-Commerce</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Bienvenido a Solaris E-Commerce
          </h2>
          <p className="text-gray-600 mb-8">
            Plataforma modular de e-commerce integrable con el ecosistema Solaris
          </p>
          <div className="space-x-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Ver Catálogo
            </button>
            <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition">
              Iniciar Sesión
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage
