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
import AuctionDetailsHeader from '../Components/LivestockAuctionDetailPage/AuctionDetailsHeader';
import { supabase } from '../supabase';

const ForumPage = ({ route, navigation }) => {
  const { item, userId: userIdFromParams } = route.params || {};
  const placeholderImage = 'https://via.placeholder.com/50';

  const [userId, setUserId] = useState(userIdFromParams);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [replyToThreadId, setReplyToThreadId] = useState(null);
  const [expandedThreads, setExpandedThreads] = useState({});
  const [livestockDetails, setLivestockDetails] = useState({
    breed: 'Unknown',
    weight: 'Unknown',
    category: 'Unknown',
  });

  useEffect(() => {
    // Fetch userId if not provided
    const fetchUserId = async () => {
      if (!userId) {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          console.error('Error fetching user from Supabase:', error?.message || 'No user found');
          Alert.alert('Error', 'Failed to retrieve user information. Please log in again.');
          navigation.navigate('LoginPage');
        } else {
          setUserId(user.id);
        }
      }
    };

    fetchUserId();
  }, [userId]);

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
      const { data: newThread, error: threadError } = await supabase
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
 
      // Determine if the sender is the seller
      const isSeller = userId === livestockDetails.owner_id;
 
      if (isSeller) {
        // Notify all bidders when the seller responds
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
            recipient_role: 'SELLER',
            message: `The seller has responded to your question about ${livestockDetails.category}.`,
            is_read: false,
            notification_type: 'NEW_FORUM_ANSWER',
          }));
 
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert(notifications);
 
          if (notificationError) {
            console.error('Error sending notifications to bidders:', notificationError.message);
          }
        }
      } else {
        // Notify the seller when a bidder asks a question
        const { error: sellerNotificationError } = await supabase
          .from('notifications')
          .insert([
            {
              livestock_id: item.livestock_id,
              recipient_id: livestockDetails.owner_id,
              recipient_role: 'BIDDER',
              message: `A bidder has posted a question about your ${livestockDetails.category}.`,
              is_read: false,
              notification_type: 'NEW_FORUM_QUESTION',
            },
          ]);
 
        if (sellerNotificationError) {
          console.error('Error sending notification to seller:', sellerNotificationError.message);
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
      <View style={styles.threadContainer}>
        <View style={styles.threadHeader}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
          <View>
            <Text style={[styles.roleText, isSeller && styles.sellerRole]}>
              {role}: {thread.profiles?.full_name || thread.created_by}
            </Text>
            <Text style={styles.messageText}>{thread.message}</Text>
            <Text style={styles.timestampText}>{new Date(thread.created_at).toLocaleString()}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => {
            setReplyToThreadId(thread.thread_id);
            setNewMessage('');
          }}
        >
          <Text style={styles.replyButtonText}>Reply</Text>
        </TouchableOpacity>
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
        {expandedThreads[thread.thread_id] &&
          childReplies.map((reply) => (
            <View key={reply.thread_id} style={styles.replyContainer}>
              <Image source={{ uri: reply.profiles?.profile_image || placeholderImage }} style={styles.replyImage} />
              <View>
                <Text style={[styles.roleText, reply.created_by === livestockDetails.owner_id && styles.sellerRole]}>
                  Reply by {reply.profiles?.full_name || reply.created_by}
                </Text>
                <Text style={styles.messageText}>{reply.message}</Text>
                <Text style={styles.timestampText}>{new Date(reply.created_at).toLocaleString()}</Text>
              </View>
            </View>
          ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuctionDetailsHeader title="Forum" onBackPress={() => navigation.goBack()} />
      <View style={styles.livestockDetails}>
        <Text style={styles.livestockText}>
          {livestockDetails.category}: {livestockDetails.breed} | {livestockDetails.weight}kg
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#257446" style={styles.loader} />
      ) : (
        <FlatList
          data={threads.filter((thread) => !thread.parent_id)}
          renderItem={renderThread}
          keyExtractor={(thread) => thread.thread_id.toString()}
          contentContainerStyle={styles.threadList}
        />
      )}
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  livestockDetails: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  livestockText: { fontSize: 16, fontWeight: '600', color: '#333' },
  threadList: { padding: 10 },
  threadContainer: { marginBottom: 12, padding: 10, backgroundColor: '#fff', borderRadius: 8, shadowOpacity: 0.1 },
  threadHeader: { flexDirection: 'row', marginBottom: 8 },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  roleText: { fontWeight: 'bold', marginBottom: 4 },
  sellerRole: { color: '#257446' },
  messageText: { fontSize: 14, color: '#444' },
  timestampText: { fontSize: 12, color: '#777', marginTop: 4 },
  replyButton: { marginTop: 6, alignSelf: 'flex-start' },
  replyButtonText: { color: '#257446', fontWeight: 'bold' },
  expandButton: { marginTop: 6, alignSelf: 'flex-start' },
  expandButtonText: { color: '#257446', fontWeight: 'bold' },
  replyContainer: { marginLeft: 20, paddingVertical: 6, paddingLeft: 10, backgroundColor: '#f1f1f1', borderRadius: 6 },
  replyImage: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, padding: 12, marginRight: 10, fontSize: 14 },
  sendButton: { backgroundColor: '#257446', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
  disabledSendButton: { backgroundColor: '#ccc' },
  sendButtonText: { color: '#fff', fontWeight: '600' },
});

export default ForumPage;
