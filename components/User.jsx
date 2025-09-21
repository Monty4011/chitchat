import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import { useContext, useState, useEffect } from "react";
import { UserType } from "../UserContext.js";
import { useNavigation } from "@react-navigation/native";

const User = ({ item }) => {
  const { userId, setUserId } = useContext(UserType);
  const [requestSent, setRequestSent] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]); // sent already
  const [userFriends, setUserFriends] = useState([]); // friends
  const [friendRequestsReceived, setFriendRequestsReceived] = useState([]); // received friend requests
  const [accepted, setAccepted] = useState(false);
  const navigation = useNavigation();

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(
        `https://chitchat-w2gg.onrender.com/friend-requests/sent/${userId}`
      );

      const data = await response.json();
      if (response.status === 200) {
        setFriendRequests(data);
      } else {
        console.log("error", response.status);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchUserFriends = async () => {
    try {
      const response = await fetch(
        `https://chitchat-w2gg.onrender.com/friends/${userId}`
      );

      const data = await response.json();

      if (response.status === 200) {
        setUserFriends(data.friendIds);
      } else {
        console.log("error retrieving user friends", response.status);
      }
    } catch (error) {
      console.log("Error message", error);
    }
  };

  const fetchReceivedFriendRequests = async () => {
    try {
      const response = await fetch(
        `https://chitchat-w2gg.onrender.com/friend-requests/received/${userId}`
      );
      const data = await response.json();
      if (response.status === 200) {
        setFriendRequestsReceived(data);
      } else {
        console.log(
          "error retrieving received friend requests",
          response.status
        );
      }
    } catch (error) {
      console.log("Error message", error);
    }
  };

  const sendFriendRequest = async (currentUserId, selectedUserId) => {
    try {
      const response = await fetch("https://chitchat-w2gg.onrender.com/friend-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentUserId, selectedUserId }),
      });
      if (response.ok) {
        setRequestSent(true);
      }
    } catch (error) {
      console.log("error message", error);
    }
  };

  const acceptRequest = async (friendRequestId) => {
    console.log("accepting friend request");
    try {
      const response = await fetch(
        "https://chitchat-w2gg.onrender.com/friend-request/accept",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: friendRequestId,
            recepientId: userId,
          }),
        }
      );
      if (response.status === 200) {
        // setFriendRequests(
        //   friendRequests.filter((request) => request._id !== friendRequestId)
        // );
        // navigation.navigate("Chats");
        setAccepted(true);
        console.log("accepted friend request");
      }
    } catch (err) {
      console.log("error accepting the friend request", err);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
    fetchUserFriends();
    fetchReceivedFriendRequests();
  }, [accepted, setAccepted]);

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
      {userFriends.includes(item._id) ? (
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
      ) : requestSent ||
        friendRequests.some((friend) => friend._id === item._id) ? (
        <Pressable
          style={{
            backgroundColor: "gray",
            padding: 10,
            width: 105,
            borderRadius: 6,
          }}
        >
          <Text style={{ textAlign: "center", color: "white", fontSize: 13 }}>
            Request Sent
          </Text>
        </Pressable>
      ) : friendRequestsReceived.some(
          (friend) => friend._id.toString() === item._id.toString()
        ) ? (
        <Pressable
          style={{
            backgroundColor: "gray",
            padding: 10,
            width: 105,
            borderRadius: 6,
          }}
          onPress={() => acceptRequest(item._id)}
        >
          <Text style={{ textAlign: "center", color: "white", fontSize: 13 }}>
            Accept
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => sendFriendRequest(userId, item._id)}
          style={{
            backgroundColor: "#567189",
            padding: 10,
            borderRadius: 6,
            width: 105,
          }}
        >
          <Text style={{ textAlign: "center", color: "white", fontSize: 13 }}>
            Add Friend
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
};

export default User;
