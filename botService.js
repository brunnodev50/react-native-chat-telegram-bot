import { saveLead } from './database';

let isRunning = false;
let lastUpdateId = 0;
let intervalId = null;
let userStates = {}; 

const TELEGRAM_API = 'https://api.telegram.org/bot';

export const sendMessage = async (token, chatId, text) => {
  try {
    await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text }),
    });
    return true;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return false;
  }
};

const processUpdate = async (update, token, settings) => {
  const message = update.message;
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (!userStates[chatId] || text === '/start') {
    userStates[chatId] = { step: 'MENU', data: {} };
    await sendMessage(token, chatId, `${settings.welcome_message}\n\n1 - Preciso de suporte\n2 - Entrar em contato (WhatsApp)\n3 - Encerrar`);
    return;
  }

  const currentState = userStates[chatId];

  if (currentState.step === 'MENU') {
    if (text === '1') {
      userStates[chatId].step = 'WAITING_CPF';
      await sendMessage(token, chatId, "Por favor, digite seu CPF (somente números):");
    } else if (text === '2') {
      const link = `https://wa.me/${settings.whatsapp_number}`;
      await sendMessage(token, chatId, `Clique aqui para falar no WhatsApp: ${link}`);
    } else if (text === '3') {
      delete userStates[chatId];
      await sendMessage(token, chatId, "Obrigado! Tchau 👋");
    } else {
      await sendMessage(token, chatId, "Opção inválida. Digite 1, 2 ou 3.");
    }
    return;
  }

  if (currentState.step === 'WAITING_CPF') {
    if (!/^\d+$/.test(text)) {
      await sendMessage(token, chatId, "CPF inválido. Digite apenas números:");
      return;
    }
    currentState.data.cpf = text;
    currentState.step = 'WAITING_NAME';
    await sendMessage(token, chatId, "Obrigado. Agora digite seu Nome Completo:");
    return;
  }

  if (currentState.step === 'WAITING_NAME') {
    currentState.data.nome = text;
    currentState.step = 'WAITING_EMAIL';
    await sendMessage(token, chatId, "Qual é o seu E-mail?");
    return;
  }

  if (currentState.step === 'WAITING_EMAIL') {
    currentState.data.email = text;
    currentState.step = 'WAITING_REASON';
    await sendMessage(token, chatId, "Por fim, qual o motivo do contato?");
    return;
  }

  if (currentState.step === 'WAITING_REASON') {
    currentState.data.motivo = text;
    try {
      saveLead(chatId, currentState.data.cpf, currentState.data.nome, currentState.data.email, currentState.data.motivo);
      await sendMessage(token, chatId, "✅ Chamado aberto! Aguarde, nossa equipe responderá por aqui.");
    } catch (e) {
      await sendMessage(token, chatId, "Erro ao salvar dados.");
    }
    userStates[chatId] = { step: 'MENU', data: {} };
  }
};

export const startBot = (token, settings) => {
  if (isRunning) return;
  isRunning = true;
  userStates = {};

  intervalId = setInterval(async () => {
    try {
      const response = await fetch(`${TELEGRAM_API}${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=0`);
      const data = await response.json();

      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          await processUpdate(update, token, settings);
        }
      }
    } catch (error) {
      // Ignora erros
    }
  }, 2000);
};

export const stopBot = () => {
  isRunning = false;
  if (intervalId) clearInterval(intervalId);
};