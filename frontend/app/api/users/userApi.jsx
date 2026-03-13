import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSetRecoilState } from "recoil";
import { router } from "expo-router";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function UserApiRoutePlaceholder() {
  return null;
}

export async function authenticateUser(loginUser, endPoint) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  try {
    const response = await fetch(API_URL + endPoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(loginUser),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Received non-JSON response from server");
    }

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error("Error during fetch operation:", error.message);
    return {
      error: true,
      status: error instanceof TypeError ? 400 : 500,
      message: error.message || "Network error",
    };
  }
}

export async function signout() {
  await AsyncStorage.removeItem("userToken");
  router.push("/signIn");
}

export async function getMyVehicles(token, endPoint) {
  const url = API_URL + endPoint;

  const header = new Headers();
  header.append("Authorization", `Bearer ${token}`);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: header,
    });
    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error("error");
    return { error: true, status: 500, message: "Network error fetch" };
  }
}

export async function addNewInsurances(
  insuranceData,
  voitureId,
  endPoint,
  token,
) {
  const url = API_URL + endPoint + voitureId;
  const header = new Headers();
  header.append("Content-Type", "application/json");
  header.append("Authorization", `Bearer ${token}`);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: header,
      body: JSON.stringify(insuranceData),
    });
    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    return { error: true, status: 500, message: "Network error" };
  }
}

export async function fetchUserInfoAndVehicle(vehicleId, token, endPoint) {
  const url = API_URL + endPoint + vehicleId;

  const header = new Headers();
  header.append("Authorization", `Bearer ${token}`);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: header,
    });
    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error("error");
    return { error: true, status: 500, message: "Network error fetch" };
  }
}

export async function sendScannedDataToServer(scannedData, setScannedData) {
  //const setScannedData = useSetRecoilState(ScannedQrCodeData);

  try {
    const { id, iv, alphaNum } = JSON.parse(scannedData);
    const userToken = await AsyncStorage.getItem("userToken");
    const requestBody = {};

    if (id && iv) {
      requestBody.id = id;
      requestBody.iv = iv;
    }
    if (alphaNum) {
      requestBody.alphaNum = alphaNum;
    }

    const response = await fetch(`${API_URL}users/code/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    // console.log('Response Status:', response.status); // Log the response status
    const contentType = response.headers.get("Content-Type"); // Get the content type of the response
    //console.log('Response Content-Type:', contentType);

    if (contentType && contentType.indexOf("application/json") !== -1) {
      const responseData = await response.json();
      setScannedData(responseData.response); // Update Recoil state with response data

      if (!response.ok) {
        throw new Error(`Server responded with error: ${responseData.msg}`);
      }

      // console.log('Success:', responseData);
      //alert(`Info received: ${JSON.stringify(responseData.response)}`);
    } else {
      const responseText = await response.text(); // Handle non-JSON responses
      throw new Error(
        `Unexpected response type: ${contentType}. Body: ${responseText}`,
      );
    }
  } catch (error) {
    //  console.error("Sending data to server failed:", error);
    // alert(`Failed to fetch user info: ${error.message}`);
  }
}

export async function SendEmail(loginUser, endPoint) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  try {
    const response = await fetch(API_URL + endPoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(loginUser),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Received non-JSON response from server");
    }

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error("Error during fetch operation:", error.message);
    return {
      error: true,
      status: error instanceof TypeError ? 400 : 500,
      message: error.message || "Network error",
    };
  }
}
