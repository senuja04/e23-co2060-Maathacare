import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";

import {
  Briefcase,
  CalendarDays,
  Camera,
  ChevronRight,
  Globe,
  Home,
  Key,
  LogOut,
  MapPin,
  Settings,
  User,
  Users,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PhmAppointments from "../../components/phmAppointments/PhmAppointments";
import { API_BASE_URL } from "../../constants/apiConfig";

const { width } = Dimensions.get("window");

const THEME = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#EFF6FF",
  bg: "#F0F4F8", // Soft professional light blue background
  surface: "#FFFFFF",
  textHeader: "#0F172A",
  textMuted: "#64748B",
  iconBg: "#E2E8F0",
  border: "#CBD5E1",
  dangerBg: "#FEF2F2",
  dangerBorder: "#FECACA",
  dangerText: "#EF4444",
};

const ExpandableListItem = ({
  icon: Icon,
  title,
  isExpanded,
  onPress,
  children,
}: any) => (
  <View style={styles.expandableWrapper}>
    <TouchableOpacity
      style={styles.listItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.listItemLeft}>
        <View style={styles.iconBox}>
          <Icon color={THEME.primary} size={18} />
        </View>
        <Text style={styles.listItemTitle}>{title}</Text>
      </View>
      <View style={styles.listItemRight}>
        <ChevronRight
          color={THEME.textMuted}
          size={18}
          style={{ transform: [{ rotate: isExpanded ? "90deg" : "0deg" }] }}
        />
      </View>
    </TouchableOpacity>
    {isExpanded && <View style={styles.expandedContentArea}>{children}</View>}
  </View>
);

export default function PHMDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [phmInfo, setPhmInfo] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "Home" | "Appointment" | "Profile"
  >("Home");

  const [isMothersPageVisible, setIsMothersPageVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchNic, setSearchNic] = useState("");

  const { t, i18n } = useTranslation();

  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const [selectedLang, setSelectedLang] = useState(
    i18n.language === "si"
      ? "සිංහල"
      : i18n.language === "ta"
        ? "தமிழ்"
        : "English",
  );

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedMothers, setSelectedMothers] = useState<any[]>([]);
  const [isSelectingDate, setIsSelectingDate] = useState(false);
  const [date, setDate] = useState(new Date());
  const [remarks, setRemarks] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time" | "datetime">(
    "date",
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [profileImage, setProfileImage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, []),
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.replace("/");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const [profileRes, patientsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/phm/me`, { headers }),
        fetch(`${API_BASE_URL}/api/phm/patients`, { headers }),
      ]);
      if (profileRes.ok) {
        const data = await profileRes.json();
        setPhmInfo(data);
        if (data.profilePictureUrl) {
          setProfileImage(`${data.profilePictureUrl}?v=${Date.now()}`);
        }
      }
      if (patientsRes.ok) {
        const patientData = await patientsRes.json();
        setPatients(patientData);
      }
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please grant gallery permissions to change your picture.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);

      try {
        const token = await AsyncStorage.getItem("userToken");
        const formData = new FormData();
        formData.append("file", {
          uri: imageUri,
          name: result.assets[0].fileName || "profile.jpg",
          type: result.assets[0].mimeType || "image/jpeg",
        } as any);

        const response = await fetch(`${API_BASE_URL}/api/phm/update-profile-picture`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        setProfileImage(`${data.profilePictureUrl}?v=${Date.now()}`);
      } catch (err) {
        console.log("Profile picture upload error:", err);
        Alert.alert("Upload failed", "Could not save the profile picture.");
      }
    }
  };

  const handleAssignMother = async () => {
    if (!searchNic) return;
    const token = await AsyncStorage.getItem("userToken");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/phm/assign-mother/${searchNic}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        Alert.alert("Success", "Patient successfully linked.");
        setSearchNic("");
        setAssignModalVisible(false);
        loadDashboardData();
      } else {
        const errorMsg = await response.text();
        Alert.alert("Error", errorMsg);
      }
    } catch (error) {
      console.error("Assignment Error:", error);
    }
  };

  const toggleMotherSelection = (mother: any) => {
    if (selectedMothers.some((m) => m.id === mother.id)) {
      setSelectedMothers(selectedMothers.filter((m) => m.id !== mother.id));
    } else {
      setSelectedMothers([...selectedMothers, mother]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedMothers.length === patients.length) {
      setSelectedMothers([]);
    } else {
      setSelectedMothers([...patients]);
    }
  };

  const handleSaveAppointment = async () => {
    if (selectedMothers.length === 0) return;
    const token = await AsyncStorage.getItem("userToken");
    try {
      const promises = selectedMothers.map((mother) => {
        const payload = {
          mother: { id: mother.id },
          phm: { id: phmInfo?.id },
          appointmentDate: date.toISOString(),
          status: "SCHEDULED",
          remarks: remarks || "Routine Checkup",
          location: phmInfo?.mohArea || "Health Center",
        };
        return fetch(`${API_BASE_URL}/api/appointments/schedule`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      });
      const results = await Promise.all(promises);
      if (results.every((res) => res.ok)) {
        Alert.alert(
          "Success",
          `Scheduled appointments for ${selectedMothers.length} patients!`,
        );
        setModalVisible(false);
        setRemarks("");
        setSelectedMothers([]);
        setIsSelectingDate(false);
        setShowPicker(false);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        Alert.alert("Partial Error", "Some appointments failed to save.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to server.");
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "ios") {
      if (selectedDate) setDate(selectedDate);
    } else {
      if (event.type === "dismissed") {
        setShowPicker(false);
        return;
      }
      if (event.type === "set" && selectedDate) setDate(selectedDate);
      if (pickerMode === "date" && event.type === "set") {
        setShowPicker(false);
        setPickerMode("time");
        setTimeout(() => setShowPicker(true), 100);
      } else if (pickerMode === "time") {
        setShowPicker(false);
      }
    }
  };

  const calculatePregnancyWeek = (lmp: string) => {
    if (!lmp) return "N/A";
    const diffInMs = new Date().getTime() - new Date(lmp).getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7));
  };

  const renderHome = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.homeWrapper}>

      {/* 1. Welcome Section (Not a Card: Large distinct typography) */}
      <View style={styles.topBannerContainer}>
        <Text style={styles.welcomeSubtitle}>WELCOME BACK,</Text>
        <Text style={styles.welcomeTitle} numberOfLines={1}>
          {phmInfo?.fullName || "A. Weerasinghe"}
        </Text>
        <Text style={styles.welcomeRole}>Public Health Midwife</Text>
      </View>

      {/* 2. Service Area: The single prominent visual anchor card */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeaderRow}>
          <View>
            <Text style={styles.heroSubLabel}>SERVICE AREA</Text>
            <Text style={styles.heroTitle}>{phmInfo?.mohArea || "Akurana"}</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{phmInfo?.mohArea?.charAt(0) || "A"}</Text>
          </View>
        </View>

        <View style={styles.heroDivider} />

        <View style={styles.heroFooterRow}>
          <View style={styles.heroInfoItem}>
            <MapPin size={14} color="#93C5FD" style={{ marginRight: 6 }} />
            <Text style={styles.heroInfoText}>{phmInfo?.mohArea || "Akurana"}</Text>
          </View>
        </View>
      </View>

      {/* 3. Overview: Horizontal connected dashboard strip */}
      <View style={styles.overviewStripCard}>
        <View style={styles.overviewItem}>
          <Text style={styles.overviewNumber}>{patients.length}</Text>
          <Text style={styles.overviewLabel}>Total Mothers</Text>
        </View>
        <View style={styles.overviewDividerVertical} />
        <View style={styles.overviewItem}>
          <Text style={styles.overviewNumber}>{phmInfo?.mohArea ? "1" : "0"}</Text>
          <Text style={styles.overviewLabel}>Active Zones</Text>
        </View>
      </View>

      {/* 4. Quick Actions: Hierarchy layout (Large primary action + compact secondary row) */}
      <View style={styles.actionSectionContainer}>
        <Text style={styles.sectionHeaderTitle}>QUICK ACTIONS</Text>

        {/* Primary Action Card (Larger visual footprint) */}
        <TouchableOpacity
          style={styles.primaryActionCard}
          onPress={() => setIsMothersPageVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.primaryActionTop}>
            <View style={styles.primaryIconBox}>
              <Users color="#1D4ED8" size={24} />
            </View>
            <ChevronRight color={THEME.textMuted} size={20} />
          </View>
          <View style={styles.primaryActionContent}>
            <Text style={styles.primaryActionTitle}>{t("assignedMothers") || "Assigned Mothers"}</Text>
            <Text style={styles.primaryActionSub}>Manage your active patient registry and records</Text>
          </View>
        </TouchableOpacity>

        {/* Secondary Action Row (Compact horizontal button) */}
        <TouchableOpacity
          style={styles.secondaryActionCard}
          onPress={() => setActiveTab("Appointment")}
          activeOpacity={0.8}
        >
          <View style={styles.secondaryLeftGroup}>
            <View style={styles.secondaryIconBox}>
              <CalendarDays color="#D97706" size={20} />
            </View>
            <View style={styles.secondaryTextGroup}>
              <Text style={styles.secondaryActionTitle}>Scheduled Clinics</Text>
              <Text style={styles.secondaryActionSub}>View upcoming appointments</Text>
            </View>
          </View>
          <ChevronRight color={THEME.textMuted} size={18} />
        </TouchableOpacity>
      </View>

    </ScrollView>
  );

  const renderProfile = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.topHeaderRow}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>{t("profileOverview") || "Profile Overview"}</Text>
        <TouchableOpacity onPress={() => setSettingsModalVisible(true)}>
          <Settings color={THEME.textHeader} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarInner}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {phmInfo?.fullName?.charAt(0) || "S"}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.cameraBadge}
            onPress={handlePickImage}
            activeOpacity={0.7}
          >
            <Camera color={THEME.textMuted} size={14} />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{phmInfo?.fullName || "Sahana"}</Text>
        <Text style={styles.role}>Public Health Midwife</Text>

        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() =>
            router.push({
              pathname: "/phm/edit-phm-profile",
              params: {
                userId: phmInfo?.id || phmInfo?.userId,
                fullName: phmInfo?.fullName,
                contactNumber: phmInfo?.contactNumber || phmInfo?.phoneNumber,
                mohArea: phmInfo?.mohArea,
                gnDivision: phmInfo?.gnDivision,
              },
            })
          }
        >
          <Text style={styles.editProfileText}>✏️ {t("editProfile") || "Edit Profile"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t("myInformation") || "My Information"}</Text>
      <View style={styles.listCard}>
        <ExpandableListItem
          icon={User}
          title={t("personalDetails") || "Personal Details"}
          isExpanded={expandedSection === "personal"}
          onPress={() => toggleSection("personal")}
        >
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("fullName") || "Full Name"}</Text>
            <Text style={styles.detailValue}>{phmInfo?.fullName || "N/A"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("phoneNumber") || "Phone Number"}</Text>
            <Text style={styles.detailValue}>
              {phmInfo?.contactNumber || "Not Set"}
            </Text>
          </View>
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>{t("emailAddress") || "Email Address"}</Text>
            <Text style={styles.detailValue}>
              {phmInfo?.email || "No Email"}
            </Text>
          </View>
        </ExpandableListItem>
        <View style={styles.listDivider} />
        <ExpandableListItem
          icon={Briefcase}
          title={t("professionalDetails") || "Professional Details"}
          isExpanded={expandedSection === "professional"}
          onPress={() => toggleSection("professional")}
        >
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("province") || "Province"}</Text>
            <Text style={styles.detailValue}>
              {phmInfo?.province || "Central Province"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("district") || "District"}</Text>
            <Text style={styles.detailValue}>
              {phmInfo?.district || "Kandy"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("mohArea") || "MOH Area"}</Text>
            <Text style={styles.detailValue}>{phmInfo?.mohArea || "N/A"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("gnDivision") || "GN Division"}</Text>
            <Text style={styles.detailValue}>
              {phmInfo?.gnDivision || "N/A"}
            </Text>
          </View>
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>{t("phmId") || "PHM ID"}</Text>
            <Text style={styles.detailValue}>
              {phmInfo?.staffId || phmInfo?.registrationNumber || "Pending"}
            </Text>
          </View>
        </ExpandableListItem>
      </View>

      <Text style={styles.sectionTitle}>{t("systemPreferences") || "System Preferences"}</Text>
      <View style={styles.listCard}>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => setLangModalVisible(true)}
        >
          <View style={styles.listItemLeft}>
            <View style={styles.iconBox}>
              <Globe color={THEME.primary} size={18} />
            </View>
            <Text style={styles.listItemTitle}>{t("language") || "Language"}</Text>
          </View>
          <View style={styles.listItemRight}>
            <Text style={styles.listItemValue}>{selectedLang}</Text>
            <ChevronRight color={THEME.textMuted} size={18} />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          await AsyncStorage.clear();
          router.replace("/");
        }}
      >
        <LogOut color={THEME.dangerText} size={18} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>{t("secureLogout") || "Secure Logout"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const languageOptions = [
    { label: "English", code: "en" },
    { label: "සිංහල", code: "si" },
    { label: "தமிழ்", code: "ta" },
  ];

  const renderAppointmentModal = () => (
    <Modal visible={modalVisible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>New Appointment</Text>
          {!isSelectingDate ? (
            <View>
              <View style={styles.selectAllHeaderRow}>
                <Text style={styles.modalSub}>
                  Select patients to schedule:
                </Text>
                <TouchableOpacity onPress={toggleSelectAll}>
                  <Text style={styles.selectAllText}>
                    {selectedMothers.length === patients.length &&
                    patients.length > 0
                      ? "Deselect All"
                      : "Select All"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.patientListContainer}>
                <FlatList
                  data={patients}
                  keyExtractor={(item: any) => item.id.toString()}
                  renderItem={({ item }) => {
                    const isSelected = selectedMothers.some(
                      (m) => m.id === item.id,
                    );
                    return (
                      <TouchableOpacity
                        style={[
                          styles.motherSelectBtn,
                          isSelected && styles.motherSelectBtnActive,
                        ]}
                        onPress={() => toggleMotherSelection(item)}
                      >
                        <View>
                          <Text
                            style={[
                              styles.motherSelectText,
                              isSelected && { color: "white" },
                            ]}
                          >
                            {item.fullName}
                          </Text>
                          <Text
                            style={[
                              styles.motherSelectNic,
                              isSelected && { color: "#E2E8F0" },
                            ]}
                          >
                            NIC: {item.nic}
                          </Text>
                        </View>
                        {isSelected && (
                          <Text style={styles.checkIcon}>✓</Text>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setSelectedMothers([]);
                    setIsSelectingDate(false);
                    setShowPicker(false);
                  }}
                  style={[styles.modalBtn, { backgroundColor: "#F1F5F9" }]}
                >
                  <Text style={{ color: "#475569", fontWeight: "bold" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={selectedMothers.length === 0}
                  onPress={() => setIsSelectingDate(true)}
                  style={[
                    styles.modalBtn,
                    {
                      backgroundColor:
                        selectedMothers.length > 0 ? THEME.primary : "#94A3B8",
                    },
                  ]}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    Next ({selectedMothers.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.selectedMotherRow}>
                <Text style={styles.modalSub}>
                  {selectedMothers.length === 1
                    ? `Patient: ${selectedMothers[0].fullName}`
                    : `Scheduling for ${selectedMothers.length} Patients`}
                </Text>
                <TouchableOpacity onPress={() => setIsSelectingDate(false)}>
                  <Text style={styles.changePatientText}>Edit List</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setPickerMode(
                    Platform.OS === "ios" ? "datetime" : "date",
                  );
                  setShowPicker(!showPicker);
                }}
                style={styles.dateSelectorButton}
              >
                <Text
                  style={styles.dateSelectorText}
                >{`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} at ${String(date.getHours() % 12 || 12).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")} ${date.getHours() >= 12 ? "PM" : "AM"}`}</Text>
              </TouchableOpacity>
              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode={pickerMode}
                  is24Hour={false}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeDate}
                  themeVariant="light"
                  textColor="#000000"
                />
              )}
              <TextInput
                style={styles.modalInput}
                placeholder="Reason (e.g. Routine Clinic)"
                placeholderTextColor="#94A3B8"
                value={remarks}
                onChangeText={setRemarks}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setIsSelectingDate(false)}
                  style={[styles.modalBtn, { backgroundColor: "#F1F5F9" }]}
                >
                  <Text style={{ color: "#475569", fontWeight: "bold" }}>
                    Back
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveAppointment}
                  style={[styles.modalBtn, { backgroundColor: THEME.primary }]}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );

  if (isMothersPageVisible) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />
        <View style={styles.modernHeader}>
          <TouchableOpacity
            onPress={() => setIsMothersPageVisible(false)}
            style={styles.backBtnWrapper}
          >
            <ChevronRight
              color={THEME.textHeader}
              size={24}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>
          <Text style={styles.modernHeaderTitle}>{t("assignedMothers") || "Assigned Mothers"}</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchBarModern}
              placeholder="Search records..."
              placeholderTextColor={THEME.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={patients.filter((p) =>
              p.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
            )}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={({ item }: any) => (
              <View style={styles.motherPremiumCard}>
                <View style={styles.avatarPremium}>
                  <Text style={styles.avatarPremiumText}>
                    {item.fullName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.motherCardContent}>
                  <Text style={styles.cardMotherName} numberOfLines={1}>
                    {item.fullName}
                  </Text>
                  <View style={styles.modernPill}>
                    <Text style={styles.modernPillText}>
                      Week {calculatePregnancyWeek(item.lastMenstrualPeriod)}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardFooterActions}>
                  <TouchableOpacity
                    style={styles.footerActionBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/phm/view-visits",
                        params: {
                          motherId: item.id,
                          motherName: item.fullName,
                        },
                      })
                    }
                  >
                    <Text style={styles.footerActionText}>📊</Text>
                  </TouchableOpacity>
                  <View style={styles.actionDivider} />
                  <TouchableOpacity
                    style={styles.footerActionBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/phm/record-visit",
                        params: {
                          motherId: item.id,
                          motherName: item.fullName,
                        },
                      })
                    }
                  >
                    <Text style={styles.footerActionText}>📝</Text>
                  </TouchableOpacity>
                  <View style={styles.actionDivider} />
                  <TouchableOpacity
                    style={styles.footerActionBtn}
                    onPress={() => {
                      setSelectedMothers([item]);
                      setIsSelectingDate(true);
                      setDate(new Date());
                      setRemarks("");
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.footerActionText}>📅</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>

        {renderAppointmentModal()}
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />
      <View style={{ flex: 1 }}>
        {activeTab === "Home" && renderHome()}
        {activeTab === "Appointment" && (
          <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
            <View style={styles.pageTitleHeader}>
              <Text style={styles.pageTitleText}>Appointments</Text>
            </View>
            <PhmAppointments
              phmUserId={phmInfo?.user?.userId || phmInfo?.userId}
              refreshTrigger={refreshTrigger}
              onAddNew={() => {
                setSelectedMothers([]);
                setIsSelectingDate(false);
                setDate(new Date());
                setRemarks("");
                setModalVisible(true);
              }}
            />
          </SafeAreaView>
        )}
        {activeTab === "Profile" && (
          <View style={{ flex: 1, backgroundColor: THEME.bg }}>
            {renderProfile()}
          </View>
        )}
      </View>

      <View style={styles.modernTabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab("Home")}
          style={styles.tabButton}
        >
          <View
            style={[
              styles.tabIconWrapper,
              activeTab === "Home" && styles.tabActiveBg,
            ]}
          >
            <Home
              color={activeTab === "Home" ? THEME.primary : THEME.textMuted}
              size={24}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("Appointment")}
          style={styles.tabButton}
        >
          <View
            style={[
              styles.tabIconWrapper,
              activeTab === "Appointment" && styles.tabActiveBg,
            ]}
          >
            <CalendarDays
              color={
                activeTab === "Appointment" ? THEME.primary : THEME.textMuted
              }
              size={24}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("Profile")}
          style={styles.tabButton}
        >
          <View
            style={[
              styles.tabIconWrapper,
              activeTab === "Profile" && styles.tabActiveBg,
            ]}
          >
            <User
              color={activeTab === "Profile" ? THEME.primary : THEME.textMuted}
              size={24}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* 🌟 INLINED SETTINGS MODAL */}
      <Modal
        visible={settingsModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("profileSettings") || "Profile Settings"}</Text>
            <TouchableOpacity
              style={styles.settingsOptionBtn}
              onPress={() => {
                setSettingsModalVisible(false);
                router.push("/phm/change-password" as any);
              }}
            >
              <View style={styles.iconBox}>
                <Key color={THEME.primary} size={18} />
              </View>
              <Text style={styles.settingsOptionText}>Change Password</Text>
              <ChevronRight color={THEME.textMuted} size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalBtn,
                { backgroundColor: THEME.iconBg, marginTop: 16 },
              ]}
              onPress={() => setSettingsModalVisible(false)}
            >
              <Text
                style={{
                  color: THEME.textHeader,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🌟 INLINED LANGUAGE MODAL */}
      <Modal visible={langModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            {languageOptions.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.langOptionBtn}
                onPress={() => {
                  i18n.changeLanguage(lang.code);
                  setSelectedLang(lang.label);
                  setLangModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.langOptionText,
                    selectedLang === lang.label && {
                      color: THEME.primary,
                      fontWeight: "700",
                    },
                  ]}
                >
                  {lang.label}
                </Text>
                {selectedLang === lang.label && (
                  <Text
                    style={{
                      color: THEME.primary,
                      fontWeight: "bold",
                      fontSize: 18,
                    }}
                  >
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.modalBtn,
                { backgroundColor: THEME.iconBg, marginTop: 16 },
              ]}
              onPress={() => setLangModalVisible(false)}
            >
              <Text
                style={{
                  color: THEME.textHeader,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {renderAppointmentModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: THEME.bg },
  container: { flex: 1, backgroundColor: THEME.bg },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: THEME.bg },
  pageTitleHeader: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: THEME.bg,
  },
  pageTitleText: {
    fontSize: 28,
    fontWeight: "800",
    color: THEME.textHeader,
    letterSpacing: -0.5,
  },
  homeWrapper: { flexGrow: 1, backgroundColor: THEME.bg, paddingBottom: 40 },

  /* 1. Welcome Section Styles (Not a card) */
  topBannerContainer: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  welcomeSubtitle: {
    fontSize: 30,
    fontWeight: "800",
    color: THEME.primary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  welcomeTitle: {
    color: THEME.textHeader,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  welcomeRole: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.textMuted,
  },

  /* 2. Service Area Hero Card Style */
  heroCard: {
    backgroundColor: THEME.primary,
    borderRadius: 24,
    padding: 22,
    marginHorizontal: 24,
    marginBottom: 16,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  heroHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroSubLabel: {
    color: "#93C5FD",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },
  heroBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 14,
  },
  heroFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroInfoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroInfoText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  /* 3. Overview Strip Card Style */
  overviewStripCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  overviewItem: {
    flex: 1,
    alignItems: "center",
  },
  overviewNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: THEME.textHeader,
    marginBottom: 2,
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  overviewDividerVertical: {
    width: 1,
    height: 32,
    backgroundColor: THEME.border,
  },

  /* 4. Quick Actions Hierarchy Styles */
  actionSectionContainer: {
    paddingHorizontal: 24,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  primaryActionCard: {
    backgroundColor: THEME.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryActionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  primaryIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: THEME.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryActionContent: {
    marginTop: 2,
  },
  primaryActionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.textHeader,
    marginBottom: 4,
  },
  primaryActionSub: {
    fontSize: 13,
    color: THEME.textMuted,
    fontWeight: "500",
    lineHeight: 18,
  },
  secondaryActionCard: {
    backgroundColor: THEME.surface,
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  secondaryLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  secondaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  secondaryTextGroup: {
    flex: 1,
  },
  secondaryActionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.textHeader,
    marginBottom: 2,
  },
  secondaryActionSub: {
    fontSize: 12,
    color: THEME.textMuted,
    fontWeight: "500",
  },

  /* Standard Component Styles */
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  topHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    marginBottom: 30,
  },
  headerTitle: {
    color: THEME.textHeader,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  profileSection: { alignItems: "center", marginBottom: 24 },
  avatarWrapper: { position: "relative", marginBottom: 16 },
  profileImage: { width: "100%", height: "100%", borderRadius: 24 },
  avatarInner: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: THEME.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: THEME.primaryLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  avatarText: { fontSize: 36, fontWeight: "800", color: THEME.primary },
  cameraBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: THEME.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: THEME.textHeader,
    marginBottom: 4,
  },
  role: { fontSize: 14, color: THEME.textMuted, fontWeight: "500" },
  editProfileBtn: {
    marginTop: 16,
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editProfileText: { color: "white", fontSize: 14, fontWeight: "700" },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
    marginTop: 10,
  },
  listCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    paddingVertical: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  expandableWrapper: { overflow: "hidden" },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  listItemLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  listItemTitle: { fontSize: 15, fontWeight: "600", color: THEME.textHeader },
  listItemRight: { flexDirection: "row", alignItems: "center" },
  listItemValue: {
    fontSize: 14,
    color: THEME.textMuted,
    marginRight: 8,
    fontWeight: "500",
  },
  listDivider: {
    height: 1,
    backgroundColor: THEME.border,
    marginLeft: 66,
    marginRight: 16,
  },
  expandedContentArea: {
    backgroundColor: THEME.bg,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  detailLabel: { fontSize: 13, color: THEME.textMuted, fontWeight: "500" },
  detailValue: { fontSize: 14, color: THEME.textHeader, fontWeight: "700" },
  logoutBtn: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: THEME.dangerBorder,
    backgroundColor: THEME.dangerBg,
    paddingVertical: 18,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
  },
  logoutText: { color: THEME.dangerText, fontWeight: "700", fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: THEME.surface,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    elevation: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.textHeader,
    marginBottom: 8,
  },
  modalSub: {
    color: THEME.textMuted,
    marginBottom: 20,
    fontSize: 14,
    fontWeight: "500",
  },
  modalInput: {
    backgroundColor: THEME.iconBg,
    padding: 16,
    borderRadius: 12,
    color: THEME.textHeader,
    fontSize: 15,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },
  modalBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  settingsOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.iconBg,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  settingsOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: THEME.textHeader,
    marginLeft: 14,
  },
  langOptionBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  langOptionText: { fontSize: 15, color: THEME.textHeader, fontWeight: "500" },
  selectAllHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  selectAllText: {
    color: THEME.primary,
    fontWeight: "600",
    marginBottom: 16,
    fontSize: 14,
  },
  patientListContainer: {
    maxHeight: 200,
    marginBottom: 16,
    backgroundColor: THEME.iconBg,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  motherSelectBtn: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  motherSelectBtnActive: {
    backgroundColor: THEME.primaryLight,
    borderBottomColor: THEME.border,
  },
  motherSelectText: {
    fontWeight: "700",
    color: THEME.textHeader,
    fontSize: 15,
  },
  motherSelectNic: {
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 4,
    fontWeight: "500",
  },
  checkIcon: { color: THEME.primaryDark, fontSize: 18, fontWeight: "bold" },
  selectedMotherRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  changePatientText: { color: THEME.primary, fontWeight: "700", fontSize: 14 },
  dateSelectorButton: {
    backgroundColor: THEME.iconBg,
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  dateSelectorText: {
    fontSize: 15,
    color: THEME.textHeader,
    fontWeight: "700",
    textAlign: "center",
  },
  modernHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  backBtnWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: THEME.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  modernHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.textHeader,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchBarModern: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: THEME.textHeader,
    fontWeight: "500",
  },
  motherPremiumCard: {
    backgroundColor: THEME.surface,
    width: "48%",
    borderRadius: 16,
    marginBottom: 16,
    paddingTop: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  avatarPremium: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: THEME.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarPremiumText: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.primaryDark,
  },
  motherCardContent: {
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  cardMotherName: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textHeader,
    marginBottom: 6,
    textAlign: "center",
  },
  modernPill: {
    backgroundColor: THEME.iconBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modernPillText: { fontSize: 10, fontWeight: "600", color: THEME.textMuted },
  cardFooterActions: {
    flexDirection: "row",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    backgroundColor: THEME.iconBg,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  footerActionBtn: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  footerActionText: { fontSize: 14 },
  actionDivider: { width: 1, backgroundColor: THEME.border },
  modernTabBar: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 85 : 70,
    backgroundColor: THEME.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabButton: { justifyContent: "center", alignItems: "center", padding: 10 },
  tabIconWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tabActiveBg: { backgroundColor: THEME.primaryLight },
});