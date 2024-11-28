import React, { useState, useEffect } from 'react';

const ProcessCard = ({ process }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-2 w-64 relative border-2 border-gray-200">
      {/* Quantum usado en la parte superior centrada */}
      <div className="text-center font-bold text-xl mb-4">
        {process.quantum_usado}
      </div>

      {/* ID de tarea */}
      <div className="text-2xl font-bold text-center mb-4">
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

const ProcessVisualization = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const requestBody = {
            "tasks": [
                {
                    "id": 0,
                    "tiempo_llegada_quantum": 0,
                    "prioridad": 2,
                    "ncpu_quantum": 20,
                    "entradas_salidas": [
                        {
                            "tiempo_gasta_entradas_salidas": 10,
                            "ncpu_quantum": 50
                        },
                        {
                            "tiempo_gasta_entradas_salidas": 15,
                            "ncpu_quantum": 100
                        }
                    ]
                },
                {
                    "id": 1,
                    "tiempo_llegada_quantum": 16,
                    "prioridad": 3,
                    "ncpu_quantum": 30,
                    "entradas_salidas": [
                        {
                            "tiempo_gasta_entradas_salidas": 15,
                            "ncpu_quantum": 30
                        }
                    ]
                },
                {
                    "id": 2,
                    "tiempo_llegada_quantum": 35,
                    "prioridad": 1,
                    "ncpu_quantum": 180,
                    "entradas_salidas": []
                }
            ]
        }
        const API_URL = 'https://upgraded-space-happiness-65wvx7grjv9h5wj7-8000.app.github.dev/simular-procesos/';
        console.log('Sending request to:', API_URL);
        console.log('Request body:', requestBody);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Group processes by id_tarea to avoid duplicates
        const uniqueProcesses = Object.values(
          data.procesos.reduce((acc, process) => {
            // Use a unique key combining id_tarea and tiempo_fin to handle multiple entries
            const key = `${process.id_tarea}-${process.tiempo_fin}`;
            if (!acc[key] || acc[key].tiempo_fin < process.tiempo_fin) {
              acc[key] = process;
            }
            return acc;
          }, {})
        );

        setProcesses(uniqueProcesses);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProcesses();
  }, []);

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