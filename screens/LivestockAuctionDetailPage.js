import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { supabase } from '../supabase';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';


const LivestockAuctionDetailPage = ({ route, navigation }) => {
  const { itemId, userId: userIdFromParams } = route.params || {};
  const [userId, setUserId] = useState(userIdFromParams);
  const [item, setItem] = useState(null);
  const [latestBid, setLatestBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    const fetchUserIdIfNeeded = async () => {
      if (!userId) {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          Alert.alert('Error', 'Failed to retrieve user. Please log in again.');
          navigation.navigate('LoginPage');
        } else if (user) {
          setUserId(user.id);
        }
      }
    };
    fetchUserIdIfNeeded();
  }, [userId]);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('livestock')
        .select(`*, profiles:profiles!livestock_owner_id_fkey (full_name)`)
        .eq('livestock_id', itemId)
        .single();

      if (error) {
        Alert.alert("Error", "Failed to fetch item details.");
      } else {
        setItem(data);
        fetchLatestBid(itemId);
        if (data.auction_end) {
          startCountdown(data.auction_end);
        }
      }
      setLoading(false);
    };

    const fetchLatestBid = async (livestockId) => {
      const { data, error } = await supabase
        .from('bids')
        .select('bid_amount')
        .eq('livestock_id', livestockId)
        .order('bid_amount', { ascending: false })
        .limit(1);

      if (!error && data.length > 0) {
        setLatestBid(data[0].bid_amount);
      } else {
        setLatestBid(null);
      }
    };

    fetchItem();

    // Subscribe to real-time updates for the livestock item
    const subscription = supabase
      .channel('livestock_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'livestock', filter: `livestock_id=eq.${itemId}` },
        (payload) => {
          console.log('Real-time update received:', payload.new);
          setItem(payload.new); // Update the item state with real-time data
        }
      )
      .subscribe();

    const bidSubscription = supabase
      .channel('bid_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bids', filter: `livestock_id=eq.${itemId}` },
        (payload) => {
          const newBid = payload.new.bid_amount;
          setLatestBid((prevBid) => Math.max(prevBid || 0, newBid));

          if (payload.new.bidder_id !== userId) {
            Alert.alert(
              "New Bid Alert!",
              `A new bid of ₱${newBid.toLocaleString()} has been placed.`
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
      supabase.removeChannel(bidSubscription);
    };
  }, [itemId]);


  const startCountdown = (endTime) => {
    const endTimestamp = new Date(endTime).getTime();

    const timer = setInterval(() => {
      const currentTime = new Date().getTime();
      const remainingTime = endTimestamp - currentTime;

      if (remainingTime <= 0) {
        clearInterval(timer);
        setTimeRemaining('AUCTION_ENDED');
        declareWinner(itemId); // Declare winner when countdown ends
      } else {
        const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        setTimeRemaining(
          `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  };




  
  const declareWinner = async (livestockId) => {
    try {
      // Fetch the highest bid
      const { data: highestBid, error: bidError } = await supabase
        .from('bids')
        .select('bidder_id, bid_amount')
        .eq('livestock_id', livestockId)
        .order('bid_amount', { ascending: false })
        .limit(1)
        .single();
  
      if (bidError || !highestBid) {
        console.warn('No bids found. Marking auction as ended without a sale.');
        await supabase
          .from('livestock')
          .update({ status: 'AUCTION_ENDED' })
          .eq('livestock_id', livestockId);
        return;
      }
  
      // Fetch the livestock details
      const { data: livestock, error: livestockError } = await supabase
        .from('livestock')
        .select('owner_id, category')
        .eq('livestock_id', livestockId)
        .single();
  
      if (livestockError || !livestock) {
        console.error('Error fetching livestock details:', livestockError);
        return;
      }
  
      // Update livestock status to SOLD
      const { error: updateError } = await supabase
        .from('livestock')
        .update({ winner_id: highestBid.bidder_id, status: 'AUCTION_ENDED' })
        .eq('livestock_id', livestockId);
  
      if (updateError) {
        console.error('Error updating livestock status:', updateError.message);
        return;
      }
  
      console.log('Livestock marked as SOLD');
  
      // Prepare notifications
      const notifications = [
        {
          recipient_id: highestBid.bidder_id,
          recipient_role: 'BIDDER',
          livestock_id: livestockId,
          message: `Congratulations! You won the auction for ${livestock.category} with a bid of ₱${highestBid.bid_amount.toLocaleString()}.`,
          is_read: false,
          notification_type: 'AUCTION_END',
        },
        {
          recipient_id: livestock.owner_id,
          recipient_role: 'SELLER',
          livestock_id: livestockId,
          message: `Your auction for ${livestock.category} has ended. Winning bid: ₱${highestBid.bid_amount.toLocaleString()}.`,
          is_read: false,
          notification_type: 'AUCTION_END',
        },
      ];
  
      for (const notification of notifications) {
        // Check if a similar notification already exists
        const { data: existingNotification, error: checkError } = await supabase
          .from('notifications')
          .select('id')
          .eq('livestock_id', notification.livestock_id)
          .eq('recipient_id', notification.recipient_id)
          .eq('notification_type', notification.notification_type)
          .single();
  
        if (!checkError && existingNotification) {
          console.log('Notification already exists, skipping:', notification);
          continue;
        }
  
        // Insert notification if it doesn't exist
        const { error: insertError } = await supabase.from('notifications').insert(notification);
        if (insertError) {
          console.error('Error inserting notification:', insertError.message);
        }
      }
  
      console.log('Notifications sent successfully.');
    } catch (error) {
      console.error('Error in declareWinner:', error);
    }
  };
  
  
  

  const isCreator = item && userId === item.owner_id; // Check if the user is the auction creator

  const handleAction = async (actionType) => {
    console.log("Action Type: ", actionType);
    console.log("Is Creator: ", isCreator);
    console.log("Time Remaining: ", timeRemaining);
  
    if (actionType === "Ask") {
      console.log("Navigating to ForumPage...");
      navigation.navigate("ForumPage", {
        item: {
          livestock_id: item.livestock_id,
          category: item.category || "Unknown",
          created_by: item.created_by,
        },
        userId: userId,
      });
    } else if (actionType === "Delete") {
      Alert.alert(
        "Confirm Deletion",
        "Are you sure you want to delete this auction?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: deleteAuction },
        ]
      );
    } else if (actionType === "Edit") {
      console.log("Navigating to EditAuctionPage...");
      navigation.navigate("EditAuctionPage", { itemId: item.id });
    } else if (actionType === "Bid") {
      console.log("Navigating to BidPage...");
      navigation.navigate("BidPage", {
        item,
        userId,
        ownerId: item.owner_id,
      });
    } else {
      console.log("Unhandled action type:", actionType);
    }
  };
  


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#405e40" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>No item details available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {imageLoading && (
          <ActivityIndicator size="large" color="#405e40" style={styles.imageLoader} />
        )}
        <Image
          style={styles.mainImage}
          source={{ uri: item.image_url || 'https://via.placeholder.com/300' }}
          onLoadEnd={() => setImageLoading(false)}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.header}>{item.category.toUpperCase()}</Text>
          <Text style={styles.subHeader}>Weight: {item.weight}kg   Breed: {item.breed}</Text>
        </View>

        <View style={styles.sellerContainer}>
          <Image style={styles.avatar} source={{ uri: 'https://via.placeholder.com/50' }} />
          <View style={styles.sellerInfo}>
            <Text style={styles.label}>Seller: <Text style={styles.infoText}>{item.profiles?.full_name || 'Unknown'}</Text></Text>
            <Text style={styles.label}>Location: <Text style={styles.infoText}>{item.location}</Text></Text>
          </View>
        </View>

        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Starting Price</Text>
            <Text style={styles.priceText}>₱{item.starting_price?.toLocaleString()}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Latest Bid</Text>
            <Text style={styles.priceText}>₱{latestBid?.toLocaleString() || 'No bids yet'}</Text>
          </View>
        </View>

        <Text style={styles.timeRemaining}>Time Remaining: {timeRemaining || 'Loading...'}</Text>

        <View style={styles.buttonContainer}>
  {/* Ask / Delete Button */}
  <TouchableOpacity
  style={styles.button}
  onPress={() => {
    console.log("Button Pressed: ", isCreator ? "Delete" : "Ask");
    handleAction(isCreator ? "Delete" : "Ask");
  }}
>
  <Text style={styles.buttonText}>{isCreator ? "Delete" : "Ask"}</Text>
</TouchableOpacity>

<TouchableOpacity
  style={[styles.button, timeRemaining === "Auction Ended" ? styles.disabledButton : null]}
  onPress={() => {
    console.log("Button Pressed: ", isCreator ? "Edit" : "Bid");
    handleAction(isCreator ? "Edit" : "Bid");
  }}
  disabled={timeRemaining === "Auction Ended"}
>
  <Text style={styles.buttonText}>{isCreator ? "Edit" : "Bid"}</Text>
</TouchableOpacity>


        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageContainer: { width: '100%', height: 200, position: 'relative', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageLoader: { position: 'absolute', zIndex: 1 },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  infoContainer: { padding: 20, backgroundColor: '#f8f8f8', borderRadius: 8, marginBottom: 20 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subHeader: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
  sellerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  sellerInfo: { flex: 1 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  infoText: { fontWeight: 'normal', color: '#555' },
  priceSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  priceContainer: { flex: 1, alignItems: 'center', padding: 15, backgroundColor: '#f2f2f2', borderRadius: 8, marginHorizontal: 5 },
  priceLabel: { fontSize: 16, color: '#555' },
  priceText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 5 },
  timeRemaining: { textAlign: 'leeft', color: '#777', marginVertical: 10, fontSize: 16 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  button: { backgroundColor: '#335441', padding: 10, borderRadius: 5, width: '40%', alignItems: 'center' },
  disabledButton: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default LivestockAuctionDetailPage;
