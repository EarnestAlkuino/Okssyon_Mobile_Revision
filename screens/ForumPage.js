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

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    console.log('Fetching threads for itemId:', item.livestock_id);
    const { data, error } = await supabase
      .from('forum_threads')
      .select(`
        thread_id,
        item_id,
        title,
        created_at,
        profiles:created_by (id, full_name)
      `)
      .eq('item_id', item.livestock_id);

    if (error) {
      console.error('Error fetching threads:', error.message);
    } else {
      console.log('Fetched threads:', data);
      setThreads(data);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (newMessage.trim()) {
      const { data, error } = await supabase
        .from('forum_threads')
        .insert([{
          item_id: item.livestock_id,
          title: newMessage.trim(),
          created_by: userId,
        }])
        .select('*');

      if (error) {
        console.error('Error sending message:', error.message);
      } else {
        setThreads((prev) => [data[0], ...prev]);
        setNewMessage('');
      }
    } else {
      Alert.alert('Error', 'Message cannot be empty.');
    }
  };

  const renderThread = ({ item }) => (
    <View style={styles.chatBubble}>
      <Text style={styles.threadCreator}>
        {item.profiles?.full_name || 'Unknown'}: 
      </Text>
      <Text style={styles.messageText}>{item.title}</Text>
      <Text style={styles.threadTime}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat: {item.category}</Text>
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
