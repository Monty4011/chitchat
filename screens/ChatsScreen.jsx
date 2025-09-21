import { StyleSheet, ScrollView, Pressable } from "react-native";
import { useCallback, useContext, useEffect, useState } from "react";
import { UserType } from "../UserContext.js";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import UserChat from "../components/UserChat.jsx";

const ChatsScreen = () => {
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const acceptedFriendsList = async () => {
        try {
          const response = await fetch(
            `https://chitchat-w2gg.onrender.com/accepted-friends/${userId}`
          );
          const data = await response.json();

          if (response.status === 200) {
            setAcceptedFriends(data);
          }
        } catch (error) {
          console.log("error showing the accepted friends", error);
        }
      };

      acceptedFriendsList();
    }, [userId])
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable>
        {acceptedFriends.map((item, index) => (
          <UserChat key={index} item={item} />
        ))}
      </Pressable>
    </ScrollView>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({});
