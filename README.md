# 📱 React Native Chat Telegram Bot

> Um sistema completo de CRM e Atendimento via Bot do Telegram que roda inteiramente no dispositivo móvel. Arquitetura serverless utilizando o próprio App como servidor de polling e banco de dados local.

![Badge License](https://img.shields.io/badge/license-MIT-blue)
![Badge React Native](https://img.shields.io/badge/React_Native-v0.76-cyan)
![Badge Expo](https://img.shields.io/badge/Expo-52-black)
![Badge SQLite](https://img.shields.io/badge/Storage-SQLite-yellow)

## 📋 Índice

- [Preview](#-preview)
- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias-utilizadas)
- [Instalação](#-como-rodar-o-projeto)
- [Autor](#-autor)

---

## 🎨 Preview

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img width="200" alt="Login" src="https://github.com/user-attachments/assets/254bc024-7b9a-4667-a87c-a77270722419" /><br />
        <sub><b>Login</b></sub>
      </td>
      <td align="center">
        <img width="200" alt="Painel Admin" src="https://github.com/user-attachments/assets/66307452-4273-4c48-ba02-b46fd59e44a9" /><br />
        <sub><b>Painel de Controle</b></sub>
      </td>
      <td align="center">
        <img width="200" alt="Lista de Leads" src="https://github.com/user-attachments/assets/860eb9a1-e04a-4f18-b4c8-a7af931cca4e" /><br />
        <sub><b>Lista de Chamados</b></sub>
      </td>
      <td align="center">
        <img width="200" alt="Detalhes" src="https://github.com/user-attachments/assets/f8017979-6b8c-466f-a92a-cafc0dc88675" /><br />
        <sub><b>Status do Lead</b></sub>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img width="200" alt="Resposta" src="https://github.com/user-attachments/assets/12a3abc8-2d57-48e5-8107-35a75d7f3cfb" /><br />
        <sub><b>Resolvendo Chamado</b></sub>
      </td>
      <td align="center">
        <img width="200" alt="Botão WhatsApp" src="https://github.com/user-attachments/assets/a9122383-9f5e-43b1-bca0-aecc6245948d" /><br />
        <sub><b>Link WhatsApp</b></sub>
      </td>
      <td align="center">
        <img width="200" alt="Bot Telegram" src="https://github.com/user-attachments/assets/61988cca-6b38-4b91-bf12-bbcc39ddb5ba" /><br />
        <sub><b>Visão do Cliente (Telegram)</b></sub>
      </td>
      <td align="center">
        <img width="200" alt="Encerrar" src="https://github.com/user-attachments/assets/d23b3ac2-fac4-4cda-8328-a530812cccf8" /><br />
        <sub><b>Fim do Fluxo</b></sub>
      </td>
    </tr>
  </table>
</div>

---

## 🚀 Sobre o Projeto

O **react-native-chat-telegram-bot** é uma prova de conceito de uma arquitetura **"Serverless Mobile"**. 

Ao invés de depender de um servidor backend (Node.js/Python) rodando 24/7 na nuvem, este aplicativo utiliza o processamento do próprio celular para realizar o *polling* da API do Telegram. Ele processa mensagens, salva Leads em um banco **SQLite** local e permite que o administrador responda aos usuários em tempo real.

É a solução perfeita para micro-negócios que precisam de um chatbot inteligente sem custos mensais de infraestrutura de servidor.

## ✨ Funcionalidades

- **🤖 Bot Autônomo:** O App consome a API do Telegram diretamente via Fetch API.
- **📂 Gestão de Leads:** Captura automática de dados via fluxo de conversa (CPF, Nome, Email, Motivo).
- **💾 Persistência Local:** Banco de dados SQLite robusto e performático.
- **💬 Atendimento Humanizado:** Interface administrativa para responder chamados diretamente pelo App.
- **⚡ Status em Tempo Real:** Atualização de status (Pendente/Resolvido) sincronizada com o envio de mensagens.
- **🎨 UI Senior:** Interface moderna, limpa e responsiva (Clean UI) com tratamento de teclado e áreas seguras.

## 🛠️ Tecnologias Utilizadas

- **Core:** [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/)
- **Database:** `expo-sqlite`
- **Networking:** Fetch API (Integração direta Telegram Bot API)
- **Filesystem:** `expo-file-system`

---

## 📦 Como rodar o projeto

### Pré-requisitos
- Node.js instalado.
- Dispositivo Android/iOS ou Emulador configurado.

### Passo a passo

1. **Clone o repositório**
   ```bash
   git clone [https://github.com/brunnodev50/react-native-chat-telegram-bot.git](https://github.com/brunnodev50/react-native-chat-telegram-bot.git)
   cd react-native-chat-telegram-bot
