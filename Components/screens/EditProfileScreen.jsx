import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUserInfo } from "../../redux/userSlice"; // adjust path if needed
import { useNavigation } from "@react-navigation/native";

const EditProfileScreen = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [username, setUsername] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return Alert.alert("Error", "Not authenticated");

    const formData = new FormData();
    formData.append("username", username);
    if (password.trim()) {
      formData.append("password", password);
    }
    if (image) {
      formData.append("profilePicture", {
        uri: image.uri,
        name: "profile.jpg",
        type: "image/jpeg",
      });
    }

    try {
      const res = await axios.put(
        "http://192.168.81.224:5000/api/users/update-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      dispatch(setUserInfo(res.data.user));
      Alert.alert("Success", "Profile updated!");
      navigation.goBack();
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert("Error", "Could not update profile");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Image
          source={{
            uri:
              image?.uri ||
              (user?.image
                ? `http://192.168.81.224:5000/${user.image.replace(/\\/g, "/")}`
                : "https://via.placeholder.com/100"),
          }}
          style={styles.profileImage}
        />
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Leave blank to keep current"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 15,
    marginTop: 10,
    marginBottom: 4,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#ff9933",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 30,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePicker: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
  },
  changePhotoText: {
    marginTop: 8,
    color: "#007bff",
    fontWeight: "500",
  },
});

export default EditProfileScreen;
