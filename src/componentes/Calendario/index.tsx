import React, { useState } from 'react';
import { diasSemana, obterDiasNoMes, encontrarAgendamentos } from '../../utilitarios/data';
import { Agendamento, Sala } from '../../servicos/api';
import './estilos.css'; // Estilos reescritos
import ModalDetalhes from '../Modais/ModalDetalhes';

interface CalendarioProps {
  ano: number;
  mes: number;
  agendamentos: Agendamento[];
  onAgendamentoHoverIn: (ag: Agendamento, e: React.MouseEvent) => void;
  onAgendamentoHoverOut: () => void;
  onClickAgendamento: (ag: Agendamento) => void;
}

export default function Calendario({ ano, mes, agendamentos, onAgendamentoHoverIn, onAgendamentoHoverOut, onClickAgendamento }: CalendarioProps) {
  const diasNoMes = obterDiasNoMes(ano, mes);
  
  // Estrutura: Andar -> Turno -> Salas[]
  const agrupamento: Record<string, Record<string, Sala[]>> = {
    "9º ANDAR": { "MANHA": [], "TARDE": [], "NOITE": [] },
    "10º ANDAR": { "MANHA": [], "TARDE": [], "NOITE": [] }
  };

  const [andaresExpandidos, setAndaresExpandidos] = useState<Record<string, boolean>>({
    "9º ANDAR": true,
    "10º ANDAR": true
  });

  // Estado para os turnos (Andar-Turno como chave)
  const [turnosExpandidos, setTurnosExpandidos] = useState<Record<string, boolean>>({
    "9º ANDAR-MANHA": true, "9º ANDAR-TARDE": true, "9º ANDAR-NOITE": true,
    "10º ANDAR-MANHA": true, "10º ANDAR-TARDE": true, "10º ANDAR-NOITE": true
  });

  const toggleAndar = (andar: string) => {
    setAndaresExpandidos(prev => ({ ...prev, [andar]: !prev[andar] }));
  };

  const toggleTurno = (andar: string, turno: string) => {
    const chave = `${andar}-${turno}`;
    setTurnosExpandidos(prev => ({ ...prev, [chave]: !prev[chave] }));
  };

  // Funcao para extrair numero da descricao da sala para ordenacao
  const extrairNumeroSala = (desc: string) => {
    const match = desc.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Agrupar salas por andar e turno
  agendamentos.forEach(a => {
    if (!a.sala || !a.sala.andar) return;
    const andarKey = a.sala.andar.includes("9") ? "9º ANDAR" : "10º ANDAR";
    const turnoKey = a.turno;
    
    if (agrupamento[andarKey] && agrupamento[andarKey][turnoKey]) {
      if (!agrupamento[andarKey][turnoKey].some(s => s.descricao === a.sala.descricao)) {
        agrupamento[andarKey][turnoKey].push(a.sala);
      }
    }
  });

  // Ordenar as salas numericamente em cada turno
  Object.keys(agrupamento).forEach(andar => {
    Object.keys(agrupamento[andar]).forEach(turno => {
      agrupamento[andar][turno].sort((a, b) => extrairNumeroSala(a.descricao) - extrairNumeroSala(b.descricao));
    });
  });

  const turnosMap = { "MANHA": "Manhã", "TARDE": "Tarde", "NOITE": "Noite" };

  return (
    <div
      className="container-calendario"
      style={{ gridTemplateColumns: `var(--largura-barra-lateral) repeat(${diasNoMes}, minmax(var(--largura-minima-celula),1fr))` }}
    >
      <div className="celula celula-cabecalho celula-barra-lateral">Andares / Turnos / Salas</div>

      {Array.from({ length: diasNoMes }).map((_, i) => {
        const d = new Date(ano, mes, i + 1);
        return (
          <div key={i} className="celula celula-cabecalho cabecalho-dia texto-centralizado">
            <div className="flexivel direcao-coluna itens-centro justificar-centro">
              <span className="numero-dia fonte-negrito">{i + 1}</span>
              <span className="nome-dia">{diasSemana[d.getDay()].toUpperCase()}</span>
            </div>
          </div>
        );
      })}

      {Object.keys(agrupamento).map((andar) => (
        <React.Fragment key={andar}>
          <div
            className="celula-andar linha-andar cursor-apontador hover-bg-cinza-100 transicao-cores"
            onClick={() => toggleAndar(andar)}
          >
            <div className="rotulo-andar-fixo">
              <span className="bloco-inline l-4 texto-centralizado mr-1">
                {andaresExpandidos[andar] ? '▼' : '▶'}
              </span>
              {andar}
            </div>
          </div>

          {andaresExpandidos[andar] && Object.keys(agrupamento[andar]).map((turno) => {
            const salas = agrupamento[andar][turno];
            const isTurnoExpandido = turnosExpandidos[`${andar}-${turno}`];
            
            return (
              <React.Fragment key={`${andar}-${turno}`}>
                <div 
                  className="celula-turno curso-apontador hover-bg-cinza-50 transicao-cores"
                  onClick={() => toggleTurno(andar, turno)}
                >
                  <div className="rotulo-turno-fixo pl-4">
                    <span className="bloco-inline l-4 texto-centralizado mr-1 texto-cinza-500">
                      {isTurnoExpandido ? '▼' : '▶'}
                    </span>
                    {turnosMap[turno as keyof typeof turnosMap]}
                  </div>
                </div>

                {isTurnoExpandido && salas.map((sala, salaIdx) => (
                  <React.Fragment key={`${andar}-${turno}-${salaIdx}`}>
                    <div className="celula celula-barra-lateral linha-sala texto-cinza-700 pl-8 borda-b">
                      {sala.descricao}
                    </div>

                    {Array.from({ length: diasNoMes }).map((_, dia) => {
                      const ags = encontrarAgendamentos(agendamentos, sala.descricao, ano, mes, dia + 1, turno);

                      // Nova Distribuição: A,B=Top, C,D=Meio, E,F=Baixo
                      const agTopo = ags.find(a => ["A", "B"].includes(a.horario));
                      const agMeio = ags.find(a => ["C", "D"].includes(a.horario));
                      const agBaixo = ags.find(a => ["E", "F"].includes(a.horario));

                      return (
                        <div key={dia} className="celula celula-dia-sala borda-b borda-cinza-100 relativo">
                          <div className="slot-agendamento slot-topo">
                            {agTopo && (
                              <div
                                className="tarja-agendamento fundo-azul-escuro"
                                onMouseEnter={(e) => onAgendamentoHoverIn(agTopo, e)}
                                onMouseLeave={onAgendamentoHoverOut}
                                onClick={() => onClickAgendamento(agTopo)}
                              >
                                <span className="texto-truncado">({agTopo.horario}) {agTopo.descricao}</span>
                              </div>
                            )}
                          </div>

                          <div className="slot-agendamento slot-meio">
                            {agMeio && (
                              <div
                                className="tarja-agendamento fundo-azul-claro"
                                onMouseEnter={(e) => onAgendamentoHoverIn(agMeio, e)}
                                onMouseLeave={onAgendamentoHoverOut}
                                onClick={() => onClickAgendamento(agMeio)}
                              >
                                <span className="texto-truncado">({agMeio.horario}) {agMeio.descricao}</span>
                              </div>
                            )}
                          </div>

                          <div className="slot-agendamento slot-baixo">
                            {agBaixo && (
                              <div
                                className="tarja-agendamento fundo-amba"
                                onMouseEnter={(e) => onAgendamentoHoverIn(agBaixo, e)}
                                onMouseLeave={onAgendamentoHoverOut}
                                onClick={() => onClickAgendamento(agBaixo)}
                              >
                                <span className="texto-truncado">({agBaixo.horario}) {agBaixo.descricao}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

