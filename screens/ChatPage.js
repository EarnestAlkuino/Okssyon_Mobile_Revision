import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { supabase } from '../supabase';

const ChatPage = ({ route, navigation }) => {
  // Retrieve conversationId, userId, and item from route params
  const { conversationId, userId, item } = route.params || {};

  // Flag to check if critical data is missing
  const isDataMissing = !conversationId || !userId || !item;

  // Redirect if critical data is missing
  useEffect(() => {
    if (isDataMissing) {
      console.warn('Missing conversationId, userId, or item data in ChatPage');
      if (navigation) {
        navigation.goBack(); // Navigate back if data is missing
      }
    }
  }, [isDataMissing, navigation]);

  // Show a fallback message if data is missing
  if (isDataMissing) {
    return (
      <View style={styles.missingDataContainer}>
        <Text>Unable to load chat. Please try again.</Text>
      </View>
    );
  }

  // State variables
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState({ name: '', role: '' });

  // Fetch messages and other user info when component mounts
  useEffect(() => {
    fetchMessages();
    fetchOtherUserInfo();
    markMessagesAsSeen();

    // Set up real-time message subscription for new messages
    const messageSubscription = supabase
      .channel(`messages-conversation-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new]);
        }
      )
      .subscribe();

    // Clean up subscription on component unmount
    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [conversationId]);

  // Function to fetch messages for the current conversation
  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error.message);
    } else {
      setMessages(data);
    }
    setLoading(false);
  };

  const fetchOtherUserInfo = async () => {
    if (!item || !item.seller_id || !item.bidder_id) {
      console.warn("Invalid item data: seller_id or bidder_id is missing.");
      Alert.alert("Error", "User information is incomplete for chat functionality.");
      return;
    }
  
    const isUserSeller = item.seller_id === userId;
    const otherUserId = isUserSeller ? item.bidder_id : item.seller_id;
    const otherUserRole = isUserSeller ? 'Bidder' : 'Seller';
  
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', otherUserId)
      .single();
  
    if (error) {
      console.error("Error fetching user info:", error.message);
    } else {
      setOtherUser({ name: data.full_name, role: otherUserRole });
    }
  };
  
  // Mark messages as seen by updating the 'seen' field
  const markMessagesAsSeen = async () => {
    const { error } = await supabase
      .from('messages')
      .update({ seen: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .is('seen', false);

    if (error) {
      console.error("Error marking messages as seen:", error.message);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const isUserSeller = item.seller_id === userId;
      const receiverId = isUserSeller ? item.bidder_id : item.seller_id;
  
      try {
        const { data, error } = await supabase
          .from('messages')
          .insert([
            {
              conversation_id: conversationId,
              sender_id: userId,
              receiver_id: receiverId,
              message_text: message.trim(),
              created_at: new Date().toISOString(),
            },
          ]);
  
        if (error) {
          console.error("Error sending message:", error.message);
        } else {
          setMessage(''); // Clear message input
        }
      } catch (error) {
        console.error("Unexpected error:", error.message);
      }
    }
  };
  
  // Render a single message
  const renderMessage = ({ item, index }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender_id === userId ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.message_text}</Text>
      {item.sender_id === userId && index === messages.length - 1 && (
        <Text style={styles.seenText}>{item.seen ? "Seen" : "Delivered"}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button, Name, and Role */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="green" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{otherUser.name}</Text>
          <Text style={styles.userRole}>{otherUser.role}</Text>
        </View>
      </View>

      {/* Display loading spinner or messages */}
      {loading ? (
        <ActivityIndicator size="large" color="#00796b" />
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          style={styles.chatBox}
        />
      )}

      {/* Message input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.button} onPress={handleSendMessage}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 70,
    paddingBottom: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  backButton: {
    paddingHorizontal: 5,
  },
  userInfo: {
    alignItems: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRole: {
    fontSize: 14,
    color: '#555',
  },
  chatBox: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: '75%',
  },
  ownMessage: {
    backgroundColor: '#6EEC74B8',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  seenText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#335441',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#335441',
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  missingDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatPage;
