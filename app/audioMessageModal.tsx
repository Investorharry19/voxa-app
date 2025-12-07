import AudioVisualizer from "@/components/audioVisual";
import ShareModal from "@/components/ShareModal";
import VoxaGradientButton from "@/components/VoxaGradientButton";
import { Colors } from "@/constants/Colors";
import { useGlobal } from "@/utils/globals";
import { downloadAndSaveVideo } from "@/utils/videoSharing";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Modal as MyModal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import useFetchMessages from "@/hooks/useFetchMessags";
import {
  handleDeleteMessage,
  handleMarkAsRead,
  handleToggleFavorite,
  handleVideoSave,
  handleVideoShare,
} from "@/utils/messageActions";
import Share from "react-native-share";

export default function AudioMessageModal() {
  // Changed to uppercase
  const [shareModalVisible, setShareModaVisible] = useState(false);
  const {
    audioUrl,
    id,
    opened,
  }: { audioUrl: string; id: string; opened: string } = useLocalSearchParams();
  const router = useRouter();
  const [deleteModalVisible, setDeleteModaVisible] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const { messages, setMessages, setFavoriteMessages } = useGlobal();
  const message = messages.filter((message) => message._id == id)[0];

  const { allMessagefetched } = useFetchMessages();

  const updateSeenStatus = async () => {
    await handleMarkAsRead(
      id,
      messages,
      setMessages,
      setFavoriteMessages,
      opened
    );
  };

  useEffect(() => {
    if (allMessagefetched) {
      updateSeenStatus();
    }
  }, [allMessagefetched]);

  const onToggleFavorite = async () => {
    await handleToggleFavorite(
      id,
      messages,
      setMessages,
      setFavoriteMessages
    );
  };

  async function deleteMessage() {
    setDeleteModaVisible(false);
    await handleDeleteMessage(
      id,
      messages,
      setMessages,
      setFavoriteMessages,
      router
    );
  }

  async function createVideoToShare() {
    try {
      setLoadingVideo(true);

      // Download and convert
      const uri: any = await downloadAndSaveVideo(audioUrl);
      setVideoUri(uri);

      setShareModaVisible(true);
    } catch (error) {
      alert("Failed to create video");
      console.error(error);
    } finally {
      setLoadingVideo(false);
    }
  }

  const shareToSocial = async (specific: boolean, app: any = null) => {
    await handleVideoShare(
      videoUri as string,
      specific,
      app,
      setShareModaVisible
    );
  };

  async function downloadLocally() {
    await handleVideoSave(videoUri as string, setShareModaVisible);
  }
  return (
    <ImageBackground
      source={require("../assets/images/bg-image.png")}
      style={styles.container}
    >
      {/* Centered Audio Player Card */}
      <View
        style={{
          backgroundColor: "#ffffffff",
          width: "90%",
          padding: 15,
          borderRadius: 20,
          alignSelf: "center",
        }}
      >
        <View
          style={{
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../assets/images/audio-disk.png")}
            style={{
              width: 180,
              height: 180,
              marginBottom: 10,
              objectFit: "scale-down",
              opacity: 0.4,
            }}
          />
          <View>
            <AudioVisualizer audioFile={audioUrl} />
          </View>
        </View>
      </View>

      {/* Bottom Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "90%",
          marginBottom: -50,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setDeleteModaVisible(true);
          }}
        >
          <Image
            source={require("../assets/images/trash.png")}
            style={{
              width: 50,
              height: 50,
              objectFit: "scale-down",
            }}
          />
        </TouchableOpacity>

        <VoxaGradientButton
          disable={loadingVideo}
          style={{ marginTop: 0 }}
          onPress={() => createVideoToShare()}
        >
          {loadingVideo ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text
              style={{
                fontFamily: "Regular",
                color: "white",
                paddingHorizontal: 15,
              }}
            >
              Share Message
            </Text>
          )}
        </VoxaGradientButton>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onToggleFavorite()}
          style={{ backgroundColor: "white", borderRadius: 100, padding: 8 }}
        >
          {message?.isStarred === true ? (
            <Image
              source={require("../assets/images/magic-star-2.png")}
              style={{
                width: 35,
                height: 35,
                objectFit: "scale-down",
              }}
            />
          ) : (
            <Image
              source={require("../assets/images/magic-star.png")}
              style={{
                width: 35,
                height: 35,
                objectFit: "scale-down",
              }}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* delete modal */}

      {true && (
        <MyModal
          transparent
          animationType="fade"
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModaVisible(false)}
        >
          <BlurView style={styles.overlay} intensity={100} tint="dark">
            <View style={styles.modalBox}>
              {/* Trash Icon */}
              <Image
                source={require("../assets/images/trash-red.png")}
                style={styles.icon}
              />

              {/* Title */}
              <Text style={styles.title}>Delete this Message</Text>

              {/* Subtitle */}
              <Text style={styles.subtitle}>
                Do you want to delete this message?{"\n"}This action cannot be
                undone
              </Text>

              {/* Buttons */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setDeleteModaVisible(false)}
                  activeOpacity={0.8}
                  style={buttons.buttonWrapper}
                >
                  <LinearGradient
                    colors={["#d7d7d7", "#aaa", "#a2a2a2"]}
                    locations={[0, 0.6667, 0.9687]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={buttons.gradient}
                  >
                    <Text
                      style={{ ...buttons.buttonText, fontFamily: "Regular" }}
                    >
                      Cancel
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    deleteMessage();
                  }}
                  activeOpacity={0.8}
                  style={buttons.buttonWrapper} // Changed from buttons.buttonWrapper
                >
                  <LinearGradient
                    colors={["#fe5b51", "#fe2e22", "#ff3b30"]} // Removed extra space after "#fe2e22 "
                    locations={[0, 0.6667, 0.9687]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={buttons.gradient} // Changed from buttons.gradient
                  >
                    <Text
                      style={{ ...buttons.buttonText, fontFamily: "Regular" }} // Changed from buttons.buttonText
                    >
                      Delete
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </MyModal>
      )}

      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModaVisible(false)}
      >
        <View style={styles.shareContainer}>
          {/*  */}
          <TouchableOpacity
            onPress={() => shareToSocial(true, Share.Social.SNAPCHAT)}
            style={styles.shareIconContainer}
          >
            <Image
              source={require("../assets/images/share/snap.png")}
              style={styles.shareIconImage}
            />
            <Text style={styles.shareText}>Snapchat </Text>
          </TouchableOpacity>
          {/*  */}
          <TouchableOpacity
            onPress={() => shareToSocial(true, Share.Social.WHATSAPP)}
            style={styles.shareIconContainer}
          >
            <Image
              source={require("../assets/images/share/whatsapp.png")}
              style={styles.shareIconImage}
            />
            <Text style={styles.shareText}>Whatsapp</Text>
          </TouchableOpacity>

          {/* <Image
          <TouchableOpacity
            onPress={() => shareToSocial(true, Share.Social.FACEBOOK_STORIES)}
            style={styles.shareIconContainer}
          >
            <Image
              source={require("../assets/images/share/stories.png")}
              style={styles.shareIconImage}
            />
            <Text style={styles.shareText}>Stories</Text>
          </TouchableOpacity> */}

          {/*  */}

          <TouchableOpacity
            onPress={() => shareToSocial(true, Share.Social.FACEBOOK)}
            style={styles.shareIconContainer}
          >
            <Image
              source={require("../assets/images/share/feeds.png")}
              style={styles.shareIconImage}
            />
            <Text style={styles.shareText}>Facebook </Text>
          </TouchableOpacity>
          {/*  */}

          <TouchableOpacity
            onPress={() => shareToSocial(true, Share.Social.INSTAGRAM)}
            style={styles.shareIconContainer}
          >
            <Image
              source={require("../assets/images/share/insta.png")}
              style={styles.shareIconImage}
            />
            <Text style={styles.shareText}>Instagram </Text>
          </TouchableOpacity>

          {/*  */}
          <TouchableOpacity
            onPress={() => shareToSocial(false, null)}
            style={styles.shareIconContainer}
          >
            <Image
              source={require("../assets/images/share/more.png")}
              style={styles.shareIconImage}
            />
            <Text style={styles.shareText}>More </Text>
          </TouchableOpacity>
          {/*  */}
          <TouchableOpacity
            onPress={() => downloadLocally()}
            style={styles.shareIconContainer}
          >
            <Image
              source={require("../assets/images/share/download.png")}
              style={styles.shareIconImage}
            />
            <Text style={styles.shareText}>Download </Text>
          </TouchableOpacity>
        </View>
      </ShareModal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#ffcb97",
    backgroundSize: "20px",
  },
  shareContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    alignItems: "stretch",
  },
  shareIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "25%",
    // backgroundColor: "red",
    marginVertical: 10,
  },
  shareIconImage: {
    width: 45,
    height: 45,
    objectFit: "scale-down",
  },
  shareText: {
    fontFamily: "Regular",
    fontSize: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
    tintColor: "#FF3B30",
  },
  title: {
    fontSize: 18,
    fontFamily: "Regular",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Regular",
  },
  modalBox: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
});

const buttons = StyleSheet.create({
  buttonWrapper: {
    borderRadius: 150,
    borderWidth: 0.5,
    borderColor: "#ffffff",
    // Outer shadows
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.25,
        shadowRadius: 0.5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  gradient: {
    paddingVertical: 12,
    borderRadius: 30,
    paddingHorizontal: 35,
    alignItems: "center",
    justifyContent: "center",
    // Inner shadows (approximated with border)
    borderTopWidth: 0.5,
    borderTopColor: "rgba(202, 189, 182, 0.3)",
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(165, 157, 157, 0.3)",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
