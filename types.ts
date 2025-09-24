
export interface User {
  name: string;
  email: string;
  website: string;
}

export interface Prospect {
  companyName: string;
  linkedinUrl: string;
  contactPerson: string;
  contactEmail: string;
  hiringProbability: number;
}

export enum View {
  PROFILE = 'Perfil',
  SERVICES = 'Servicios',
  SEARCH = 'Búsqueda',
  SAVED_EMAILS = 'Emails Guardados'
}
