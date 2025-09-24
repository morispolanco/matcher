
export interface UserProfile {
  name: string;
  email: string;
  website: string;
}

export interface Prospect {
  id: string;
  companyName: string;
  industry: string;
  location: string;
  website: string;
  contact: {
    name: string;
    title: string;
    email: string;
  };
  analysis?: {
    hiringProbability: number;
    analysis: string;
  };
}

export interface GeneratedEmail {
  prospectId: string;
  prospectName: string;
  recipientEmail: string;
  subject: string;
  body: string;
}

export enum AppSection {
  PROFILE = 'Perfil',
  SERVICES = 'Servicios',
  SEARCH = 'Búsqueda',
  RESULTS = 'Resultados',
  EMAILS = 'Emails',
}
