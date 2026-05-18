import React from 'react';

function MapPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2 className="text-2xl font-bold mb-4">📍 Rastreo de tu Pedido</h2>
      <p className="mb-6 text-gray-600">Aquí podrás ver la ubicación del repartidor en tiempo real.</p>
      
      {/* Contenedor del Mapa (Simulado por ahora o Leaflet) */}
      <div style={{ 
        width: '100%', 
        height: '450px', 
        backgroundColor: '#e5e7eb', 
        borderRadius: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed #9ca3af'
      }}>
        <p className="text-lg font-medium text-gray-500 italic">
          [ Aquí se cargará el mapa de Leaflet ]
        </p>
      </div>
    </div>
  );
}

export default MapPage;