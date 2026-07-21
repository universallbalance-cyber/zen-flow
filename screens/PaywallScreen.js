import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from "react-native";
import { storeToken } from "../data/entitlement";

const BG = "#1a2535";
const CARD = "#223044";
const TEAL = "#2dd4c0";
const TEXT = "#d0dcea";
const MUTED = "#a0b0c8";
const DANGER = "#e0796b";

const PAYPAL_SDK_SCRIPT_ID = "paypal-sdk";

export default function PaywallScreen({ onUnlock }) {
  const containerRef = useRef(null);
  const buttonsRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [showRestore, setShowRestore] = useState(false);
  const [restoreCode, setRestoreCode] = useState("");
  const [restoreState, setRestoreState] = useState("idle"); // idle | checking | error

  const redeemCode = async () => {
    const code = restoreCode.trim();
    if (!code) return;
    setRestoreState("checking");
    try {
      const res = await fetch("/api/verify-entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code }),
      });
      const data = res.ok ? await res.json() : { valid: false };
      if (data.valid) {
        await storeToken(code);
        onUnlock();
      } else {
        setRestoreState("error");
      }
    } catch {
      setRestoreState("error");
    }
  };

  useEffect(() => {
    let cancelled = false;

    function renderButtons() {
      if (cancelled || !containerRef.current || !window.paypal) return;
      try {
        buttonsRef.current = window.paypal.Buttons({
          style: { color: "black", label: "pay", height: 45 },
          createOrder: async () => {
            const res = await fetch("/api/paypal-create-order", { method: "POST" });
            if (!res.ok) throw new Error("Could not start checkout");
            const data = await res.json();
            return data.id;
          },
          onApprove: async (data) => {
            const res = await fetch("/api/paypal-capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID }),
            });
            if (!res.ok) throw new Error("Payment could not be completed");
            const { token } = await res.json();
            await storeToken(token);
            if (!cancelled) onUnlock();
          },
          onError: () => {
            if (!cancelled) setStatus("error");
          },
        });
        buttonsRef.current.render(containerRef.current).then(() => {
          if (!cancelled) setStatus("ready");
        }).catch(() => {
          if (!cancelled) setStatus("error");
        });
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    if (window.paypal) {
      renderButtons();
      return;
    }

    let script = document.getElementById(PAYPAL_SDK_SCRIPT_ID);
    if (!script) {
      const clientId = process.env.EXPO_PUBLIC_PAYPAL_CLIENT_ID;
      script = document.createElement("script");
      script.id = PAYPAL_SDK_SCRIPT_ID;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.onerror = () => {
        if (!cancelled) setStatus("error");
      };
      document.body.appendChild(script);
    }
    script.addEventListener("load", renderButtons);

    return () => {
      cancelled = true;
      script && script.removeEventListener("load", renderButtons);
      if (buttonsRef.current && buttonsRef.current.close) {
        buttonsRef.current.close().catch(() => {});
      }
    };
  }, [onUnlock]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.emoji}>🪷</Text>
        <Text style={styles.title}>Zen Flow</Text>
        <View style={styles.card}>
          <Text style={styles.pitch}>
            Unlock yoga sequences, poses, meditation timers, and journaling.
          </Text>
          <Text style={styles.price}>$0.99 · one-time</Text>

          <View ref={containerRef} style={styles.buttonSlot} />

          {status === "loading" && (
            <View style={styles.statusRow}>
              <ActivityIndicator color={TEAL} />
              <Text style={styles.statusText}>Loading payment options…</Text>
            </View>
          )}
          {status === "error" && (
            <Text style={styles.errorText}>
              Couldn't load PayPal. Check your connection (or disable any ad blocker) and reload the page.
            </Text>
          )}

          {!showRestore ? (
            <TouchableOpacity onPress={() => setShowRestore(true)} style={styles.restoreLink}>
              <Text style={styles.restoreLinkText}>Already purchased? Restore access</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.restoreBox}>
              <Text style={styles.restoreLabel}>Enter your restore code</Text>
              <TextInput
                style={styles.restoreInput}
                value={restoreCode}
                onChangeText={(t) => {
                  setRestoreCode(t);
                  setRestoreState("idle");
                }}
                placeholder="Paste code here"
                placeholderTextColor={MUTED}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.restoreBtn}
                onPress={redeemCode}
                disabled={restoreState === "checking"}
              >
                <Text style={styles.restoreBtnText}>
                  {restoreState === "checking" ? "Checking…" : "Restore"}
                </Text>
              </TouchableOpacity>
              {restoreState === "error" && (
                <Text style={styles.errorText}>That code isn't valid. Check it and try again.</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emoji: { fontSize: 56 },
  title: { fontSize: 26, fontWeight: "600", color: TEAL, letterSpacing: 1, marginTop: 8, marginBottom: 24 },
  card: { backgroundColor: CARD, borderRadius: 16, padding: 20, width: "100%", maxWidth: 360 },
  pitch: { color: TEXT, fontSize: 14, lineHeight: 20, textAlign: "center", marginBottom: 12 },
  price: { color: TEAL, fontSize: 18, fontWeight: "600", textAlign: "center", marginBottom: 18 },
  buttonSlot: { minHeight: 45 },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 12, gap: 8 },
  statusText: { color: MUTED, fontSize: 12 },
  errorText: { color: DANGER, fontSize: 12, textAlign: "center", marginTop: 12, lineHeight: 18 },
  restoreLink: { marginTop: 18, alignItems: "center" },
  restoreLinkText: { color: TEAL, fontSize: 12, textDecorationLine: "underline" },
  restoreBox: { marginTop: 18 },
  restoreLabel: { color: MUTED, fontSize: 12, marginBottom: 6 },
  restoreInput: {
    backgroundColor: "#1a2535",
    borderRadius: 10,
    padding: 10,
    color: TEXT,
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#2dd4c020",
    marginBottom: 10,
  },
  restoreBtn: {
    borderWidth: 1.5,
    borderColor: TEAL,
    borderRadius: 50,
    paddingVertical: 10,
    alignItems: "center",
  },
  restoreBtnText: { color: TEAL, fontSize: 13, fontWeight: "600" },
});
