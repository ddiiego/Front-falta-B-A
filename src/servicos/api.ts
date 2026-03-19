import { Sala, Agendamento } from "../tipos";

export type { Sala, Agendamento };

const API_URL = "/api/agendamento";

export const api = {
  buscarAgendamentos: async (): Promise<Agendamento[]> => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Erro ao buscar agendamentos");
    return res.json();
  },

  buscarSalas: async (): Promise<Sala[]> => {
    const res = await fetch("/api/sala");
    if (!res.ok) throw new Error("Erro ao buscar salas");
    return res.json();
  },

  criarAgendamento: async (dados: Omit<Agendamento, "id">): Promise<Agendamento> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error("Erro ao criar agendamento");
    return res.json();
  },

  excluirAgendamento: async (id: string): Promise<Response> => {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao excluir agendamento");
    return res;
  },

  atualizarAgendamento: async (id: string, dadosAtualizados: Partial<Agendamento>): Promise<Response> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosAtualizados),
    });
    if (!res.ok) throw new Error("Erro ao atualizar agendamento");
    return res;
  },
};
