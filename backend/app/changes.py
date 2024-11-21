from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import io
import base64

app = FastAPI()

class EntradaSalida(BaseModel):
    tiempo_gasta_entradas_salidas: int
    ncpu_quantum: int

class Task(BaseModel):
    id: int
    tiempo_llegada_quantum: int
    prioridad: int
    ncpu_quantum: int
    entradas_salidas: List[EntradaSalida]

class TaskList(BaseModel):
    tasks: List[Task]

class ProcesoSimulado(BaseModel):
    id_tarea: int
    tiempo_inicio: int
    tiempo_fin: int
    quantum_usado: int
    estado: str
    prioridad: int

def calcular_quantum_por_prioridad(prioridad):
    """
    Calcula los quantum disponibles para cada prioridad.
    Prioridad 0 = 1 quantum
    Prioridad 1 = 2 quantum
    Prioridad 2 = 4 quantum
    Prioridad 3 = 8 quantum
    y así sucesivamente hasta la prioridad máxima que es 8.
    Si se acaban los quantum de la prioridad 8, el proceso vuelve a prioridad 0.
    """
    if prioridad == 0:
        return 1
    else:
        return 2 ** prioridad

def obtener_prioridad_siguiente(prioridad):
    """
    Obtiene la siguiente prioridad en caso de que se acaben los quantum de la prioridad actual.
    Si la prioridad actual es 8, vuelve a la prioridad 0.
    """
    return (prioridad + 1) % 9

class SistemaOperativo:
    def __init__(self):
        self.tiempo_global = 0
        self.task_queue = []
        self.procesos = []

    def agregar_tareas(self, task_list: TaskList):
        self.task_queue.extend(task_list.tasks)
        self.task_queue.sort(key=lambda x: (x.prioridad, x.tiempo_llegada_quantum))

    def procesar_tareas(self):
        while self.task_queue:
            task = self.task_queue.pop(0)
            quantum_disponible = calcular_quantum_por_prioridad(task.prioridad)
            quantum_usado = min(quantum_disponible, task.ncpu_quantum)
            tiempo_inicio = self.tiempo_global
            tiempo_fin = tiempo_inicio + quantum_usado

            self.procesos.append(ProcesoSimulado(
                id_tarea=task.id,
                tiempo_inicio=tiempo_inicio,
                tiempo_fin=tiempo_fin,
                quantum_usado=quantum_usado,
                estado="procesando",
                prioridad=task.prioridad
            ))

            self.tiempo_global = tiempo_fin
            task.ncpu_quantum -= quantum_usado

            if task.ncpu_quantum > 0:
                # Si la tarea no ha terminado, vuelve a la cola con la misma prioridad
                self.task_queue.append(task)
                self.task_queue.sort(key=lambda x: (x.prioridad, x.tiempo_llegada_quantum))

    def generar_diagrama_gantt(self):
        fig, ax = plt.subplots()
        for proceso in self.procesos:
            ax.barh(proceso.id_tarea, proceso.tiempo_fin - proceso.tiempo_inicio, left=proceso.tiempo_inicio, height=0.4)

        ax.set_xlabel('Tiempo')
        ax.set_ylabel('ID de Tarea')
        ax.set_title('Diagrama de Gantt')

        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        image_base64 = base64.b64encode(buf.read()).decode('utf-8')
        buf.close()

        return image_base64

@app.post("/process_tasks/")
def process_tasks(task_list: TaskList):
    """
    Endpoint para procesar colas múltiples con prioridades.
    Recibe una lista de tareas con sus prioridades y las procesa en orden de prioridad.
    
    Args:
    - task_list (TaskList): Lista de tareas a procesar.
    
    Returns:
    - dict: Resultado del procesamiento de las tareas.
    """
    sistema = SistemaOperativo()
    sistema.agregar_tareas(task_list)
    sistema.procesar_tareas()
    gantt_chart = sistema.generar_diagrama_gantt()

    return {"procesos": sistema.procesos, "gantt_chart": gantt_chart}