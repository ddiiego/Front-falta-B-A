export interface Sala {
  id: string;
  descricao: string;
  andar: string;
  capacidade: number;
}

export interface Agendamento {
  id: string;
  data: string;
  turno: string;
  horario: string;
  descricao: string;
  sala: Sala;
}
