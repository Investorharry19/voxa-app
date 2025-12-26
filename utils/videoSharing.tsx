import * as Sharing from "expo-sharing";

import { backendUrl } from "@/sever";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export async function downloadAndSaveVideo(audioUrl: string) {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }

    const fileUri = FileSystem.cacheDirectory + `video_${Date.now()}.mp4`;

    const response = await axios.get(
      `${backendUrl}convert`,
      {
        params: { audioUrl },
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "application/json",
          Accept: "video/mp4",
        },
        timeout: 120000, // 2 minutes
      }
    );

    console.log("Video received, size:", response.data.byteLength);

    // Check file size (WhatsApp limit is ~16MB)
    const fileSizeMB = response.data.byteLength / (1024 * 1024);
    console.log(`File size: ${fileSizeMB.toFixed(2)} MB`);

    if (fileSizeMB > 16) {
      alert(
        `Video is ${fileSizeMB.toFixed(
          2
        )}MB. WhatsApp limit is 16MB. Try a shorter audio.`
      );
      return;
    }

    // Convert to base64
    const uint8Array = new Uint8Array(response.data);
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);

    console.log("Writing file...");
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Verify file
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    console.log("File saved:", fileInfo);

    if (!fileInfo.exists || fileInfo.size === 0) {
      throw new Error("File was not saved correctly");
    }

    return fileUri;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function saveVideoToGallery(videoUri: string) {
  try {
    // Save to media library (gallery)
    const asset = await MediaLibrary.createAssetAsync(videoUri);
    await MediaLibrary.createAlbumAsync("MyApp", asset, false);

    console.log("Video saved to gallery!");
    return asset;
  } catch (error) {
    console.error("Error saving to gallery:", error);
    throw error;
  }
}

export async function shareVideoToSocials(videoUri: string) {
  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      alert("Sharing is not available on this device");
      return;
    }

    // Share the video (opens system share sheet)
    await Sharing.shareAsync(videoUri, {
      mimeType: "video/mp4",
      dialogTitle: "Share your video",
      UTI: "public.movie", // For iOS
    });

    console.log("Shared video!");
  } catch (error) {
    console.error("Error sharing video:", error);
    throw error;
  }
}
