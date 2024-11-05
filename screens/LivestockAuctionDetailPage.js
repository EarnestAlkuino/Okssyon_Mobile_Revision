import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, TextInput, RefreshControl, ScrollView, SafeAreaView } from 'react-native';
import { supabase } from '../supabase';
import { Ionicons } from '@expo/vector-icons';

const LivestockAuctionDetailPage = ({ route, navigation }) => {
  const { itemId, userId: userIdFromParams } = route.params || {};
  const [userId, setUserId] = useState(userIdFromParams);
  const [item, setItem] = useState(null);
  const [latestBid, setLatestBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    fetchUserIdIfNeeded();
    fetchItem();
  }, [itemId]);

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

  const fetchItem = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('livestock')
      .select(`*, profiles:profiles!owner_id (full_name)`)
      .eq('id', itemId)
      .single();

    if (error) {
      Alert.alert("Error", "Failed to fetch item details.");
    } else {
      setItem(data);
      fetchLatestBid(data);
    }
    setLoading(false);
  };

  const fetchLatestBid = async (itemData) => {
    const { data, error } = await supabase
      .from('bids')
      .select('bid_amount')
      .eq('livestock_id', itemId)
      .order('bid_amount', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest bid:', error);
    } else if (data.length > 0) {
      setLatestBid(data[0].bid_amount);
    } else {
      setLatestBid(itemData?.starting_price);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItem();
    setRefreshing(false);
  };

  const isCreator = item && userId === item.owner_id;

  const handleAction = async (actionType) => {
    if (isCreator) {
      if (actionType === "Edit") {
        if (!item?.id) {
          Alert.alert("Error", "Auction ID is missing.");
          return;
        }
        navigation.navigate('EditAuctionPage', { itemId: item.id });
      } else if (actionType === "Delete") {
        Alert.alert(
          "Confirm Deletion",
          "Are you sure you want to delete this auction?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: deleteAuction },
          ]
        );
      }
    } else {
      const targetPage = actionType === 'Bid' ? 'BidPage' : 'ChatPage';
      navigation.navigate(targetPage, { item, userId, ownerId: item.owner_id });
    }
  };

  const deleteAuction = async () => {
    try {
      const { error } = await supabase
        .from('livestock')
        .delete()
        .eq('id', itemId);

      if (error) {
        Alert.alert("Error", "Failed to delete auction. Please try again.");
        console.error("Error deleting auction:", error);
      } else {
        Alert.alert("Success", "Auction deleted successfully.");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error deleting auction:", error);
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

  const formattedEndTime = item?.auction_end_time
    ? new Date(item.auction_end_time).toLocaleString()
    : 'Not available';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contentWrapper}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.imageContainer}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="white"
            style={styles.backIcon}
            onPress={() => navigation.goBack()}
          />
          {imageLoading && <ActivityIndicator size="large" color="#405e40" style={styles.imageLoader} />}
          <Image
            style={styles.mainImage}
            source={{ uri: item.image_url || 'https://via.placeholder.com/300' }}
            onLoadEnd={() => setImageLoading(false)}
          />
        </View>

        <View style={styles.detailContainer}>
          <Text style={styles.categoryText}>{item.category?.toUpperCase()}</Text>

          <View style={styles.attributesContainer}>
            <View style={styles.attribute}>
              <Text style={styles.label}>Weight:</Text>
              <Text>{item.weight} kg</Text>
            </View>
            <View style={styles.attribute}>
              <Text style={styles.label}>Breed:</Text>
              <Text>{item.breed}</Text>
            </View>
          </View>

          <View style={styles.sellerContainer}>
            <Image style={styles.avatar} source={{ uri: 'https://via.placeholder.com/50' }} />
            <View style={styles.sellerInfo}>
              <Text style={styles.label}>Seller: <Text style={styles.infoText}>{item.profiles?.full_name || 'Unknown'}</Text></Text>
              <Text style={styles.label}>Location: <Text style={styles.infoText}>{item.location}</Text></Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.label}>Starting Price</Text>
            <TextInput style={styles.priceText} value={`₱${item.starting_price?.toLocaleString()}`} editable={false} />
            
            <Text style={styles.label}>Highest Bid</Text>
            <TextInput style={styles.priceText} value={`₱${latestBid?.toLocaleString()}`} editable={false} />

            <Text style={styles.label}>Auction Ends At</Text>
            <Text style={styles.endTimeText}>{formattedEndTime}</Text>
          </View>

          <View style={styles.buttonContainer}>
            {isCreator ? (
              <>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleAction("Delete")}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editButton} onPress={() => handleAction("Edit")}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.bidButton} onPress={() => handleAction("Bid")}>
                  <Text style={styles.bidButtonText}>Bid</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chatButton} onPress={() => handleAction("Chat")}>
                  <Text style={styles.chatButtonText}>Chat</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  contentWrapper: { flex: 1, backgroundColor: '#fff' },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  backIcon: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 1,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    flex: 1,
  },
  categoryText: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#405e40', marginBottom: 10 },
  attributesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10, // Adjusted spacing
  },
  attribute: {
    flex: 1,
    alignItems: 'center',
  },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  sellerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  sellerInfo: { flex: 1 },
  infoText: { fontWeight: 'normal', color: '#555' },
  priceContainer: { marginBottom: 20 },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  endTimeText: { fontSize: 16, color: '#777', textAlign: 'left', marginBottom: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 2 },
  deleteButton: {
    borderColor: '#335441',
    borderWidth: 2,
    padding: 10,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
  },
  deleteButtonText: { color: '#335441', fontWeight: 'bold' },
  editButton: {
    backgroundColor: '#335441',
    padding: 10,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
  },
  editButtonText: { color: '#fff', fontWeight: 'bold' },
  bidButton: {
    backgroundColor: '#335441',
    padding: 10,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
  },
  bidButtonText: { color: '#fff', fontWeight: 'bold' },
  chatButton: {
    borderColor: '#335441',
    borderWidth: 2,
    padding: 10,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
  },
  chatButtonText: { color: '#335441', fontWeight: 'bold' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LivestockAuctionDetailPage;
