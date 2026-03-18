import React, { useEffect, useState, useRef } from "react";
import { api, Agendamento, Sala } from "./servicos/api";
import "./App.css"; // Estilos específicos do App e seus modais

import Cabecalho from "./componentes/Cabecalho";
import Calendario from "./componentes/Calendario";
// O Modais/ModalEdicao e Modais/ModalDetalhes serão substituídos pelo comportamento do Popover em breve.
// Manteremos as importações antigas até a próxima etapa ou adaptaremos agora.
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

  // Estados para controlar o popover customizado (estilo Gantt)
  const [agendamentoBalao, setAgendamentoBalao] = useState<Agendamento | null>(null);
  const [posicaoBalao, setPosicaoBalao] = useState<{ x: number, y: number, arrowX: number, position: 'top' | 'bottom' }>({ x: 0, y: 0, arrowX: 190, position: 'top' });
  const referenciaTempo = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    carregarAgendamentos();
    carregarSalas();
  }, []);

  const carregarSalas = async () => {
    try {
      const data = await api.buscarSalas();
      setSalas(data);
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

  // Funções legadas (para os modais originais)
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
    try {
      await api.criarAgendamento(dados);
      setModalAgendar(false);
      carregarAgendamentos();
    } catch (error) {
      alert("Erro ao criar agendamento.");
    }
  };

  // --------------- Lógica do Hover Popover ----------------
  const handleAgendamentoHoverIn = (ag: Agendamento, e: React.MouseEvent) => {
    if (referenciaTempo.current) clearTimeout(referenciaTempo.current);

    setAgendamentoAtual(ag);
    setAgendamentoBalao(ag);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const ALTURA_MEDIDA_POPOVER = 280;
    const LARGURA_POPOVER = 380;
    const MARGEM_SEGURANCA = 20;

    // Se a distância até o topo da tela for menor que o tamanho do popover,
    // significa que ele vai ser cortado pra cima. Vamos inverter!
    const isTopCutOff = rect.top - ALTURA_MEDIDA_POPOVER < MARGEM_SEGURANCA;

    let popoverX = rect.left + rect.width / 2 - LARGURA_POPOVER / 2;

    if (popoverX < MARGEM_SEGURANCA) {
      popoverX = MARGEM_SEGURANCA;
    } else if (popoverX + LARGURA_POPOVER > window.innerWidth - MARGEM_SEGURANCA) {
      popoverX = window.innerWidth - LARGURA_POPOVER - MARGEM_SEGURANCA;
    }

    // Calcula a posição da setinha relativa ao popover
    const arrowX = (rect.left + rect.width / 2) - popoverX;

    setPosicaoBalao({
      x: popoverX,
      y: isTopCutOff ? rect.bottom : rect.top,
      arrowX: arrowX,
      position: isTopCutOff ? 'bottom' : 'top'
    });
  };

  const handleAgendamentoHoverOut = () => {
    // Dá um tempo de 300ms para a pessoa mover o mouse até o popover
    referenciaTempo.current = setTimeout(() => {
      fecharPopoverImediato();
    }, 300);
  };

  const handlePopoverEnter = () => {
    // Se o mouse entrou no popover, cancela o fechamento
    if (referenciaTempo.current) clearTimeout(referenciaTempo.current);
  };

  const handlePopoverLeave = () => {
    // Se saiu do popover, conta o tempo de fechamento
    referenciaTempo.current = setTimeout(() => {
      fecharPopoverImediato();
    }, 300);
  };

  const fecharPopoverImediato = () => {
    setAgendamentoBalao(null);
  };
  // --------------------------------------------------------

  return (
    <div className="container-aplicativo">
      <Cabecalho mes={mes} ano={ano} onMudarMes={mudarMes} onIrParaMes={irParaMes} onAbrirAgendar={handleAbrirAgendar} />

      <Calendario
        ano={ano}
        mes={mes}
        agendamentos={agendamentos}
        onAgendamentoHoverIn={handleAgendamentoHoverIn}
        onAgendamentoHoverOut={handleAgendamentoHoverOut}
        onClickAgendamento={abrirModalDetalhes}
      />

      {/* NOVO POPOVER FLUTUANTE */}
      {agendamentoBalao && (
        <div
          className={`balao-flutuante balao-${posicaoBalao.position === 'top' ? 'cima' : 'baixo'}`}
          style={{
            left: `${posicaoBalao.x}px`,
            top: `${posicaoBalao.y}px`
          }}
          onMouseEnter={handlePopoverEnter}
          onMouseLeave={handlePopoverLeave}
        >
          <div className="balao-cabecalho fundo-azul-400">
            <div className="flexivel justificar-entre itens-centro">
              <span>{agendamentoBalao.descricao}</span>
              {/*<span className="balao-fechar" onClick={fecharPopoverImediato}>x</span>*/}
            </div>

          </div>

          <div className="balao-corpo flexivel">
            <div className="balao-info">
              <div className="grupo-info">
                <label>Data</label>
                <div>{agendamentoBalao.data}</div>
              </div>
              <div className="grupo-info">
                <label>Horário / Turno</label>
                <div>{agendamentoBalao.horario} - {agendamentoBalao.turno}</div>
              </div>
              <div className="grupo-info">
                <label>Andar/ Sala / Capacidade</label>
                <div>{agendamentoBalao.sala?.andar} {agendamentoBalao.sala?.descricao} ({agendamentoBalao.sala?.capacidade} lugares)</div>
              </div>
            </div>
            <div className="balao-acoes">
              <div className="abas borda-b mb-2">
                <span className="aba ativa">Ações</span>
              </div>
              <button className="link-acao" onClick={() => { fecharPopoverImediato(); abrirModalEdicao(); }}>{'>'} Editar</button>
              <button className="link-acao" onClick={() => { if (agendamentoBalao) abrirModalDetalhes(agendamentoBalao); fecharPopoverImediato(); }}>{'>'} Ver Detalhes</button>
              <button className="link-acao texto-vermelho-500" onClick={() => handleExcluir(agendamentoBalao.id)}>{'>'} Cancelar</button>
            </div>
          </div>
          <div
            className={`seta-${posicaoBalao.position === 'top' ? 'cima' : 'baixo'}`}
            style={{ left: `${posicaoBalao.arrowX}px` }}
          ></div>
        </div>
      )}

      {/* Modais Antigos/Backups (ainda utilizados acionados via Popover) */}
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
