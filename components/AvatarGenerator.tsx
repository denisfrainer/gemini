'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';


export function AvatarGenerator() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const pixCode = "00020101021126330014br.gov.bcb.pix01110295947403152040000530398654044.995802BR5913DENIS F LOPES6013FLORIANOPOLIS62070503***6304C95B";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    console.log("[FUNNEL_PIX_COPIED] User copied PIX payload.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppRedirect = () => {
    console.log("[FUNNEL_WHATSAPP_CLICK] User clicked WhatsApp submission CTA.");
    const waText = encodeURIComponent("Olá! Acabei de pagar pelo meu Avatar Épico. Aqui está o comprovante:");
    window.open(`https://wa.me/5548992123255?text=${waText}`, "_blank");
  };

  const [view, setView] = useState<'input' | 'loading' | 'result'>('input');
  const [isFading, setIsFading] = useState<boolean>(false);
  
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [finalDuration, setFinalDuration] = useState<number>(0);
  
  const [selfie, setSelfie] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('linkedin');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const transitionTo = (nextView: 'input' | 'loading' | 'result', delay = 350) => {
    setIsFading(true);
    setTimeout(() => {
      setView(nextView);
      setIsFading(false);
    }, delay);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Ocorreu um erro ao gerar o avatar. Tente novamente!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelfie(e.target.result as string);
        setError(null);
        setResult(null); // Clear previous result if uploading a new photo
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!selfie) {
      setError("Ocorreu um erro ao gerar o avatar. Tente novamente!");
      return;
    }

    // Viewport Correction: Smooth scroll to top on submit
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setLoading(true);
    setError(null);
    setElapsedTime(0);
    transitionTo('loading');

    // Dopamine Loading Ticker (Ticks every 30ms for live decimal display)
    const startTime = performance.now();
    const timer = setInterval(() => {
      const currentElapsed = (performance.now() - startTime) / 1000;
      setElapsedTime(currentElapsed);
    }, 30);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: selectedTheme,
          selfie: selfie,
        }),
      });

      // Check if the content type is actually JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro na API do Gemini');
        } else {
          const textError = await response.text();
          console.error('[API_HTML_ERROR]', textError);
          throw new Error('Erro de conexão com o servidor (404/500). Verifique o console.');
        }
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.image) {
        clearInterval(timer);
        const totalDuration = Math.round((performance.now() - startTime) / 1000);
        setFinalDuration(totalDuration);
        setResult(`data:image/jpeg;base64,${data.image}`);
        transitionTo('result');
      } else {
        throw new Error("Ocorreu um erro ao gerar o avatar. Tente novamente!");
      }
    } catch (err: any) {
      clearInterval(timer);
      console.error('[AVATAR_CLIENT_ERROR]', err);
      setError(err.message || "Ocorreu um erro ao gerar o avatar. Tente novamente!");
      transitionTo('input');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    transitionTo('input');
    setTimeout(() => {
      setSelfie(null);
      setResult(null);
      setError(null);
    }, 350);
  };

  const themes = [
    {
      id: 'linkedin',
      name: "Perfil Profissional (LinkedIn)",
      description: "Um retrato corporativo impecável e elegante.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      bgGradient: 'from-blue-600/20 to-cyan-500/20 border-blue-500/30',
      activeColor: 'ring-blue-500 text-blue-400 border-blue-500',
    },
    {
      id: 'warrior',
      name: "Guerreiro(a) Medieval",
      description: "Armadura de combate detalhada e cenário lendário.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      bgGradient: 'from-amber-600/20 to-red-500/20 border-amber-500/30',
      activeColor: 'ring-amber-500 text-amber-400 border-amber-500',
    },
    {
      id: 'space',
      name: "Viagem ao Espaço",
      description: "Traje espacial de astronauta explorando o cosmos.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      bgGradient: 'from-purple-600/20 to-pink-500/20 border-purple-500/30',
      activeColor: 'ring-purple-500 text-purple-400 border-purple-500',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
      <div className={`transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        {view === 'input' && (
          <div className="space-y-12 animate-[fadeIn_0.5s_ease-out]">
            {/* App Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                {"Avatar Épico"}
              </h1>
              <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
                {"Transforme sua selfie em um retrato épico gerado por Inteligência Artificial."}
              </p>
            </div>

            {/* Error Message if any */}
            {error && (
              <div className="max-w-md mx-auto bg-red-950/20 border border-red-500/20 p-6 rounded-3xl text-center space-y-4 backdrop-blur-md">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-red-300 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            {/* Main Grid */}
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left Side: Upload or Selfie Preview */}
              <div className="space-y-6">
                {!selfie ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300
                      ${isDragOver
                        ? 'border-[var(--accent-blue)] bg-white/[0.04] scale-[0.98]'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]'
                      }
                    `}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{"Arraste sua foto aqui"}</h3>
                    <p className="text-sm text-gray-500">{"Ou clique para selecionar um arquivo"}</p>
                  </div>
                ) : (
                  <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02]">
                    <img
                      src={selfie}
                      alt="Selfie"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <button
                      onClick={() => setSelfie(null)}
                      disabled={loading}
                      className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2 rounded-full border border-white/10 transition-colors"
                      aria-label="Remove image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                      <span>{"Foto carregada com sucesso!"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Theme Selector & Action */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-bold uppercase tracking-wider text-gray-500">{"Escolha seu Tema"}</h2>

                  <div className="space-y-3">
                    {themes.map((theme) => {
                      const isSelected = selectedTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedTheme(theme.id)}
                          disabled={loading}
                          className={`
                            w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center space-x-4 cursor-pointer
                            ${isSelected
                              ? `bg-white/[0.04] border-white/20 ring-2 ${theme.activeColor} shadow-[0_0_25px_rgba(255,255,255,0.02)]`
                              : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                            }
                          `}
                        >
                          <div className={`p-3 rounded-xl border transition-colors ${isSelected ? 'bg-white/5' : 'bg-white/[0.02]'}`}>
                            {theme.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold tracking-tight">{theme.name}</h3>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{theme.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleGenerate}
                  disabled={!selfie || loading}
                  className={`
                    w-full py-4 px-6 rounded-full font-bold transition-all duration-300 flex items-center justify-center space-x-2 active:scale-95 cursor-pointer
                    ${!selfie
                      ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                      : loading
                        ? 'bg-white/10 text-gray-400 border border-white/10 cursor-wait'
                        : 'bg-white text-black hover:bg-gray-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]'
                    }
                  `}
                >
                  <span>{"Gerar Meu Avatar"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'loading' && (
          <div className="max-w-md mx-auto space-y-6 text-center py-16 animate-[fadeIn_0.5s_ease-out]">
            <div className="aspect-square rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 shadow-[inset_0_0_30px_rgba(255,255,255,0.02)] max-w-sm mx-auto">
              <div className="w-12 h-12 bg-white/10 rounded-full animate-ping"></div>
            </div>
            <p className="text-gray-400 text-sm font-semibold tracking-wider">
              Criando a imagem em <span className="font-mono text-white bg-white/5 px-2 py-1 rounded border border-white/10 shadow-inner">{elapsedTime.toFixed(2)}s</span>
            </p>
          </div>
        )}

        {view === 'result' && result && (
          <div className="max-w-md mx-auto space-y-8 text-center animate-[fadeIn_0.5s_ease-out]">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                {"Seu Retrato Está Pronto!"}
              </h2>
              <p className="text-emerald-400 text-sm font-semibold tracking-wide">
                Imagem gerada em <span className="font-mono">{finalDuration}</span> segundos
              </p>
            </div>

            <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              <img
                src={result}
                alt="Generated Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  console.log("[FUNNEL_CHECKOUT_OPEN] User opened the PIX checkout modal.");
                }}
                className="bg-white text-black font-bold py-3.5 px-8 rounded-full hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2 text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{"Baixar Avatar"}</span>
              </button>

              <button
                onClick={handleReset}
                className="bg-white/5 border border-white/10 text-white font-bold py-3.5 px-8 rounded-full hover:bg-white/10 transition-all duration-300 text-sm cursor-pointer"
              >
                {"Criar Novo Avatar"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PIX Checkout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 md:p-8 flex flex-col items-center text-center space-y-6 shadow-[0_30px_70px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-2 cursor-pointer"
              aria-label="Fechar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Premium Copywriting */}
            <div className="space-y-2 mt-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Seu Avatar Épico está pronto! 🚀
              </h2>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                Desbloqueie sua arte em Alta Resolução agora mesmo por apenas <span className="text-white font-bold">R$ 4,90</span>.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="w-48 h-48 bg-white p-3 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] relative flex items-center justify-center">
              <Image
                src="/assets/qrcode.jpg"
                alt="PIX QR Code"
                width={192}
                height={192}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            {/* PIX Copy & Paste UI */}
            <div className="w-full space-y-2">
              <label className="text-left block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Copia e Cola PIX
              </label>
              <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden p-1.5 focus-within:border-white/20 transition-colors">
                <input
                  type="text"
                  readOnly
                  value={pixCode}
                  className="flex-1 bg-transparent border-none text-xs text-gray-300 px-3 outline-none select-all truncate"
                />
                <button
                  onClick={handleCopyPix}
                  className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg font-bold text-xs transition-colors shrink-0 active:scale-95 cursor-pointer"
                >
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>

            {/* WhatsApp CTA Button */}
            <button
              onClick={handleWhatsAppRedirect}
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold py-3.5 px-6 rounded-full flex items-center justify-center space-x-2 text-sm active:scale-95 transition-all shadow-[0_0_20px_rgba(37,211,102,0.15)] cursor-pointer"
            >
              <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.489.002 9.961-4.47 9.964-9.964.003-2.66-1.033-5.161-2.917-7.047C16.438 1.71 13.932.668 11.23.668 5.748.668 1.282 5.134 1.279 10.62c-.001 1.559.41 3.086 1.192 4.417L1.5 20.25l5.147-1.096z" />
              </svg>
              <span>Enviar Comprovante no WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
