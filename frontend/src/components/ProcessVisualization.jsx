import React, { useState, useEffect } from 'react';

const ProcessCard = ({ process }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-2 w-64 relative border-2 border-gray-200">
      {/* Quantum usado en la parte superior centrada */}
      <div className="text-left font-bold text-xl mb-4 text-gray-600">
        {process.quantum_usado}
      </div>

      {/* ID de tarea */}
      <div className="text-2xl font-bold text-center mb-4 text-gray-800">
        P{process.id_tarea}
      </div>

      {/* Footer con tiempo de inicio y fin */}
      <div className="flex justify-between mt-4">
        <span className="text-sm text-gray-600">
          Inicio: {process.tiempo_inicio}
        </span>
        <span className="text-sm text-gray-600">
          Fin: {process.tiempo_fin}
        </span>
      </div>

      {/* Estado del proceso como una etiqueta */}
      <div className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
        {process.estado}
      </div>
    </div>
  );
};

const ProcessVisualization = ({ initialData = null }) => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(initialData ? false : true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      // Procesar los datos iniciales
      const uniqueProcesses = Object.values(
        initialData.procesos.reduce((acc, process) => {
          const key = `${process.id_tarea}-${process.tiempo_fin}`;
          if (!acc[key] || acc[key].tiempo_fin < process.tiempo_fin) {
            acc[key] = process;
          }
          return acc;
        }, {})
      );
      setProcesses(uniqueProcesses);
    }
  }, [initialData]);

  if (loading) return <div>Cargando procesos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Visualización de Procesos</h1>
      <div className="flex flex-wrap justify-center">
        {processes.map((process, index) => (
          <ProcessCard key={`${process.id_tarea}-${index}`} process={process} />
        ))}
      </div>
    </div>
  );
};

export default ProcessVisualization;