import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from "react-native";
import { getDailyAffirmation, getDailyPose } from "../data/poses";
import { PoseImage } from "../components/PoseImage";

const BG = "#1a2535";
const CARD = "#223044";
const TEAL = "#2dd4c0";
const TEXT = "#d0dcea";
const MUTED = "#a0b0c8";

export default function HomeScreen() {
  const [completed, setCompleted] = useState(false);
  const affirmation = getDailyAffirmation();
  const pose = getDailyPose();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Zen Flow</Text>
          <Text style={styles.subtitle}>Your daily dose of calm</Text>
        </View>

        <View style={styles.heroBox}>
          <Text style={styles.heroEmoji}>🪷</Text>
          <Text style={styles.heroTagline}>Breathe. Move. Be.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Affirmation</Text>
          <Text style={styles.affirmationText}>"{affirmation}"</Text>
          <TouchableOpacity
            style={[styles.btn, completed && styles.btnDone]}
            onPress={() => setCompleted(true)}
            disabled={completed}
          >
            <Text style={[styles.btnText, completed && styles.btnTextDone]}>
              {completed ? "Affirmation Complete ✓" : "Mark as Complete for Today"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Pose of the Day</Text>
        <View style={styles.card}>
          <PoseImage poseId={pose.id} size={220} />

          <View style={styles.poseHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.poseName}>{pose.name}</Text>
              <Text style={styles.poseSanskrit}>{pose.sanskrit}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{pose.level}</Text>
            </View>
          </View>

          <Text style={styles.poseDescription}>{pose.description}</Text>
          <View style={styles.tagRow}>
            <View style={styles.tag}><Text style={styles.tagText}>{pose.category}</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>{pose.duration}</Text></View>
          </View>

          <Text style={styles.subHeading}>Benefits</Text>
          <Text style={styles.bodyText}>{pose.benefits}</Text>

          <Text style={styles.subHeading}>Instructions</Text>
          {pose.instructions.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepNum}>{i + 1}.</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
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
  heroBox: { backgroundColor: CARD, margin: 16, borderRadius: 16, alignItems: "center", paddingVertical: 32 },
  heroEmoji: { fontSize: 72 },
  heroTagline: { color: MUTED, fontSize: 14, fontStyle: "italic", marginTop: 10, letterSpacing: 1 },
  card: { backgroundColor: CARD, marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: "500", color: TEAL, textAlign: "center", marginBottom: 10 },
  affirmationText: { fontSize: 15, color: TEXT, fontStyle: "italic", textAlign: "center", lineHeight: 24, marginBottom: 16 },
  btn: { backgroundColor: TEAL, borderRadius: 50, paddingVertical: 14, alignItems: "center" },
  btnDone: { backgroundColor: "#1e5040" },
  btnText: { color: "#0e1f2e", fontSize: 15, fontWeight: "600" },
  btnTextDone: { color: TEAL },
  sectionTitle: { color: TEAL, fontSize: 15, fontWeight: "500", paddingHorizontal: 16, marginBottom: 8 },
  poseHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, marginTop: 14 },
  poseName: { fontSize: 18, fontWeight: "600", color: TEAL },
  poseSanskrit: { fontSize: 12, color: MUTED, fontStyle: "italic", marginTop: 2 },
  levelBadge: { backgroundColor: "#1a3050", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8, marginTop: 2 },
  levelText: { color: TEAL, fontSize: 11 },
  poseDescription: { fontSize: 13, color: TEXT, lineHeight: 20, marginBottom: 12 },
  tagRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  tag: { backgroundColor: "#1a3050", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  tagText: { color: TEAL, fontSize: 11 },
  subHeading: { fontSize: 13, fontWeight: "600", color: TEAL, marginBottom: 6, marginTop: 4 },
  bodyText: { fontSize: 13, color: TEXT, lineHeight: 20, marginBottom: 12 },
  stepRow: { flexDirection: "row", marginBottom: 6 },
  stepNum: { color: TEAL, fontSize: 13, fontWeight: "600", marginRight: 6, minWidth: 18 },
  stepText: { fontSize: 13, color: TEXT, lineHeight: 20, flex: 1 },
});