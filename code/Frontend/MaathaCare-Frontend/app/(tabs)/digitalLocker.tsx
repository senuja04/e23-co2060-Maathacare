import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../../constants/apiConfig";

export default function DigitalLocker() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [motherId, setMotherId] = useState<string | null>(null);

  const { t } = useTranslation();

  // =========================================================
  // LOAD USER
  // =========================================================

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedId = await AsyncStorage.getItem("userId");

        if (storedId) {
          setMotherId(storedId);
        } else {
          setIsLoadingDocs(false);
        }
      } catch (error) {
        setIsLoadingDocs(false);
      }
    };

    loadUserData();
  }, []);

  // =========================================================
  // LOAD DOCUMENTS
  // =========================================================

  useEffect(() => {
    if (motherId) {
      fetchDocuments(motherId);
    }
  }, [motherId]);

  // =========================================================
  // FETCH DOCUMENTS
  // =========================================================

  const fetchDocuments = async (id: string) => {
    try {
      setIsLoadingDocs(true);

      const token = await AsyncStorage.getItem("userToken");

      const response = await axios.get(
        `${API_BASE_URL}/api/medical-records/mother/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDocuments(response.data);
    } catch (error) {
      console.log("Error loading docs");
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // =========================================================
  // UPLOAD
  // =========================================================

  const handleUploadDocument = async () => {
    if (!motherId) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (result.canceled) return;

      const file = result.assets[0];

      setIsUploading(true);

      const formData = new FormData();

      formData.append(
        "file",
        {
          uri: file.uri,
          name: file.name,
          type: "application/pdf",
        } as any,
      );

      formData.append("phoneNumber", motherId);
      formData.append("uploadedByRole", "MOTHER");

      const token = await AsyncStorage.getItem("userToken");

      await axios.post(
        `${API_BASE_URL}/api/medical-records/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchDocuments(motherId);
    } catch (error) {
      Alert.alert("Upload Failed", "An error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id: string) => {
    const token = await AsyncStorage.getItem("userToken");

    try {
      await axios.delete(
        `${API_BASE_URL}/api/medical-records/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDocuments((prevDocs) =>
        prevDocs.filter((doc) => doc.id !== id),
      );
    } catch (error) {
      Alert.alert("Error", "Could not delete.");
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <View style={styles.container}>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {t("myDigitalLocker")}
          </Text>

          <Text style={styles.subtitle}>
            {t("secureStorage")}
          </Text>
        </View>

        <View style={styles.lockIcon}>
          <Ionicons
            name="lock-closed-outline"
            size={23}
            color="#8E74B7"
          />
        </View>
      </View>

      {/* =====================================================
          SUMMARY CARD
      ====================================================== */}

      <View style={styles.summaryCard}>
        {/* Decorative circles */}

        <View style={styles.summaryBubbleOne} />
        <View style={styles.summaryBubbleTwo} />

        <View style={styles.summaryTop}>
          <View style={styles.folderIcon}>
            <Ionicons
              name="folder-open-outline"
              size={29}
              color="#D75E9B"
            />
          </View>

          <View style={styles.summaryTextArea}>
            <Text style={styles.summaryLabel}>
              Digital Health Locker
            </Text>

            <Text style={styles.summaryDescription}>
              Your medical records in one secure place
            </Text>
          </View>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {documents.length}
            </Text>

            <Text style={styles.statLabel}>
              {documents.length === 1
                ? "Document"
                : "Documents"}
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statType}>
              PDF
            </Text>

            <Text style={styles.statLabel}>
              Supported format
            </Text>
          </View>
        </View>
      </View>

      {/* =====================================================
          UPLOAD
      ====================================================== */}

      <TouchableOpacity
        style={[
          styles.uploadButton,
          isUploading && styles.uploadButtonDisabled,
        ]}
        onPress={handleUploadDocument}
        disabled={isUploading}
        activeOpacity={0.85}
      >
        <View style={styles.uploadIcon}>
          {isUploading ? (
            <ActivityIndicator
              color="#D65E98"
              size="small"
            />
          ) : (
            <Ionicons
              name="cloud-upload-outline"
              size={22}
              color="#D65E98"
            />
          )}
        </View>

        <View style={styles.uploadTextArea}>
          <Text style={styles.uploadTitle}>
            {isUploading
              ? "Uploading document..."
              : t("uploadPdf")}
          </Text>

          {!isUploading && (
            <Text style={styles.uploadSubtitle}>
              Add a medical report to your locker
            </Text>
          )}
        </View>

        {!isUploading && (
          <Ionicons
            name="add-circle-outline"
            size={23}
            color="#BA5D8D"
          />
        )}
      </TouchableOpacity>

      {/* =====================================================
          DOCUMENT SECTION TITLE
      ====================================================== */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Your Documents
        </Text>

        {documents.length > 0 && (
          <View style={styles.countBubble}>
            <Text style={styles.countText}>
              {documents.length}
            </Text>
          </View>
        )}
      </View>

      {/* =====================================================
          DOCUMENT LIST
      ====================================================== */}

      {isLoadingDocs ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator
              size="large"
              color="#D65E98"
            />
          </View>

          <Text style={styles.loadingText}>
            Loading your documents...
          </Text>
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            documents.length === 0 &&
              styles.emptyListContent,
          ]}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIllustration}>
                <View style={styles.emptyBackCircle} />

                <Ionicons
                  name="document-text-outline"
                  size={38}
                  color="#B985BC"
                />
              </View>

              <Text style={styles.emptyTitle}>
                Your locker is empty
              </Text>

              <Text style={styles.emptyDescription}>
                Upload your medical documents and keep
                them safely available whenever you need them.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.documentCard,
                index % 2 === 0
                  ? styles.pinkDocumentCard
                  : styles.blueDocumentCard,
              ]}
            >
              {/* Document details */}

              <View style={styles.documentTop}>
                <View
                  style={[
                    styles.documentIcon,
                    index % 2 === 0
                      ? styles.pinkDocumentIcon
                      : styles.blueDocumentIcon,
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={27}
                    color={
                      index % 2 === 0
                        ? "#D75E9B"
                        : "#659ED0"
                    }
                  />
                </View>

                <View style={styles.cardInfo}>
                  <Text
                    style={styles.fileName}
                    numberOfLines={2}
                  >
                    {decodeURIComponent(
                      item.fileName,
                    ).replace(/%20/g, " ")}
                  </Text>

                  <View style={styles.dateRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={13}
                      color="#9C91A0"
                    />

                    <Text style={styles.dateText}>
                      {t("uploadedOn")}{" "}
                      {new Date(
                        item.uploadedAt,
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Actions */}

              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(item.fileUrl)
                  }
                  style={styles.viewButton}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="eye-outline"
                    size={18}
                    color="#755F86"
                  />

                  <Text style={styles.viewText}>
                    {t("viewPdf")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    handleDelete(item.id)
                  }
                  style={styles.deleteButton}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="trash-outline"
                    size={19}
                    color="#C96D79"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({
  // ===========================================================
  // ROOT
  // ===========================================================

  container: {
    flex: 1,
    backgroundColor: "#FFF9FC",
    paddingHorizontal: 22,
    paddingTop: 56,
  },

  // ===========================================================
  // HEADER
  // ===========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  headerText: {
    flex: 1,
    paddingRight: 15,
  },

  title: {
    fontSize: 29,
    lineHeight: 36,
    fontWeight: "800",
    color: "#625470",
    letterSpacing: -0.6,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    color: "#9A90A0",
  },

  lockIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F2ECFA",
    alignItems: "center",
    justifyContent: "center",
  },

  // ===========================================================
  // SUMMARY
  // ===========================================================

  summaryCard: {
    position: "relative",
    overflow: "hidden",

    backgroundColor: "#FCECF4",

    borderRadius: 26,
    padding: 20,

    marginBottom: 16,

    borderWidth: 1,
    borderColor: "#F4DDE9",

    shadowColor: "#8D7586",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.055,
    shadowRadius: 12,

    elevation: 2,
  },

  summaryBubbleOne: {
    position: "absolute",

    width: 140,
    height: 140,

    borderRadius: 70,

    right: -45,
    top: -65,

    backgroundColor: "#EDE7FA",

    opacity: 0.6,
  },

  summaryBubbleTwo: {
    position: "absolute",

    width: 75,
    height: 75,

    borderRadius: 38,

    left: -25,
    bottom: -30,

    backgroundColor: "#F7DCEB",

    opacity: 0.85,
  },

  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },

  folderIcon: {
    width: 56,
    height: 56,

    borderRadius: 18,

    backgroundColor: "#FFF8FB",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 14,
  },

  summaryTextArea: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: "#67566F",
  },

  summaryDescription: {
    marginTop: 4,

    fontSize: 12.5,
    lineHeight: 18,

    color: "#9B8D99",
  },

  summaryStats: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 20,

    borderRadius: 18,

    backgroundColor: "rgba(255,255,255,0.58)",

    paddingVertical: 13,

    zIndex: 2,
  },

  statBox: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
  },

  statDivider: {
    width: 1,
    height: 38,

    backgroundColor: "#E9DAE3",
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#65566E",
  },

  statType: {
    fontSize: 20,
    fontWeight: "800",
    color: "#806A8A",
  },

  statLabel: {
    marginTop: 2,

    fontSize: 10.5,

    color: "#9C909B",
  },

  // ===========================================================
  // UPLOAD
  // ===========================================================

  uploadButton: {
    minHeight: 68,

    borderRadius: 21,

    backgroundColor: "#F3ECFA",

    borderWidth: 1,
    borderColor: "#E9DEF3",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,
    paddingVertical: 12,

    marginBottom: 27,
  },

  uploadButtonDisabled: {
    opacity: 0.7,
  },

  uploadIcon: {
    width: 43,
    height: 43,

    borderRadius: 14,

    backgroundColor: "#FFF6FA",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  uploadTextArea: {
    flex: 1,
  },

  uploadTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#705D7C",
  },

  uploadSubtitle: {
    marginTop: 3,

    fontSize: 11.5,
    lineHeight: 16,

    color: "#A095A4",
  },

  // ===========================================================
  // SECTION
  // ===========================================================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#65576F",
  },

  countBubble: {
    marginLeft: 9,

    minWidth: 26,
    height: 26,

    paddingHorizontal: 7,

    borderRadius: 13,

    backgroundColor: "#F7E5EF",

    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#C15A8A",
  },

  // ===========================================================
  // LIST
  // ===========================================================

  listContent: {
    paddingBottom: 35,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  // ===========================================================
  // DOCUMENT CARD
  // ===========================================================

  documentCard: {
    borderRadius: 23,

    padding: 16,

    marginBottom: 14,

    borderWidth: 1,

    shadowColor: "#806E80",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.045,
    shadowRadius: 9,

    elevation: 2,
  },

  pinkDocumentCard: {
    backgroundColor: "#FFF2F7",
    borderColor: "#F3DDE7",
  },

  blueDocumentCard: {
    backgroundColor: "#F3F7FF",
    borderColor: "#E1EAF7",
  },

  documentTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  documentIcon: {
    width: 52,
    height: 52,

    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,
  },

  pinkDocumentIcon: {
    backgroundColor: "#FFF9FC",
  },

  blueDocumentIcon: {
    backgroundColor: "#FAFCFF",
  },

  cardInfo: {
    flex: 1,
  },

  fileName: {
    fontSize: 15,
    lineHeight: 20,

    fontWeight: "700",

    color: "#5C515F",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 7,
  },

  dateText: {
    marginLeft: 5,

    fontSize: 11.5,

    color: "#9C91A0",
  },

  // ===========================================================
  // CARD ACTIONS
  // ===========================================================

  cardActions: {
    flexDirection: "row",

    marginTop: 15,
  },

  viewButton: {
    flex: 1,

    height: 43,

    borderRadius: 14,

    backgroundColor: "rgba(255,255,255,0.74)",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  viewText: {
    marginLeft: 7,

    fontSize: 13,
    fontWeight: "700",

    color: "#755F86",
  },

  deleteButton: {
    width: 45,
    height: 43,

    borderRadius: 14,

    backgroundColor: "#FFE9EB",

    alignItems: "center",
    justifyContent: "center",
  },

  // ===========================================================
  // LOADING
  // ===========================================================

  loadingContainer: {
    flex: 1,

    alignItems: "center",

    paddingTop: 55,
  },

  loadingCircle: {
    width: 70,
    height: 70,

    borderRadius: 35,

    backgroundColor: "#FCEAF3",

    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 13,

    fontSize: 13,

    color: "#9A8E9B",
  },

  // ===========================================================
  // EMPTY STATE
  // ===========================================================

  emptyState: {
    alignItems: "center",

    paddingHorizontal: 35,
    paddingTop: 45,
  },

  emptyIllustration: {
    width: 82,
    height: 82,

    borderRadius: 41,

    backgroundColor: "#F6F0FA",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 17,

    overflow: "hidden",
  },

  emptyBackCircle: {
    position: "absolute",

    width: 60,
    height: 60,

    borderRadius: 30,

    backgroundColor: "#FCE1EE",

    right: -18,
    bottom: -12,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",

    color: "#62556C",
  },

  emptyDescription: {
    maxWidth: 285,

    marginTop: 7,

    fontSize: 12.5,
    lineHeight: 19,

    textAlign: "center",

    color: "#A095A4",
  },
});