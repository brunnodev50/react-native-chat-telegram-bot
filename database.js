import * as SQLite from 'expo-sqlite';

// Mudei o nome para garantir que crie um banco zerado e sem erros
const db = SQLite.openDatabaseSync('bot_final.db');

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY NOT NULL,
      bot_token TEXT,
      welcome_message TEXT,
      whatsapp_number TEXT
    );
  `);
  
  db.execSync(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id TEXT,
      cpf TEXT,
      nome TEXT,
      email TEXT,
      motivo TEXT,
      data_criacao TEXT,
      status TEXT DEFAULT 'pendente',
      resposta TEXT
    );
  `);

  const firstRun = db.getAllSync('SELECT * FROM settings');
  if (firstRun.length === 0) {
    db.runSync('INSERT INTO settings (bot_token, welcome_message, whatsapp_number) VALUES (?, ?, ?)', ['', 'Bem-vindo! Escolha uma opção.', '']);
  }
};

export const getSettings = () => {
  return db.getFirstSync('SELECT * FROM settings');
};

export const updateSettings = (token, msg, zap) => {
  db.runSync('UPDATE settings SET bot_token = ?, welcome_message = ?, whatsapp_number = ? WHERE id = 1', [token, msg, zap]);
};

export const saveLead = (chatId, cpf, nome, email, motivo) => {
  const date = new Date().toLocaleString();
  db.runSync('INSERT INTO leads (chat_id, cpf, nome, email, motivo, data_criacao, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [chatId, cpf, nome, email, motivo, date, 'pendente']);
};

export const getLeads = () => {
  return db.getAllSync('SELECT * FROM leads ORDER BY id DESC');
};

export const resolveLeadDB = (id, resposta) => {
  db.runSync('UPDATE leads SET status = ?, resposta = ? WHERE id = ?', ['resolvido', resposta, id]);
};