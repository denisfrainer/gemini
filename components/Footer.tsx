'use client';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--primary)] border-t border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 text-center md:text-left">
          {/* Column 1: About */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4 text-white">Avatar Épico</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
              O gerador de avatares com IA mais rápido e épico da internet. Crie retratos incríveis em segundos.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4 text-white">Contato</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:suporte@avatarepico.com" className="text-gray-400 hover:text-[var(--accent-blue)] text-sm transition-colors">
                  Fale Conosco: suporte@avatarepico.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/20 text-center">
          <p className="text-gray-500 text-sm">
            {currentYear} © Avatar Épico. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
