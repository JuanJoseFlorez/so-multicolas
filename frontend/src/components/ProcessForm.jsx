import React, { useState } from 'react';

const ProcessForm = ({ onSubmit }) => {
  const [tasks, setTasks] = useState([
    {
      id: 0,
      tiempo_llegada_quantum: 0,
      prioridad: 2,
      ncpu_quantum: 20,
      entradas_salidas: []
    }
  ]);

  const addTask = () => {
    const newTask = {
      id: tasks.length,
      tiempo_llegada_quantum: 0,
      prioridad: 2,
      ncpu_quantum: 20,
      entradas_salidas: []
    };
    setTasks([...tasks, newTask]);
  };

  const addInputOutput = (taskIndex) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].entradas_salidas.push({
      tiempo_gasta_entradas_salidas: 0,
      ncpu_quantum: 0
    });
    setTasks(updatedTasks);
  };

  const updateTask = (taskIndex, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex][field] = Number(value);
    setTasks(updatedTasks);
  };

  const updateInputOutput = (taskIndex, ioIndex, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].entradas_salidas[ioIndex][field] = Number(value);
    setTasks(updatedTasks);
  };

  const removeTask = (taskIndex) => {
    const updatedTasks = tasks.filter((_, index) => index !== taskIndex);
    // Reajustar IDs
    const resetIdTasks = updatedTasks.map((task, index) => ({
      ...task,
      id: index
    }));
    setTasks(resetIdTasks);
  };

  const removeInputOutput = (taskIndex, ioIndex) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].entradas_salidas = updatedTasks[taskIndex].entradas_salidas
      .filter((_, index) => index !== ioIndex);
    setTasks(updatedTasks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/simular-procesos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks })
      });

      if (!response.ok) {
        throw new Error('Error al enviar los datos');
      }

      const result = await response.json();
      onSubmit(result);
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un problema al enviar los datos');
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Configuración de Procesos</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {tasks.map((task, taskIndex) => (
          <div 
            key={taskIndex} 
            className="border p-4 rounded-lg bg-gray-50 relative"
          >
            <button 
              type="button"
              onClick={() => removeTask(taskIndex)}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm"
            >
              Eliminar Tarea
            </button>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block mb-2">ID de Tarea</label>
                <input 
                  type="number" 
                  value={task.id} 
                  readOnly 
                  className="w-full p-2 border rounded bg-gray-200"
                />
              </div>
              <div>
                <label className="block mb-2">Tiempo de Llegada</label>
                <input 
                  type="number" 
                  value={task.tiempo_llegada_quantum}
                  onChange={(e) => updateTask(taskIndex, 'tiempo_llegada_quantum', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Prioridad</label>
                <input 
                  type="number" 
                  value={task.prioridad}
                  onChange={(e) => updateTask(taskIndex, 'prioridad', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="col-span-3">
                <label className="block mb-2">Quantum de CPU</label>
                <input 
                  type="number" 
                  value={task.ncpu_quantum}
                  onChange={(e) => updateTask(taskIndex, 'ncpu_quantum', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Entradas/Salidas */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Entradas/Salidas</h3>
              {task.entradas_salidas.map((io, ioIndex) => (
                <div 
                  key={ioIndex} 
                  className="bg-white p-3 border rounded mb-2 relative"
                >
                  <button 
                    type="button"
                    onClick={() => removeInputOutput(taskIndex, ioIndex)}
                    className="absolute top-2 right-2 bg-red-400 text-white px-2 py-1 rounded text-xs"
                  >
                    Eliminar
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Tiempo Entradas/Salidas</label>
                      <input 
                        type="number" 
                        value={io.tiempo_gasta_entradas_salidas}
                        onChange={(e) => updateInputOutput(
                          taskIndex, 
                          ioIndex, 
                          'tiempo_gasta_entradas_salidas', 
                          e.target.value
                        )}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Quantum de CPU</label>
                      <input 
                        type="number" 
                        value={io.ncpu_quantum}
                        onChange={(e) => updateInputOutput(
                          taskIndex, 
                          ioIndex, 
                          'ncpu_quantum', 
                          e.target.value
                        )}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                type="button"
                onClick={() => addInputOutput(taskIndex)}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
              >
                Agregar Entrada/Salida
              </button>
            </div>
          </div>
        ))}

        <div className="flex justify-between">
          <button 
            type="button"
            onClick={addTask}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Agregar Tarea
          </button>
          <button 
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Enviar Procesos
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProcessForm;