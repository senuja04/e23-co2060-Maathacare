import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Baby,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Flower2,
  Heart,
  Languages,
  RefreshCw,
  Search,
  Sparkles,
  Sprout,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { API_BASE_URL } from "../../constants/apiConfig";

const weeks = Array.from({ length: 40 }, (_, index) => index + 1);
const DAY_IN_MS = 1000 * 60 * 60 * 24;
const PREGNANCY_LENGTH_DAYS = 280;

type AppLanguage = "en" | "si" | "ta";

const LANGUAGE_OPTIONS: Array<{
  code: AppLanguage;
  shortLabel: string;
  fullLabel: string;
}> = [
  { code: "en", shortLabel: "EN", fullLabel: "English" },
  { code: "si", shortLabel: "සිං", fullLabel: "සිංහල" },
  { code: "ta", shortLabel: "த", fullLabel: "தமிழ்" },
];

const DATE_LOCALES: Record<AppLanguage, string> = {
  en: "en-GB",
  si: "si-LK",
  ta: "ta-LK",
};

type Filter = "all" | "first" | "second" | "third";

interface MotherProfile {
  lastMenstrualPeriod?: string | null;
  expectedDeliveryDate?: string | null;
  estimatedDeliveryDate?: string | null;
  estimatedDueDate?: string | null;
  expectedDateOfDelivery?: string | null;
  deliveryDate?: string | null;
  dueDate?: string | null;
}

interface PregnancyProgress {
  week: number;
  trimester: string;
  progress: number;
  today: Date;
  dueDate: Date;
  daysRemaining: number;
}

const filters: Array<{
  key: Filter;
  label: string;
  range: string;
}> = [
  { key: "all", label: "All", range: "1–40" },
  { key: "first", label: "First", range: "1–13" },
  { key: "second", label: "Second", range: "14–27" },
  { key: "third", label: "Third", range: "28–40" },
];

const getWeekMeta = (week: number) => {
  if (week <= 13) {
    return {
      trimester: "First trimester",
      stage: 1,
      accent: "#D96F91",
      soft: "#FDEAF0",
    };
  }

  if (week <= 27) {
    return {
      trimester: "Second trimester",
      stage: 2,
      accent: "#8A70C7",
      soft: "#F0EBFA",
    };
  }

  return {
    trimester: "Third trimester",
    stage: 3,
    accent: "#4F958E",
    soft: "#E8F6F3",
  };
};

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00`
    : value;
  const parsed = new Date(normalized);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const formatDate = (date: Date, language: AppLanguage) =>
  date.toLocaleDateString(DATE_LOCALES[language], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const cleanStoredValue = (value: string | null): string | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "string") return parsed;
  } catch {
    // The value was stored as plain text, which is valid.
  }

  return value;
};

const getStoredToken = async () => {
  const keys = ["userToken", "token", "authToken", "jwtToken"];

  for (const key of keys) {
    const storedValue = cleanStoredValue(await AsyncStorage.getItem(key));
    if (storedValue) {
      return storedValue.startsWith("Bearer ")
        ? storedValue.substring(7)
        : storedValue;
    }
  }

  return null;
};

const calculatePregnancyProgress = (
  profile: MotherProfile,
): PregnancyProgress | null => {
  const today = startOfDay(new Date());
  const lmp = parseDate(profile.lastMenstrualPeriod);
  const profileDueDate = parseDate(
    profile.expectedDeliveryDate ??
      profile.estimatedDeliveryDate ??
      profile.estimatedDueDate ??
      profile.expectedDateOfDelivery ??
      profile.deliveryDate ??
      profile.dueDate,
  );
  const dueDate = profileDueDate ?? (lmp ? addDays(lmp, 280) : null);

  if (!dueDate && !lmp) return null;

  let pregnancyDays: number;

  if (lmp) {
    pregnancyDays = Math.floor(
      (today.getTime() - startOfDay(lmp).getTime()) / DAY_IN_MS,
    );
  } else {
    const daysUntilDueDate = Math.ceil(
      (startOfDay(dueDate as Date).getTime() - today.getTime()) / DAY_IN_MS,
    );
    pregnancyDays = PREGNANCY_LENGTH_DAYS - daysUntilDueDate;
  }

  const safePregnancyDays = Math.min(
    PREGNANCY_LENGTH_DAYS,
    Math.max(0, pregnancyDays),
  );
  const week = Math.min(40, Math.max(1, Math.floor(safePregnancyDays / 7) + 1));
  const progress = Math.min(
    100,
    Math.max(0, (safePregnancyDays / PREGNANCY_LENGTH_DAYS) * 100),
  );
  const trimester = getWeekMeta(week);
  const resolvedDueDate = dueDate ?? addDays(lmp as Date, 280);
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (startOfDay(resolvedDueDate).getTime() - today.getTime()) / DAY_IN_MS,
    ),
  );

  return {
    week,
    trimester: trimester.trimester,
    progress,
    today,
    dueDate: resolvedDueDate,
    daysRemaining,
  };
};

function TrimesterIcon({
  type,
  color,
  size = 20,
}: {
  type: Filter;
  color: string;
  size?: number;
}) {
  if (type === "first") return <Sprout size={size} color={color} />;
  if (type === "second") return <Flower2 size={size} color={color} />;
  if (type === "third") return <Baby size={size} color={color} />;
  return <BookOpen size={size} color={color} />;
}

const getFilterForWeek = (week: number): Filter => {
  if (week <= 13) return "first";
  if (week <= 27) return "second";
  return "third";
};

export default function ExploreScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage?.split("-")[0] ??
    "en") as AppLanguage;
  const [filter, setFilter] = useState<Filter>("all");
  const [weekInput, setWeekInput] = useState("");
  const [profile, setProfile] = useState<MotherProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const pregnancy = useMemo(
    () => (profile ? calculatePregnancyProgress(profile) : null),
    [profile],
  );

  const visibleWeeks = useMemo(() => {
    if (filter === "first") return weeks.filter((week) => week <= 13);
    if (filter === "second") {
      return weeks.filter((week) => week >= 14 && week <= 27);
    }
    if (filter === "third") return weeks.filter((week) => week >= 28);
    return weeks;
  }, [filter]);

  const changeLanguage = async (language: AppLanguage) => {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem("appLanguage", language);
  };

  const openWeek = (week: number) => {
    router.push({
      pathname: "/week/[id]",
      params: { id: String(week) },
    });
  };

  const loadPregnancyProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError("");

    try {
      const userId = cleanStoredValue(await AsyncStorage.getItem("userId"));
      const token = await getStoredToken();

      if (!userId || !token) {
        throw new Error(t("explore.sessionExpired"));
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/mothers/profile/${encodeURIComponent(userId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const responseProfile = response.data?.data ?? response.data;
      setProfile(responseProfile as MotherProfile);
    } catch (error: any) {
      console.error("Pregnancy profile error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      setProfile(null);
      setProfileError(
        error.response?.status === 401 || error.response?.status === 403
          ? t("explore.sessionExpired")
          : error.message || t("explore.profileLoadError"),
      );
    } finally {
      setProfileLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadPregnancyProfile();
  }, [loadPregnancyProfile]);

  useEffect(() => {
    if (!pregnancy) return;

    if (pregnancy.week <= 13) setFilter("first");
    else if (pregnancy.week <= 27) setFilter("second");
    else setFilter("third");
  }, [pregnancy]);

  const jumpToWeek = () => {
    const week = Number(weekInput);

    if (!Number.isInteger(week) || week < 1 || week > 40) {
      Alert.alert(t("explore.chooseWeekTitle"), t("explore.chooseWeekMessage"));
      return;
    }

    Keyboard.dismiss();
    setWeekInput("");
    openWeek(week);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LanguageSwitcher
          currentLanguage={currentLanguage}
          onChangeLanguage={changeLanguage}
        />

        <PregnancyProgressCard
          pregnancy={pregnancy}
          loading={profileLoading}
          error={profileError}
          onRetry={loadPregnancyProfile}
          onOpenWeek={() => pregnancy && openWeek(pregnancy.week)}
        />

        <View style={styles.quickJumpCard}>
          <View style={styles.quickJumpHeader}>
            <View style={styles.quickJumpIcon}>
              <Search size={19} color="#B65378" />
            </View>
            <View style={styles.quickJumpCopy}>
              <Text style={styles.quickJumpTitle}>
                {t("explore.goToWeekTitle")}
              </Text>
              <Text style={styles.quickJumpText}>
                {t("explore.goToWeekHint")}
              </Text>
            </View>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              value={weekInput}
              onChangeText={(value) =>
                setWeekInput(value.replace(/[^0-9]/g, ""))
              }
              onSubmitEditing={jumpToWeek}
              placeholder={t("explore.weekPlaceholder")}
              placeholderTextColor="#B49AA5"
              keyboardType="number-pad"
              returnKeyType="go"
              maxLength={2}
              style={styles.weekInput}
              accessibilityLabel={t("explore.inputAccessibility")}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={jumpToWeek}
              style={styles.goButton}
              accessibilityRole="button"
              accessibilityLabel={t("explore.goAccessibility")}
            >
              <Text style={styles.goButtonText}>{t("explore.go")}</Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>
              {t("explore.chooseTrimester")}
            </Text>
            <Text style={styles.sectionTitle}>
              {t("explore.exploreEveryWeek")}
            </Text>
          </View>
          <View style={styles.bookIcon}>
            <BookOpen size={21} color="#B65378" />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((item) => {
            const active = filter === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.82}
                onPress={() => setFilter(item.key)}
                style={[styles.filterChip, active && styles.filterChipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t("explore.filterAccessibility", {
                  label: t(`explore.filters.${item.key}`),
                  range: item.range,
                })}
              >
                <View
                  style={[styles.filterIcon, active && styles.filterIconActive]}
                >
                  <TrimesterIcon
                    type={item.key}
                    color={active ? "#FFFFFF" : "#B65378"}
                    size={19}
                  />
                </View>
                <View>
                  <Text
                    style={[
                      styles.filterLabel,
                      active && styles.filterLabelActive,
                    ]}
                  >
                    {t(`explore.filters.${item.key}`)}
                  </Text>
                  <Text
                    style={[
                      styles.filterRange,
                      active && styles.filterRangeActive,
                    ]}
                  >
                    {t("explore.weeksRange", { range: item.range })}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.grid}>
          {visibleWeeks.map((week) => {
            const item = getWeekMeta(week);
            const isCurrentWeek = pregnancy?.week === week;

            return (
              <TouchableOpacity
                key={week}
                activeOpacity={0.83}
                onPress={() => openWeek(week)}
                style={[
                  styles.weekCard,
                  isCurrentWeek && styles.currentWeekCard,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("explore.openWeekAccessibility", {
                  week,
                })}
              >
                {isCurrentWeek && (
                  <View style={styles.currentWeekBadge}>
                    <Heart size={11} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.currentWeekBadgeText}>
                      {t("explore.yourWeek")}
                    </Text>
                  </View>
                )}

                <View
                  style={[styles.weekBubble, { backgroundColor: item.soft }]}
                >
                  <TrimesterIcon
                    type={getFilterForWeek(week)}
                    color={item.accent}
                    size={22}
                  />
                </View>
                <Text style={styles.weekStageText}>
                  {t("explore.stage", { stage: item.stage })}
                </Text>

                <Text style={[styles.weekNumber, { color: item.accent }]}>
                  {week}
                </Text>
                <Text style={styles.weekLabel}>{t("explore.week")}</Text>
                <Text style={styles.trimesterLabel}>
                  {t(`explore.trimesters.${getFilterForWeek(week)}`)}
                </Text>

                <View style={[styles.openPill, { backgroundColor: item.soft }]}>
                  <Text style={[styles.openPillText, { color: item.accent }]}>
                    {t("explore.view")}
                  </Text>
                  <ChevronRight size={14} color={item.accent} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.healthNote}>
          <View style={styles.healthNoteIcon}>
            <Heart size={20} color="#B65378" fill="#F5C6D6" />
          </View>
          <View style={styles.healthNoteCopy}>
            <Text style={styles.healthNoteTitle}>
              {t("explore.caringReminderTitle")}
            </Text>
            <Text style={styles.healthNoteText}>
              {t("explore.caringReminderText")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LanguageSwitcher({
  currentLanguage,
  onChangeLanguage,
}: {
  currentLanguage: AppLanguage;
  onChangeLanguage: (language: AppLanguage) => Promise<void>;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.languageCard}>
      <View style={styles.languageHeader}>
        <View style={styles.languageIcon}>
          <Languages size={20} color="#B65378" />
        </View>
        <View style={styles.languageCopy}>
          <Text style={styles.languageTitle}>{t("explore.languageTitle")}</Text>
          <Text style={styles.languageHint}>{t("explore.languageHint")}</Text>
        </View>
      </View>

      <View style={styles.languageOptions}>
        {LANGUAGE_OPTIONS.map((option) => {
          const active = currentLanguage === option.code;

          return (
            <TouchableOpacity
              key={option.code}
              activeOpacity={0.84}
              onPress={() => void onChangeLanguage(option.code)}
              style={[
                styles.languageButton,
                active && styles.languageButtonActive,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={option.fullLabel}
            >
              <Text
                style={[
                  styles.languageButtonShort,
                  active && styles.languageButtonShortActive,
                ]}
              >
                {option.shortLabel}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.languageButtonLabel,
                  active && styles.languageButtonLabelActive,
                ]}
              >
                {option.fullLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function PregnancyProgressCard({
  pregnancy,
  loading,
  error,
  onRetry,
  onOpenWeek,
}: {
  pregnancy: PregnancyProgress | null;
  loading: boolean;
  error: string;
  onRetry: () => void;
  onOpenWeek: () => void;
}) {
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage?.split("-")[0] ??
    "en") as AppLanguage;

  if (loading) {
    return (
      <LinearGradient
        colors={["#FFF0F5", "#F8EAF8", "#EDF8F6"]}
        style={styles.progressHero}
      >
        <ActivityIndicator size="large" color="#B65378" />
        <Text style={styles.progressLoadingTitle}>
          {t("explore.profileLoadingTitle")}
        </Text>
        <Text style={styles.progressLoadingText}>
          {t("explore.profileLoadingText")}
        </Text>
      </LinearGradient>
    );
  }

  if (!pregnancy) {
    return (
      <LinearGradient
        colors={["#FFF0F5", "#F8EAF8", "#EDF8F6"]}
        style={styles.progressHero}
      >
        <View style={styles.emptyProgressIcon}>
          <CalendarDays size={28} color="#B65378" />
        </View>
        <Text style={styles.emptyProgressTitle}>
          {t("explore.datesUnavailableTitle")}
        </Text>
        <Text style={styles.emptyProgressText}>
          {error || t("explore.datesUnavailableText")}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <RefreshCw size={16} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>{t("explore.retry")}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#FFF1F5", "#F7ECFA", "#EAF7F4"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.progressHero}
    >
      <View style={styles.progressBubbleOne} />
      <View style={styles.progressBubbleTwo} />

      <View style={styles.progressTopRow}>
        <View style={styles.progressLabelPill}>
          <Sparkles size={13} color="#A64F73" />
          <Text style={styles.progressLabelText}>
            {t("explore.pregnancyToday")}
          </Text>
        </View>
        <View style={styles.trimesterTopPill}>
          <TrimesterIcon
            type={getFilterForWeek(pregnancy.week)}
            color="#7A5465"
            size={15}
          />
          <Text style={styles.trimesterTopText}>
            {t(`explore.trimesters.${getFilterForWeek(pregnancy.week)}`)}
          </Text>
        </View>
      </View>

      <View style={styles.progressMainRow}>
        <ProgressCircle progress={pregnancy.progress} week={pregnancy.week} />

        <View style={styles.progressSummary}>
          <Text style={styles.progressSummaryEyebrow}>
            {t("explore.currentStage")}
          </Text>
          <Text style={styles.progressSummaryTitle}>
            {t("explore.weekOf", { week: pregnancy.week })}
          </Text>
          <Text style={styles.progressSummaryText}>
            {t("explore.progressComplete", {
              progress: Math.round(pregnancy.progress),
            })}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.viewCurrentWeekButton}
            onPress={onOpenWeek}
            accessibilityRole="button"
            accessibilityLabel={t("explore.viewCurrentAccessibility", {
              week: pregnancy.week,
            })}
          >
            <Text style={styles.viewCurrentWeekText}>
              {t("explore.viewThisWeek")}
            </Text>
            <ChevronRight size={17} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dateCardsRow}>
        <View style={styles.dateCard}>
          <View style={styles.dateIconPink}>
            <CalendarDays size={18} color="#B65378" />
          </View>
          <Text style={styles.dateCardLabel}>{t("explore.today")}</Text>
          <Text style={styles.dateCardValue}>
            {formatDate(pregnancy.today, currentLanguage)}
          </Text>
        </View>

        <View style={styles.dateCard}>
          <View style={styles.dateIconMint}>
            <Baby size={18} color="#3E8A83" />
          </View>
          <Text style={styles.dateCardLabel}>
            {t("explore.estimatedDelivery")}
          </Text>
          <Text style={styles.dateCardValue}>
            {formatDate(pregnancy.dueDate, currentLanguage)}
          </Text>
          <Text style={styles.daysRemainingText}>
            {pregnancy.daysRemaining === 0
              ? t("explore.dueDateReached")
              : t("explore.daysToGo", { count: pregnancy.daysRemaining })}
          </Text>
        </View>
      </View>

      <View style={styles.estimateNote}>
        <Heart size={14} color="#A64F73" fill="#F3BACD" />
        <Text style={styles.estimateNoteText}>{t("explore.estimateNote")}</Text>
      </View>
    </LinearGradient>
  );
}

function ProgressCircle({
  progress,
  week,
}: {
  progress: number;
  week: number;
}) {
  const { t } = useTranslation();
  const size = 138;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <View style={styles.progressCircleWrapper}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="rgba(255,255,255,0.72)"
          stroke="rgba(182,83,120,0.14)"
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#B65378"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.progressCircleContent}>
        <Text style={styles.progressCircleSmall}>
          {t("explore.progressWeek")}
        </Text>
        <Text style={styles.progressCircleWeek}>{week}</Text>
        <Text style={styles.progressCirclePercent}>
          {t("explore.progressPercent", { progress: Math.round(progress) })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF8FA",
  },
  container: {
    padding: 18,
    paddingBottom: 44,
  },
  languageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F0DDE5",
    shadowColor: "#A75E7C",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  languageHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#FCEAF0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  languageCopy: {
    flex: 1,
  },
  languageTitle: {
    color: "#51343F",
    fontSize: 15,
    fontWeight: "900",
  },
  languageHint: {
    color: "#9B7E8A",
    fontSize: 11,
    marginTop: 2,
  },
  languageOptions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 13,
  },
  languageButton: {
    flex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#FFF7F9",
    borderWidth: 1.5,
    borderColor: "#ECDCE3",
    paddingHorizontal: 5,
  },
  languageButtonActive: {
    backgroundColor: "#B65378",
    borderColor: "#B65378",
    shadowColor: "#B65378",
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  languageButtonShort: {
    color: "#8A6172",
    fontSize: 13,
    fontWeight: "900",
  },
  languageButtonShortActive: {
    color: "#FFFFFF",
  },
  languageButtonLabel: {
    color: "#A18792",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 2,
  },
  languageButtonLabelActive: {
    color: "rgba(255,255,255,0.82)",
  },
  progressHero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 32,
    padding: 20,
    minHeight: 290,
    borderWidth: 1,
    borderColor: "#F0DCE5",
    shadowColor: "#A75E7C",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  progressBubbleOne: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.45)",
    right: -55,
    top: -55,
  },
  progressBubbleTwo: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.32)",
    left: -35,
    bottom: -35,
  },
  progressLoadingTitle: {
    color: "#563744",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 16,
  },
  progressLoadingText: {
    color: "#917683",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
  },
  emptyProgressIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  emptyProgressTitle: {
    color: "#563744",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 15,
  },
  emptyProgressText: {
    color: "#917683",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
  },
  retryButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B65378",
    borderRadius: 16,
    paddingHorizontal: 18,
    alignSelf: "center",
    marginTop: 18,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
  },
  progressTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabelPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  progressLabelText: {
    color: "#A64F73",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginLeft: 5,
  },
  trimesterTopPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.64)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  trimesterTopText: {
    color: "#6E5260",
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 6,
  },
  progressMainRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  progressCircleWrapper: {
    width: 138,
    height: 138,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCircleContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progressCircleSmall: {
    color: "#A58996",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  progressCircleWeek: {
    color: "#6E3850",
    fontSize: 37,
    lineHeight: 42,
    fontWeight: "900",
  },
  progressCirclePercent: {
    color: "#A16D82",
    fontSize: 9,
    fontWeight: "800",
  },
  progressSummary: {
    flex: 1,
    marginLeft: 16,
  },
  progressSummaryEyebrow: {
    color: "#AA8797",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  progressSummaryTitle: {
    color: "#50323F",
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900",
    marginTop: 4,
  },
  progressSummaryText: {
    color: "#876D79",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  viewCurrentWeekButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B65378",
    borderRadius: 15,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  viewCurrentWeekText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginRight: 3,
  },
  dateCardsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  dateCard: {
    flex: 1,
    minHeight: 116,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
  },
  dateIconPink: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: "#FBE4EC",
    alignItems: "center",
    justifyContent: "center",
  },
  dateIconMint: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: "#DFF2EE",
    alignItems: "center",
    justifyContent: "center",
  },
  dateCardLabel: {
    color: "#9E8290",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 10,
  },
  dateCardValue: {
    color: "#513541",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4,
  },
  daysRemainingText: {
    color: "#4F8A83",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
  },
  estimateNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 11,
  },
  estimateNoteText: {
    flex: 1,
    color: "#856B77",
    fontSize: 10,
    lineHeight: 15,
    marginLeft: 7,
  },
  quickJumpCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 17,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#F1DFE7",
    shadowColor: "#A75E7C",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  quickJumpHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  quickJumpIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#FCEAF0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  quickJumpCopy: {
    flex: 1,
  },
  quickJumpTitle: {
    color: "#51343F",
    fontSize: 15,
    fontWeight: "900",
  },
  quickJumpText: {
    color: "#9B7E8A",
    fontSize: 12,
    marginTop: 3,
  },
  inputRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },
  weekInput: {
    flex: 1,
    minHeight: 52,
    borderRadius: 17,
    backgroundColor: "#FFF7F9",
    borderWidth: 1,
    borderColor: "#EEDCE4",
    paddingHorizontal: 16,
    color: "#51343F",
    fontSize: 15,
    fontWeight: "700",
  },
  goButton: {
    minWidth: 82,
    minHeight: 52,
    borderRadius: 17,
    backgroundColor: "#B65378",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  goButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginRight: 3,
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 14,
  },
  sectionEyebrow: {
    color: "#B7899C",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  sectionTitle: {
    color: "#4B303B",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 4,
  },
  bookIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: "#FCEAF0",
    alignItems: "center",
    justifyContent: "center",
  },
  filters: {
    paddingRight: 10,
    paddingBottom: 6,
    gap: 10,
  },
  filterChip: {
    minWidth: 128,
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EDDFE5",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterChipActive: {
    backgroundColor: "#B65378",
    borderColor: "#B65378",
  },
  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCEAF0",
    marginRight: 10,
  },
  filterIconActive: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  filterLabel: {
    color: "#5B3D49",
    fontSize: 13,
    fontWeight: "900",
  },
  filterLabelActive: {
    color: "#FFFFFF",
  },
  filterRange: {
    color: "#A88E99",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
  },
  filterRangeActive: {
    color: "rgba(255,255,255,0.76)",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
    rowGap: 13,
  },
  weekCard: {
    position: "relative",
    width: "48.4%",
    minHeight: 196,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0E3E8",
    shadowColor: "#A75E7C",
    shadowOpacity: 0.07,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  currentWeekCard: {
    borderWidth: 2,
    borderColor: "#D87599",
    backgroundColor: "#FFFAFC",
  },
  currentWeekBadge: {
    position: "absolute",
    top: 9,
    right: 9,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B65378",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    zIndex: 2,
  },
  currentWeekBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
    marginLeft: 4,
  },
  weekBubble: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  weekStageText: {
    color: "#A18792",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 5,
  },
  weekNumber: {
    fontSize: 31,
    fontWeight: "900",
    marginTop: 10,
    lineHeight: 35,
  },
  weekLabel: {
    color: "#5A3B47",
    fontSize: 13,
    fontWeight: "900",
  },
  trimesterLabel: {
    color: "#A18792",
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
  openPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  openPillText: {
    fontSize: 11,
    fontWeight: "900",
    marginRight: 2,
  },
  healthNote: {
    flexDirection: "row",
    backgroundColor: "#FFF0F5",
    borderRadius: 24,
    padding: 17,
    marginTop: 22,
    borderWidth: 1,
    borderColor: "#F1DCE5",
  },
  healthNoteIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#FCE2EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  healthNoteCopy: {
    flex: 1,
  },
  healthNoteTitle: {
    color: "#7B4059",
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
