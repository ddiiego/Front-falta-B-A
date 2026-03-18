import { Agendamento } from "../servicos/api";

export const nomesMes = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const diasSemana = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

export function obterDiasNoMes(ano: number, mes: number): number {
  return new Date(ano, mes + 1, 0).getDate();
}

export function obterDiaDaSemana(ano: number, mes: number, dia: number): number {
  return new Date(ano, mes, dia).getDay();
}

export function encontrarAgendamentos(agendamentos: Agendamento[], salaDescricao: string, ano: number, mes: number, dia: number, turno?: string): Agendamento[] {
  return agendamentos.filter(a => {
    if (!a.data) return false;
    const p = a.data.split("-");
    const anoAg = parseInt(p[0], 10);
    const mesAg = parseInt(p[1], 10) - 1; // Mês no JS é 0-indexed
    const diaAg = parseInt(p[2], 10);
    
    const baseMatch = salaDescricao === a.sala?.descricao &&
           ano === anoAg &&
           mes === mesAg &&
           dia === diaAg;

    if (!baseMatch) return false;
    if (turno && a.turno !== turno) return false;

    return true;
  });
}
