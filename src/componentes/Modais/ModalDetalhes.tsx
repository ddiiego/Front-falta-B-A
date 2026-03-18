import React from 'react';
import './ModalDetalhes.css';

export default function ModalDetalhes({ agendamento, onFechar, onEditar, onExcluir }) {
  if (!agendamento) return null;

  return (
    <div className="modal-fundo">
      <div className="modal-caixa">
        <div className="modal-cabecalho">
          <span>{agendamento.descricao}</span>
          <span style={{ cursor: 'pointer' }} onClick={onFechar}>×</span>
        </div>

        <div className="conteudoModal1" id="conteudoModal">
          <b>Data:</b> {agendamento.data}<br />
          <b>Turno:</b> {agendamento.turno}<br />
          <b>Horário:</b> {agendamento.horario}<br /><br />

          <b>Sala:</b> {agendamento.sala.descricao}<br />
          <b>Andar:</b> {agendamento.sala.andar}<br />
          <b>Capacidade:</b> {agendamento.sala.capacidade}
        </div>

        <div className="modal-acoes">
          <button onClick={onEditar}>Editar</button>
          <button className="botao-perigo" onClick={onExcluir}>Excluir</button>
        </div>
      </div>
    </div>
  );
}
