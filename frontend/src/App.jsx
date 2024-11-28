import React, { useState } from 'react'
import ProcessForm from './components/ProcessForm'
import ProcessVisualization from './components/ProcessVisualization'

function App() {
  const [processData, setProcessData] = useState(null);

  const handleProcessSubmit = (data) => {
    setProcessData(data);
  };

  return (
    <div className="App container mx-auto px-4 py-8">
      <ProcessForm onSubmit={handleProcessSubmit} />
      {processData && <ProcessVisualization initialData={processData} />}
    </div>
  )
}

export default App