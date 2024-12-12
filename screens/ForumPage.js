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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Ensure expo-linear-gradient is installed
import { Ionicons } from '@expo/vector-icons'; // Ensure expo/vector-icons is installed
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
    category: 'Unknown',
  });

  useEffect(() => {
    fetchThreads();
    fetchLivestockDetails();

    const channel = supabase
      .channel('forum_threads')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forum_threads' }, async (payload) => {
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
          console.error('Error fetching new thread:', error.message);
        } else {
          setThreads((prevThreads) => [newThread, ...prevThreads]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
        .select('breed, weight, category, owner_id')
        .eq('livestock_id', item.livestock_id)
        .single();

      if (error) throw error;

      setLivestockDetails({
        breed: livestockData.breed || 'Unknown',
        weight: livestockData.weight || 'Unknown',
        category: livestockData.category || 'Unknown',
        owner_id: livestockData.owner_id,
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
      const { data: newThread, error } = await supabase
        .from('forum_threads')
        .insert([
          {
            item_id: item.livestock_id,
            message: newMessage.trim(),
            created_by: userId,
          },
        ])
        .select('*');

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };

  const renderThread = ({ item: thread }) => {
    const isSeller = thread.created_by === livestockDetails.owner_id;
    const role = isSeller ? 'Seller' : 'Bidder';
    return (
      <View style={[styles.threadContainer, isSeller && styles.sellerHighlight]}>
        <Text style={[styles.threadRole, isSeller && styles.sellerRole]}>{role}: {thread.profiles?.full_name || 'Unknown'}</Text>
        <Text style={styles.threadMessage}>{thread.message}</Text>
        <Text style={styles.threadTimestamp}>{new Date(thread.created_at).toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#257446', '#234D35']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{livestockDetails.category} Forum</Text>
      </LinearGradient>

      {/* Livestock Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsText}>Breed: {livestockDetails.breed} | Weight: {livestockDetails.weight} kg</Text>
      </View>

      {/* Threads */}
      {loading ? (
        <ActivityIndicator size="large" color="#257446" style={styles.loader} />
      ) : (
        <FlatList
          data={threads}
          renderItem={renderThread}
          keyExtractor={(thread) => thread.thread_id.toString()}
          style={styles.threadsList}
        />
      )}

      {/* Input Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Write your reply..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.disabledSendButton]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    left: 80,
  },
  detailsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
  threadsList: {
    padding: 10,
  },
  threadContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  sellerHighlight: {
    borderColor: '#257446',
    backgroundColor: '#e7f9ee',
  },
  threadRole: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#555',
  },
  sellerRole: {
    color: '#257446',
  },
  threadMessage: {
    fontSize: 15,
    marginBottom: 8,
    color: '#333',
  },
  threadTimestamp: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    padding: 12,
    fontSize: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#257446',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  disabledSendButton: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default ForumPage;
