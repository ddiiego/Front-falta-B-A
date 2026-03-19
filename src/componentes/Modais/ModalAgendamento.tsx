import React, { useRef, useState } from 'react';
import { Agendamento, Sala } from '../../servicos/api';

interface ModalAgendamentoProps {
  salas: Sala[];
  onFechar: () => void;
  onSalvar: (dados: Omit<Agendamento, "id">) => void;
}

export default function ModalAgendamento({ salas, onFechar, onSalvar }: ModalAgendamentoProps) {
  const dataRef = useRef<HTMLInputElement>(null);
  const turnoRef = useRef<HTMLSelectElement>(null);
  const horarioRef = useRef<HTMLSelectElement>(null);
  const descricaoRef = useRef<HTMLTextAreaElement>(null);
  const [salaBusca, setSalaBusca] = useState('');

  const handleSalvar = () => {
    const busca = salaBusca.trim().toLowerCase();
    // Busca flexível: tenta bater o nome exato ou parte dele (ex: "911" baterá em "SALA 911")
    const salaSelecionada = salas.find(s => {
      const desc = s.descricao.toLowerCase();
      return desc === busca || desc.includes(busca);
    });
    
    if (!salaSelecionada) {
      console.warn("Salas disponíveis:", salas.map(s => s.descricao));
      alert(`Sala "${salaBusca}" não encontrada. Verifique se o número está correto!`);
      return;
    }

    const novosDados = {
      data: dataRef.current?.value || '',
      turno: turnoRef.current?.value || 'MANHA',
      horario: horarioRef.current?.value || 'A',
      descricao: descricaoRef.current?.value || '',
      sala: salaSelecionada
    };

    if (!novosDados.data || !novosDados.descricao) {
      alert("Preencha todos os campos!");
      return;
    }

    onSalvar(novosDados);
  };

  return (
    <div className="modal-fundo">
      <div className="modal-caixa">
        <div className="modal-cabecalho">
          <span>Criar Agendamento</span>
          <span style={{ cursor: 'pointer' }} onClick={onFechar}>×</span>
        </div>

        <div className="formulario-edicao">

          <div className="form-grupo">
            <label htmlFor="salaSelect">Sala (Digite o número)</label>
            <input
              type="text"
              id="salaSelect"
              list="listaSalas"
              value={salaBusca}
              onChange={(e) => setSalaBusca(e.target.value)}
              placeholder="Ex: 201"
            />
            <datalist id="listaSalas">
              {salas.map(s => (
                <option key={s.id} value={s.descricao} />
              ))}
            </datalist>
          </div>

          <div className="form-grupo">
            <label htmlFor="newData">Data do Agendamento</label>
            <input type="date" id="newData" ref={dataRef} defaultValue={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="flexivel" style={{ gap: '16px' }}>
            <div className="form-grupo" style={{ flex: 1 }}>
              <label htmlFor="newTurno">Turno</label>
              <select id="newTurno" ref={turnoRef}>
                <option>MANHA</option>
                <option>TARDE</option>
                <option>NOITE</option>
              </select>
            </div>

            <div className="form-grupo" style={{ flex: 1 }}>
              <label htmlFor="newHorario">Horário / Bloco</label>
              <select id="newHorario" ref={horarioRef}>
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
                <option>E</option>
                <option>F</option>
              </select>
            </div>
          </div>

          <div className="form-grupo">
            <label htmlFor="newDescricao">Descrição ou Assunto</label>
            {/*<input id="newDescricao" ref={descricaoRef} placeholder="Ex: Aula Prática de Laboratório"/>*/}
            <textarea className="textarea-editor" id="newDescricao" ref={descricaoRef} placeholder="Ex: Aula Prática de Laboratório"></textarea>
          </div>

          <button onClick={handleSalvar}>Salvar Agendamento</button>
        </div>
      </div>
    </div>
  );
}
