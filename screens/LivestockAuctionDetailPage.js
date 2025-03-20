import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../supabase'; // Import your Supabase client
import AuctionDetailsHeader from '../Components/LivestockAuctionDetailPage/AuctionDetailsHeader';
import AuctionImage from '../Components/LivestockAuctionDetailPage/AuctionImage';
import AuctionDetails from '../Components/LivestockAuctionDetailPage/AuctionDetails';
import SellerInfo from '../Components/LivestockAuctionDetailPage/SellerInfo';
import PriceDetails from '../Components/LivestockAuctionDetailPage/PriceDetails'; 
import CountdownTimer from '../Components/LivestockAuctionDetailPage/CountdownTimer';
import ActionButtons from '../Components/LivestockAuctionDetailPage/ActionButtons';
import BottomDrawerModal from '../Components/LivestockAuctionDetailPage/BottomDrawerModal';

const LivestockAuctionDetailPage = ({ route, navigation }) => {
  const { itemId, userId: userIdFromParams } = route.params || {};
  const [userId, setUserId] = useState(userIdFromParams);
  const [item, setItem] = useState(null);
  const [latestBid, setLatestBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [userCount, setUserCount] = useState(0);

  // Fetch userId if needed
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

  // Fetch auction and bid data
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('livestock')
        .select(`
          *,
          profiles:profiles!livestock_owner_id_fkey (full_name, profile_image)
        `)
        .eq('livestock_id', itemId)
        .single();
      if (error) {
        Alert.alert('Error', 'Failed to fetch item details.');
      } else {
        setItem(data);
        fetchLatestBid(itemId);
        fetchBidCount(itemId);
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

    const fetchBidCount = async (livestockId) => {
      const { data, error } = await supabase
        .from('bids')
        .select('bidder_id', { count: 'exact' })
        .eq('livestock_id', livestockId);
      if (!error) {
        setUserCount(data.length);
      }
    };

    fetchItem();

    // Real-time subscriptions for livestock and bids
    const itemSubscription = supabase
      .channel('livestock-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'livestock',
        filter: `livestock_id=eq.${itemId}`,
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setItem((prevItem) => ({
            ...prevItem,
            ...payload.new,
          }));
        }
      })
      .subscribe();

    const bidSubscription = supabase
      .channel('bids-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bids',
        filter: `livestock_id=eq.${itemId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          fetchLatestBid(itemId);
          fetchBidCount(itemId);
        }
      })
      .subscribe();

    // Cleanup subscriptions
    return () => {
      itemSubscription.unsubscribe();
      bidSubscription.unsubscribe();
    };
  }, [itemId]);

  // Real-time subscription for winner notifications using channel()
  useEffect(() => {
    const winnerNotifChannel = supabase
      .channel('winner_notifications-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'winner_notifications',
      }, (payload) => {
        console.log('New winner notification:', payload);
        // Update your UI with the new notification or display it
      })
      .subscribe();
  
    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(winnerNotifChannel);
    };
  }, []);
  

  const startCountdown = (endTime) => {
    const endTimestamp = new Date(endTime).getTime();
    const timer = setInterval(() => {
      const currentTime = new Date().getTime();
      const remainingTime = endTimestamp - currentTime;

      if (remainingTime <= 0) {
        clearInterval(timer);
        setTimeRemaining('AUCTION_ENDED');
        console.log('AUCTION_ENDED. Declaring winner...');
        declareWinner(itemId);
      } else {
        const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        setTimeRemaining(`${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  };

  const declareWinner = async (itemId) => {
    try {
      console.log("Fetching the highest bid for item:", itemId);
  
      // ✅ Get the highest bid for the item
      const { data: highestBidData, error } = await supabase
        .from('bids')
        .select('bidder_id, bid_amount')
        .eq('livestock_id', itemId)
        .order('bid_amount', { ascending: false })
        .limit(1);
  
      if (error) {
        console.error('❌ Error fetching highest bid:', error);
        throw new Error('Failed to retrieve highest bid.');
      }
  
      console.log("✅ Highest bid data:", highestBidData);
  
      if (!highestBidData || highestBidData.length === 0) {
        console.error('⚠ No bids were placed.');
        throw new Error('No bids were placed.');
      }
  
      const winnerId = highestBidData[0].bidder_id;
      console.log("🏆 Winner ID found:", winnerId);
  
      // ✅ Fetch Seller ID (auction owner)
      const { data: itemData, error: itemError } = await supabase
        .from('livestock')
        .select('owner_id')
        .eq('livestock_id', itemId)
        .single();
  
      if (itemError || !itemData) {
        console.error('❌ Error fetching auction owner:', itemError?.message);
        throw new Error('Failed to retrieve auction owner.');
      }
  
      const sellerId = itemData.owner_id;
      console.log("🛒 Seller ID:", sellerId, "🏆 Winner ID:", winnerId);
  
      // ✅ Update item status to 'AUCTION_ENDED'
      const { error: updateError } = await supabase
        .from('livestock')
        .update({ status: 'AUCTION_ENDED', winner_id: winnerId })
        .eq('livestock_id', itemId);
  
      if (updateError) {
        console.error('❌ Error updating item status:', updateError);
        throw new Error('Failed to declare winner.');
      }
  
      console.log("✅ Item status updated successfully.");
  
      // ✅ Send notifications
      await sendWinnerNotifications(itemId, winnerId);  // Notify the winner (bidder)
      await sendNotificationToSeller(  // Notify the seller (owner)
        itemId,
        sellerId,
        'AUCTION_ENDED_OWNER',
        'The auction has ended. You have a winner for your livestock.'
      );
  
    } catch (error) {
      console.error('❌ Error in declareWinner:', error.message);
    }
  };
  
  const sendWinnerNotifications = async (itemId, winnerId) => {
    try {
      console.log("📌 Fetching auction owner for item:", itemId);
  
      // ✅ Fetch seller ID (auction owner)
      const { data: itemData, error: itemError } = await supabase
        .from('livestock')
        .select('owner_id')
        .eq('livestock_id', itemId)
        .single();
  
      if (itemError || !itemData) {
        console.error('❌ Error fetching auction owner:', itemError?.message);
        throw new Error('Failed to retrieve auction owner.');
      }
  
      const sellerId = itemData.owner_id;
      console.log("✅ Seller ID:", sellerId, "🏆 Winner ID:", winnerId);
  
      // ✅ Ensure **only the winner** receives `AUCTION_ENDED_WINNER`
      if (winnerId === sellerId) {
        console.warn("⚠ The seller is also the highest bidder. Skipping winner notification.");
        return; // Prevent sending `AUCTION_ENDED_WINNER` to the seller
      }
  
      // ✅ Check if the notification already exists
      const { data: existingNotif, error: checkError } = await supabase
        .from('winner_notifications')
        .select('id')
        .eq('livestock_id', itemId)
        .eq('notification_type', 'AUCTION_ENDED_WINNER')
        .maybeSingle();
        
      if (existingNotif) {
        console.log('⚠ Winner notification already exists. Skipping duplicate insertion.');
        return;
      }
  
      // ✅ Insert the notification **ONLY for the winner**
      const { error: insertError } = await supabase.from('winner_notifications').insert([
        {
          livestock_id: itemId,
          winner_id: winnerId, // ✅ Ensure this goes to the winner (bidder)
          message: '🎉 Congratulations! You are the winner of the auction!',
          notification_type: 'AUCTION_ENDED_WINNER',
          role: 'bidder',
          is_read: false,
        }
      ]);
  
      if (insertError) {
        console.error('❌ Error inserting winner notification:', insertError.message);
        throw new Error('Failed to send winner notification.');
      }
  
      console.log("✅ AUCTION_ENDED_WINNER notification sent successfully to:", winnerId);
    } catch (error) {
      console.error('❌ Error in sendWinnerNotifications:', error.message);
    }
  };
  
  
  const sendNotificationToSeller = async (livestockId, sellerId, type, message) => {
    try {
      console.log(`🔹 Checking existing ${type} notification for livestock: ${livestockId}`);
  
      // ✅ Check if notification already exists
      const { data: existingNotif, error: checkError } = await supabase
        .from('notifications')
        .select('id')
        .eq('livestock_id', livestockId)
        .eq('notification_type', type)
        .maybeSingle();
  
      if (checkError) {
        console.error(`❌ Error checking existing ${type} notification:`, checkError.message);
        return;
      }
  
      if (existingNotif) {
        console.log(`⚠ ${type} notification already exists. Skipping duplicate insertion.`);
        return;
      }
  
      // ✅ Insert new notification if it doesn't exist
      console.log(`🔹 Sending ${type} notification for livestock: ${livestockId}`);
  
      const { error } = await supabase.from('notifications').insert([
        {
          livestock_id: livestockId,
          seller_id: sellerId,
          message: message,
          notification_type: type,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]);
  
      if (error) {
        console.error(`❌ Error sending ${type} notification to seller:`, error.message);
      } else {
        console.log(`✅ ${type} notification sent successfully to seller (${sellerId}).`);
      }
    } catch (err) {
      console.error(`❌ Unexpected error in ${type} notification:`, err.message);
    }
  };
  
  
  
  
  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  const navigateToForum = () => {
    navigation.navigate('ForumPage', {
      item: {
        livestock_id: item.livestock_id,
        category: item.category || 'Unknown',
        created_by: item.created_by,
      },
      userId: userId,
    });
  };

  const navigateToEdit = () => {
    if (userId !== item.owner_id) {
      Alert.alert('Unauthorized', 'You cannot edit this auction.');
      return;
    }
    navigation.navigate('EditAuctionPage', { itemId: item.livestock_id });
  };

  const handleDelete = async () => {
    if (userId !== item.owner_id) {
      Alert.alert('Unauthorized', 'You cannot delete this auction.');
      return;
    }
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this auction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('livestock')
                .delete()
                .eq('livestock_id', item.livestock_id);
              if (error) throw error;
              Alert.alert('Success', 'Auction deleted successfully!');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete the auction. Please try again.');
            }
          },
        },
      ]
    );
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
      <AuctionDetailsHeader title="Auction Details" onBackPress={() => navigation.goBack()} />
      <AuctionImage imageUrl={item.image_url} />
      <View style={styles.contentContainer}>
        <AuctionDetails item={item} />
        <SellerInfo
          sellerName={item.profiles?.full_name}
          location={item.location}
          profileImage={item.profiles?.profile_image}
        />
        <CountdownTimer timeRemaining={timeRemaining} />
        
        <PriceDetails item={item} latestBid={latestBid} /> {/* Updated Component */}
        
        <ActionButtons
          isCreator={userId === item.owner_id}
          handleAsk={navigateToForum}
          handleBid={openDrawer}
          handleEdit={navigateToEdit}
          handleDelete={handleDelete}
        />
      </View>

      <BottomDrawerModal
        isVisible={isDrawerVisible}
        onClose={closeDrawer}
        item={item}
        userId={userId}
        ownerId={item.owner_id}
        currentHighestBid={latestBid}
        setCurrentHighestBid={setLatestBid}
        userCount={userCount}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default LivestockAuctionDetailPage;