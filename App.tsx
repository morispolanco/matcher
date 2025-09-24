
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, Prospect, GeneratedEmail, AppSection } from './types';
import { ALL_SERVICES, SECTION_ORDER } from './constants';
import * as geminiService from './services/geminiService';

// --- Helper & UI Components (defined outside main App to prevent re-renders) ---

const Spinner: React.FC = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
    </div>
);

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6 ${className}`}>
        {children}
    </div>
);

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <input
            id={id}
            {...props}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
        />
    </div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }> = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseClasses = "px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClasses = variant === 'primary'
        ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white"
        : "bg-slate-600 hover:bg-slate-700 focus:ring-slate-500 text-slate-200";
    return (
        <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
            {children}
        </button>
    );
};

const Icon: React.FC<{ path: string, className?: string }> = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d={path} clipRule="evenodd" />
    </svg>
);

// --- Section Components ---

const UserProfileSection: React.FC<{ profile: UserProfile, setProfile: React.Dispatch<React.SetStateAction<UserProfile>>, onSave: () => void }> = ({ profile, setProfile, onSave }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-white mb-4">Perfil de Usuario</h2>
            <p className="text-slate-400 mb-6">Esta información se usará para personalizar tus correos electrónicos.</p>
            <div className="space-y-4">
                <InputField label="Nombre Completo" id="name" name="name" value={profile.name} onChange={handleChange} placeholder="Tu Nombre" />
                <InputField label="Email" id="email" name="email" type="email" value={profile.email} onChange={handleChange} placeholder="tu@email.com" />
                <InputField label="Página Web" id="website" name="website" type="url" value={profile.website} onChange={handleChange} placeholder="https://tuweb.com" />
            </div>
            <div className="mt-6">
                <Button onClick={onSave}>Guardar Perfil</Button>
            </div>
        </Card>
    );
};

const ServicesSection: React.FC<{ selected: string[], setSelected: React.Dispatch<React.SetStateAction<string[]>> }> = ({ selected, setSelected }) => {
    const handleToggle = (service: string) => {
        setSelected(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-white mb-4">Servicios Ofrecidos</h2>
            <p className="text-slate-400 mb-6">Selecciona los servicios que ofreces. Esto ayudará a la IA a encontrar los mejores prospectos.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ALL_SERVICES.map(service => (
                    <label key={service} className="flex items-center space-x-3 bg-slate-700 p-3 rounded-md cursor-pointer hover:bg-slate-600 transition">
                        <input
                            type="checkbox"
                            checked={selected.includes(service)}
                            onChange={() => handleToggle(service)}
                            className="h-5 w-5 rounded bg-slate-800 border-slate-500 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-slate-200">{service}</span>
                    </label>
                ))}
            </div>
        </Card>
    );
};

const ProspectSearchSection: React.FC<{ onSearch: (service: string, industry: string, location: string) => void, isLoading: boolean, services: string[] }> = ({ onSearch, isLoading, services }) => {
    const [service, setService] = useState('');
    const [industry, setIndustry] = useState('');
    const [location, setLocation] = useState('');

    useEffect(() => {
        if (services.length > 0 && !service) {
            setService(services[0]);
        }
    }, [services, service]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(service, industry, location);
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-white mb-4">Búsqueda de Prospectos</h2>
            <p className="text-slate-400 mb-6">Ingresa los criterios para que la IA genere una lista de prospectos calificados.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="service" className="block text-sm font-medium text-slate-300 mb-2">Servicio Deseado por el Prospecto</label>
                    <select id="service" value={service} onChange={e => setService(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition">
                        <option value="" disabled>Selecciona un servicio</option>
                        {ALL_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <InputField label="Tipo de Comercio / Industria" id="industry" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Ej: E-commerce, SaaS, Restaurantes" />
                <InputField label="Ubicación" id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej: Madrid, España" />
                <div className="pt-2">
                    <Button type="submit" disabled={isLoading || !service || !industry || !location}>
                        {isLoading ? <Spinner /> : 'Buscar Prospectos'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

const ResultsSection: React.FC<{ prospects: Prospect[], onGenerateEmail: (prospectId: string) => void, isLoadingEmail: string | null }> = ({ prospects, onGenerateEmail, isLoadingEmail }) => {
    if (prospects.length === 0) {
        return <Card><p className="text-slate-400 text-center">No hay resultados de búsqueda. Realiza una nueva búsqueda para ver prospectos.</p></Card>;
    }
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Resultados de Búsqueda</h2>
            {prospects.sort((a, b) => (b.analysis?.hiringProbability ?? 0) - (a.analysis?.hiringProbability ?? 0)).map(prospect => (
                <Card key={prospect.id} className="transform hover:scale-[1.01] transition-transform duration-300">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-indigo-400">{prospect.companyName}</h3>
                            <p className="text-slate-400">{prospect.industry} - {prospect.location}</p>
                            <a href={`//${prospect.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline">{prospect.website}</a>
                        </div>
                        {prospect.analysis && (
                            <div className="text-right">
                                <p className="text-2xl font-bold text-green-400">{prospect.analysis.hiringProbability}%</p>
                                <p className="text-sm text-slate-400">Probabilidad</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 border-t border-slate-700 pt-4">
                        <p className="text-slate-200 font-semibold">{prospect.contact.name} - <span className="font-normal italic">{prospect.contact.title}</span></p>
                        <p className="text-sm text-slate-400">{prospect.contact.email}</p>
                    </div>
                    {prospect.analysis ? (
                        <div className="mt-4 bg-slate-900/50 p-4 rounded-md">
                            <h4 className="font-semibold text-slate-200 mb-2">Análisis de IA:</h4>
                            <p className="text-slate-300 text-sm">{prospect.analysis.analysis}</p>
                        </div>
                    ) : (
                         <div className="mt-4 flex items-center justify-center p-4"> <Spinner/> </div>
                    )}
                    <div className="mt-6">
                        <Button onClick={() => onGenerateEmail(prospect.id)} disabled={!prospect.analysis || isLoadingEmail === prospect.id} variant="secondary">
                           {isLoadingEmail === prospect.id ? <Spinner /> : 'Generar Email'}
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
};

const EmailsSection: React.FC<{ emails: GeneratedEmail[] }> = ({ emails }) => {
    const openInGmail = (email: GeneratedEmail) => {
        const subject = encodeURIComponent(email.subject);
        const body = encodeURIComponent(email.body);
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email.recipientEmail}&su=${subject}&body=${body}`;
        window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    };

    if (emails.length === 0) {
        return <Card><p className="text-slate-400 text-center">No has generado ningún email. Ve a la sección de Resultados para empezar.</p></Card>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Emails Guardados</h2>
            {emails.map((email, index) => (
                <Card key={index}>
                    <h3 className="text-lg font-semibold text-slate-200">Para: {email.prospectName}</h3>
                    <p className="text-sm text-slate-400 mb-2">Asunto: {email.subject}</p>
                    <div className="bg-slate-900/50 p-4 rounded-md whitespace-pre-wrap text-slate-300 text-sm max-h-60 overflow-y-auto">
                        {email.body}
                    </div>
                    <div className="mt-4">
                        <Button onClick={() => openInGmail(email)}>Abrir en Gmail</Button>
                    </div>
                </Card>
            ))}
        </div>
    );
};

// --- Main App Component ---

export default function App() {
    // State management
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeSection, setActiveSection] = useState<AppSection>(AppSection.PROFILE);
    const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', email: '', website: '' });
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [savedEmails, setSavedEmails] = useState<GeneratedEmail[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingEmail, setIsLoadingEmail] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load data from localStorage on initial render
    useEffect(() => {
        try {
            const storedProfile = localStorage.getItem('userProfile');
            if (storedProfile) {
                const profile = JSON.parse(storedProfile);
                setUserProfile(profile);
                if (profile.name && profile.email) {
                    setIsAuthenticated(true);
                }
            }
            const storedServices = localStorage.getItem('selectedServices');
            if (storedServices) setSelectedServices(JSON.parse(storedServices));

            const storedProspects = localStorage.getItem('prospects');
            if(storedProspects) setProspects(JSON.parse(storedProspects));

            const storedEmails = localStorage.getItem('savedEmails');
            if(storedEmails) setSavedEmails(JSON.parse(storedEmails));
        } catch (e) {
            console.error("Failed to parse from localStorage", e);
        }
    }, []);

    // Save data to localStorage when it changes
    useEffect(() => {
        try {
            localStorage.setItem('selectedServices', JSON.stringify(selectedServices));
        } catch (e) {
            console.error("Failed to save services", e);
        }
    }, [selectedServices]);
    
    useEffect(() => {
        try {
            localStorage.setItem('prospects', JSON.stringify(prospects));
        } catch (e) {
            console.error("Failed to save prospects", e);
        }
    }, [prospects]);

     useEffect(() => {
        try {
            localStorage.setItem('savedEmails', JSON.stringify(savedEmails));
        } catch (e) {
            console.error("Failed to save emails", e);
        }
    }, [savedEmails]);

    const handleSaveProfile = () => {
        try {
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            if (userProfile.name && userProfile.email) {
                setIsAuthenticated(true);
                setActiveSection(AppSection.SERVICES);
            }
        } catch(e) {
             console.error("Failed to save profile", e);
        }
    };

    const handleSearch = useCallback(async (service: string, industry: string, location: string) => {
        setIsLoading(true);
        setError(null);
        setProspects([]); // Clear previous results
        try {
            const generatedProspects = await geminiService.generateProspects(service, industry, location);
            setProspects(generatedProspects);
            setActiveSection(AppSection.RESULTS);

            // Analyze each prospect
            generatedProspects.forEach(async (prospect) => {
                const analysis = await geminiService.analyzeProspect(prospect, selectedServices);
                if (analysis) {
                    setProspects(prev => prev.map(p => p.id === prospect.id ? { ...p, analysis } : p));
                }
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedServices]);
    
    const handleGenerateEmail = useCallback(async (prospectId: string) => {
        const prospect = prospects.find(p => p.id === prospectId);
        if (!prospect || !prospect.analysis) return;

        // Prevent generating duplicate emails
        if (savedEmails.some(e => e.prospectId === prospectId)) {
            setActiveSection(AppSection.EMAILS);
            return;
        }

        setIsLoadingEmail(prospectId);
        setError(null);
        try {
            const emailContent = await geminiService.generateEmail(userProfile, prospect, selectedServices);
            if (emailContent) {
                const newEmail: GeneratedEmail = {
                    prospectId,
                    prospectName: prospect.companyName,
                    recipientEmail: prospect.contact.email,
                    ...emailContent,
                };
                setSavedEmails(prev => [newEmail, ...prev]);
                setActiveSection(AppSection.EMAILS);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during email generation.');
            console.error(err);
        } finally {
            setIsLoadingEmail(null);
        }
    }, [prospects, userProfile, selectedServices, savedEmails]);


    const renderContent = () => {
        switch (activeSection) {
            case AppSection.PROFILE: return <UserProfileSection profile={userProfile} setProfile={setUserProfile} onSave={handleSaveProfile} />;
            case AppSection.SERVICES: return <ServicesSection selected={selectedServices} setSelected={setSelectedServices} />;
            case AppSection.SEARCH: return <ProspectSearchSection onSearch={handleSearch} isLoading={isLoading} services={selectedServices} />;
            case AppSection.RESULTS: return <ResultsSection prospects={prospects} onGenerateEmail={handleGenerateEmail} isLoadingEmail={isLoadingEmail}/>;
            case AppSection.EMAILS: return <EmailsSection emails={savedEmails} />;
            default: return null;
        }
    };
    
    const isSectionCompleted = useCallback((section: AppSection): boolean => {
        switch (section) {
            case AppSection.PROFILE: return !!(userProfile.name && userProfile.email);
            case AppSection.SERVICES: return selectedServices.length > 0;
            case AppSection.SEARCH: return true; // always accessible if previous are done
            case AppSection.RESULTS: return prospects.length > 0;
            case AppSection.EMAILS: return savedEmails.length > 0;
            default: return false;
        }
    }, [userProfile, selectedServices.length, prospects.length, savedEmails.length]);
    
    const sectionIcons: Record<AppSection, string> = {
        [AppSection.PROFILE]: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
        [AppSection.SERVICES]: "M10.5 6h9.75M10.5 12h9.75M10.5 18h9.75M3.75 6a1.125 1.125 0 011.125-1.125h.008a1.125 1.125 0 011.125 1.125v.008a1.125 1.125 0 01-1.125 1.125h-.008A1.125 1.125 0 013.75 6.008v-.008zM3.75 12a1.125 1.125 0 011.125-1.125h.008a1.125 1.125 0 011.125 1.125v.008a1.125 1.125 0 01-1.125 1.125h-.008A1.125 1.125 0 013.75 12.008v-.008zM3.75 18a1.125 1.125 0 011.125-1.125h.008a1.125 1.125 0 011.125 1.125v.008a1.125 1.125 0 01-1.125 1.125h-.008A1.125 1.125 0 013.75 18.008v-.008z",
        [AppSection.SEARCH]: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
        [AppSection.RESULTS]: "M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25c.621 0 1.125.504 1.125 1.125v3.375c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 01-1.125-1.125v-3.375c0-.621.504-1.125 1.125-1.125h1.5zM12 14.25a.75.75 0 000-1.5h-3a.75.75 0 000 1.5h3zM12 17.25a.75.75 0 000-1.5h-3a.75.75 0 000 1.5h3zM18.75 9.75a1.5 1.5 0 00-3 0v.75h3v-.75zM18 12.75h.75a.75.75 0 01.75.75v3a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-3a.75.75 0 01.75-.75h.75v-1.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5z",
        [AppSection.EMAILS]: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <UserProfileSection profile={userProfile} setProfile={setUserProfile} onSave={handleSaveProfile} />
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-slate-900 text-white flex">
            <aside className="w-64 bg-slate-800 p-4 border-r border-slate-700 flex flex-col">
                 <div className="flex items-center space-x-2 mb-8">
                     <Icon path="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" className="w-8 h-8 text-indigo-400" />
                    <h1 className="text-xl font-bold text-white">Prospect AI</h1>
                </div>
                <nav className="flex-grow space-y-2">
                    {SECTION_ORDER.map((section, index) => {
                         const isUnlocked = SECTION_ORDER.slice(0, index).every(s => isSectionCompleted(s));
                         const isCurrent = activeSection === section;
                         return (
                            <button
                                key={section}
                                onClick={() => setActiveSection(section)}
                                disabled={!isUnlocked}
                                className={`w-full flex items-center space-x-3 p-2 rounded-md text-left transition ${
                                    isCurrent ? 'bg-indigo-600 text-white' : 
                                    isUnlocked ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-500 cursor-not-allowed'
                                }`}
                            >
                                <Icon path={sectionIcons[section]} className="w-5 h-5" />
                                <span>{section}</span>
                                {isSectionCompleted(section) && !isCurrent && <div className="w-2 h-2 rounded-full bg-green-500 ml-auto"></div>}
                            </button>
                         )
                    })}
                </nav>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-md mb-6">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                {renderContent()}
            </main>
        </div>
    );
}
