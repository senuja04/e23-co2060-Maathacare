import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  Baby,
  ChevronLeft,
  ChevronRight,
  Heart,
  Hospital,
  PlayCircle,
  Scale,
  Sparkles,
  UserRound,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../../constants/apiConfig";

interface WeekData {
  babySize?: string;
  babyWeight?: string;
  babyDevelopment?: string;
  motherChanges?: string;
  phmChecklist?: string;
  weeklyTip?: string;
}

const VIDEO_SOURCES: Record<string, number> = {
  "1": require("../../assets/videos/week1.mp4"),
  "2": require("../../assets/videos/week2.mp4"),
  "3": require("../../assets/videos/week3.mp4"),
  "4": require("../../assets/videos/week4.mp4"),
  "5": require("../../assets/videos/week5.mp4"),
  "6": require("../../assets/videos/week6.mp4"),
  "7": require("../../assets/videos/week7.mp4"),
  "8": require("../../assets/videos/week8.mp4"),
  "12": require("../../assets/videos/week12.mp4"),
  "13": require("../../assets/videos/week13.mp4"),
  "14": require("../../assets/videos/week14.mp4"),
  "15": require("../../assets/videos/week15.mp4"),
  "16": require("../../assets/videos/week16.mp4"),
  "17": require("../../assets/videos/week17.mp4"),
  "18": require("../../assets/videos/week18.mp4"),
  "19": require("../../assets/videos/week19.mp4"),
  "20": require("../../assets/videos/week20.mp4"),
  "21": require("../../assets/videos/week21.mp4"),
  "22": require("../../assets/videos/week22.mp4"),
  "23": require("../../assets/videos/week23.mp4"),
  "24": require("../../assets/videos/week24.mp4"),
  "25": require("../../assets/videos/week25.mp4"),
  "26": require("../../assets/videos/week26.mp4"),
  "27": require("../../assets/videos/week27.mp4"),
  "28": require("../../assets/videos/week28.mp4"),
};

const getTrimester = (week: number) => {
  if (week <= 13) return { label: "First trimester", emoji: "🌱" };
  if (week <= 27) return { label: "Second trimester", emoji: "🌸" };
  return { label: "Third trimester", emoji: "🧸" };
};

export default function WeekDetails() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id || "1";
  const week = Math.min(40, Math.max(1, Number(id) || 1));
  const trimester = getTrimester(week);

  const [data, setData] = useState<WeekData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    const loadWeek = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await axios.get<WeekData>(
          `${API_BASE_URL}/api/weekly-milestones/${week}`,
        );

        if (active) setData(response.data);
      } catch (error) {
        console.error("Weekly milestone error:", error);
        if (active) {
          setData(null);
          setErrorMessage(
            "We could not load this week's information right now.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadWeek();

    return () => {
      active = false;
    };
  }, [week]);

  const openWeek = (nextWeek: number) => {
    router.replace({
      pathname: "/week/[id]",
      params: { id: String(nextWeek) },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingHeart}>
          <Heart size={25} color="#C35F84" fill="#F5C2D3" />
        </View>
        <ActivityIndicator size="large" color="#C35F84" />
        <Text style={styles.loadingTitle}>Opening Week {week}</Text>
        <Text style={styles.loadingText}>Just a little moment, Mama 🌷</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#F3A4BA", "#DE7FA1", "#A95F8A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroBubbleOne} />
        <View style={styles.heroBubbleTwo} />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back to pregnancy weeks"
        >
          <ChevronLeft size={20} color="#FFFFFF" />
          <Text style={styles.backText}>All weeks</Text>
        </TouchableOpacity>

        <View style={styles.trimesterPill}>
          <Text style={styles.trimesterEmoji}>{trimester.emoji}</Text>
          <Text style={styles.trimesterText}>{trimester.label}</Text>
        </View>

        <Text style={styles.heroTitle}>Week {week}</Text>
        <Text style={styles.heroSubtitle}>
          Here is what may be happening with you and your little one this week.
        </Text>

        <View style={styles.heroMessage}>
          <Heart size={16} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.heroMessageText}>
            One week closer to meeting your baby
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {VIDEO_SOURCES[String(week)] ? (
          <WeekVideo source={VIDEO_SOURCES[String(week)]} />
        ) : (
          <View style={styles.videoPlaceholder}>
            <View style={styles.videoPlaceholderIcon}>
              <PlayCircle size={29} color="#B65A7D" />
            </View>
            <Text style={styles.videoPlaceholderTitle}>
              Weekly video coming soon
            </Text>
            <Text style={styles.videoPlaceholderText}>
              You can still read all of this week's helpful information below.
            </Text>
          </View>
        )}

        {data ? (
          <>
            <Text style={styles.sectionEyebrow}>AT A GLANCE</Text>
            <Text style={styles.sectionTitle}>Your week in a nutshell</Text>

            <View style={styles.statsRow}>
              <StatCard
                icon={<Baby size={21} color="#B9577C" />}
                emoji="🍼"
                label="Baby size"
                value={data.babySize}
                background="#FDEBF1"
              />
              <StatCard
                icon={<Scale size={21} color="#7B62B0" />}
                emoji="⚖️"
                label="Est. weight"
                value={data.babyWeight}
                background="#F0EBFA"
              />
            </View>

            <FriendlyInfoCard
              icon={<Baby size={22} color="#B9577C" />}
              emoji="👶"
              title="Your baby this week"
              subtitle="Growth and development"
              text={data.babyDevelopment}
              background="#FFF5F8"
              border="#F3DCE5"
            />

            <FriendlyInfoCard
              icon={<UserRound size={22} color="#7A63AE" />}
              emoji="🤰"
              title="How you may feel"
              subtitle="Changes in your body"
              text={data.motherChanges}
              background="#F8F5FF"
              border="#E7DFF5"
            />

            <FriendlyInfoCard
              icon={<Hospital size={22} color="#39877F" />}
              emoji="🏥"
              title="Your care checklist"
              subtitle="PHM and clinic reminders"
              text={data.phmChecklist}
              background="#F2FBF9"
              border="#DCEEEA"
            />

            <LinearGradient
              colors={["#FFF7DE", "#FFF0D7"]}
              style={styles.tipCard}
            >
              <View style={styles.tipIcon}>
                <Sparkles size={23} color="#BB7A25" />
              </View>
              <View style={styles.tipCopy}>
                <Text style={styles.tipEyebrow}>A LITTLE TIP FOR YOU</Text>
                <Text style={styles.tipTitle}>Mama's weekly reminder ✨</Text>
                <Text style={styles.tipText}>
                  {data.weeklyTip || "No weekly tip is available yet."}
                </Text>
              </View>
            </LinearGradient>
          </>
        ) : (
          <View style={styles.errorCard}>
            <Text style={styles.errorEmoji}>🌷</Text>
            <Text style={styles.errorTitle}>This page needs a moment</Text>
            <Text style={styles.errorText}>
              {errorMessage || `Week ${week} information is not available yet.`}
            </Text>
          </View>
        )}

        <View style={styles.weekNavigation}>
          <TouchableOpacity
            activeOpacity={0.82}
            disabled={week === 1}
            onPress={() => openWeek(week - 1)}
            style={[
              styles.navigationButton,
              week === 1 && styles.navigationButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Open week ${week - 1}`}
          >
            <ChevronLeft size={19} color={week === 1 ? "#CBBAC1" : "#A64F73"} />
            <View style={styles.navigationCopy}>
              <Text style={styles.navigationSmall}>Previous</Text>
              <Text
                style={[
                  styles.navigationWeek,
                  week === 1 && styles.navigationWeekDisabled,
                ]}
              >
                {week === 1 ? "Start" : `Week ${week - 1}`}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.82}
            disabled={week === 40}
            onPress={() => openWeek(week + 1)}
            style={[
              styles.navigationButton,
              week === 40 && styles.navigationButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Open week ${week + 1}`}
          >
            <View style={[styles.navigationCopy, styles.navigationCopyRight]}>
              <Text style={styles.navigationSmall}>Next</Text>
              <Text
                style={[
                  styles.navigationWeek,
                  week === 40 && styles.navigationWeekDisabled,
                ]}
              >
                {week === 40 ? "Complete" : `Week ${week + 1}`}
              </Text>
            </View>
            <ChevronRight
              size={19}
              color={week === 40 ? "#CBBAC1" : "#A64F73"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.healthNote}>
          <Text style={styles.healthNoteEmoji}>💗</Text>
          <View style={styles.healthNoteCopy}>
            <Text style={styles.healthNoteTitle}>Please remember</Text>
            <Text style={styles.healthNoteText}>
              Every pregnancy is different. Contact your PHM, midwife, or doctor
              if you feel unwell, worried, or notice an important change.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function WeekVideo({ source }: { source: number }) {
  const player = useVideoPlayer(source, (videoPlayer) => {
    videoPlayer.loop = true;
  });

  return (
    <View style={styles.videoCard}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
      />
      <View style={styles.videoCaption}>
        <View style={styles.videoCaptionIcon}>
          <Baby size={18} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.videoCaptionEyebrow}>WEEKLY VIDEO</Text>
          <Text style={styles.videoCaptionTitle}>A peek inside the womb</Text>
        </View>
      </View>
    </View>
  );
}

function StatCard({
  icon,
  emoji,
  label,
  value,
  background,
}: {
  icon: React.ReactNode;
  emoji: string;
  label: string;
  value?: string;
  background: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: background }]}>
        {icon}
      </View>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value || "Not available"}</Text>
    </View>
  );
}

function FriendlyInfoCard({
  icon,
  emoji,
  title,
  subtitle,
  text,
  background,
  border,
}: {
  icon: React.ReactNode;
  emoji: string;
  title: string;
  subtitle: string;
  text?: string;
  background: string;
  border: string;
}) {
  return (
    <View
      style={[
        styles.infoCard,
        { backgroundColor: background, borderColor: border },
      ]}
    >
      <View style={styles.infoHeader}>
        <View style={styles.infoIcon}>{icon}</View>
        <View style={styles.infoHeadingCopy}>
          <Text style={styles.infoSubtitle}>{subtitle.toUpperCase()}</Text>
          <Text style={styles.infoTitle}>{title}</Text>
        </View>
        <Text style={styles.infoEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.infoText}>
        {text || "Information for this section is not available yet."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF8FA",
  },
  container: {
    paddingBottom: 44,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#FFF8FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingHeart: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: "#FDEAF0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  loadingTitle: {
    color: "#51343F",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 14,
  },
  loadingText: {
    color: "#9B7D89",
    fontSize: 13,
    marginTop: 5,
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 34,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  heroBubbleOne: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(255,255,255,0.12)",
    right: -75,
    top: -60,
  },
  heroBubbleTwo: {
    position: "absolute",
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: "rgba(255,255,255,0.10)",
    left: -40,
    bottom: -35,
  },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingHorizontal: 13,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    marginBottom: 25,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 3,
  },
  trimesterPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  trimesterEmoji: {
    fontSize: 15,
    marginRight: 6,
  },
  trimesterText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 39,
    fontWeight: "900",
    marginTop: 13,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 330,
  },
  heroMessage: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.17)",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 20,
  },
  heroMessageText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 7,
  },
  content: {
    paddingHorizontal: 18,
  },
  videoCard: {
    marginTop: -18,
    borderRadius: 27,
    overflow: "hidden",
    backgroundColor: "#241C20",
    borderWidth: 1,
    borderColor: "#F4E6EB",
    shadowColor: "#7C405A",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 9 },
    elevation: 7,
  },
  video: {
    width: "100%",
    height: 235,
  },
  videoCaption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#302329",
  },
  videoCaptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#C35F84",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  videoCaptionEyebrow: {
    color: "#D2BEC6",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  videoCaptionTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 3,
  },
  videoPlaceholder: {
    marginTop: -18,
    minHeight: 190,
    backgroundColor: "#FFFFFF",
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderWidth: 1,
    borderColor: "#F1DFE7",
  },
  videoPlaceholderIcon: {
    width: 58,
    height: 58,
    borderRadius: 21,
    backgroundColor: "#FCEAF0",
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlaceholderTitle: {
    color: "#593945",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 13,
  },
  videoPlaceholderText: {
    color: "#9B7D89",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 5,
  },
  sectionEyebrow: {
    color: "#B88B9E",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginTop: 25,
  },
  sectionTitle: {
    color: "#4E323E",
    fontSize: 23,
    fontWeight: "900",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    minHeight: 158,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0E2E8",
    shadowColor: "#A75E7C",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  statEmoji: {
    position: "absolute",
    right: 13,
    top: 15,
    fontSize: 20,
  },
  statLabel: {
    color: "#9E818D",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    marginTop: 16,
  },
  statValue: {
    color: "#51343F",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 5,
  },
  infoCard: {
    borderRadius: 26,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.78)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoHeadingCopy: {
    flex: 1,
  },
  infoSubtitle: {
    color: "#A68A96",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  infoTitle: {
    color: "#503540",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 3,
  },
  infoEmoji: {
    fontSize: 24,
    marginLeft: 8,
  },
  infoText: {
    color: "#755F69",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 14,
  },
  tipCard: {
    flexDirection: "row",
    borderRadius: 26,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#F0D9B6",
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  tipCopy: {
    flex: 1,
  },
  tipEyebrow: {
    color: "#B6813D",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  tipTitle: {
    color: "#7B5427",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 3,
  },
  tipText: {
    color: "#86643D",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  errorCard: {
    backgroundColor: "#FFF3F6",
    borderRadius: 26,
    padding: 24,
    marginTop: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1D9E2",
  },
  errorEmoji: {
    fontSize: 31,
  },
  errorTitle: {
    color: "#82465D",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 9,
  },
  errorText: {
    color: "#976F7E",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 5,
  },
  weekNavigation: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  navigationButton: {
    flex: 1,
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#EDDFE5",
  },
  navigationButtonDisabled: {
    backgroundColor: "#FAF6F8",
    opacity: 0.72,
  },
  navigationCopy: {
    marginLeft: 3,
  },
  navigationCopyRight: {
    alignItems: "flex-end",
    marginLeft: 0,
    marginRight: 3,
  },
  navigationSmall: {
    color: "#A68C97",
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  navigationWeek: {
    color: "#714054",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 3,
  },
  navigationWeekDisabled: {
    color: "#BCAAB2",
  },
  healthNote: {
    flexDirection: "row",
    backgroundColor: "#FFF0F5",
    borderRadius: 24,
    padding: 17,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F0DBE4",
  },
  healthNoteEmoji: {
    fontSize: 25,
    marginRight: 12,
  },
  healthNoteCopy: {
    flex: 1,
  },
  healthNoteTitle: {
    color: "#7D4059",
    fontSize: 14,
    fontWeight: "900",
  },
  healthNoteText: {
    color: "#916C7C",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
});
