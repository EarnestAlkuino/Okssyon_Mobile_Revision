import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { supabase } from '../supabase';

const ForumPage = ({ route, navigation }) => {
  const { item, userId } = route.params || {};

  if (!item) {
    console.error('Error: Item is undefined.');
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Item data is missing.</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [livestockDetails, setLivestockDetails] = useState({
    breed: 'Unknown',
    weight: 'Unknown',
  });

  useEffect(() => {
    fetchThreads();
    fetchLivestockDetails(); // Fetch breed and weight

    const channel = supabase
      .channel('forum_threads') // Unique channel name
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forum_threads' }, async (payload) => {
        // Fetch the newly inserted thread with profile details
        const { data: newThread, error } = await supabase
          .from('forum_threads')
          .select(`
            thread_id,
            item_id,
            message,
            created_at,
            created_by,
            profiles:created_by (id, full_name)
          `)
          .eq('thread_id', payload.new.thread_id)
          .single();

        if (error) {
          console.error('Error fetching new thread with profile:', error.message);
        } else {
          setThreads((prevThreads) => [newThread, ...prevThreads]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Cleanup the subscription
    };
  }, [item.livestock_id]);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const { data: threadsData, error } = await supabase
        .from('forum_threads')
        .select(`
          thread_id,
          item_id,
          message,
          created_at,
          created_by,
          profiles:created_by (id, full_name)
        `)
        .eq('item_id', item.livestock_id);

      if (error) throw error;

      setThreads(threadsData);
    } catch (error) {
      console.error('Error fetching threads:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLivestockDetails = async () => {
    try {
      const { data: livestockData, error } = await supabase
        .from('livestock')
        .select('breed, weight')
        .eq('livestock_id', item.livestock_id)
        .single();

      if (error) throw error;

      setLivestockDetails({
        breed: livestockData.breed || 'Unknown',
        weight: livestockData.weight || 'Unknown',
      });
    } catch (error) {
      console.error('Error fetching livestock details:', error.message);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      Alert.alert('Error', 'Message cannot be empty.');
      return;
    }
  
    if (!userId) {
      console.error('Error: userId is missing.');
      Alert.alert('Error', 'Unable to send message. Please log in and try again.');
      return;
    }
  
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .insert([
          {
            item_id: item.livestock_id,
            message: newMessage.trim(),
            created_by: userId, // Ensure userId is valid
          },
        ])
        .select('*');
  
      if (error) throw error;
  
      setNewMessage(''); // Clear the input field
    } catch (error) {
      console.error('Error sending message:', error.message);
      return;
    }
  
    // Prepare Notifications
    const notificationData = [
      {
        livestock_id: item.livestock_id,
        recipient_id: item.created_by || null, // Validate seller's ID
        recipient_role: 'SELLER',
        message: `A new reply was posted on your auction for the ${item.category || 'Unknown'}.`,
        is_read: false,
        notification_type: 'NEW_FORUM_QUESTION',
      },
      {
        livestock_id: item.livestock_id,
        recipient_id: userId, // Current user
        recipient_role: 'BIDDER',
        message: `You replied to the auction for the ${item.category || 'Unknown'}.`,
        is_read: false,
        notification_type: 'NEW_FORUM_ANSWER',
      },
    ];
  
    for (const notification of notificationData) {
      if (!notification.recipient_id) {
        console.error('Invalid recipient_id. Skipping notification:', notification);
        continue; // Skip notifications with invalid recipient_id
      }
  
      const { error: insertError } = await supabase.from('notifications').insert(notification);
      if (insertError) {
        console.error('Error creating notification:', insertError.message);
      }
    }
  };
  
  
  const renderThread = ({ item: thread }) => {
    const isSeller = thread.created_by === item.created_by;
    return (
      <View
        style={[
          styles.chatBubble,
          isSeller && styles.sellerBubble,
        ]}
      >
        <Text style={styles.threadCreator}>
          {isSeller ? 'Seller' : thread.profiles?.full_name || 'Unknown'}:
        </Text>
        <Text style={styles.messageText}>{thread.message}</Text>
        <Text style={styles.threadTime}>
          {new Date(thread.created_at).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat: {item.category}</Text>
        <Text style={styles.headerSubtitle}>Breed: {livestockDetails.breed}</Text>
        <Text style={styles.headerSubtitle}>Weight: {livestockDetails.weight} kg</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00796b" />
      ) : (
        <FlatList
          data={threads}
          renderItem={renderThread}
          keyExtractor={(thread) => thread.thread_id.toString()}
          style={styles.messageList}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.button} onPress={sendMessage}>
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
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  chatBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  sellerBubble: {
    backgroundColor: '#e0f7fa', // Light blue background for seller replies
    borderColor: '#00796b', // Different border color
  },
  threadCreator: {
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  threadTime: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#335441',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#335441',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    marginBottom: 20,
  },
  errorButton: {
    padding: 10,
    backgroundColor: '#00796b',
    borderRadius: 5,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ForumPage;
