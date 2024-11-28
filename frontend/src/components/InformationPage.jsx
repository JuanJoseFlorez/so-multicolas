import React, { useState, useEffect } from 'react';

const InformationPage = () => {
  const [information, setInformation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Información estática, pero podrías cargarla desde un JSON externo
    const staticInformation = [
      {
        title: "Simulador de Procesos",
        content: "Este es un simulador que permite modelar y visualizar diferentes estrategias de gestión de procesos en sistemas operativos."
      },
      {
        title: "Conceptos Básicos",
        content: "Un proceso es una instancia de un programa en ejecución. Cada proceso tiene su propio espacio de memoria, recursos y estado."
      },
      {
        title: "Algoritmos de Planificación",
        content: "Los algoritmos de planificación determinan el orden y la duración en que los procesos utilizan la CPU. Algunos ejemplos incluyen Round Robin, FIFO, y Prioridad."
      }
    ];

    // Simular una carga de datos
    setTimeout(() => {
      setInformation(staticInformation);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div className="text-center py-8">Cargando información...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Información del Sistema</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {information.map((info, index) => (
          <div 
            key={index} 
            className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{info.title}</h2>
            <p className="text-gray-600">{info.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InformationPage;