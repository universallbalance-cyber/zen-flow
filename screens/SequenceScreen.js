import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
  TextInput, Alert, Modal, FlatList, Share,
} from "react-native";
import { poses, categories } from "../data/poses";
import { PoseThumbnail } from "../components/PoseImage";

const BG = "#1a2535";
const CARD = "#223044";
const TEAL = "#2dd4c0";
const TEXT = "#d0dcea";
const MUTED = "#a0b0c8";

export default function SequenceScreen() {
  const [sequenceName, setSequenceName] = useState("My Sequence");
  const [sequence, setSequence] = useState([]);
  const [savedSequences, setSavedSequences] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [viewingSaved, setViewingSaved] = useState(null);

  const filteredPoses = filterCategory === "All" ? poses : poses.filter((p) => p.category === filterCategory);

  const addPose = (pose) => {
    setSequence((prev) => [...prev, { ...pose, uid: Date.now() + Math.random() }]);
    setModalVisible(false);
  };
  const removePose = (uid) => setSequence((prev) => prev.filter((p) => p.uid !== uid));
  const movePose = (index, direction) => {
    const newSeq = [...sequence];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newSeq.length) return;
    [newSeq[index], newSeq[swapIndex]] = [newSeq[swapIndex], newSeq[index]];
    setSequence(newSeq);
  };

  const saveSequence = () => {
    if (sequence.length === 0) { Alert.alert("Empty Sequence", "Add at least one pose before saving."); return; }
    const newSeq = {
      id: Date.now(),
      name: sequenceName || "Untitled Sequence",
      poses: sequence,
      createdAt: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    };
    setSavedSequences((prev) => [newSeq, ...prev]);
    Alert.alert("Saved!", `"${newSeq.name}" has been saved.`);
  };

  const clearSequence = () => Alert.alert("Clear Sequence", "Remove all poses?", [
    { text: "Cancel", style: "cancel" },
    { text: "Clear", style: "destructive", onPress: () => setSequence([]) },
  ]);

  const deleteSaved = (id) => Alert.alert("Delete Sequence", "Are you sure?", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: () => setSavedSequences((prev) => prev.filter((s) => s.id !== id)) },
  ]);

  const loadSequence = (saved) => Alert.alert("Load Sequence", `Load "${saved.name}"?`, [
    { text: "Cancel", style: "cancel" },
    { text: "Load", onPress: () => { setSequence(saved.poses.map((p) => ({ ...p, uid: Date.now() + Math.random() }))); setSequenceName(saved.name); setViewingSaved(null); } },
  ]);

  const buildShareText = (posesArr, name, createdAt) => {
    const lines = [
      `🧘 Zen Flow — ${name}`,
      `${"─".repeat(28)}`,
      ...posesArr.map((p, i) => `${i + 1}. ${p.name} (${p.sanskrit})\n   ${p.category} · ${p.duration}`),
      `${"─".repeat(28)}`,
      `${posesArr.length} poses · ${createdAt}`,
      `\nShared from Zen Flow 🪷`,
    ];
    return lines.join("\n");
  };

  const shareSequence = async (posesArr, name, createdAt) => {
    if (posesArr.length === 0) {
      Alert.alert("Nothing to share", "Add some poses to your sequence first.");
      return;
    }
    try {
      const message = buildShareText(posesArr, name, createdAt);
      await Share.share({ message, title: `Zen Flow — ${name}` });
    } catch (e) {
      Alert.alert("Share failed", "Unable to share at this time.");
    }
  };

  const shareCurrentSequence = () => {
    const createdAt = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    shareSequence(sequence, sequenceName || "My Sequence", createdAt);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Sequences</Text>
          <Text style={styles.subtitle}>Build your flow</Text>
        </View>

        <View style={styles.nameRow}>
          <TextInput
            style={styles.nameInput}
            value={sequenceName}
            onChangeText={setSequenceName}
            placeholder="Sequence name..."
            placeholderTextColor={MUTED}
            selectionColor={TEAL}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Current sequence ({sequence.length} pose{sequence.length !== 1 ? "s" : ""})
        </Text>

        {sequence.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🧘</Text>
            <Text style={styles.emptyText}>No poses yet. Tap below to add some!</Text>
          </View>
        )}

        {sequence.map((pose, index) => (
          <View key={pose.uid} style={styles.seqItem}>
            <PoseThumbnail poseId={pose.id} size={48} />
            <View style={styles.seqInfo}>
              <Text style={styles.seqName}>{pose.name}</Text>
              <Text style={styles.seqMeta}>{pose.category} · {pose.duration}</Text>
            </View>
            <View style={styles.seqActions}>
              <TouchableOpacity onPress={() => movePose(index, -1)} style={styles.arrowBtn}><Text style={styles.arrowText}>▲</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => movePose(index, 1)} style={styles.arrowBtn}><Text style={styles.arrowText}>▼</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => removePose(pose.uid)} style={styles.removeBtn}><Text style={styles.removeText}>✕</Text></TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.outlineBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Text style={styles.outlineBtnText}>+ Add Pose</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btn} onPress={saveSequence} activeOpacity={0.8}>
            <Text style={styles.btnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={shareCurrentSequence} activeOpacity={0.8}>
            <Text style={styles.shareBtnText}>⬆ Share</Text>
          </TouchableOpacity>
        </View>

        {sequence.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearSequence} activeOpacity={0.8}>
            <Text style={styles.clearBtnText}>Clear Sequence</Text>
          </TouchableOpacity>
        )}

        {savedSequences.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Saved sequences</Text>
            {savedSequences.map((saved) => (
              <View key={saved.id} style={styles.savedCard}>
                <TouchableOpacity
                  style={styles.savedHeader}
                  onPress={() => setViewingSaved(viewingSaved === saved.id ? null : saved.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.savedName}>{saved.name}</Text>
                    <Text style={styles.savedMeta}>{saved.poses.length} poses · {saved.createdAt}</Text>
                  </View>
                  <Text style={styles.chevron}>{viewingSaved === saved.id ? "▲" : "▼"}</Text>
                </TouchableOpacity>

                {viewingSaved === saved.id && (
                  <View style={styles.savedBody}>
                    {saved.poses.map((p, i) => (
                      <Text key={i} style={styles.savedPoseItem}>{i + 1}. {p.name}</Text>
                    ))}
                    <View style={styles.savedBtnRow}>
                      <TouchableOpacity style={styles.loadBtn} onPress={() => loadSequence(saved)}>
                        <Text style={styles.loadBtnText}>Load</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.savedShareBtn}
                        onPress={() => shareSequence(saved.poses, saved.name, saved.createdAt)}
                      >
                        <Text style={styles.savedShareText}>⬆ Share</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteSaved(saved.id)}>
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose a Pose</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {["All", ...categories].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, filterCategory === cat && styles.filterChipActive]}
                  onPress={() => setFilterCategory(cat)}
                >
                  <Text style={[styles.filterChipText, filterCategory === cat && styles.filterChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <FlatList
              data={filteredPoses}
              keyExtractor={(item) => item.id.toString()}
              style={styles.poseList}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.poseListItem} onPress={() => addPose(item)} activeOpacity={0.75}>
                  <PoseThumbnail poseId={item.id} size={52} />
                  <View style={styles.poseListInfo}>
                    <Text style={styles.poseListName}>{item.name}</Text>
                    <Text style={styles.poseListMeta}>{item.category} · {item.level} · {item.duration}</Text>
                  </View>
                  <Text style={styles.addIcon}>+</Text>
                </TouchableOpacity>
              )}
            />
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
  nameRow: { marginHorizontal: 16, marginTop: 12, marginBottom: 4 },
  nameInput: { backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: TEXT, fontSize: 15, fontWeight: "500", borderWidth: 1, borderColor: "#2dd4c030" },
  sectionTitle: { color: TEAL, fontSize: 15, fontWeight: "500", paddingHorizontal: 16, marginTop: 16, marginBottom: 10 },
  emptyBox: { alignItems: "center", padding: 28, backgroundColor: CARD, marginHorizontal: 16, borderRadius: 14, marginBottom: 8 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: MUTED, fontSize: 13, textAlign: "center" },
  seqItem: { flexDirection: "row", alignItems: "center", backgroundColor: CARD, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 10, gap: 10 },
  seqInfo: { flex: 1 },
  seqName: { color: TEXT, fontSize: 14, fontWeight: "500" },
  seqMeta: { color: MUTED, fontSize: 11, marginTop: 2 },
  seqActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  arrowBtn: { padding: 4 },
  arrowText: { color: MUTED, fontSize: 12 },
  removeBtn: { padding: 4, marginLeft: 2 },
  removeText: { color: "#e05060", fontSize: 14 },
  outlineBtn: { marginHorizontal: 16, marginTop: 8, borderRadius: 50, borderWidth: 1.5, borderColor: TEAL, paddingVertical: 13, alignItems: "center" },
  outlineBtnText: { color: TEAL, fontSize: 15, fontWeight: "500" },
  actionRow: { flexDirection: "row", marginHorizontal: 16, marginTop: 10, gap: 10 },
  btn: { flex: 1, backgroundColor: TEAL, borderRadius: 50, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#0e1f2e", fontSize: 15, fontWeight: "600" },
  shareBtn: { flex: 1, borderRadius: 50, borderWidth: 1.5, borderColor: TEAL, paddingVertical: 14, alignItems: "center" },
  shareBtnText: { color: TEAL, fontSize: 15, fontWeight: "500" },
  clearBtn: { marginHorizontal: 16, marginTop: 8, borderRadius: 50, borderWidth: 1, borderColor: "#e0506040", paddingVertical: 12, alignItems: "center" },
  clearBtnText: { color: "#e05060", fontSize: 14 },
  savedCard: { backgroundColor: CARD, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, overflow: "hidden" },
  savedHeader: { flexDirection: "row", alignItems: "center", padding: 14 },
  savedName: { color: TEAL, fontSize: 15, fontWeight: "500" },
  savedMeta: { color: MUTED, fontSize: 12, marginTop: 2 },
  chevron: { color: MUTED, fontSize: 12, marginLeft: 8 },
  savedBody: { borderTopWidth: 1, borderTopColor: "#1a3050", padding: 14 },
  savedPoseItem: { color: TEXT, fontSize: 13, marginBottom: 4 },
  savedBtnRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  loadBtn: { flex: 1, backgroundColor: TEAL, borderRadius: 50, paddingVertical: 10, alignItems: "center" },
  loadBtnText: { color: "#0e1f2e", fontSize: 13, fontWeight: "600" },
  savedShareBtn: { flex: 1, borderRadius: 50, borderWidth: 1.5, borderColor: TEAL, paddingVertical: 10, alignItems: "center" },
  savedShareText: { color: TEAL, fontSize: 13, fontWeight: "500" },
  deleteBtn: { borderWidth: 1, borderColor: "#e0506060", borderRadius: 50, paddingVertical: 10, paddingHorizontal: 16, alignItems: "center" },
  deleteBtnText: { color: "#e05060", fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: "#00000090", justifyContent: "flex-end" },
  modalBox: { backgroundColor: BG, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "80%", paddingBottom: 24 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: "#243347" },
  modalTitle: { color: TEAL, fontSize: 18, fontWeight: "600" },
  modalClose: { color: MUTED, fontSize: 18 },
  filterScroll: { paddingHorizontal: 16, paddingVertical: 12, maxHeight: 56 },
  filterChip: { backgroundColor: CARD, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, height: 32 },
  filterChipActive: { backgroundColor: TEAL },
  filterChipText: { color: MUTED, fontSize: 13 },
  filterChipTextActive: { color: "#0e1f2e", fontWeight: "600" },
  poseList: { paddingHorizontal: 16 },
  poseListItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#243347", gap: 12 },
  poseListInfo: { flex: 1 },
  poseListName: { color: TEXT, fontSize: 14, fontWeight: "500" },
  poseListMeta: { color: MUTED, fontSize: 11, marginTop: 2 },
  addIcon: { color: TEAL, fontSize: 22, fontWeight: "300" },
});