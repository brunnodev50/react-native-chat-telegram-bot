import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { sendMessage, startBot, stopBot } from './botService';
import { getLeads, getSettings, initDB, resolveLeadDB, updateSettings } from './database';

const theme = {
  primary: '#3B82F6', secondary: '#64748B', success: '#10B981', warning: '#F59E0B',
  background: '#F8FAFC', cardBg: '#FFFFFF', textDark: '#1E293B', textLight: '#94A3B8', borderColor: '#E2E8F0'
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const [view, setView] = useState('config');
  const [botActive, setBotActive] = useState(false);
  const [settings, setSettings] = useState({ bot_token: '', welcome_message: '', whatsapp_number: '' });
  
  const [leads, setLeads] = useState([]);
  const [searchText, setSearchText] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    // Inicializa DB Síncrono (seguro)
    initDB();
    loadSettings();
    
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') StatusBar.setBackgroundColor(theme.background);
  }, []);

  const loadSettings = () => {
    const data = getSettings();
    if (data) setSettings(data);
  };

  const handleLogin = () => {
    if (user === 'admin' && pass === 'admin') setIsLoggedIn(true);
    else Alert.alert('Acesso Negado', 'Verifique suas credenciais.');
  };

  const handleSaveSettings = () => {
    updateSettings(settings.bot_token, settings.welcome_message, settings.whatsapp_number);
    Alert.alert('Salvo', 'Configurações atualizadas com sucesso!');
    if (botActive) {
      stopBot();
      startBot(settings.bot_token, settings);
    }
  };

  const toggleBot = () => {
    if (!settings.bot_token) {
      Alert.alert('Atenção', 'Configure o Token do Bot antes de iniciar.');
      return;
    }
    if (botActive) {
      stopBot();
      setBotActive(false);
    } else {
      startBot(settings.bot_token, settings);
      setBotActive(true);
      Alert.alert('Bot Online', 'O sistema está respondendo no Telegram.');
    }
  };

  const refreshLeads = () => {
    setLeads(getLeads());
  };

  const filteredLeads = leads.filter(lead => {
    const search = searchText.toLowerCase();
    return (
      lead.nome?.toLowerCase().includes(search) ||
      lead.cpf?.includes(search) ||
      lead.email?.toLowerCase().includes(search)
    );
  });

  const openResolveModal = (lead) => {
    setSelectedLead(lead);
    setResponseText('');
    setModalVisible(true);
  };

  const sendResponse = async () => {
    if (!responseText.trim()) {
      Alert.alert('Campo Vazio', 'Por favor, digite uma resposta para o usuário.');
      return;
    }
    const sent = await sendMessage(settings.bot_token, selectedLead.chat_id, `🔔 *Atualização do Suporte:*\n\n${responseText}`);
    
    if (sent) {
      resolveLeadDB(selectedLead.id, responseText);
      Alert.alert('Resolvido', 'Resposta enviada e chamado finalizado.');
      setModalVisible(false);
      refreshLeads();
    } else {
      Alert.alert('Erro de Conexão', 'Não foi possível enviar a mensagem ao Telegram.');
    }
  };

  if (!isLoggedIn) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.loginContainer}>
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Admin Bot</Text>
          <Text style={styles.loginSubtitle}>Gerenciador de Atendimento</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Usuário</Text>
            <TextInput style={styles.input} placeholder="admin" placeholderTextColor={theme.textLight} onChangeText={setUser} autoCapitalize="none" />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput style={styles.input} placeholder="admin" placeholderTextColor={theme.textLight} secureTextEntry onChangeText={setPass} />
          </View>
          
          <TouchableOpacity style={[styles.btnPrimary, {marginTop: 20}]} onPress={handleLogin}>
            <Text style={styles.btnPrimaryText}>Entrar no Sistema</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Painel de Controle</Text>
            <Text style={styles.headerSubtitle}>Visão geral do atendimento</Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, {color: botActive ? theme.success : theme.secondary}]}>
              {botActive ? 'ONLINE' : 'OFFLINE'}
            </Text>
            <Switch value={botActive} onValueChange={toggleBot} trackColor={{false: theme.borderColor, true: theme.primary + '80'}} thumbColor={botActive ? theme.primary : theme.textLight} />
          </View>
        </View>

        <View style={styles.navContainer}>
          <View style={styles.navBackground}>
            <TouchableOpacity onPress={() => setView('config')} style={[styles.navBtn, view==='config' && styles.activeNavBtn]}>
              <Text style={[styles.navText, view==='config' && styles.activeNavText]}>Configurações</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {setView('leads'); refreshLeads();}} style={[styles.navBtn, view==='leads' && styles.activeNavBtn]}>
              <Text style={[styles.navText, view==='leads' && styles.activeNavText]}>Leads & Chamados</Text>
            </TouchableOpacity>
          </View>
        </View>

        {view === 'config' ? (
          <ScrollView style={styles.contentScroll} contentContainerStyle={{paddingBottom: 40}}>
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Conexão Telegram</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Token do Bot (BotFather)</Text>
                <TextInput style={styles.input} value={settings.bot_token} placeholder="Ex: 123456:ABC-DEF..." placeholderTextColor={theme.textLight} onChangeText={(t) => setSettings({...settings, bot_token: t})} />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Personalização</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mensagem de Boas-vindas</Text>
                <TextInput style={[styles.input, styles.textArea]} multiline value={settings.welcome_message} placeholder="Digite a mensagem inicial..." placeholderTextColor={theme.textLight} onChangeText={(t) => setSettings({...settings, welcome_message: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Número WhatsApp (Link Direto)</Text>
                <TextInput style={styles.input} value={settings.whatsapp_number} placeholder="Ex: 5511999999999" keyboardType="phone-pad" placeholderTextColor={theme.textLight} onChangeText={(t) => setSettings({...settings, whatsapp_number: t})} />
              </View>
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveSettings}>
              <Text style={styles.btnPrimaryText}>Salvar Todas as Configurações</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.contentFlex}>
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput 
                style={styles.searchInput} 
                placeholder="Buscar por Nome, CPF ou Email..." 
                placeholderTextColor={theme.textLight}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            <ScrollView style={styles.contentScroll} contentContainerStyle={{paddingBottom: 40}}>
              <View style={styles.leadsHeader}>
                <Text style={styles.leadsCount}>{filteredLeads.length} Chamados encontrados</Text>
              </View>

              {filteredLeads.map((lead) => {
                const isResolved = lead.status === 'resolvido';
                return (
                <View key={lead.id} style={[styles.leadCard, isResolved ? styles.leadCardResolved : styles.leadCardPending]}>
                  
                  <View style={styles.leadHeaderRow}>
                    <View style={styles.leadInfoContainer}>
                        <Text style={styles.leadName}>{lead.nome}</Text>
                        <Text style={styles.leadDate}>{lead.data_criacao}</Text>
                    </View>
                    
                    <View style={[styles.statusBadge, {backgroundColor: isResolved ? theme.success + '20' : theme.warning + '20'}]}>
                        <Text style={[styles.statusBadgeText, {color: isResolved ? theme.success : theme.warning}]}>
                          {isResolved ? 'RESOLVIDO' : 'PENDENTE'}
                        </Text>
                    </View>
                  </View>
                  
                  <View style={styles.separator} />
                  
                  <View style={styles.leadInfoRow}><Text style={styles.infoLabel}>CPF:</Text><Text style={styles.infoValue}>{lead.cpf}</Text></View>
                  <View style={styles.leadInfoRow}><Text style={styles.infoLabel}>Email:</Text><Text style={styles.infoValue}>{lead.email}</Text></View>
                  
                  <View style={styles.reasonContainer}>
                    <Text style={styles.reasonTitle}>Motivo do Contato:</Text>
                    <Text style={styles.reasonText}>"{lead.motivo}"</Text>
                  </View>
                  
                  {isResolved ? (
                    <View style={styles.responseContainer}>
                       <Text style={styles.responseTitle}>✅ Sua Resposta:</Text>
                       <Text style={styles.responseText}>{lead.resposta}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.btnResolve} onPress={() => openResolveModal(lead)}>
                      <Text style={styles.btnResolveText}>Responder e Finalizar Chamado</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )})}
              {filteredLeads.length === 0 && (
                <View style={styles.emptyState}>
                   <Text style={styles.emptyStateText}>Nenhum lead encontrado.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>Responder Chamado</Text>
                 <Text style={styles.modalSubtitle}>Cliente: {selectedLead?.nome}</Text>
              </View>
              
              <Text style={styles.label}>Sua resposta (será enviada ao Telegram):</Text>
              <TextInput 
                style={[styles.input, styles.textArea, styles.modalTextArea]} 
                multiline 
                placeholder="Escreva a solução aqui..." 
                placeholderTextColor={theme.textLight}
                value={responseText}
                onChangeText={setResponseText}
                autoFocus
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.btnGhost} onPress={() => setModalVisible(false)}>
                  <Text style={styles.btnGhostText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnPrimary, styles.btnModalSend]} onPress={sendResponse}>
                  <Text style={styles.btnPrimaryText}>Enviar Resposta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  container: { flex: 1 },
  contentScroll: { paddingHorizontal: 20, paddingTop: 20 },
  contentFlex: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  loginContainer: { flex: 1, backgroundColor: theme.background, justifyContent: 'center', padding: 30, alignItems: 'center' },
  loginCard: { backgroundColor: theme.cardBg, width: '100%', maxWidth: 400, padding: 30, borderRadius: 24, shadowColor: theme.textDark, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  loginTitle: { fontSize: 28, fontWeight: '800', color: theme.textDark, textAlign: 'center' },
  loginSubtitle: { fontSize: 16, color: theme.secondary, textAlign: 'center', marginBottom: 30, marginTop: 5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20, backgroundColor: theme.cardBg, borderBottomWidth: 1, borderBottomColor: theme.borderColor },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.textDark },
  headerSubtitle: { fontSize: 14, color: theme.secondary, marginTop: 2 },
  statusContainer: { alignItems: 'flex-end' },
  statusText: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  navContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  navBackground: { flexDirection: 'row', backgroundColor: theme.borderColor + '60', borderRadius: 12, padding: 4 },
  navBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeNavBtn: { backgroundColor: theme.cardBg, shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  navText: { fontWeight: '600', color: theme.secondary, fontSize: 15 },
  activeNavText: { color: theme.primary, fontWeight: '700' },
  card: { backgroundColor: theme.cardBg, padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: theme.borderColor, shadowColor: theme.textDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardSectionTitle: { fontSize: 18, fontWeight: '700', color: theme.textDark, marginBottom: 15 },
  inputGroup: { marginBottom: 15 },
  label: { marginBottom: 8, fontWeight: '600', color: theme.textDark, fontSize: 14 },
  input: { backgroundColor: theme.background, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.borderColor, fontSize: 16, color: theme.textDark },
  textArea: { height: 100, textAlignVertical: 'top' },
  separator: { height: 1, backgroundColor: theme.borderColor, marginVertical: 12 },
  btnPrimary: { backgroundColor: theme.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center', shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnGhost: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center' },
  btnGhostText: { color: theme.secondary, fontWeight: '600', fontSize: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.cardBg, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, borderColor: theme.borderColor, marginBottom: 10, height: 50 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: theme.textDark, height: '100%' },
  leadsHeader: { marginBottom: 15 },
  leadsCount: { color: theme.secondary, fontWeight: '600' },
  leadCard: { backgroundColor: theme.cardBg, padding: 20, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: theme.borderColor, shadowColor: theme.textDark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  leadCardPending: { borderLeftWidth: 6, borderLeftColor: theme.warning },
  leadCardResolved: { borderLeftWidth: 6, borderLeftColor: theme.success, opacity: 0.9 },
  leadHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  
  leadInfoContainer: { flex: 1, marginRight: 10 },

  leadName: { fontWeight: '800', fontSize: 18, color: theme.textDark },
  leadDate: { fontSize: 12, color: theme.textLight, marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', flexShrink: 0 },
  statusBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  leadInfoRow: { flexDirection: 'row', marginBottom: 6 },
  infoLabel: { color: theme.secondary, fontWeight: '600', width: 60 },
  infoValue: { color: theme.textDark, flex: 1 },
  reasonContainer: { backgroundColor: theme.background, padding: 12, borderRadius: 10, marginTop: 10 },
  reasonTitle: { fontSize: 12, fontWeight: '700', color: theme.secondary, marginBottom: 4 },
  reasonText: { color: theme.textDark, fontStyle: 'italic', fontSize: 15 },
  btnResolve: { backgroundColor: theme.primary, padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  btnResolveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  responseContainer: { marginTop: 15, padding: 12, backgroundColor: theme.success + '15', borderRadius: 10, borderWidth: 1, borderColor: theme.success + '30' },
  responseTitle: { fontSize: 12, fontWeight: '700', color: theme.success, marginBottom: 4 },
  responseText: { color: theme.textDark, fontSize: 15 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyStateText: { color: theme.textLight, fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: theme.cardBg, padding: 25, borderRadius: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 25, elevation: 10 },
  modalHeader: { marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: theme.textDark },
  modalSubtitle: { fontSize: 16, color: theme.secondary, marginTop: 4 },
  modalTextArea: { backgroundColor: theme.background, height: 150, fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  btnModalSend: { marginLeft: 10, paddingHorizontal: 30 },
});