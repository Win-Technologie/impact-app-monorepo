import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const HOST_URL = API_URL?.replace("api/", "");
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Build redirect URI from iOS client ID (reversed client ID scheme)
const iosClientPrefix = IOS_CLIENT_ID?.split(".apps.googleusercontent.com")[0];
const REDIRECT_URI = `com.googleusercontent.apps.${iosClientPrefix}:/oauthredirect`;

/**
 * Google OAuth using iOS client with authorization code flow.
 * Works in Expo Go without auth.expo.io proxy.
 */
export async function signInWithGoogle() {
  try {
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(IOS_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent("openid email profile")}` +
      `&prompt=select_account`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

    if (result.type !== "success" || !result.url) {
      console.log("Auth cancelled or failed:", result);
      return { success: false, error: "Authentication cancelled" };
    }

    // Parse authorization code from URL query params
    const url = result.url;
    const codeMatch = url.match(/[?&]code=([^&]+)/);
    if (!codeMatch) {
      console.error("No authorization code in URL:", url);
      return { success: false, error: "No authorization code received" };
    }
    const code = decodeURIComponent(codeMatch[1]);

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `code=${encodeURIComponent(code)}` +
        `&client_id=${encodeURIComponent(IOS_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&grant_type=authorization_code`,
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return { success: false, error: "Failed to exchange code for token" };
    }

    const accessToken = tokenData.access_token;

    // Get user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!userInfoResponse.ok) {
      console.error("Failed to fetch user info:", userInfoResponse.status);
      return { success: false, error: "Failed to get user info from Google" };
    }

    const userInfo = await userInfoResponse.json();

    if (!userInfo.email) {
      console.error("No email in user info:", userInfo);
      return { success: false, error: "No email from Google" };
    }

    // Send to backend
    const loginResponse = await fetch(`${API_URL}users/user/google-auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userInfo.email,
        googleId: userInfo.id,
        name: userInfo.given_name || userInfo.name,
        picture: userInfo.picture,
      }),
    });

    const loginData = await loginResponse.json();

    if (loginResponse.ok && loginData.A7) {
      await AsyncStorage.setItem("userToken", loginData.A7);
      await AsyncStorage.setItem("user", JSON.stringify(loginData.user));

      if (loginData.user?.user?.profileImagePath) {
        const selfieUrl = `${HOST_URL}Backend/${loginData.user.user.profileImagePath}`;
        const payload = JSON.stringify({ url: selfieUrl, ts: Date.now() });
        await AsyncStorage.setItem("selfie", payload);
      } else if (userInfo.picture) {
        const payload = JSON.stringify({ url: userInfo.picture, ts: Date.now() });
        await AsyncStorage.setItem("selfie", payload);
      }

      // Check if profile is complete — if not, redirect to signup flow
      const user = loginData.user?.user || loginData.user;
      if (!user?.allFieldsComplete) {
        router.push("/signup/signUpLanding");
      } else {
        router.push("/(tabs)");
      }
      return { success: true };
    } else if (loginResponse.status === 201) {
      // Brand new account — send to signup to complete profile
      if (loginData.TA7) {
        await AsyncStorage.setItem("userToken", loginData.TA7);
      }
      // Store user data so the profile/account pages can read it
      const userData = loginData.user || {
        email: userInfo.email,
        name: userInfo.given_name || userInfo.name || "",
        lastName: userInfo.family_name || "",
      };
      await AsyncStorage.setItem("user", JSON.stringify({ user: userData }));

      // Store Google profile picture as selfie
      if (userInfo.picture) {
        const payload = JSON.stringify({ url: userInfo.picture, ts: Date.now() });
        await AsyncStorage.setItem("selfie", payload);
      }

      router.push("/signup/signUpLanding");
      return { success: true };
    } else {
      return {
        success: false,
        error: loginData.msg || "Google authentication failed",
      };
    }
  } catch (err) {
    console.error("Google auth error:", err);
    return { success: false, error: err.message || "Google sign-in failed" };
  }
}
