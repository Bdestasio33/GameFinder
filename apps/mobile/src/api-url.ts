import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Resolve the API base URL for local development.
 *
 * `localhost` only works when the JS runtime is on the same machine as the API
 * (e.g. some simulators). Physical devices and Expo Go need the dev machine IP.
 */
export function getApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === "android") {
    // Android emulator maps host loopback to 10.0.2.2
    return "http://10.0.2.2:3001";
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.linkingUri ??
    Constants.manifest2?.extra?.expoClient?.hostUri;

  const host = hostUri?.split(":")[0];
  if (host && host !== "localhost") {
    return `http://${host}:3001`;
  }

  return "http://localhost:3001";
}
