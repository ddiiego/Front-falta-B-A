import React, { useState } from 'react';
import { nomesMes } from '../../utilitarios/data';
import './estilos.css';

interface CabecalhoProps {
  mes: number;
  ano: number;
  onMudarMes: (dir: number) => void;
  onIrParaMes: (mes: number) => void;
  onAbrirAgendar: () => void;
}

export default function Cabecalho({ mes, ano, onMudarMes, onIrParaMes, onAbrirAgendar }: CabecalhoProps) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="cabecalho-principal">
      <h2>Agendamento de Salas</h2>
      
      <div className="flexivel itens-centro" style={{ gap: '20px' }}>
        <button className="botao-header-agendar" onClick={onAbrirAgendar}>
          + Agendar
        </button>

        <div className="controle-mes">
        <button className="botao-seta" onClick={() => onMudarMes(-1)}>◀</button>
        
        <div className="seletor-mes-container">
          <span 
            className="mes-atual cursor-apontador hover-opacidade"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            {nomesMes[mes]} {ano}
          </span>
          
          {menuAberto && (
            <div className="menu-meses shadow-lg">
              {nomesMes.map((nome, index) => (
                <div 
                  key={nome} 
                  className={`item-mes ${index === mes ? 'ativo' : ''}`}
                  onClick={() => {
                    onIrParaMes(index);
                    setMenuAberto(false);
                  }}
                >
                  {nome}
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="botao-seta" onClick={() => onMudarMes(1)}>▶</button>
      </div>
      </div>
    </header>
  );
}
