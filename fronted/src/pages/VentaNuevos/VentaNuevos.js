import React, { useEffect, useState } from 'react';
import './globals.css';
import './style.css';
import Header from '../../common/header/header.js';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CarritoCompras from '../CarritoCompras';

const NuevosJuegos = () => {
  const [juegos, setJuegos] = useState([]);
  const [error, setError] = useState(null);
  const [juegosSeleccionados, setJuegosSeleccionados] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [carritoKey, setCarritoKey] = useState(0); 

  useEffect(() => {
    fetch('http://localhost:3001/venta-nuevos')
      .then(response => response.json())
      .then(data => setJuegos(data))
      .catch(error => setError('Error fetching used games:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3001/juegos-seleccionados')
      .then(response => setJuegosSeleccionados(response.data))
      .catch(error => console.error('Error fetching selected games:', error));
  }, []);

  const handleComprarClick = (juegoId) => {
    const juegoSeleccionado = juegos.find(juego => juego.juego_id === juegoId); 
    if (juegoSeleccionado) {
      eliminarJuegos();
      const juegoExistente = juegosSeleccionados.find(juego => juego.juego_id === juegoId);
      let nuevosJuegosSeleccionados;
      if (juegoExistente) {
        nuevosJuegosSeleccionados = juegosSeleccionados.map(juego =>
          juego.juego_id === juegoId ? { ...juego, cantidad: juego.cantidad + 1 } : juego
        );
      } else {
        nuevosJuegosSeleccionados = [...juegosSeleccionados, { ...juegoSeleccionado, cantidad: 1 }];
      }
      setJuegosSeleccionados(nuevosJuegosSeleccionados);
      setIsDropdownVisible(true);
      actualizarJuegosSeleccionados(nuevosJuegosSeleccionados);
      setMostrarCarrito(true);  // Actualiza el estado para mostrar el carrito
      setCarritoKey(prevKey => prevKey + 1); // Incrementa la clave del carrito para forzar re-render
    }
  };

  const handleRemoverJuego = (juegoId) => {
    const juegoExistente = juegosSeleccionados.find(juego => juego.juego_id === juegoId);
    let nuevosJuegosSeleccionados;
    eliminarJuegos();
    if (juegoExistente.cantidad > 1) {
      nuevosJuegosSeleccionados = juegosSeleccionados.map(juego =>
        juego.juego_id === juegoId ? { ...juego, cantidad: juego.cantidad - 1 } : juego
      );
    } else {
      nuevosJuegosSeleccionados = juegosSeleccionados.filter(juego => juego.juego_id !== juegoId);
      setIsDropdownVisible(nuevosJuegosSeleccionados.length > 0);
    }
    setJuegosSeleccionados(nuevosJuegosSeleccionados);
    actualizarJuegosSeleccionados(nuevosJuegosSeleccionados);
    setIsDropdownVisible(true);
    setMostrarCarrito(true);  // Actualiza el estado para mostrar el carrito
    setCarritoKey(prevKey => prevKey + 1); // Incrementa la clave del carrito para forzar re-render
  };

  const eliminarJuegos = () => {
    axios.delete('http://localhost:3001/juegos-seleccionados')
      .then(response => console.log(response.data))
      .catch(error => console.error('Error deleting selected games:', error));
    setJuegosSeleccionados([]);
  };

  const actualizarJuegosSeleccionados = (juegosSeleccionados) => {
    axios.post('http://localhost:3001/juegos-seleccionados', juegosSeleccionados)
      .then(response => console.log(response.data))
      .catch(error => console.error('Error updating selected games:', error));
  };

  return (
    <div>
      <Header
        juegosSeleccionados={juegosSeleccionados}
        onRemoverJuego={handleRemoverJuego}
        isComprasDropdownVisible={isDropdownVisible}
        setIsComprasDropdownVisible={setIsDropdownVisible}
      />
      <div className='venta-usados'>
        <div className='div'>
          <div className='frame'>
            <h1>Nuevos Juegos</h1>
            {error && <p>{error}</p>}
            <ul className="juegos-grid">
              {juegos.map(juego => (
                <li key={juego.juego_id} className="juego-item">
                  <div className="videojuego">
                    <div className="text-wrapper">{juego.titulo}</div>
                    <Link to={`/detalle-producto/${juego.juego_id}`} className="frame-3">
                      <img className="rectangle" src={`http://localhost:3001/uploads/${juego.titulo}`} alt={juego.titulo} />
                    </Link>
                    <div className="div-wrapper">Precio: {juego.precio}</div>
                    <div> 
                      <button className="text-wrapper-3" onClick={() => handleComprarClick(juego.juego_id)}>Comprar</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {mostrarCarrito && (
        <CarritoCompras
          key={carritoKey} // Clave dinámica para forzar re-render
          juegosSeleccionados={juegosSeleccionados}
          handleRemoverJuego={handleRemoverJuego}
          isDropdownVisible={isDropdownVisible}
          setIsComprasDropdownVisible={setIsDropdownVisible}
        />
      )}
    </div>
  );
};

export default NuevosJuegos;
