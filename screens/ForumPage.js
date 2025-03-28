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
  const { livestockId, userId, threadId, notificationType } = route.params || {};

  if (!livestockId || !userId) {
    Alert.alert('Error', 'Required data is missing. Please try again.');
    return; // Prevent rendering if critical data is missing
  }

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [replyToThreadId, setReplyToThreadId] = useState(threadId || null); // Set threadId if available
  const [expandedThreads, setExpandedThreads] = useState({});
  const [livestockDetails, setLivestockDetails] = useState({
    breed: 'Unknown',
    weight: 'Unknown',
    category: 'Unknown',
  });

  const fetchUserId = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.error('Error fetching user:', error?.message || 'No user found');
      return null;  // Return null if no user is found or there is an error
    }
    return user.id;  // Return the valid UUID from Supabase session
  };
  

  // Fetch forum threads related to the livestock
  useEffect(() => {
    fetchThreads();
    fetchLivestockDetails();
  }, [livestockId]);

  // Fetch threads from the forum
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
        .eq('item_id', livestockId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setThreads(threadsData);
    } catch (error) {
      console.error('Error fetching threads:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch livestock details (optional for display in the forum)
  const fetchLivestockDetails = async () => {
    try {
      const { data: livestockData, error } = await supabase
        .from('livestock')
        .select('breed, weight, category, owner_id')
        .eq('livestock_id', livestockId)
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
    const userId = await fetchUserId();  // Fetch valid userId
  
    if (!userId) {
      Alert.alert('Error', 'User is not logged in. Please try again.');
      return;
    }
  
    if (!newMessage.trim()) {
      Alert.alert('Error', 'Message cannot be empty.');
      return;
    }
  
    try {
      // Insert the new thread or reply into the database
      const { data: newThread, error: threadError } = await supabase
        .from('forum_threads')
        .insert([{
          item_id: livestockId,
          message: newMessage.trim(),
          created_by: userId,
          parent_id: replyToThreadId,  // Link reply to a specific thread if available
        }])
        .select('*')
        .single();
  
      if (threadError) throw threadError;
  
      setNewMessage('');
      setReplyToThreadId(null);
      fetchThreads();  // Refresh threads after sending
  
      // Determine whether the user is the seller or bidder
      const isSeller = userId === livestockDetails.owner_id;
  
      if (isSeller) {
        // Notify all bidders when the seller replies
        const { data: bidders, error: bidderError } = await supabase
          .from('bids')
          .select('bidder_id')
          .eq('livestock_id', livestockId);
  
        if (bidderError) throw bidderError;
  
        // Insert a new notification into the forum_notifications table
        const { data: notificationData, error: notificationError } = await supabase
          .from('forum_notifications')
          .insert([{
            livestock_id: livestockId,
            user_id: livestockDetails.owner_id,
            notification_type: 'FORUM_ANSWER', // Notification type for seller replies
            message: 'The seller has replied to your question.',
            is_read: false,
            created_at: new Date().toISOString(),
            thread_id: newThread.thread_id,  // Attach the thread ID to the notification
          }])
          .select('*')
          .single();
  
        if (notificationError) throw notificationError;
  
        // Now that we have the notification_id, insert into notification_bidders
        const notifications = bidders.map((bidder) => ({
          notification_id: notificationData.id,  // Reference the inserted notification_id
          bidder_id: bidder.bidder_id,  // Notify each bidder
          notification_type: 'FORUM_ANSWER',
          is_read: false,
          created_at: new Date().toISOString(),
        }));
  
        const { error: insertError } = await supabase
          .from('notification_bidders')
          .insert(notifications);
  
        if (insertError) throw insertError;
      } else {
        // Notify the seller if a bidder posts a question
        const { error: sellerNotifError } = await supabase
          .from('forum_notifications')
          .insert([{
            livestock_id: livestockId,
            user_id: livestockDetails.owner_id,
            notification_type: 'FORUM_QUESTION',
            message: 'A bidder posted a question on your livestock.',
            is_read: false,
            created_at: new Date().toISOString(),
            thread_id: newThread.thread_id,  // Attach the thread ID to the notification
          }]);
  
        if (sellerNotifError) throw sellerNotifError;
      }
    } catch (error) {
      console.error('❌ Error sending message or notifications:', error.message);
    }
  };
  
  
  
  
  const handleForumNotification = async () => {
    // Get the actual userId
    const userId = await fetchUserId();
    if (!userId) {
      console.error("User not authenticated");
      return;  // Exit if user is not authenticated
    }
  
    const isSeller = userId === livestockDetails.owner_id;
  
    if (isSeller) {
      // Notify all bidders when the seller replies
      try {
        const { data: bidders, error } = await supabase
          .from('bids')
          .select('bidder_id')
          .eq('livestock_id', livestockId);
  
        if (error) {
          console.error('Error fetching bidders:', error.message);
        }
  
        bidders.forEach(async (bidder) => {
          await supabase.from('notifications').insert([{
            notification_id: livestockId,
            bidder_id: bidder.bidder_id,
            notification_type: 'FORUM_ANSWER',
            message: `The seller has responded to your question about this livestock.`,
            is_read: false,
            created_at: new Date(),
          }]);
        });
      } catch (error) {
        console.error('Error sending notifications to bidders:', error.message);
      }
    } else {
      // Notify the seller when a bidder posts a question
      try {
        await supabase.from('notifications').insert([{
          livestock_id: livestockId,
          seller_id: livestockDetails.owner_id,
          notification_type: 'FORUM_QUESTION',
          message: `A bidder has posted a question about your livestock.`,
          is_read: false,
          created_at: new Date(),
        }]);
      } catch (error) {
        console.error('Error sending notification to seller:', error.message);
      }
    }
  };
  
  const toggleThreadExpansion = (threadId) => {
    setExpandedThreads((prevState) => ({
      ...prevState,
      [threadId]: !prevState[threadId],  // Toggle the expanded state for the specific thread
    }));
  };
  

  // Render individual thread
  const renderThread = ({ item: thread }) => {
    const isSeller = thread.created_by === livestockDetails.owner_id;
    const role = isSeller ? 'Seller' : 'Bidder';
    const profileImage = thread.profiles?.profile_image || 'https://via.placeholder.com/50';  // Default placeholder image

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
              <Image source={{ uri: reply.profiles?.profile_image || 'https://via.placeholder.com/50' }} style={styles.replyImage} />
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
        // Update the keyExtractor to ensure unique keys
<FlatList
  data={threads.filter((thread) => !thread.parent_id)}  // Only top-level threads
  renderItem={renderThread}
  keyExtractor={(thread) => thread.thread_id ? thread.thread_id.toString() : `thread_${Math.random()}`}
  contentContainerStyle={styles.threadList}
/>





      )}

      {/* Input for new messages */}
      <KeyboardAvoidingView style={styles.inputContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
