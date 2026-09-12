import React from "react";
import { View, Image, StyleSheet } from "react-native";

const CARD = "#223044";

// Local AI-generated images stored in assets/poses/
const POSE_IMAGES = {
  1:  require("../assets/poses/pose_1.jpg"),
  2:  require("../assets/poses/pose_2.jpg"),
  3:  require("../assets/poses/pose_3.jpg"),
  4:  require("../assets/poses/pose_4.jpg"),
  5:  require("../assets/poses/pose_5.jpg"),
  6:  require("../assets/poses/pose_6.jpg"),
  7:  require("../assets/poses/pose_7.jpg"),
  8:  require("../assets/poses/pose_8.jpg"),
  9:  require("../assets/poses/pose_9.jpg"),
  10: require("../assets/poses/pose_10.jpg"),
  11: require("../assets/poses/pose_11.jpg"),
  12: require("../assets/poses/pose_12.jpg"),
  13: require("../assets/poses/pose_13.jpg"),
  14: require("../assets/poses/pose_14.jpg"),
  15: require("../assets/poses/pose_15.jpg"),
  16: require("../assets/poses/pose_16.jpg"),
  17: require("../assets/poses/pose_17.jpg"),
  18: require("../assets/poses/pose_18.jpg"),
  19: require("../assets/poses/pose_19.jpg"),
  20: require("../assets/poses/pose_20.jpg"),
  21: require("../assets/poses/pose_21.jpg"),
  22: require("../assets/poses/pose_22.png"),
  23: require("../assets/poses/pose_23.png"),
  24: require("../assets/poses/pose_24.png"),
  25: require("../assets/poses/pose_25.png"),
  26: require("../assets/poses/pose_26.png"),
  27: require("../assets/poses/pose_27.png"),
  28: require("../assets/poses/pose_28.png"),
  29: require("../assets/poses/pose_29.png"),
};

export function PoseImage({ poseId, size = 220 }) {
  const source = POSE_IMAGES[poseId];
  if (!source) return null;
  return (
    <View style={[styles.container, { height: size }]}>
      <Image
        source={source}
        style={[styles.image, { height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

export function PoseThumbnail({ poseId, size = 56 }) {
  const source = POSE_IMAGES[poseId];
  if (!source) return null;
  return (
    <View style={[styles.thumb, { width: size, height: size, borderRadius: size / 6 }]}>
      <Image
        source={source}
        style={{ width: size, height: size, borderRadius: size / 6 }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: CARD,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
  },
  thumb: {
    backgroundColor: CARD,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});