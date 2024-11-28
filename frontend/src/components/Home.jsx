import React, { useState } from 'react'
import ProcessForm from './ProcessForm'
import ProcessVisualization from './ProcessVisualization'

function Home() {
  const [processData, setProcessData] = useState(null);

  const handleProcessSubmit = (data) => {
    setProcessData(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProcessForm onSubmit={handleProcessSubmit} />
      {processData && <ProcessVisualization initialData={processData} />}
    </div>
  )
}

export default Home;