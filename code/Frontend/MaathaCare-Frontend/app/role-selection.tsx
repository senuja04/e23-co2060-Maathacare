import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import { useFonts } from "expo-font";
import { useFocusEffect, useRouter } from "expo-router";
import { LockKeyhole } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const BACKGROUND = "#FEF4F6";

export default function GatewayScreen() {
  const router = useRouter();
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  const { height } = useWindowDimensions();

  const isCompact = height < 760;
  const isTall = height > 850;

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useFocusEffect(
      useCallback(() => {
        const checkLoginStatus = async () => {
          try {
            setIsCheckingUser(true);

            const userToken = await AsyncStorage.getItem("userToken");
            const userRole = await AsyncStorage.getItem("userRole");

            console.log(
                "Gateway Check - Token exists:",
                !!userToken,
                "Role:",
                userRole,
            );

            if (!userToken) {
              setIsCheckingUser(false);
              return;
            }

            if (userRole === "MOTHER") {
              router.replace("/(tabs)");
            } else if (userRole === "PHM") {
              router.replace("/phm/phm_dashboard");
            } else if (userRole === "ADMIN") {
              // router.replace("/admin/admin_hub");
            } else {
              setIsCheckingUser(false);
            }
          } catch (error) {
            console.error("Error checking login status:", error);
            setIsCheckingUser(false);
          }
        };

        checkLoginStatus();
      }, []),
  );

  // =========================================================
  // LOADING
  // =========================================================

  if (isCheckingUser || !fontsLoaded) {
    return (
        <View style={styles.loadingContainer}>
          <Image
              source={require("../assets/images/logo.png")}
              style={styles.loadingLogo}
              resizeMode="contain"
          />

          <ActivityIndicator size="large" color="#D85B94" />

          <Text style={styles.loadingText}>Loading MaathaCare...</Text>
        </View>
    );
  }

  // =========================================================
  // MAIN SCREEN
  // =========================================================

  return (
      <View style={styles.screen}>
        {/* =====================================================
          DECORATIVE BACKGROUND BUBBLES
      ====================================================== */}

        {/* Left side - away from logo */}
        <View style={styles.bubbleTopLeft} />

        {/* Tiny bubble far to the right - below logo */}
        <View style={styles.bubbleUpperRight} />

        {/* Side bubbles */}
        <View style={styles.bubbleLeftMiddle} />
        <View style={styles.bubbleRightMiddle} />

        {/* Bottom decoration */}
        <View style={styles.bubbleBottomLeft} />
        <View style={styles.bubbleBottomRight} />

        <SafeAreaView style={styles.safeArea}>
          <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={[
                styles.scrollContent,
                {
                  minHeight: height,
                },
              ]}
          >
            <View style={styles.page}>
              {/* =================================================
                MAIN CONTENT
            ================================================== */}

              <View>
                {/* =================================================
                  LOGO
              ================================================== */}

                <View
                    style={[
                      styles.logoWrap,
                      {
                        marginTop: isCompact ? 2 : 5,
                        marginBottom: isCompact ? 20 : isTall ? 28 : 24,
                      },
                    ]}
                >
                  <Image
                      source={require("../assets/images/logo.png")}
                      style={[
                        styles.logo,
                        {
                          width: isCompact ? 250 : isTall ? 320 : 295,
                          height: isCompact ? 105 : isTall ? 134 : 122,
                        },
                      ]}
                      resizeMode="contain"
                  />
                </View>

                {/* =================================================
                  HEADING
              ================================================== */}

                <View
                    style={[
                      styles.headerSection,
                      {
                        marginBottom: isCompact ? 21 : isTall ? 31 : 26,
                      },
                    ]}
                >
                  <Text
                      style={[
                        styles.title,
                        {
                          fontSize: isCompact ? 32 : isTall ? 39 : 36,
                          lineHeight: isCompact ? 40 : isTall ? 48 : 44,
                        },
                      ]}
                  >
                    How will you use{"\n"}MaathaCare?
                  </Text>

                  <Text
                      style={[
                        styles.subtitle,
                        {
                          fontSize: isCompact ? 15 : 17,
                        },
                      ]}
                  >
                    Choose your role to get started.
                  </Text>
                </View>

                {/* =================================================
                  ROLE CARDS
              ================================================== */}

                <View style={styles.cardsWrap}>
                  {/* ===============================================
                    MOTHER
                ================================================ */}

                  <TouchableOpacity
                      activeOpacity={0.88}
                      style={styles.cardTouchable}
                      onPress={() => router.push("/mother-login")}
                  >
                    <View
                        style={[
                          styles.card,
                          styles.motherCard,
                          {
                            minHeight: isCompact ? 178 : isTall ? 215 : 198,
                          },
                        ]}
                    >
                      <View
                          style={[
                            styles.imageBox,
                            styles.motherImageBox,
                            {
                              width: isCompact ? 106 : isTall ? 134 : 122,
                              height: isCompact ? 134 : isTall ? 164 : 152,
                            },
                          ]}
                      >
                        <Image
                            source={require("../assets/images/mother.jpeg")}
                            style={styles.roleImage}
                            resizeMode="cover"
                        />
                      </View>

                      <View style={styles.cardTextArea}>
                        <View style={styles.labelRow}>
                          <View style={[styles.dot, styles.motherDot]} />

                          <Text
                              style={[
                                styles.microLabel,
                                styles.motherLabel,
                              ]}
                          >
                            FOR MOTHERS
                          </Text>
                        </View>

                        <Text style={styles.cardTitle}>
                          I&apos;m a Mother
                        </Text>

                        <Text style={styles.cardDescription}>
                          Pregnancy and baby care.
                        </Text>

                        <Text
                            style={[
                              styles.cardAction,
                              styles.motherAction,
                            ]}
                        >
                          Continue as Mother
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* ===============================================
                    HEALTH STAFF
                ================================================ */}

                  <TouchableOpacity
                      activeOpacity={0.88}
                      style={styles.cardTouchable}
                      onPress={() => router.push("/staff-login")}
                  >
                    <View
                        style={[
                          styles.card,
                          styles.staffCard,
                          {
                            minHeight: isCompact ? 178 : isTall ? 215 : 198,
                          },
                        ]}
                    >
                      <View
                          style={[
                            styles.imageBox,
                            styles.staffImageBox,
                            {
                              width: isCompact ? 106 : isTall ? 134 : 122,
                              height: isCompact ? 134 : isTall ? 164 : 152,
                            },
                          ]}
                      >
                        <Image
                            source={require("../assets/images/PHM.jpeg")}
                            style={styles.roleImage}
                            resizeMode="cover"
                        />
                      </View>

                      <View style={styles.cardTextArea}>
                        <View style={styles.labelRow}>
                          <View style={[styles.dot, styles.staffDot]} />

                          <Text
                              style={[
                                styles.microLabel,
                                styles.staffLabel,
                              ]}
                          >
                            CARE TEAM
                          </Text>
                        </View>

                        <Text style={styles.cardTitle}>
                          I&apos;m Health Staff
                        </Text>

                        <Text style={styles.cardDescription}>
                          Support mothers and manage care.
                        </Text>

                        <Text
                            style={[
                              styles.cardAction,
                              styles.staffAction,
                            ]}
                        >
                          Continue as Staff
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* =================================================
                FOOTER - NO BOX
            ================================================== */}

              <View style={styles.footer}>
                <View style={styles.footerIconWrap}>
                  <LockKeyhole
                      size={18}
                      color="#836D79"
                      strokeWidth={1.8}
                  />
                </View>

                <View style={styles.footerTextWrap}>
                  <Text style={styles.footerTitle}>
                    Private and secure
                  </Text>

                  <Text style={styles.footerText}>
                    Your information stays protected.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  // ========================================================
  // ROOT
  // ========================================================

  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
    overflow: "hidden",
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,

    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 20,
  },

  /*
   * Footer is allowed to sit at the bottom,
   * while main content uses most of the screen.
   */
  page: {
    flex: 1,
  },

  // ========================================================
  // DECORATIVE BUBBLES
  // ========================================================

  /*
   * No bubble behind the logo anymore.
   * The top decoration is moved to the LEFT.
   */
  bubbleTopLeft: {
    position: "absolute",

    width: 190,
    height: 190,

    borderRadius: 95,

    backgroundColor: "#F8E1EB",

    top: -125,
    left: -110,

    opacity: 0.72,
  },

  /*
   * Right bubble starts BELOW the logo.
   */
  bubbleUpperRight: {
    position: "absolute",

    width: 74,
    height: 74,

    borderRadius: 37,

    backgroundColor: "#EEE1EF",

    top: 215,
    right: -20,

    opacity: 0.55,
  },

  bubbleLeftMiddle: {
    position: "absolute",

    width: 145,
    height: 145,

    borderRadius: 73,

    backgroundColor: "#EFE4F0",

    top: 290,
    left: -105,

    opacity: 0.62,
  },

  bubbleRightMiddle: {
    position: "absolute",

    width: 92,
    height: 92,

    borderRadius: 46,

    backgroundColor: "#F2E2EC",

    top: 670,
    right: -62,

    opacity: 0.48,
  },

  bubbleBottomLeft: {
    position: "absolute",

    width: 215,
    height: 215,

    borderRadius: 108,

    backgroundColor: "#F8E1EB",

    bottom: -145,
    left: -100,

    opacity: 0.66,
  },

  bubbleBottomRight: {
    position: "absolute",

    width: 105,
    height: 105,

    borderRadius: 53,

    backgroundColor: "#ECE0EF",

    bottom: 35,
    right: -58,

    opacity: 0.42,
  },

  // ========================================================
  // LOADING
  // ========================================================

  loadingContainer: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: BACKGROUND,
  },

  loadingLogo: {
    width: 230,
    height: 110,

    marginBottom: 20,
  },

  loadingText: {
    marginTop: 12,

    fontFamily: "Manrope_600SemiBold",

    fontSize: 14,

    color: "#A85D84",
  },

  // ========================================================
  // LOGO
  // ========================================================

  logoWrap: {
    width: "100%",

    alignItems: "center",
    justifyContent: "center",

    /*
     * Same colour as logo image.
     * No decorative shape enters this area.
     */
    backgroundColor: BACKGROUND,

    zIndex: 10,
  },

  logo: {
    alignSelf: "center",
  },

  // ========================================================
  // HEADING
  // ========================================================

  headerSection: {
    alignItems: "flex-start",
  },

  title: {
    maxWidth: 365,

    fontFamily: "Manrope_700Bold",

    letterSpacing: -1.5,

    color: "#593047",
  },

  subtitle: {
    marginTop: 11,

    fontFamily: "Manrope_400Regular",

    lineHeight: 24,

    color: "#8A737E",
  },

  // ========================================================
  // ROLE CARDS
  // ========================================================

  cardsWrap: {
    width: "100%",
  },

  cardTouchable: {
    width: "100%",

    borderRadius: 30,

    marginBottom: 20,
  },

  card: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    borderRadius: 30,

    paddingHorizontal: 21,
    paddingVertical: 21,

    borderWidth: 1.1,

    backgroundColor: "rgba(255,255,255,0.92)",

    shadowColor: "#745764",

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.07,

    shadowRadius: 15,

    elevation: 3,
  },

  motherCard: {
    borderColor: "#EACFD9",
  },

  staffCard: {
    borderColor: "#E2D7E5",
  },

  // ========================================================
  // IMAGES
  // ========================================================

  imageBox: {
    borderRadius: 24,

    overflow: "hidden",

    marginRight: 20,

    justifyContent: "center",
    alignItems: "center",
  },

  motherImageBox: {
    backgroundColor: "#FBE3EC",
  },

  staffImageBox: {
    backgroundColor: "#EFEAF6",
  },

  roleImage: {
    width: "100%",
    height: "100%",
  },

  // ========================================================
  // CARD TEXT
  // ========================================================

  cardTextArea: {
    flex: 1,

    justifyContent: "center",
    alignItems: "flex-start",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 8,
  },

  dot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    marginRight: 8,
  },

  motherDot: {
    backgroundColor: "#D95A94",
  },

  staffDot: {
    backgroundColor: "#806C80",
  },

  microLabel: {
    fontFamily: "Manrope_700Bold",

    fontSize: 11.5,

    letterSpacing: 1.6,
  },

  motherLabel: {
    color: "#C75A8D",
  },

  staffLabel: {
    color: "#806D7D",
  },

  cardTitle: {
    fontFamily: "Manrope_700Bold",

    fontSize: 25,

    lineHeight: 32,

    letterSpacing: -0.75,

    color: "#583448",

    marginBottom: 7,
  },

  cardDescription: {
    fontFamily: "Manrope_400Regular",

    fontSize: 16,

    lineHeight: 23,

    color: "#7D6B75",

    marginBottom: 12,
  },

  cardAction: {
    fontFamily: "Manrope_600SemiBold",

    fontSize: 14.5,

    lineHeight: 20,
  },

  motherAction: {
    color: "#D24D89",
  },

  staffAction: {
    color: "#705A6E",
  },

  // ========================================================
  // FOOTER
  // ========================================================

  footer: {
    marginTop: "auto",

    minHeight: 70,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingTop: 18,
    paddingBottom: 4,

    /*
     * Intentionally NO background,
     * NO border,
     * NO shadow.
     */
    backgroundColor: BACKGROUND,
  },

  footerIconWrap: {
    width: 38,
    height: 38,

    borderRadius: 19,

    backgroundColor: "#F6E8EF",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  footerTextWrap: {
    justifyContent: "center",
  },

  footerTitle: {
    fontFamily: "Manrope_600SemiBold",

    fontSize: 14,

    lineHeight: 19,

    color: "#715E69",

    marginBottom: 2,
  },

  footerText: {
    fontFamily: "Manrope_400Regular",

    fontSize: 12.5,

    lineHeight: 18,

    color: "#917E88",
  },
});