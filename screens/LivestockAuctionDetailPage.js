import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../supabase';
import AuctionDetailsHeader from '../Components/LivestockAuctionDetailPage/AuctionDetailsHeader';
import AuctionImage from '../Components/LivestockAuctionDetailPage/AuctionImage';
import AuctionDetails from '../Components/LivestockAuctionDetailPage/AuctionDetails';
import SellerInfo from '../Components/LivestockAuctionDetailPage/SellerInfo';
import PriceDetails from '../Components/LivestockAuctionDetailPage/PriceDetails'; // Updated Import
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
  }, [itemId]);

  const startCountdown = (endTime) => {
    const endTimestamp = new Date(endTime).getTime();
    const timer = setInterval(() => {
      const currentTime = new Date().getTime();
      const remainingTime = endTimestamp - currentTime;
  
      if (remainingTime <= 0) {
        clearInterval(timer);
        setTimeRemaining('AUCTION_ENDED');
        console.log('Auction ended. Declaring winner...');
        
        // Automatically declare the winner
        declareWinner(itemId); // Call declareWinner with the current itemId
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
  
  const declareWinner = async (livestockId) => {
    try {
      console.log('Starting winner declaration for livestock:', livestockId);
  
      // Step 1: Check if status is already AUCTION_ENDED or SOLD
      const { data: livestockStatus, error: statusError } = await supabase
        .from('livestock')
        .select('status')
        .eq('livestock_id', livestockId)
        .single();
  
      if (statusError) {
        console.error('Error checking auction status:', statusError.message);
        return;
      }
  
      if (livestockStatus.status === 'AUCTION_ENDED' || livestockStatus.status === 'SOLD') {
        console.log('Winner already declared or auction ended. Exiting...');
        return; // Exit if already ended or sold
      }
  
      // Step 2: Fetch the highest bid
      const { data: highestBid, error: bidError } = await supabase
        .from('bids')
        .select('bidder_id, bid_amount')
        .eq('livestock_id', livestockId)
        .order('bid_amount', { ascending: false })
        .limit(1)
        .single();
  
      if (bidError) {
        console.error('Error fetching highest bid:', bidError.message);
        return;
      }
  
      if (!highestBid) {
        console.warn('No bids found for this auction. Marking as AUCTION_ENDED.');
        await supabase
          .from('livestock')
          .update({ status: 'AUCTION_ENDED' })
          .eq('livestock_id', livestockId);
        return;
      }
  
      // Step 3: Update status to AUCTION_ENDED
      const { error: updateError } = await supabase
        .from('livestock')
        .update({ status: 'AUCTION_ENDED' })
        .eq('livestock_id', livestockId);
  
      if (updateError) {
        console.error('Error updating livestock status:', updateError.message);
        return;
      }
  
      console.log('Livestock status updated to AUCTION_ENDED.');
  
      // Step 4: Send a single notification to the winner and seller
      const notifications = [
        {
          recipient_id: highestBid.bidder_id,
          recipient_role: 'BIDDER',
          livestock_id: livestockId,
          message: `Congratulations! You won the auction with a bid of ₱${highestBid.bid_amount.toLocaleString()}.`,
          is_read: false,
          notification_type: 'AUCTION_END',
          created_at: new Date(),
        },
        {
          recipient_id: livestockStatus.owner_id,
          recipient_role: 'SELLER',
          livestock_id: livestockId,
          message: `Your auction has ended. Winning bid: ₱${highestBid.bid_amount.toLocaleString()}.`,
          is_read: false,
          notification_type: 'AUCTION_END',
          created_at: new Date(),
        },
      ];
  
      await supabase.from('notifications').insert(notifications);
      console.log('Notifications sent successfully.');
  
    } catch (error) {
      console.error('Unexpected error in declareWinner:', error.message);
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
