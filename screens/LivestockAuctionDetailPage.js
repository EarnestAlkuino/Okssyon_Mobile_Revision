import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { supabase } from '../supabase';
import AuctionDetailsHeader from '../Components/LivestockAuctionDetailPage/AuctionDetailsHeader';
import BottomDrawerModal from '../Components/LivestockAuctionDetailPage/BottomDrawerModal';
import ItemImage from '../Components/LivestockAuctionDetailPage/ItemImage';
import ItemDetails from '../Components/LivestockAuctionDetailPage/ItemDetails';
import SellerDetails from '../Components/LivestockAuctionDetailPage/SellerDetails';
import AuctionTimer from '../Components/LivestockAuctionDetailPage/AuctionTimer';
import PriceDetails from '../Components/LivestockAuctionDetailPage/PriceDetails';
import ActionButtons from '../Components/LivestockAuctionDetailPage/ActionButtons';

const LivestockAuctionDetailPage = ({ route, navigation }) => {
  const { itemId, userId: userIdFromParams } = route.params || {};
  const [userId, setUserId] = useState(userIdFromParams || null);
  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentHighestBid, setCurrentHighestBid] = useState(null);

  // Determine if the user is the auction creator
  const isCreator = item && userId === item.owner_id;

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching userId:", error.message);
      } else if (!userId && user?.id) { // Only set userId if it is null
        setUserId(user.id);
        console.log("Fetched userId:", user.id);
      }
    };
  
    if (!userId) {
      fetchUserId();
    }
  }, []); // Fix: Added proper closing bracket for useEffect

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('livestock')
          .select(
            `*, profiles:profiles!livestock_owner_id_fkey (full_name, profile_image)`
          )
          .eq('livestock_id', itemId)
          .single();

        if (error) throw error;

        console.log('Fetched item:', data);
        setItem(data);
        setSeller(data.profiles);

        if (data.status === 'AVAILABLE' && data.auction_duration) {
          startCountdown(data.auction_duration);
        }

        console.log(
          'isCreator:',
          data.owner_id === userId,
          '| userId:',
          userId,
          '| ownerId:',
          data.owner_id
        );
      } catch (err) {
        console.error('Error fetching item:', err.message);
        Alert.alert('Error', 'Failed to fetch item details.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, userId]);

  const startCountdown = (duration) => {
    const [hours, minutes, seconds] = duration.split(':').map(Number);
    const endTime = Date.now() + (hours * 3600 + minutes * 60 + seconds) * 1000;

    const timer = setInterval(() => {
      const remainingTime = endTime - Date.now();
      if (remainingTime <= 0) {
        clearInterval(timer);
        setTimeRemaining('Auction Ended');
      } else {
        const hrs = Math.floor(remainingTime / (1000 * 60 * 60));
        const mins = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((remainingTime % (1000 * 60)) / 1000);
        setTimeRemaining(`${hrs}h ${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  };

  const handleAction = async (actionType) => {
    console.log('Action Type:', actionType);
    console.log('Is Creator:', isCreator);

    if (actionType === 'Ask') {
      navigation.navigate('ForumPage', {
        item: { livestock_id: item.livestock_id },
        userId: userId,
      });
    } else if (actionType === 'Delete') {
      if (!isCreator) {
        Alert.alert('Unauthorized', 'Only the auction owner can delete this.');
        return;
      }
      Alert.alert('Confirm Deletion', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteAuction,
        },
      ]);
    } else if (actionType === 'Edit') {
      if (!isCreator) {
        Alert.alert('Unauthorized', 'Only the auction owner can edit this.');
        return;
      }
      navigation.navigate('EditAuctionPage', { itemId: item.livestock_id });
    }
  };

  const deleteAuction = async () => {
    try {
      const { error } = await supabase
        .from('livestock')
        .delete()
        .eq('livestock_id', item.livestock_id);

      if (error) {
        Alert.alert('Error', 'Failed to delete the auction. Please try again.');
      } else {
        Alert.alert('Success', 'Auction deleted successfully!');
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const handleAuctionEnd = async () => {
    try {
      const { error } = await supabase
        .from('livestock')
        .update({ status: 'AUCTION_ENDED' })
        .eq('livestock_id', item.livestock_id);
  
      if (error) {
        console.error('Error ending auction:', error);
      } else {
        console.log('Auction has ended.');
      }
    } catch (err) {
      console.error('Error during auction end:', err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#335441" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AuctionDetailsHeader title="Auction Details" onBackPress={() => navigation.goBack()} />

      <ItemImage imageUrl={item.image_url} />

      <View style={styles.contentContainer}>
        <Text style={styles.breedText}>{item.breed || 'Unknown Breed'}</Text>

        <ItemDetails item={item} />
        <SellerDetails seller={seller} />

        <AuctionTimer
          auctionEnd={item.auction_end}
          status={item.status}
          livestockId={item.livestock_id}
        />


        <PriceDetails item={item} latestBid={currentHighestBid} />

        <ActionButtons
          isCreator={isCreator}
          isModalVisible={isModalVisible}
          setModalVisible={setModalVisible}
          handleAsk={() => handleAction('Ask')}
          handleEdit={() => handleAction('Edit')}
          handleDelete={() => handleAction('Delete')}
        />

        <BottomDrawerModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          item={item}
          userId={userId}
          ownerId={item?.owner_id}
          currentHighestBid={currentHighestBid}
          setCurrentHighestBid={setCurrentHighestBid}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  breedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
});

export default LivestockAuctionDetailPage;
