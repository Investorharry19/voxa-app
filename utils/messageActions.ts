import { MessagesRequest } from "@/utils/axios";
import { VoxaMessage } from "@/utils/myTypes";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Alert, Platform } from "react-native";
import Share from "react-native-share";
import Toast from "react-native-toast-message";

export const handleToggleFavorite = async (
  id: string,
  messages: VoxaMessage[],
  setMessages: (msgs: VoxaMessage[]) => void,
  setFavoriteMessages: (msgs: VoxaMessage[]) => void
) => {
  try {
    const newMessages = messages.map((x) => {
      if (x._id == id) {
        return { ...x, isStarred: !x.isStarred };
      }
      return x;
    });

    // Re-calculate favorites based on the new state
    const newFavorites = newMessages.filter((x) => x.isStarred);

    setMessages(newMessages);
    setFavoriteMessages(newFavorites);
    await MessagesRequest.toggleFav(id);
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Something went wrong",
      position: "top",
    });
  }
};

export const handleDeleteMessage = async (
  id: string,
  messages: VoxaMessage[],
  setMessages: (msgs: VoxaMessage[]) => void,
  setFavoriteMessages: (msgs: VoxaMessage[]) => void,
  router?: any
) => {
  const tempHolder = messages;
  const newMessages = messages.filter((message) => message._id !== id);
  setMessages(newMessages);
  setFavoriteMessages(newMessages.filter((msg) => msg.isStarred === true));

  try {
    await MessagesRequest.deleteMessage(id);
    if (router) router.back();
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
};

export const handleMarkAsRead = async (
  id: string,
  messages: VoxaMessage[],
  setMessages: (msgs: VoxaMessage[]) => void,
  setFavoriteMessages: (msgs: VoxaMessage[]) => void,
  opened: string | string[] | undefined | boolean
) => {
  const recycledMessages = messages;
  const newMessages = messages.map((msg) =>
    msg._id === id ? { ...msg, isOpened: true } : msg
  );
  setMessages(newMessages);
  setFavoriteMessages(newMessages.filter((msg) => msg.isStarred === true));

  if (opened === "true" || opened === true) {
    return;
  }
  try {
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

export const handleCaptureAndShare = async (
  viewRef: any,
  specific: boolean,
  app: any = null,
  setShareModaVisible?: (visible: boolean) => void
) => {
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
      message: "https://www.voxa.buzz! \n Send and receive anonymous messages",
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
    if (setShareModaVisible) setShareModaVisible(false);
  } catch (error) {
    console.log("Error sharing:", error);
  }
};

export const handleCaptureAndSave = async (
  viewRef: any,
  setShareModaVisible?: (visible: boolean) => void
) => {
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
    if (setShareModaVisible) setShareModaVisible(false);
  } catch (error) {
    console.error("Error saving capture:", error);
    Alert.alert("Error", "Could not save image.");
  }
};

export const handleVideoShare = async (
  videoUri: string,
  specific: boolean,
  app: any = null,
  setShareModaVisible?: (visible: boolean) => void
) => {
  try {
    const cacheFile = FileSystem.cacheDirectory + "share-video.mp4";
    const existing = await FileSystem.getInfoAsync(cacheFile);
    if (existing.exists)
      await FileSystem.deleteAsync(cacheFile, { idempotent: true });
    await FileSystem.copyAsync({ from: videoUri, to: cacheFile });

    // 2. Set up share options
    const shareOptions: any = {
      title: "Sharing Video",
      url: Platform.OS === "android" ? `file://${cacheFile}` : cacheFile,
      type: "video/mp4",
      message:
        "https://www.voxa.buzz! 🎬\nSend and receive anonymous messages.",
      failOnCancel: false,
      social: app,
    };

    // 3. App-specific share
    if (specific && app) {
      await Share.shareSingle(shareOptions);
    } else {
      await Share.open(shareOptions);
    }

    // 4. Close share modal
    if (setShareModaVisible) setShareModaVisible(false);
  } catch (error) {
    console.log("Error sharing video:", error);
  }
};

export const handleVideoSave = async (
  videoUri: string,
  setShareModaVisible?: (visible: boolean) => void
) => {
  // Ask for gallery permission
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission Denied", "Please allow media access.");
    return;
  }

  // Save the image to Voxa Messages album
  const asset = await MediaLibrary.createAssetAsync(videoUri);
  let album = await MediaLibrary.getAlbumAsync("Voxa Messages");

  if (!album) {
    await MediaLibrary.createAlbumAsync("Voxa Messages", asset, false);
  } else {
    await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
  }

  Alert.alert("Success", "Video saved to Voxa Messages album!");
  if (setShareModaVisible) setShareModaVisible(false);
};
