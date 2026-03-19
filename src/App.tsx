import React, { useEffect, useState, useRef } from "react";
import { api } from "./servicos/api";
import { Agendamento, Sala } from "./tipos";
import "./App.css";

import Cabecalho from "./componentes/Cabecalho";
import Calendario from "./componentes/Calendario";
import Popover from "./componentes/Popover";
import ModalDetalhes from "./componentes/Modais/ModalDetalhes";
import ModalEdicao from "./componentes/Modais/ModalEdicao";
import ModalAgendamento from "./componentes/Modais/ModalAgendamento";

export default function App() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [agendamentoAtual, setAgendamentoAtual] = useState<Agendamento | null>(null);

  const [ano, setAno] = useState<number>(2026);
  const [mes, setMes] = useState<number>(2);

  const [modal, setModal] = useState<boolean>(false);
  const [modalEditar, setModalEditar] = useState<boolean>(false);
  const [modalAgendar, setModalAgendar] = useState<boolean>(false);

  const [agendamentoBalao, setAgendamentoBalao] = useState<Agendamento | null>(null);
  const [posicaoBalao, setPosicaoBalao] = useState<{ x: number, y: number, arrowX: number, position: 'top' | 'bottom' }>({ x: 0, y: 0, arrowX: 190, position: 'top' });
  const referenciaTempo = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  useEffect(() => {
    if (salas.length === 0) {
      carregarSalas();
    }
  }, [agendamentos]);

  const carregarSalas = async () => {
    try {
      const data = await api.buscarSalas();
      
      if (data && data.length > 0) {
        setSalas(data);
      } else {
        const salasUnicas: Sala[] = [];
        agendamentos.forEach(a => {
          if (a.sala && !salasUnicas.some(s => s.id === a.sala.id)) {
            salasUnicas.push(a.sala);
          }
        });
        
        if (salasUnicas.length > 0) {
          setSalas(salasUnicas);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const carregarAgendamentos = async () => {
    try {
      const data = await api.buscarAgendamentos();
      setAgendamentos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const mudarMes = (dir: number) => {
    let m = mes + dir;
    let a = ano;
    if (m < 0) { m = 11; a--; }
    if (m > 11) { m = 0; a++; }
    setMes(m);
    setAno(a);
  };

  const irParaMes = (novoMes: number) => {
    setMes(novoMes);
  };

  const abrirModalDetalhes = (agendamento: Agendamento) => {
    setAgendamentoAtual(agendamento);
    setModal(true);
  };

  const fecharModalDetalhes = () => {
    setModal(false);
    setAgendamentoAtual(null);
  };

  const handleExcluir = async (id?: string) => {
    const targetId = id || agendamentoAtual?.id;
    if (!targetId || !window.confirm("Excluir agendamento?")) return;
    try {
      await api.excluirAgendamento(targetId);
      fecharModalDetalhes();
      fecharPopoverImediato();
      carregarAgendamentos();
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  const abrirModalEdicao = () => {
    setModalEditar(true);
  };

  const fecharModalEdicao = () => {
    setModalEditar(false);
  };

  const handleSalvarEdicao = async (dadosAtualizados: Partial<Agendamento>) => {
    if (!agendamentoAtual) return;

    const dataCheck = dadosAtualizados.data || agendamentoAtual.data;
    const turnoCheck = dadosAtualizados.turno || agendamentoAtual.turno;
    const horarioCheck = dadosAtualizados.horario || agendamentoAtual.horario;
    const salaIdCheck = String(dadosAtualizados.sala?.id || agendamentoAtual.sala.id);
    const idAtual = String(agendamentoAtual.id);

    const conflito = agendamentos.some(a => 
      String(a.id) !== idAtual &&
      a.data === dataCheck &&
      a.turno === turnoCheck &&
      a.horario === horarioCheck &&
      String(a.sala.id) === salaIdCheck
    );

    if (conflito) {
      alert("Já existe um agendamento para esta sala nesse horário!");
      return;
    }

    try {
      await api.atualizarAgendamento(agendamentoAtual.id, dadosAtualizados);
      fecharModalEdicao();
      fecharModalDetalhes();
      fecharPopoverImediato();
      carregarAgendamentos();
    } catch (error) {
      alert("Erro ao editar.");
    }
  };

  const handleAbrirAgendar = () => {
    setModalAgendar(true);
  };

  const handleCriarAgendamento = async (dados: Omit<Agendamento, "id">) => {
    const conflito = agendamentos.some(a => 
      a.data === dados.data &&
      a.turno === dados.turno &&
      a.horario === dados.horario &&
      String(a.sala.id) === String(dados.sala.id)
    );

    if (conflito) {
      alert("Já existe um agendamento para esta sala nesse horário!");
      return;
    }

    try {
      await api.criarAgendamento(dados);
      setModalAgendar(false);
      carregarAgendamentos();
    } catch (error) {
      alert("Erro ao criar agendamento.");
    }
  };

  const handleAgendamentoHoverIn = (ag: Agendamento, e: React.MouseEvent) => {
    if (referenciaTempo.current) clearTimeout(referenciaTempo.current);

    setAgendamentoAtual(ag);
    setAgendamentoBalao(ag);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const ALTURA_MEDIDA_POPOVER = 400;
    const LARGURA_POPOVER = 380;
    const MARGEM_SEGURANCA = 20;

    const isTopCutOff = rect.top - ALTURA_MEDIDA_POPOVER < MARGEM_SEGURANCA;

    let popoverX = rect.left + rect.width / 2 - LARGURA_POPOVER / 2;

    if (popoverX < MARGEM_SEGURANCA) {
      popoverX = MARGEM_SEGURANCA;
    } else if (popoverX + LARGURA_POPOVER > window.innerWidth - MARGEM_SEGURANCA) {
      popoverX = window.innerWidth - LARGURA_POPOVER - MARGEM_SEGURANCA;
    }

    const arrowX = (rect.left + rect.width / 2) - popoverX;

    setPosicaoBalao({
      x: popoverX,
      y: isTopCutOff ? rect.bottom : rect.top,
      arrowX: arrowX,
      position: isTopCutOff ? 'bottom' : 'top'
    });
  };

  const handleAgendamentoHoverOut = () => {
    referenciaTempo.current = setTimeout(() => {
      fecharPopoverImediato();
    }, 300);
  };

  const handlePopoverEnter = () => {
    if (referenciaTempo.current) clearTimeout(referenciaTempo.current);
  };

  const handlePopoverLeave = () => {
    referenciaTempo.current = setTimeout(() => {
      fecharPopoverImediato();
    }, 300);
  };

  const fecharPopoverImediato = () => {
    setAgendamentoBalao(null);
  };

  return (
    <div className="container-aplicativo">
      <Cabecalho mes={mes} ano={ano} onMudarMes={mudarMes} onIrParaMes={irParaMes} onAbrirAgendar={handleAbrirAgendar} />

      <div className="calendario-scroll-container">
        <Calendario
          ano={ano}
          mes={mes}
          agendamentos={agendamentos}
          onAgendamentoHoverIn={handleAgendamentoHoverIn}
          onAgendamentoHoverOut={handleAgendamentoHoverOut}
          onClickAgendamento={abrirModalDetalhes}
        />
      </div>

      {agendamentoBalao && (
        <Popover
          agendamento={agendamentoBalao}
          posicao={posicaoBalao}
          onMouseEnter={handlePopoverEnter}
          onMouseLeave={handlePopoverLeave}
          onEditar={() => { fecharPopoverImediato(); abrirModalEdicao(); }}
          onVerDetalhes={() => { if (agendamentoBalao) abrirModalDetalhes(agendamentoBalao); fecharPopoverImediato(); }}
          onCancelar={(id) => handleExcluir(id)}
        />
      )}

      {modal && agendamentoAtual && !modalEditar && (
        <ModalDetalhes
          agendamento={agendamentoAtual}
          onFechar={fecharModalDetalhes}
          onEditar={abrirModalEdicao}
          onExcluir={() => handleExcluir(agendamentoAtual.id)}
        />
      )}

      {modalEditar && agendamentoAtual && (
        <ModalEdicao
          agendamento={agendamentoAtual}
          salas={salas}
          onFechar={fecharModalEdicao}
          onSalvar={handleSalvarEdicao}
        />
      )}

      {modalAgendar && (
        <ModalAgendamento
          salas={salas}
          onFechar={() => setModalAgendar(false)}
          onSalvar={handleCriarAgendamento}
        />
      )}
    </div>
  );
}
