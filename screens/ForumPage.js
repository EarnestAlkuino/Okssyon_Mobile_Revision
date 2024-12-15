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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';

const ForumPage = ({ route, navigation }) => {
  const { item, userId } = route.params || {};
  const placeholderImage = 'https://via.placeholder.com/50'; // Fallback image

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
  const [replyToThreadId, setReplyToThreadId] = useState(null); // Track the thread being replied to
  const [expandedThreads, setExpandedThreads] = useState({}); // Track expanded/collapsed threads
  const [livestockDetails, setLivestockDetails] = useState({
    breed: 'Unknown',
    weight: 'Unknown',
    category: 'Unknown',
  });

  useEffect(() => {
    fetchThreads();
    fetchLivestockDetails();
  }, [item.livestock_id]);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const { data: threadsData, error } = await supabase
        .from('forum_threads')
        .select(`
          thread_id,
          parent_id,
          item_id,
          message,
          created_at,
          created_by,
          profiles:created_by (id, full_name, profile_image)
        `)
        .eq('item_id', item.livestock_id)
        .order('created_at', { ascending: true });

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
      Alert.alert('Error', 'Unable to send message. Please log in and try again.');
      return;
    }
  
    try {
      // Insert the new thread/reply
      const { error: threadError } = await supabase
        .from('forum_threads')
        .insert([
          {
            item_id: item.livestock_id,
            message: newMessage.trim(),
            created_by: userId,
            parent_id: replyToThreadId, // Associate reply with a thread
          },
        ])
        .select('*')
        .single();
  
      if (threadError) throw threadError;
  
      setNewMessage('');
      setReplyToThreadId(null);
      fetchThreads(); // Refresh threads after sending
  
      // Determine if the sender is the seller or a bidder
      const isSeller = userId === livestockDetails.owner_id;
  
      if (replyToThreadId) {
        // Notify the original thread creator when a reply is made
        const originalThread = threads.find((thread) => thread.thread_id === replyToThreadId);
        if (originalThread) {
          const { created_by: threadCreatorId } = originalThread;
  
          // Skip notification if replying to self
          if (threadCreatorId !== userId) {
            const { error: replyNotificationError } = await supabase
              .from('notifications')
              .insert([
                {
                  livestock_id: item.livestock_id,
                  recipient_id: threadCreatorId,
                  recipient_role: isSeller ? 'BIDDER' : 'SELLER', // Notify opposite role
                  message: `${isSeller ? 'The seller' : 'A bidder'} has replied to your message in the forum about ${livestockDetails.category}.`,
                  is_read: false,
                  notification_type: 'NEW_FORUM_ANSWER',
                },
              ]);
  
            if (replyNotificationError) {
              console.error('Error sending reply notification:', replyNotificationError.message);
            }
          }
        }
      } else {
        // Notify all bidders when the seller starts a new discussion
        if (isSeller) {
          const { data: bidders, error: bidderError } = await supabase
            .from('bids')
            .select('bidder_id')
            .eq('livestock_id', item.livestock_id);
  
          if (bidderError) {
            console.error('Error fetching bidders:', bidderError.message);
          } else {
            const notifications = bidders.map((bidder) => ({
              livestock_id: item.livestock_id,
              recipient_id: bidder.bidder_id,
              recipient_role: 'BIDDER',
              message: `The seller has started a new discussion about ${livestockDetails.category}.`,
              is_read: false,
              notification_type: 'NEW_FORUM_QUESTION',
            }));
  
            const { error: discussionNotificationError } = await supabase
              .from('notifications')
              .insert(notifications);
  
            if (discussionNotificationError) {
              console.error('Error sending discussion notifications:', discussionNotificationError.message);
            }
          }
        } else {
          // Notify the seller when a bidder starts a new discussion
          const { error: sellerNotificationError } = await supabase
            .from('notifications')
            .insert([
              {
                livestock_id: item.livestock_id,
                recipient_id: livestockDetails.owner_id,
                recipient_role: 'SELLER',
                message: `A bidder has started a new discussion about your ${livestockDetails.category}.`,
                is_read: false,
                notification_type: 'NEW_FORUM_QUESTION',
              },
            ]);
  
          if (sellerNotificationError) {
            console.error('Error sending notification to seller:', sellerNotificationError.message);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message or notifications:', error.message);
    }
  };
  
  

  const toggleThreadExpansion = (threadId) => {
    setExpandedThreads((prevState) => ({
      ...prevState,
      [threadId]: !prevState[threadId],
    }));
  };

  const renderThread = ({ item: thread }) => {
    const isSeller = thread.created_by === livestockDetails.owner_id;
    const role = isSeller ? 'Seller' : 'Bidder';
    const profileImage = thread.profiles?.profile_image || placeholderImage;

    const childReplies = threads.filter((reply) => reply.parent_id === thread.thread_id);

    return (
      <View>
        {/* Parent Thread */}
        <View style={styles.threadContainer}>
          <View style={styles.profileContainer}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            <View>
              <Text style={[styles.threadRole, isSeller && styles.sellerRole]}>
                {role}: {thread.profiles?.full_name || thread.created_by}
              </Text>
              <Text style={styles.threadMessage}>{thread.message}</Text>
              <Text style={styles.threadTimestamp}>{new Date(thread.created_at).toLocaleString()}</Text>
            </View>
          </View>

          {/* Reply Button */}
          <TouchableOpacity
            style={styles.replyButton}
            onPress={() => {
              setReplyToThreadId(thread.thread_id);
              setNewMessage('');
            }}
          >
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>

          {/* Expand/Collapse Replies */}
          {childReplies.length > 0 && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => toggleThreadExpansion(thread.thread_id)}
            >
              <Text style={styles.expandButtonText}>
                {expandedThreads[thread.thread_id] ? 'Hide Replies' : `View Replies (${childReplies.length})`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Child Replies */}
        {expandedThreads[thread.thread_id] &&
          childReplies.map((reply) => {
            const replyImage = reply.profiles?.profile_image || placeholderImage;
            return (
              <View key={reply.thread_id} style={styles.replyContainer}>
                <View style={styles.profileContainer}>
                  <Image source={{ uri: replyImage }} style={styles.profileImage} />
                  <View>
                    <Text style={[styles.threadRole, reply.created_by === livestockDetails.owner_id && styles.sellerRole]}>
                      Reply by {reply.profiles?.full_name || reply.created_by}
                    </Text>
                    <Text style={styles.threadMessage}>{reply.message}</Text>
                    <Text style={styles.threadTimestamp}>{new Date(reply.created_at).toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            );
          })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#257446', '#234D35']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{livestockDetails.category} Forum</Text>
      </LinearGradient>

      {/* Livestock Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsText}>
          Breed: {livestockDetails.breed} | Weight: {livestockDetails.weight} kg
        </Text>
      </View>

      {/* Forum Threads */}
      {loading ? (
        <ActivityIndicator size="large" color="#257446" style={styles.loader} />
      ) : (
        <FlatList
          data={threads.filter((thread) => !thread.parent_id)} // Only top-level threads
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
          placeholder={replyToThreadId ? 'Write your reply...' : 'Start a new discussion...'}
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
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  backButton: { marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', left: 80 },
  detailsContainer: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  detailsText: { fontSize: 16, fontWeight: '500', color: '#444' },
  threadsList: { padding: 10 },
  threadContainer: { marginBottom: 12, padding: 12, backgroundColor: '#fff', borderRadius: 8 },
  profileContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  replyContainer: { marginLeft: 20, padding: 10, backgroundColor: '#f9f9f9', borderLeftWidth: 2, borderLeftColor: '#ccc' },
  threadRole: { fontWeight: 'bold', marginBottom: 4, color: '#333' },
  sellerRole: { color: '#257446' },
  threadMessage: { fontSize: 15, marginBottom: 8 },
  threadTimestamp: { fontSize: 12, color: '#888', textAlign: 'right' },
  replyButton: { marginTop: 4 },
  replyButtonText: { color: '#257446', fontWeight: 'bold' },
  expandButton: { marginTop: 4 },
  expandButtonText: { color: '#257446', fontWeight: 'bold' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff' },
  input: { flex: 1, backgroundColor: '#f1f1f1', borderRadius: 20, padding: 12, marginRight: 10 },
  sendButton: { backgroundColor: '#257446', padding: 10, borderRadius: 20 },
  disabledSendButton: { backgroundColor: '#ccc' },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default ForumPage;
