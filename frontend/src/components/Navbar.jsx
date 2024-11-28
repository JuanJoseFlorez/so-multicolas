import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold">
          Multicolas
        </div>
        <div className="space-x-4">
          <Link 
            to="/" 
            className="hover:bg-blue-700 px-3 py-2 rounded transition duration-300"
          >
            Inicio
          </Link>
          <Link 
            to="/informacion" 
            className="hover:bg-blue-700 px-3 py-2 rounded transition duration-300"
          >
            Información
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;