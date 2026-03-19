import React from 'react';
import { Agendamento } from '../../tipos';
import './estilos.css';

interface PopoverProps {
  agendamento: Agendamento;
  posicao: {
    x: number;
    y: number;
    arrowX: number;
    position: 'top' | 'bottom';
  };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onEditar: () => void;
  onVerDetalhes: () => void;
  onCancelar: (id: string) => void;
}

export default function Popover({
  agendamento,
  posicao,
  onMouseEnter,
  onMouseLeave,
  onEditar,
  onVerDetalhes,
  onCancelar
}: PopoverProps) {
  return (
    <div
      className={`balao-flutuante balao-${posicao.position === 'top' ? 'cima' : 'baixo'}`}
      style={{
        left: `${posicao.x}px`,
        top: `${posicao.y}px`
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="balao-cabecalho fundo-azul-400">
        <div className="flexivel justificar-entre itens-centro">
          <span>{agendamento.descricao}</span>
        </div>
      </div>

      <div className="balao-corpo flexivel">
        <div className="balao-info">
          <div className="grupo-info">
            <label>Data</label>
            <div>{agendamento.data}</div>
          </div>
          <div className="grupo-info">
            <label>Horário / Turno</label>
            <div>{agendamento.horario} - {agendamento.turno}</div>
          </div>
          <div className="grupo-info">
            <label>Andar/ Sala / Capacidade</label>
            <div>{agendamento.sala?.andar} {agendamento.sala?.descricao} ({agendamento.sala?.capacidade} lugares)</div>
          </div>
        </div>
        <div className="balao-acoes">
          <div className="abas borda-b mb-2">
            <span className="aba ativa">Ações</span>
          </div>
          <button className="link-acao" onClick={onEditar}>{'>'} Editar</button>
          <button className="link-acao" onClick={onVerDetalhes}>{'>'} Ver Detalhes</button>
          <button className="link-acao texto-vermelho-500" onClick={() => onCancelar(agendamento.id)}>{'>'} Cancelar</button>
        </div>
      </div>
      <div
        className={`seta-${posicao.position === 'top' ? 'cima' : 'baixo'}`}
        style={{ left: `${posicao.arrowX}px` }}
      ></div>
    </div>
  );
}
