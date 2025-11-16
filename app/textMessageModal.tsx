import ShareModal from "@/components/ShareModal";
import VoxaGradientButton from "@/components/VoxaGradientButton";
import { useGlobal } from "@/utils/globals";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import Share from "react-native-share";
import Toast from "react-native-toast-message";
import ViewShot from "react-native-view-shot";

import useFetchMessages from "@/hooks/useFetchMessags";
import { MessagesRequest } from "@/utils/axios";
import { VoxaMessage } from "@/utils/myTypes";
import { BlurView } from "expo-blur";
import {
  Alert,
  Image,
  ImageBackground,
  Modal as MyModal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function TextMessageModal() {
  const [shareModalVisible, setShareModaVisible] = useState(false);
  const [deleteModalVisible, setDeleteModaVisible] = useState(false);
  const { id, opened, messageText } = useLocalSearchParams();
  const { messages, setMessages, setFavoriteMessages, username } = useGlobal();
  const message = messages.filter((message) => message._id == id)[0];
  const viewRef = useRef<any>(null);
  const { allMessagefetched } = useFetchMessages(username);

  const updateSeenStatus = async () => {
    const recycledMessages = messages;
    const newMessages = messages.map((msg) =>
      msg._id === id ? { ...msg, isOpened: true } : msg
    );
    setMessages(newMessages);
    setFavoriteMessages(newMessages.filter((msg) => msg.isStarred === true));

    if (opened === "true") {
      return;
    }
    try {
      console.log(id);
      await MessagesRequest.seenMessage(id);
    } catch (err) {
      console.log({ err });
      setMessages(recycledMessages);
      setFavoriteMessages(
        recycledMessages.filter((msg) => msg.isStarred === true)
      );
      Toast.show({
        type: "error",
        text1: "Something went wrong... Try again",
        position: "top",
      });
    }
  };

  useEffect(() => {
    if (username && allMessagefetched) {
      updateSeenStatus();
    }
  }, [allMessagefetched]);

  const captureAndShare = async (specific: boolean, app: any = null) => {
    try {
      // 1. Capture view
      const uri = await viewRef.current.capture();
      const fileUri = FileSystem.documentDirectory + "screenshot.jpg";

      // 2. Copy to file system (for sharing)
      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      });

      // 3. Set up share options
      const shareOptions: any = {
        title: "Sharing Screenshot",
        url: Platform.OS === "android" ? `file://${fileUri}` : fileUri,
        type: "image/jpeg",
        message:
          "https://www.voxa.buzz! 📸 \n Send and receive anonymous messageesLine 2",
        failOnCancel: false,
        social: app,
      };

      // 4. App-specific target (if passed)
      if (specific && app) {
        shareOptions.social = app; // e.g., Share.Social.WHATSAPP
        await Share.shareSingle(shareOptions);
      }
      if (specific === false) {
        await Share.open(shareOptions);
      }

      // 5. Share
      setShareModaVisible(false);
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const captureAndSave = async () => {
    try {
      // Capture the view as an image
      const uri = await viewRef.current.capture();
      console.log("Captured image:", uri);

      // Ask for gallery permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please allow media access.");
        return;
      }

      // Save the image to Voxa Messages album
      const asset = await MediaLibrary.createAssetAsync(uri);
      let album = await MediaLibrary.getAlbumAsync("Voxa Messages");

      if (!album) {
        await MediaLibrary.createAlbumAsync("Voxa Messages", asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      Alert.alert("Success", "Image saved to Voxa Messages album!");
      setShareModaVisible(false);
    } catch (error) {
      console.error("Error saving capture:", error);
      Alert.alert("Error", "Could not save image.");
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const f: VoxaMessage[] = [];
      const newMessages = messages.map((x) => {
        console.log(x._id);
        if (x._id == id) {
          x.isStarred = !x.isStarred;
        }
        if (x.isStarred) {
          f.push(x);
        }

        return x;
      });
      setMessages(newMessages);
      console.log(f);
      setFavoriteMessages(f);
      await MessagesRequest.toggleFav(id);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Somethin went wrong",
        position: "top",
      });
    }
  };

  async function deleteMessage() {
    const tempHolder = messages;
    const newMessages = messages.filter((message) => message._id !== id);
    setMessages(newMessages);
    setFavoriteMessages(newMessages.filter((msg) => msg.isStarred === true));
    setDeleteModaVisible(false);

    try {
      await MessagesRequest.deleteMessage(id);
      router.back();
    } catch (error) {
      console.log("Delete error:", error);
      setMessages(tempHolder);
      setFavoriteMessages(tempHolder.filter((msg) => msg.isStarred === true));
      Toast.show({
        type: "error",
        text1: "Failed to delete message",
        position: "top",
      });
    }
  }
  return (
    <ImageBackground
      source={require("../assets/images/bg-image.png")}
      style={styles.container}
    >
      <TouchableOpacity></TouchableOpacity>
      <ViewShot
        ref={viewRef}
        style={{
          backgroundColor: "white",
          width: "90%",
          padding: 15,
          borderRadius: 10,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Image
            source={require("../assets/images/Love-Letter.png")}
            style={{ width: 40, height: 40, marginBottom: 10 }}
          />
          <Image
            source={require("../assets/images/logo.png")}
            style={{
              width: 50,
              height: 50,
              marginBottom: 10,
              objectFit: "scale-down",
              opacity: 0.4,
            }}
          />
        </View>
        <Text style={{ ...styles.shareText, fontSize: 14 }}>{messageText}</Text>
      </ViewShot>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "90%",
          marginBottom: 30,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={{ backgroundColor: "white", borderRadius: 100, padding: 8 }}
          onPress={() => {
            console.log("open");
            setDeleteModaVisible(true);
          }}
        >
          <Image
            source={require("../assets/images/trash-red.png")}
            style={{
              width: 35,
              height: 35,
              objectFit: "scale-down",
            }}
          />
        </TouchableOpacity>

        <VoxaGradientButton
          style={{ marginTop: 0 }}
          onPress={() => setShareModaVisible(true)}
        >
          <Text
            style={{
              fontFamily: "Regular",
              color: "white",
              paddingHorizontal: 15,
            }}
          >
            Share Message
          </Text>
        </VoxaGradientButton>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleToggleFavorite()}
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
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModaVisible(false)}
      >
        <View style={styles.shareContainer}>
          <TouchableOpacity
            onPress={() => captureAndShare(true, Share.Social.TWITTER)}
            style={styles.shareIconContainer}
          >
            <Image
              source={require("../assets/images/share/x.png")}
              style={styles.shareIconImage}
            />
            <Text style={styles.shareText}>X </Text>
          </TouchableOpacity>
          {/*  */}
          <TouchableOpacity
            onPress={() => captureAndShare(true, Share.Social.SNAPCHAT)}
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
            onPress={() => captureAndShare(true, Share.Social.WHATSAPP)}
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
            onPress={() => captureAndShare(true, Share.Social.FACEBOOK_STORIES)}
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
            onPress={() => captureAndShare(true, Share.Social.FACEBOOK)}
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
            onPress={() => captureAndShare(true, Share.Social.INSTAGRAM)}
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
            onPress={() => captureAndShare(false, null)}
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
            onPress={() => captureAndSave()}
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
    </ImageBackground>
  );
}
export default TextMessageModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
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

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  showButton: {
    padding: 14,
    backgroundColor: "#ff4500",
    borderRadius: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
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
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelBtn: {
    backgroundColor: "#E0E0E0",
  },
  deleteBtn: {
    backgroundColor: "#FF3B30",
  },
  cancelText: {
    color: "#333",
    fontFamily: "Regular",
  },
  deleteText: {
    color: "#fff",
    fontFamily: "Regular",
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
