import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";

const BG = "#1a2535";
const CARD = "#223044";
const TEAL = "#2dd4c0";
const TEXT = "#d0dcea";
const MUTED = "#a0b0c8";

const DURATIONS = [5, 10, 15, 20, 30];

const breathingExercises = [
  {
    name: "Box Breathing",
    pattern: "4-4-4-4",
    description:
      "Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Used by Navy SEALs to reduce stress and sharpen focus.",
    steps: ["Inhale", "Hold", "Exhale", "Hold"],
    counts: [4, 4, 4, 4],
  },
  {
    name: "4-7-8 Breath",
    pattern: "4-7-8",
    description:
      "Inhale for 4, hold for 7, exhale for 8. A natural tranquilizer for the nervous system.",
    steps: ["Inhale", "Hold", "Exhale"],
    counts: [4, 7, 8],
  },
  {
    name: "Alternate Nostril",
    pattern: "Nadi Shodhana",
    description:
      "Close right nostril, inhale left. Close left, exhale right. Inhale right, close, exhale left. Balances the mind.",
    steps: ["Inhale left", "Switch", "Exhale right", "Inhale right", "Switch", "Exhale left"],
    counts: [4, 1, 4, 4, 1, 4],
  },
  {
    name: "Ujjayi Breath",
    pattern: "Ocean Breath",
    description:
      "Breathe in and out through the nose with a slight constriction at the back of the throat, creating an ocean sound.",
    steps: ["Inhale (ocean sound)", "Exhale (ocean sound)"],
    counts: [5, 5],
  },
];

export default function MeditateScreen() {
  const [duration, setDuration] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [activeBreath, setActiveBreath] = useState(null);
  const [breathStep, setBreathStep] = useState(0);
  const [breathCount, setBreathCount] = useState(0);

  const intervalRef = useRef(null);
  const breathIntervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const totalSeconds = duration * 60;
  const progress = 1 - secondsLeft / totalSeconds;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(breathIntervalRef.current);
    };
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startTimer = () => {
    setRunning(true);
    setFinished(false);
    startPulse();
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setFinished(true);
          stopPulse();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    stopPulse();
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setFinished(false);
    setSecondsLeft(duration * 60);
    stopPulse();
  };

  const selectDuration = (mins) => {
    if (running) return;
    setDuration(mins);
    setSecondsLeft(mins * 60);
    setFinished(false);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const startBreathing = (exercise) => {
    if (activeBreath?.name === exercise.name) {
      clearInterval(breathIntervalRef.current);
      setActiveBreath(null);
      setBreathStep(0);
      setBreathCount(0);
      return;
    }
    clearInterval(breathIntervalRef.current);
    setActiveBreath(exercise);
    setBreathStep(0);
    setBreathCount(exercise.counts[0]);

    let stepIndex = 0;
    let count = exercise.counts[0];

    breathIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        stepIndex = (stepIndex + 1) % exercise.steps.length;
        count = exercise.counts[stepIndex];
        setBreathStep(stepIndex);
      }
      setBreathCount(count);
    }, 1000);
  };

  const dashOffset = circumference * (1 - progress);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Meditate</Text>
          <Text style={styles.subtitle}>Find your stillness</Text>
        </View>

        {/* Duration Selector */}
        <View style={styles.durationRow}>
          {DURATIONS.map((mins) => (
            <TouchableOpacity
              key={mins}
              style={[
                styles.durationChip,
                duration === mins && styles.durationChipActive,
              ]}
              onPress={() => selectDuration(mins)}
              disabled={running}
            >
              <Text
                style={[
                  styles.durationText,
                  duration === mins && styles.durationTextActive,
                ]}
              >
                {mins}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Timer Circle */}
        <View style={styles.timerSection}>
          <Animated.View
            style={[styles.timerOuter, { transform: [{ scale: pulseAnim }] }]}
          >
            <View style={styles.timerInner}>
              {/* SVG-style ring using border */}
              <View style={styles.ringContainer}>
                <Text style={styles.timerText}>
                  {finished ? "🙏" : formatTime(secondsLeft)}
                </Text>
                {finished && (
                  <Text style={styles.finishedLabel}>Complete</Text>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Progress indicator as text arc substitute */}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(progress * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {Math.round(progress * 100)}% complete
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controlRow}>
          {!running && !finished && (
            <TouchableOpacity style={styles.btn} onPress={startTimer}>
              <Text style={styles.btnText}>
                {secondsLeft === duration * 60 ? "Begin" : "Resume"}
              </Text>
            </TouchableOpacity>
          )}
          {running && (
            <TouchableOpacity style={styles.btn} onPress={pauseTimer}>
              <Text style={styles.btnText}>Pause</Text>
            </TouchableOpacity>
          )}
          {(running || secondsLeft < duration * 60) && (
            <TouchableOpacity style={styles.resetBtn} onPress={resetTimer}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {finished && (
          <View style={styles.finishedCard}>
            <Text style={styles.finishedTitle}>Well done 🙏</Text>
            <Text style={styles.finishedText}>
              You completed {duration} minutes of meditation. Take a moment to
              notice how you feel before returning to your day.
            </Text>
            <TouchableOpacity style={styles.btn} onPress={resetTimer}>
              <Text style={styles.btnText}>Meditate Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Breathing Exercises */}
        <Text style={styles.sectionTitle}>Breathing guides</Text>
        <Text style={styles.sectionSubtitle}>
          Tap a technique to start a live guide
        </Text>

        {breathingExercises.map((ex) => (
          <TouchableOpacity
            key={ex.name}
            style={[
              styles.breathCard,
              activeBreath?.name === ex.name && styles.breathCardActive,
            ]}
            onPress={() => startBreathing(ex)}
            activeOpacity={0.8}
          >
            <View style={styles.breathHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.breathName}>{ex.name}</Text>
                <Text style={styles.breathPattern}>{ex.pattern}</Text>
              </View>
              <View style={styles.breathToggle}>
                <Text style={styles.breathToggleText}>
                  {activeBreath?.name === ex.name ? "Stop" : "Start"}
                </Text>
              </View>
            </View>

            <Text style={styles.breathDesc}>{ex.description}</Text>

            {activeBreath?.name === ex.name && (
              <View style={styles.breathLiveBox}>
                <Text style={styles.breathLiveStep}>
                  {ex.steps[breathStep]}
                </Text>
                <Text style={styles.breathLiveCount}>{breathCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

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
  durationRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    flexWrap: "wrap",
  },
  durationChip: {
    backgroundColor: CARD,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  durationChipActive: {
    borderColor: TEAL,
    backgroundColor: "#1a3050",
  },
  durationText: { color: MUTED, fontSize: 14 },
  durationTextActive: { color: TEAL, fontWeight: "600" },
  timerSection: { alignItems: "center", paddingVertical: 28 },
  timerOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#1a3050",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: TEAL,
  },
  timerInner: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  ringContainer: { alignItems: "center" },
  timerText: { fontSize: 36, fontWeight: "600", color: TEAL },
  finishedLabel: { color: MUTED, fontSize: 13, marginTop: 4 },
  progressBar: {
    width: "70%",
    height: 4,
    backgroundColor: "#243347",
    borderRadius: 2,
    marginTop: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: TEAL,
    borderRadius: 2,
  },
  progressLabel: { color: MUTED, fontSize: 12, marginTop: 6 },
  controlRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  btn: {
    backgroundColor: TEAL,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  btnText: { color: "#0e1f2e", fontSize: 15, fontWeight: "600" },
  resetBtn: {
    borderWidth: 1.5,
    borderColor: MUTED,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  resetText: { color: MUTED, fontSize: 15 },
  finishedCard: {
    backgroundColor: CARD,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  finishedTitle: { color: TEAL, fontSize: 20, fontWeight: "600", marginBottom: 8 },
  finishedText: {
    color: TEXT,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: TEAL,
    fontSize: 15,
    fontWeight: "500",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: MUTED,
    fontSize: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontStyle: "italic",
  },
  breathCard: {
    backgroundColor: CARD,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  breathCardActive: { borderColor: TEAL },
  breathHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  breathName: { color: TEAL, fontSize: 15, fontWeight: "500" },
  breathPattern: { color: MUTED, fontSize: 11, marginTop: 2 },
  breathToggle: {
    backgroundColor: "#1a3050",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  breathToggleText: { color: TEAL, fontSize: 12, fontWeight: "500" },
  breathDesc: { color: TEXT, fontSize: 12, lineHeight: 18, marginBottom: 4 },
  breathLiveBox: {
    marginTop: 12,
    backgroundColor: "#1a3050",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  breathLiveStep: {
    color: TEAL,
    fontSize: 18,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  breathLiveCount: {
    color: TEXT,
    fontSize: 40,
    fontWeight: "600",
    marginTop: 4,
  },
});