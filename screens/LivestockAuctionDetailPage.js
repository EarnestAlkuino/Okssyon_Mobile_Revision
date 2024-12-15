import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { supabase } from '../supabase';

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
        Alert.alert('Error', 'Failed to fetch item details.');
      } else {
        setItem(data);

        if (data.status === 'AVAILABLE' && data.auction_duration) {
          console.log('Status changed to AVAILABLE. Starting countdown...');
          startCountdown(data.auction_duration, data.livestock_id);
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

    const subscription = supabase
      .channel('livestock_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'livestock', filter: `livestock_id=eq.${itemId}` },
        (payload) => {
          console.log('Real-time update received:', payload.new);

          const updatedItem = payload.new;
          setItem(updatedItem);

          if (updatedItem.status === 'AVAILABLE' && updatedItem.auction_duration) {
            console.log('Real-time status changed to AVAILABLE. Starting countdown...');
            startCountdown(updatedItem.auction_duration, updatedItem.livestock_id);
          }
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
          if (newBid > (latestBid || 0)) {
            setLatestBid(newBid);
            if (payload.new.bidder_id !== userId) {
              Alert.alert(
                'New Bid Alert!',
                `A new bid of ₱${newBid.toLocaleString()} has been placed.`
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
      supabase.removeChannel(bidSubscription);
    };
  }, [itemId]);

  const startCountdown = (duration, livestockId) => {
    if (!duration || !livestockId) return;

    const durationParts = duration.split(':'); // Parse duration (e.g., "01:30:00")
    const totalMilliseconds =
      (parseInt(durationParts[0], 10) * 3600 +
        parseInt(durationParts[1], 10) * 60 +
        parseInt(durationParts[2], 10)) *
      1000;

    const endTime = Date.now() + totalMilliseconds;

    const timer = setInterval(() => {
      const remainingTime = endTime - Date.now();

      if (remainingTime <= 0) {
        clearInterval(timer);
        setTimeRemaining('AUCTION_ENDED');
        console.log('Auction ended. Declaring winner...');
        declareWinner(livestockId);
      } else {
        const hours = Math.floor(remainingTime / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        setTimeRemaining(
          `${hours}h ${minutes}m ${seconds}s`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  };

  const declareWinner = async (livestockId) => {
    try {
      const { data: highestBid, error: bidError } = await supabase
        .from('bids')
        .select('bidder_id, bid_amount')
        .eq('livestock_id', livestockId)
        .order('bid_amount', { ascending: false })
        .limit(1)
        .single();

      if (bidError || !highestBid) {
        await supabase
          .from('livestock')
          .update({ status: 'AUCTION_ENDED' })
          .eq('livestock_id', livestockId);
        return;
      }

      const { error: updateError } = await supabase
        .from('livestock')
        .update({ winner_id: highestBid.bidder_id, status: 'AUCTION_ENDED' })
        .eq('livestock_id', livestockId);

      if (!updateError) {
        console.log('Winner declared successfully.');
      }
    } catch (error) {
      console.error('Error declaring winner:', error);
    }
  };

  const isCreator = item && userId === item.owner_id; // Check if the user is the auction creator

  const deleteAuction = async () => {
    try {
      // Confirm deletion in the database
      const { error } = await supabase
        .from('livestock')
        .delete()
        .eq('livestock_id', item.livestock_id);
  
      if (error) {
        console.error("Error deleting auction:", error.message);
        Alert.alert("Error", "Failed to delete the auction. Please try again.");
      } else {
        Alert.alert("Success", "Auction deleted successfully!");
        navigation.goBack(); // Navigate back after successful deletion
      }
    } catch (err) {
      console.error("Error during deleteAuction:", err);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };
  
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
      if (!isCreator) {
        Alert.alert("Unauthorized", "You are not allowed to delete this auction.");
        return;
      }
  
      Alert.alert(
        "Confirm Deletion",
        "Are you sure you want to delete this auction?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteAuction(); // Ensure deleteAuction executes properly
              } catch (error) {
                console.error("Error in deleteAuction:", error);
              }
            },
          },
        ]
      );
    } else if (actionType === "Edit") {
      if (!isCreator) {
        Alert.alert("Unauthorized", "You are not allowed to edit this auction.");
        return;
      }
  
      console.log("Navigating to EditAuctionPage...");
      navigation.navigate("EditAuctionPage", { itemId: item.livestock_id });
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

        <Text style={styles.timeRemaining}>
          Time Remaining: {timeRemaining || 'Loading...'}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleAction(isCreator ? 'Delete' : 'Ask')}
          >
            <Text style={styles.buttonText}>{isCreator ? 'Delete' : 'Ask'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleAction(isCreator ? 'Edit' : 'Bid')}
          >
            <Text style={styles.buttonText}>{isCreator ? 'Edit' : 'Bid'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageContainer: { width: '100%', height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  infoContainer: { padding: 20, backgroundColor: '#f8f8f8', borderRadius: 8, marginBottom: 20 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subHeader: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
  priceSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  priceContainer: { flex: 1, alignItems: 'center', padding: 15, backgroundColor: '#f2f2f2', borderRadius: 8, marginHorizontal: 5 },
  priceLabel: { fontSize: 16, color: '#555' },
  priceText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 5 },
  timeRemaining: { textAlign: 'center', color: '#777', marginVertical: 10, fontSize: 16 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  button: { backgroundColor: '#335441', padding: 10, borderRadius: 5, width: '40%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default LivestockAuctionDetailPage;
