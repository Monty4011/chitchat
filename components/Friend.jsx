import { Text, View, Pressable, Image } from "react-native";
import { useContext, useState, useEffect } from "react";
import { UserType } from "../UserContext.js";
import { useNavigation } from "@react-navigation/native";

const Friend = ({ item }) => {
  const { userId, setUserId } = useContext(UserType);
  const [userFriends, setUserFriends] = useState([]); // friends
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserFriends = async () => {
      try {
        const response = await fetch(
          `http://10.187.180.32:3000/friends/${userId}`
        );

        const data = await response.json();

        if (response.status === 200) {
          setUserFriends(data);
        } else {
          console.log("error retrieving user friends", response.status);
        }
      } catch (error) {
        console.log("Error message", error);
      }
    };

    fetchUserFriends();
  }, []);

  return (
    <Pressable
      style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}
    >
      <View>
        <Image
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            resizeMode: "cover",
          }}
          source={{ uri: item.image }}
        />
      </View>

      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontWeight: "bold" }}>{item?.name}</Text>
        <Text style={{ marginTop: 4, color: "gray" }}>{item?.email}</Text>
      </View>
      {userFriends ? (
        <Pressable
          style={{
            backgroundColor: "#82CD47",
            padding: 10,
            width: 105,
            borderRadius: 6,
          }}
          onPress={() =>
            navigation.navigate("Messages", {
              recepientId: item._id,
            })
          }
        >
          <Text style={{ textAlign: "center", color: "white" }}>Message</Text>
        </Pressable>
      ) : (
        <View>
          <Text>Make some friends...</Text>
        </View>
      )}
    </Pressable>
  );
};

export default Friend;
