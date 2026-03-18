import React from 'react';
import './ModalDetalhes.css';

export default function ModalDetalhes({ agendamento, onFechar, onEditar, onExcluir }) {
  if (!agendamento) return null;

  return (
    <div className="modal-fundo">
      <div className="modal-caixa">
        <div className="modal-cabecalho flexivel itens-acima">
          <div>
            <span>{agendamento.descricao}</span>
          </div>
          <div>
            <span style={{ cursor: 'pointer' }} onClick={onFechar}>×</span>
          </div>
        </div>

        <div className="conteudoModal1 flexivel justificar-entre2" id="conteudoModal">
            <div>
              <span className="bold-1">Data:</span> {agendamento.data}<br />
              <span className="bold-1">Turno:</span> {agendamento.turno}<br />
              <span className="bold-1">Horário</span> {agendamento.horario}<br /><br />
            </div>

            <div className=''>
              <span className="bold-1">Sala:</span> {agendamento.sala.descricao}<br />
              <span className="bold-1">Andar:</span> {agendamento.sala.andar}<br />
              <span className="bold-1">Capacidade:</span> {agendamento.sala.capacidade}
            </div>
        </div>

        <div className="modal-acoes">
          <button className="botao-editar" onClick={onEditar}>Editar</button>
          <button className="botao-perigo" onClick={onExcluir}>Excluir</button>
        </div>
      </div>
    </div>
  );
}
