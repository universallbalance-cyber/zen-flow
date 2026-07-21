import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { getRandomPose, categories } from "../data/poses";
import { PoseImage } from "../components/PoseImage";

const BG = "#1a2535";
const CARD = "#223044";
const TEAL = "#2dd4c0";
const TEXT = "#d0dcea";
const MUTED = "#a0b0c8";

const categoryIcons = {
  Standing: "🧍", Balance: "🦩", Inversion: "🙃",
  Seated: "🧘", Restorative: "😌", Any: "✨",
};

export default function YogaDiceScreen() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);

  const roll = async (category) => {
    // Haptic burst to simulate dice roll
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 150);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 300);

    setRolling(true);
    setSelectedCategory(category);
    setResult(null);
    setTimeout(() => {
      setResult(getRandomPose(category));
      setRolling(false);
      // Final haptic on result reveal
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Yoga Dice</Text>
          <Text style={styles.subtitle}>Roll for your next pose</Text>
        </View>

        <Text style={styles.sectionTitle}>Roll by category</Text>
        <View style={styles.grid}>
          {[...categories, "Any"].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.diceCard, selectedCategory === cat && styles.diceCardActive]}
              onPress={() => roll(cat)}
              activeOpacity={0.75}
            >
              <Text style={styles.diceIcon}>{categoryIcons[cat]}</Text>
              <Text style={styles.diceName}>{cat === "Any" ? "Surprise Me" : cat}</Text>
              <Text style={styles.diceHint}>
                {cat === "Standing" && "Strength & power"}
                {cat === "Balance" && "Focus & stability"}
                {cat === "Inversion" && "Energize & focus"}
                {cat === "Seated" && "Grounding & calm"}
                {cat === "Restorative" && "Relax & restore"}
                {cat === "Any" && "Any category"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {rolling && (
          <View style={styles.rollingBox}>
            <Text style={styles.rollingText}>🎲 Rolling...</Text>
          </View>
        )}

        {result && !rolling && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Your pose</Text>
            <PoseImage poseId={result.id} size={220} />
            <Text style={styles.resultName}>{result.name}</Text>
            <Text style={styles.resultSanskrit}>{result.sanskrit}</Text>
            <View style={styles.tagRow}>
              <View style={styles.tag}><Text style={styles.tagText}>{result.category}</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>{result.level}</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>{result.duration}</Text></View>
            </View>
            <Text style={styles.resultDesc}>{result.description}</Text>
            <Text style={styles.subHeading}>Benefits</Text>
            <Text style={styles.bodyText}>{result.benefits}</Text>
            <Text style={styles.subHeading}>Instructions</Text>
            {result.instructions.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <Text style={styles.stepNum}>{i + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.rerollBtn} onPress={() => roll(selectedCategory)} activeOpacity={0.8}>
              <Text style={styles.rerollText}>🎲 Roll Again</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1, backgroundColor: BG },
  header: { alignItems: "center", paddingTop: 24, paddingBottom: 8 },
  title: { fontSize: 30, fontWeight: "600", color: TEAL, letterSpacing: 1 },
  subtitle: { fontSize: 13, color: MUTED, fontStyle: "italic", marginTop: 4 },
  sectionTitle: { color: TEAL, fontSize: 15, fontWeight: "500", paddingHorizontal: 16, marginTop: 12, marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 10 },
  diceCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, width: "47%", alignItems: "center" },
  diceCardActive: { borderWidth: 1.5, borderColor: TEAL },
  diceIcon: { fontSize: 28, marginBottom: 6 },
  diceName: { color: TEAL, fontSize: 13, fontWeight: "500", textAlign: "center" },
  diceHint: { color: MUTED, fontSize: 11, marginTop: 3, textAlign: "center" },
  rollingBox: { alignItems: "center", paddingVertical: 24 },
  rollingText: { color: TEAL, fontSize: 18, fontWeight: "500" },
  resultCard: { backgroundColor: CARD, marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16 },
  resultLabel: { color: MUTED, fontSize: 12, textAlign: "center", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 },
  resultName: { color: TEAL, fontSize: 22, fontWeight: "600", textAlign: "center", marginTop: 14 },
  resultSanskrit: { color: MUTED, fontSize: 13, fontStyle: "italic", textAlign: "center", marginTop: 2, marginBottom: 12 },
  tagRow: { flexDirection: "row", gap: 8, marginBottom: 14, flexWrap: "wrap" },
  tag: { backgroundColor: "#1a3050", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  tagText: { color: TEAL, fontSize: 11 },
  resultDesc: { fontSize: 13, color: TEXT, lineHeight: 20, marginBottom: 12 },
  subHeading: { fontSize: 13, fontWeight: "600", color: TEAL, marginBottom: 6, marginTop: 4 },
  bodyText: { fontSize: 13, color: TEXT, lineHeight: 20, marginBottom: 12 },
  stepRow: { flexDirection: "row", marginBottom: 6 },
  stepNum: { color: TEAL, fontSize: 13, fontWeight: "600", marginRight: 6, minWidth: 18 },
  stepText: { fontSize: 13, color: TEXT, lineHeight: 20, flex: 1 },
  rerollBtn: { backgroundColor: TEAL, borderRadius: 50, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  rerollText: { color: "#0e1f2e", fontSize: 15, fontWeight: "600" },
});