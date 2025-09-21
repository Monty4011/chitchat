import { Text, View } from "react-native";
import { useEffect, useContext, useState } from "react";
import axios from "axios";
import { UserType } from "../UserContext.js";
import FriendRequest from "./../components/FriendRequest";
import Friend from "../components/Friend.jsx";

const FriendsScreen = () => {
  const { userId, setUserId } = useContext(UserType);
  const [friendRequests, setFriendRequests] = useState([]);
  const [userFriends, setUserFriends] = useState([]);

  useEffect(() => {
    fetchFriendRequests();
    fetchUserFriends();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(
        `https://chitchat-w2gg.onrender.com/friend-request/${userId}`
      );
      if (response.status === 200) {
        const friendRequestsData = response.data.map((friendRequest) => ({
          _id: friendRequest._id,
          name: friendRequest.name,
          email: friendRequest.email,
          image: friendRequest.image,
        }));

        setFriendRequests(friendRequestsData);
      }
    } catch (err) {
      console.log("error message", err);
    }
  };

  const fetchUserFriends = async () => {
    try {
      const response = await fetch(
        `https://chitchat-w2gg.onrender.com/friends/${userId}`
      );

      const data = await response.json();

      if (response.status === 200) {
        setUserFriends(data.friends);
      } else {
        console.log("error retrieving user friends", response.status);
      }
    } catch (error) {
      console.log("Error message", error);
    }
  };

  return (
    <View style={{ padding: 10, marginHorizontal: 12 }}>
      {friendRequests.length > 0 && <Text>Your Friend Requests!</Text>}

      {friendRequests.map((item, index) => (
        <FriendRequest
          key={index}
          item={item}
          friendRequests={friendRequests}
          setFriendRequests={setFriendRequests}
        />
      ))}
      {userFriends.map((item, index) => (
        <Friend key={index} item={item} />
      ))}
    </View>
  );
};

export default FriendsScreen;
