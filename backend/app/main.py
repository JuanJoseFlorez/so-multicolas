from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import math

class EntradaSalida(BaseModel):
    tiempo_gasta_entradas_salidas: int
    ncpu_quantum: int

class Task(BaseModel):
    id: int
    tiempo_llegada_quantum: int
    prioridad: int
    ncpu_quantum: int
    entradas_salidas: List[EntradaSalida]
    quantum_restantes_prioridad: int = 0  # Nuevo atributo

class TaskList(BaseModel):
    tasks: List[Task]

class ProcesoSimulado(BaseModel):
    id_tarea: int
    tiempo_inicio: int
    tiempo_fin: int
    quantum_usado: int
    estado: str
    prioridad: int
    antigua_prioridad: Optional[int]  # Nuevo atributo

def calcular_quantum_por_prioridad(prioridad):
    """
    Calcula los quantum disponibles para cada prioridad
    Prioridad 1 = 1 quantum
    Prioridad 2 = 2 quantum
    Prioridad 3 = 4 quantum
    Prioridad 4 = 8 quantum
    y así sucesivamente
    """
    if prioridad == 0:
        return 1
    else:
        return 2 ** prioridad

class SistemaOperativo:
    def __init__(self):
        self.tiempo_global = 0
        self.procesos_simulados = []
        self.tareas_pendientes = []
        self.tarea_en_ejecucion = None

    def _obtener_tarea_ejecutable(self, tiempo_actual):
        # Filtrar tareas que ya pueden ejecutarse
        tareas_ejecutables = [
            tarea for tarea in self.tareas_pendientes 
            if tarea.tiempo_llegada_quantum <= tiempo_actual
        ]
        
        # Ordenar por prioridad (menor número = mayor prioridad)
        tareas_ejecutables.sort(key=lambda x: x.prioridad)
        
        return tareas_ejecutables[0] if tareas_ejecutables else None

    def _calcular_nueva_prioridad(self, prioridad_actual):
        # Si ya está en la prioridad más baja, mantenerla
        if prioridad_actual >= 8:
            return 0
        return prioridad_actual + 1

    def _hay_tarea_con_mayor_prioridad(self, prioridad_actual, tiempo_actual):
        return any(
            tarea.prioridad < prioridad_actual and tarea.tiempo_llegada_quantum <= tiempo_actual
            for tarea in self.tareas_pendientes
        )

    def simular_procesos(self, tareas):
        # Ordenar tareas por tiempo de llegada
        self.tareas_pendientes = sorted(tareas, key=lambda x: x.tiempo_llegada_quantum)
        
        while self.tareas_pendientes:
            # Obtener tarea a ejecutar
            tarea_actual = self._obtener_tarea_ejecutable(self.tiempo_global)
            
            if not tarea_actual:
                # Avanzar tiempo si no hay tareas ejecutables
                self.tiempo_global += 1
                continue
            
            # Calcular quantum disponible para esta prioridad
            quantum_disponible = calcular_quantum_por_prioridad(tarea_actual.prioridad)
            if tarea_actual.quantum_restantes_prioridad > 0:
                quantum_disponible = tarea_actual.quantum_restantes_prioridad

            # Calcular quantum a usar
            quantum_maximo = min(tarea_actual.ncpu_quantum, quantum_disponible)
            
            # Encontrar el momento de interrupción (si aplica)
            momento_interrupcion = None
            for tarea_pendiente in self.tareas_pendientes:
                if (tarea_pendiente.tiempo_llegada_quantum > self.tiempo_global and 
                    tarea_pendiente.tiempo_llegada_quantum <= self.tiempo_global + quantum_maximo and
                    tarea_pendiente.prioridad < tarea_actual.prioridad):
                    momento_interrupcion = tarea_pendiente.tiempo_llegada_quantum
                    break
            
            # Usar momento de interrupción si existe
            quantum_usado = (momento_interrupcion - self.tiempo_global) if momento_interrupcion else quantum_maximo
            if momento_interrupcion:
                quantum_restante = quantum_disponible - quantum_usado
                tarea_actual.quantum_restantes_prioridad = quantum_restante
                # Registrar proceso
                proceso = ProcesoSimulado(
                    id_tarea=tarea_actual.id,
                    tiempo_inicio=self.tiempo_global,
                    tiempo_fin=self.tiempo_global + quantum_usado,
                    quantum_usado=quantum_usado,
                    # estado=f"Pausado por prioridad, gasto {quantum_usado} quantum",
                    estado=f"Bloqueado, Prioridad",
                    prioridad=tarea_actual.prioridad,
                    antigua_prioridad=tarea_actual.prioridad
                )
            else:
                tarea_actual.quantum_restantes_prioridad = 0
                estado = ""
                if not any(p.id_tarea == tarea_actual.id for p in self.procesos_simulados):
                    estado = "Nuevo"
                elif tarea_actual.entradas_salidas and tarea_actual.ncpu_quantum - quantum_usado <= 0:
                    estado = "Bloqueado, E/S"
                elif tarea_actual.ncpu_quantum - quantum_usado <= 0:
                    estado = "Terminado"
                else:
                    estado = "Procesando"
                # Registrar proceso
                proceso = ProcesoSimulado(
                    id_tarea=tarea_actual.id,
                    tiempo_inicio=self.tiempo_global,
                    tiempo_fin=self.tiempo_global + quantum_usado,
                    quantum_usado=quantum_usado,
                    estado=estado,
                    prioridad=self._calcular_nueva_prioridad(tarea_actual.prioridad),
                    antigua_prioridad=tarea_actual.prioridad
                )
            
            self.procesos_simulados.append(proceso)
            # Actualizar tiempo y quantum restante
            self.tiempo_global += quantum_usado
            tarea_actual.ncpu_quantum -= quantum_usado
            
            # Manejar entradas/salidas solo si el proceso gastó todos sus quantum disponibles
            if tarea_actual.entradas_salidas and tarea_actual.ncpu_quantum <= 0:
                entrada_salida = tarea_actual.entradas_salidas[0]
                # Calcular nuevo tiempo de llegada
                nuevo_tiempo_llegada = proceso.tiempo_fin + entrada_salida.tiempo_gasta_entradas_salidas
                
                # Actualizar tarea con nuevos valores
                tarea_actual.tiempo_llegada_quantum = nuevo_tiempo_llegada
                tarea_actual.ncpu_quantum = entrada_salida.ncpu_quantum
                
                # Remover entrada/salida procesada
                tarea_actual.entradas_salidas.pop(0)
            
            # Actualizar prioridad
            tarea_actual.prioridad = proceso.prioridad
            
            # Reincorporar tarea si aún tiene quantum
            if tarea_actual.ncpu_quantum > 0:
                # Si ya no hay más prioridades, asignar prioridad 0
                if tarea_actual.prioridad > 8:
                    tarea_actual.prioridad = 0
            else:
                # Remover tarea completada
                self.tareas_pendientes.remove(tarea_actual)
        
        return self.procesos_simulados

app = FastAPI()

# Add CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def status():
    return {"status": "online"}

@app.post("/simular-procesos")
async def simular_procesos(task_list: TaskList):
    sistema_operativo = SistemaOperativo()
    procesos = sistema_operativo.simular_procesos(task_list.tasks)
    
    # Convertir procesos a un formato JSON serializable
    return {
        "procesos": [
            {
                "id_tarea": p.id_tarea,
                "tiempo_inicio": p.tiempo_inicio,
                "tiempo_fin": p.tiempo_fin,
                "quantum_usado": p.quantum_usado,
                "estado": p.estado,
                "prioridad": p.prioridad,
                "antigua_prioridad": p.antigua_prioridad  # Agregando el campo antigua_prioridad
            } for p in procesos
        ]
    }

# Ejemplo de uso
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)