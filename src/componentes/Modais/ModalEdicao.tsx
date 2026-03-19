import React, { useRef } from 'react';
import { Agendamento, Sala } from '../../servicos/api';

interface ModalEdicaoProps {
  agendamento: Agendamento;
  salas: Sala[];
  onFechar: () => void;
  onSalvar: (dados: Partial<Agendamento>) => void;
}

export default function ModalEdicao({ agendamento, salas, onFechar, onSalvar }: ModalEdicaoProps) {
  const dataRef = useRef<HTMLInputElement>(null);
  const turnoRef = useRef<HTMLSelectElement>(null);
  const horarioRef = useRef<HTMLSelectElement>(null);
  const descricaoRef = useRef<HTMLTextAreaElement>(null);
  const [salaBusca, setSalaBusca] = React.useState(agendamento.sala.descricao);

  if (!agendamento) return null;

  const handleSalvar = () => {
    const busca = salaBusca.trim().toLowerCase();
    const salaSelecionada = salas.find(s => {
      const desc = s.descricao.toLowerCase();
      return desc === busca || desc.includes(busca);
    });

    if (!salaSelecionada) {
      alert(`Sala "${salaBusca}" não encontrada. Verifique se o número está correto!`);
      return;
    }

    const atualizado = {
      data: dataRef.current?.value,
      turno: turnoRef.current?.value,
      horario: horarioRef.current?.value,
      descricao: descricaoRef.current?.value,
      sala: salaSelecionada
    };
    onSalvar(atualizado);
  };

  return (
    <div className="modal-fundo">
      <div className="modal-caixa">
        <div className="modal-cabecalho">
          <span>Editar Agendamento</span>
          <span style={{ cursor: 'pointer' }} onClick={onFechar}>×</span>
        </div>
        
        <div className="formulario-edicao">

          <div className="form-grupo">
            <label htmlFor="editSala">Sala (Digite o número)</label>
            <input
              type="text"
              id="editSala"
              list="listaSalasEdit"
              value={salaBusca}
              onChange={(e) => setSalaBusca(e.target.value)}
              placeholder="Ex: 201"
            />
            <datalist id="listaSalasEdit">
              {salas.map(s => (
                <option key={s.id} value={s.descricao} />
              ))}
            </datalist>
          </div>
          
          <div className="form-grupo">
            <label htmlFor="editData">Data do Agendamento</label>
            <input type="date" id="editData" ref={dataRef} defaultValue={agendamento.data}/>
          </div>
          
          <div className="flexivel" style={{ gap: '16px' }}>
            <div className="form-grupo" style={{ flex: 1 }}>
              <label htmlFor="editTurno">Turno</label>
              <select id="editTurno" ref={turnoRef} defaultValue={agendamento.turno}>
                <option>MANHA</option>
                <option>TARDE</option>
                <option>NOITE</option>
              </select>
            </div>
            
            <div className="form-grupo" style={{ flex: 1 }}>
              <label htmlFor="editHorario">Horário / Bloco</label>
              <select id="editHorario" ref={horarioRef} defaultValue={agendamento.horario}>
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
            <label htmlFor="editDescricao">Descrição ou Assunto Formativo</label>
            {/*<input id="editDescricao" ref={descricaoRef} defaultValue={agendamento.descricao} placeholder="Ex: Aula Prática de Laboratório"/> */}
            <textarea className="textarea-editor" id="editDescricao" ref={descricaoRef} defaultValue={agendamento.descricao} placeholder="Ex: Aula Prática de Laboratório"></textarea>
          </div>
          
          <button onClick={handleSalvar}>Salvar Alterações</button>
        </div>
      </div>
    </div>
  );
}
