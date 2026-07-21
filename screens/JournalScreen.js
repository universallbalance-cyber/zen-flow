import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const JOURNAL_STORAGE_KEY = "zenflow.journal.entries";

const BG = "#1a2535";
const CARD = "#223044";
const TEAL = "#2dd4c0";
const TEXT = "#d0dcea";
const MUTED = "#a0b0c8";

const prompts = [
  "How did today's practice feel in your body?",
  "What are you grateful for today?",
  "What intention do you want to set for your practice?",
  "Where did you notice tension today, and how did you release it?",
  "What pose challenged you today, and what did it teach you?",
  "How is your breath different after practice than before?",
  "What emotion came up during your practice today?",
  "What does your body need most right now?",
  "Describe a moment of stillness you experienced today.",
  "What are you letting go of with today's practice?",
  "How did you show up for yourself today?",
  "What would you like to explore in your next practice?",
];

export default function JournalScreen() {
  const [entries, setEntries] = useState([]);
  const [entriesLoaded, setEntriesLoaded] = useState(false);

  const [mode, setMode] = useState("free"); // "free" or "prompted"
  const [entryText, setEntryText] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [promptModalVisible, setPromptModalVisible] = useState(false);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    AsyncStorage.getItem(JOURNAL_STORAGE_KEY).then((stored) => {
      if (stored) setEntries(JSON.parse(stored));
      setEntriesLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!entriesLoaded) return;
    AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
  }, [entries, entriesLoaded]);

  const getRandomPrompt = () => {
    const unused = prompts.filter(
      (p) => !entries.some((e) => e.prompt === p)
    );
    const pool = unused.length > 0 ? unused : prompts;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    if (newMode === "prompted" && !selectedPrompt) {
      setSelectedPrompt(getRandomPrompt());
    }
  };

  const saveEntry = () => {
    if (!entryText.trim()) {
      Alert.alert("Empty Entry", "Please write something before saving.");
      return;
    }
    const today = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const newEntry = {
      id: Date.now(),
      date: today,
      prompt: mode === "prompted" ? selectedPrompt : null,
      text: entryText.trim(),
    };
    setEntries((prev) => [newEntry, ...prev]);
    setEntryText("");
    if (mode === "prompted") {
      setSelectedPrompt(getRandomPrompt());
    }
    Alert.alert("Saved", "Your journal entry has been saved.");
  };

  const deleteEntry = (id) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setEntries((prev) => prev.filter((e) => e.id !== id));
          setViewingEntry(null);
        },
      },
    ]);
  };

  const startEdit = (entry) => {
    setEditingEntry(entry.id);
    setEditText(entry.text);
    setViewingEntry(null);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    setEntries((prev) =>
      prev.map((e) =>
        e.id === editingEntry ? { ...e, text: editText.trim() } : e
      )
    );
    setEditingEntry(null);
    setEditText("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Journal</Text>
          <Text style={styles.subtitle}>Reflect on your practice</Text>
        </View>

        {/* Mode Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === "free" && styles.toggleBtnActive]}
            onPress={() => handleModeSwitch("free")}
          >
            <Text style={[styles.toggleText, mode === "free" && styles.toggleTextActive]}>
              Free Write
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === "prompted" && styles.toggleBtnActive]}
            onPress={() => handleModeSwitch("prompted")}
          >
            <Text style={[styles.toggleText, mode === "prompted" && styles.toggleTextActive]}>
              Prompted
            </Text>
          </TouchableOpacity>
        </View>

        {/* Entry Composer */}
        <View style={styles.card}>
          {mode === "prompted" && selectedPrompt && (
            <View style={styles.promptBox}>
              <Text style={styles.promptLabel}>Today's prompt</Text>
              <Text style={styles.promptText}>"{selectedPrompt}"</Text>
              <TouchableOpacity
                style={styles.changePromptBtn}
                onPress={() => setPromptModalVisible(true)}
              >
                <Text style={styles.changePromptText}>Change prompt</Text>
              </TouchableOpacity>
            </View>
          )}

          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={6}
            placeholder={
              mode === "free"
                ? "How are you feeling? What came up in your practice today?"
                : "Write your response here..."
            }
            placeholderTextColor={MUTED}
            value={entryText}
            onChangeText={setEntryText}
            selectionColor={TEAL}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={saveEntry}>
            <Text style={styles.saveBtnText}>Save Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Past Entries */}
        <Text style={styles.sectionTitle}>
          Past entries ({entries.length})
        </Text>

        {entries.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📓</Text>
            <Text style={styles.emptyText}>
              No entries yet. Start writing above!
            </Text>
          </View>
        )}

        {entries.map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            {editingEntry === entry.id ? (
              // Edit mode
              <View>
                <Text style={styles.entryDate}>{entry.date}</Text>
                <TextInput
                  style={styles.editInput}
                  multiline
                  value={editText}
                  onChangeText={setEditText}
                  selectionColor={TEAL}
                  textAlignVertical="top"
                  autoFocus
                />
                <View style={styles.editBtnRow}>
                  <TouchableOpacity style={styles.saveEditBtn} onPress={saveEdit}>
                    <Text style={styles.saveEditText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelEditBtn}
                    onPress={() => setEditingEntry(null)}
                  >
                    <Text style={styles.cancelEditText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // View mode
              <TouchableOpacity
                onPress={() =>
                  setViewingEntry(viewingEntry === entry.id ? null : entry.id)
                }
                activeOpacity={0.85}
              >
                <View style={styles.entryHeader}>
                  <Text style={styles.entryDate}>{entry.date}</Text>
                  <Text style={styles.entryChevron}>
                    {viewingEntry === entry.id ? "▲" : "▼"}
                  </Text>
                </View>
                {entry.prompt && (
                  <Text style={styles.entryPrompt}>📝 {entry.prompt}</Text>
                )}
                <Text
                  style={styles.entryPreview}
                  numberOfLines={viewingEntry === entry.id ? undefined : 2}
                >
                  {entry.text}
                </Text>

                {viewingEntry === entry.id && (
                  <View style={styles.entryActions}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => startEdit(entry)}
                    >
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteEntryBtn}
                      onPress={() => deleteEntry(entry.id)}
                    >
                      <Text style={styles.deleteEntryText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Prompt Picker Modal */}
      <Modal
        visible={promptModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPromptModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose a Prompt</Text>
              <TouchableOpacity onPress={() => setPromptModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.promptList}>
              {prompts.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.promptListItem,
                    selectedPrompt === p && styles.promptListItemActive,
                  ]}
                  onPress={() => {
                    setSelectedPrompt(p);
                    setPromptModalVisible(false);
                  }}
                >
                  <Text style={styles.promptListText}>"{p}"</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1, backgroundColor: BG },
  header: { alignItems: "center", paddingTop: 24, paddingBottom: 8 },
  title: { fontSize: 30, fontWeight: "600", color: TEAL, letterSpacing: 1 },
  subtitle: { fontSize: 13, color: MUTED, fontStyle: "italic", marginTop: 4 },
  toggleRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  toggleBtnActive: { backgroundColor: TEAL },
  toggleText: { color: MUTED, fontSize: 14, fontWeight: "500" },
  toggleTextActive: { color: "#0e1f2e", fontWeight: "600" },
  card: {
    backgroundColor: CARD,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 16,
  },
  promptBox: {
    backgroundColor: "#1a3050",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  promptLabel: {
    color: MUTED,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  promptText: {
    color: TEXT,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
  changePromptBtn: { marginTop: 10, alignSelf: "flex-end" },
  changePromptText: { color: TEAL, fontSize: 12 },
  textInput: {
    backgroundColor: "#1a2535",
    borderRadius: 12,
    padding: 12,
    color: TEXT,
    fontSize: 14,
    lineHeight: 22,
    minHeight: 130,
    borderWidth: 1,
    borderColor: "#2dd4c020",
  },
  saveBtn: {
    backgroundColor: TEAL,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  saveBtnText: { color: "#0e1f2e", fontSize: 15, fontWeight: "600" },
  sectionTitle: {
    color: TEAL,
    fontSize: 15,
    fontWeight: "500",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyBox: {
    alignItems: "center",
    padding: 28,
    backgroundColor: CARD,
    marginHorizontal: 16,
    borderRadius: 14,
  },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: MUTED, fontSize: 13, textAlign: "center" },
  entryCard: {
    backgroundColor: CARD,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  entryDate: { color: MUTED, fontSize: 12, marginBottom: 4 },
  entryChevron: { color: MUTED, fontSize: 11 },
  entryPrompt: {
    color: TEAL,
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 6,
  },
  entryPreview: { color: TEXT, fontSize: 13, lineHeight: 20 },
  entryActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  editBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: TEAL,
    borderRadius: 50,
    paddingVertical: 9,
    alignItems: "center",
  },
  editBtnText: { color: TEAL, fontSize: 13, fontWeight: "500" },
  deleteEntryBtn: {
    borderWidth: 1,
    borderColor: "#e0506060",
    borderRadius: 50,
    paddingVertical: 9,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  deleteEntryText: { color: "#e05060", fontSize: 13 },
  editInput: {
    backgroundColor: "#1a2535",
    borderRadius: 12,
    padding: 12,
    color: TEXT,
    fontSize: 14,
    lineHeight: 22,
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#2dd4c040",
    marginTop: 8,
  },
  editBtnRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  saveEditBtn: {
    flex: 1,
    backgroundColor: TEAL,
    borderRadius: 50,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveEditText: { color: "#0e1f2e", fontSize: 13, fontWeight: "600" },
  cancelEditBtn: {
    borderWidth: 1,
    borderColor: MUTED,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  cancelEditText: { color: MUTED, fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000090",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#243347",
  },
  modalTitle: { color: TEAL, fontSize: 18, fontWeight: "600" },
  modalClose: { color: MUTED, fontSize: 18 },
  promptList: { paddingHorizontal: 16, paddingTop: 8 },
  promptListItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#243347",
  },
  promptListItemActive: { backgroundColor: "#1a3050", borderRadius: 8, paddingHorizontal: 8 },
  promptListText: { color: TEXT, fontSize: 13, lineHeight: 20, fontStyle: "italic" },
});