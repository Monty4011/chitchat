import { Alert, StyleSheet, Text, View } from "react-native";
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { UserType } from "../UserContext.js";
import User from "../components/User.jsx";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [users, setUsers] = useState([]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      Alert.alert("Logged out", "You have been logged out successfully");
      navigation.replace("Login");
    } catch (error) {
      console.log("Logout error", error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Chit Chat</Text>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons
            onPress={() => navigation.navigate("Chats")}
            name="chatbox-ellipses-outline"
            size={24}
            color="black"
          />
          <MaterialIcons
            onPress={() => navigation.navigate("Friends")}
            name="people-outline"
            size={24}
            color="black"
          />
          <MaterialIcons
            onPress={handleLogout}
            name="logout"
            size={24}
            color="black"
          />
        </View>
      ),
    });
  }, []);

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        console.log("No token found");
        return;
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      setUserId(userId);

      const response = await axios.get(
        `https://chitchat-w2gg.onrender.com/users/${userId}`
      );
      setUsers(response.data);
    } catch (error) {
      console.log("Error in fetchUsers:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  return (
    <View>
      <View style={{ padding: 10 }}>
        {users.map((item, index) => (
          <User key={index} item={item} />
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
