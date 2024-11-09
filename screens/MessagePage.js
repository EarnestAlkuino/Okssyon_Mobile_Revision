import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../Components/Header';
import { supabase } from '../supabase'; // Ensure Supabase instance is correctly imported

const MessagePage = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Fetch user ID when the component mounts
  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user ID:", error.message);
      } else if (user) {
        setUserId(user.id);
      }
    };
    fetchUserId();
  }, []);

  // Fetch conversations after userId is set
  useEffect(() => {
    if (userId) {
      console.log("Fetching conversations for userId:", userId); // Debug log
      fetchConversations();
    }
  }, [userId]);

  const fetchConversations = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        conversation_id, last_message, last_message_at, seller_id, bidder_id,
        profiles_seller:profiles!seller_id (id, full_name), 
        profiles_bidder:profiles!bidder_id (id, full_name)
      `)
      .or(`seller_id.eq.${userId},bidder_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error.message);
    } else {
      console.log("Conversations fetched successfully:", data); // Debug log
      setConversations(data);
    }
    setLoading(false);
  };

  const renderConversationItem = ({ item }) => {
    const isSeller = item.seller_id === userId;
    const otherUser = isSeller ? item.profiles_bidder.full_name : item.profiles_seller.full_name;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigation.navigate('ChatPage', {
          conversationId: item.conversation_id,
          userId: userId,
          item, // Pass the livestock item data if available
        })}
      >
        <Text style={styles.conversationTitle}>{otherUser}</Text>
        <Text style={styles.conversationMessage}>{item.last_message}</Text>
        <Text style={styles.conversationTime}>
          {new Date(item.last_message_at).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  const filteredConversations = conversations.filter(conversation =>
    (conversation.profiles_seller?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     conversation.profiles_bidder?.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      {/* Status bar */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Header */}
      <Header 
        title="Messages"
        showBackButton={false} // Back button not needed on bottom tabs
        showSettingsButton={false}
      />

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Conversations List */}
      {loading ? (
        <ActivityIndicator size="large" color="#00796b" />
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.conversation_id.toString()}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.conversationList}
          ListEmptyComponent={<Text style={styles.noMessages}>No messages found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  conversationList: {
    paddingHorizontal: 10,
  },
  conversationItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  conversationMessage: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  conversationTime: {
    fontSize: 12,
    color: '#999',
  },
  noMessages: {
    textAlign: 'center',
    color: '#555',
    marginTop: 20,
  },
});

export default MessagePage;
