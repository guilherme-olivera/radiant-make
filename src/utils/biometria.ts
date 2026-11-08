// Utilitário para Biometria (Face ID / Touch ID / Impressão Digital do celular)
// Utiliza a Web Authentication API nativa dos smartphones (iOS Safari e Android Chrome)

export const biometriaService = {
  // Verifica se o aparelho suporta biometria/desbloqueio nativo
  isDisponivel: async (): Promise<boolean> => {
    if (
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    ) {
      try {
        return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      } catch {
        return false;
      }
    }
    return false;
  },

  // Verifica se a biometria está habilitada pela usuária no app
  isAtivada: (): boolean => {
    return localStorage.getItem('radiant_biometria_ativa') === 'true';
  },

  // Ativa a biometria criando uma credencial local rápida
  ativar: async (): Promise<{ sucesso: boolean; mensagem: string }> => {
    try {
      if (!window.PublicKeyCredential) {
        return { sucesso: false, mensagem: 'Biometria não suportada neste navegador.' };
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'Radiant Make' },
          user: {
            id: userId,
            name: 'admin@radiantmake',
            displayName: 'Radiant Make Admin',
          },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      });

      if (credential) {
        localStorage.setItem('radiant_biometria_ativa', 'true');
        return { sucesso: true, mensagem: 'Biometria ativada com sucesso!' };
      }
      return { sucesso: false, mensagem: 'Operação cancelada.' };
    } catch (err: any) {
      // Se der erro por domínio ou cancelamento, permite fallback
      return { sucesso: false, mensagem: err.message || 'Falha ao registrar biometria.' };
    }
  },

  // Solicita o desbloqueio por Face ID / Digital
  autenticar: async (): Promise<boolean> => {
    try {
      if (!window.PublicKeyCredential) return false;

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          userVerification: 'required',
          timeout: 60000,
        },
      });

      return Boolean(assertion);
    } catch {
      return false;
    }
  },

  desativar: () => {
    localStorage.removeItem('radiant_biometria_ativa');
  },
};
