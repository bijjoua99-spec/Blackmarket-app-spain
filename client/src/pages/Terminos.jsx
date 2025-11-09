import React from "react";

export default function Terminos() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-950 text-gray-100 p-8">
      <div className="max-w-2xl w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 mx-auto relative">
        <div className="flex flex-col items-center mb-4">
          <img src="/assets/blackmarket.png" alt="BlackMarket" className="w-16 h-16 rounded-full shadow-lg border-4 border-yellow-400 bg-gray-900 mb-2" />
          <h1 className="text-3xl font-bold text-yellow-400 mb-2 text-center">Términos y Condiciones</h1>
        </div>
        <p className="mb-4 text-gray-300 text-sm text-center">
          Bienvenido a <span className="font-bold text-yellow-300">BlackMarket SpainRP</span>. Al usar esta plataforma, aceptas los siguientes términos y condiciones:
        </p>
        <ul className="list-disc pl-6 text-gray-300 text-sm mb-6">
          <li>Solo usuarios que pertenecen a una Organizacion Criminal pueden acceder y operar en el mercado.</li>
          <li>Está prohibido el uso de la plataforma para actividades no relacionadas con SpainRP.Servidor Roleplay Ficticio ERLC!</li>
          <li>La administración se reserva el derecho de suspender IPS y/o usuarios por mal uso o incumplimiento.</li>
          <li>Los datos de Discord se usan únicamente para verificación y acceso seguro.</li>
          <li>El acceso al Mercado entre Usuarios puede estar sujeto a mantenimiento o restricciones temporales.</li>
          <li>El uso de la plataforma implica la aceptación de estos términos y todos los que se incluyen en la Web Oficial de SpainRP.</li>
        </ul>
        <div className="text-xs text-gray-500 text-center mb-2">Última actualización: 10/11/2025</div>
        <div className="flex justify-center mt-4">
          <a href="/" className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 rounded text-white font-bold">Volver al inicio</a>
        </div>
        <div className="flex flex-col items-center mt-8">
          <img src="/assets/spainrp_navideño.png" alt="SpainRP | Términos" className="w-12 h-12 rounded-full shadow border border-gray-700 mb-2" />
          <span className="text-xs text-gray-400 text-center">Normativas y términos sujetos a SpainRP</span>
        </div>
      </div>
    </div>
  );
}
