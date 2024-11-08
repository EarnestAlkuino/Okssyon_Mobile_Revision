import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  RefreshControl,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { supabase } from '../supabase';
import { Ionicons } from '@expo/vector-icons';

const LivestockAuctionDetailPage = ({ route, navigation }) => {
  // Log route parameters for debugging
  console.log("Route parameters:", route.params);

  // Retrieve livestock_id and userId from route parameters, with a fallback value for testing
  const { livestock_id = "53379761-fa40-47ad-a871-17a61761b79d", userId: userIdFromParams } = route.params || {};
  console.log("Received livestock_id:", livestock_id); // Log the received livestock_id

  const [userId, setUserId] = useState(userIdFromParams);
  const [item, setItem] = useState(null);
  const [latestBid, setLatestBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    fetchUserIdIfNeeded();
    fetchItem();
  }, [livestock_id]);

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
    console.log("Fetching item details for livestock_id:", livestock_id); // Log to check value
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('livestock')
        .select(`
          livestock_id,
          owner_id,
          category,
          gender,
          image_url,
          proof_of_ownership_url,
          vet_certificate_url,
          breed,
          age,
          weight,
          starting_price,
          location,
          auction_start,
          auction_end,
          created_at,
          status,
          profiles:profiles!livestock_owner_id_fkey (full_name)
        `)
        .eq('livestock_id', livestock_id)
        .single();
  
      if (error) {
        console.error("Error fetching item details:", error);
        Alert.alert("Error", "Failed to fetch item details.");
      } else if (data) {
        setItem(data);
        fetchLatestBid(data);
      } else {
        console.warn("No item found with provided livestock_id.");
      }
    } catch (error) {
      console.error("Unexpected error fetching item details:", error);
    }
    setLoading(false);
  };
  
  const fetchLatestBid = async (itemData) => {
    const { data, error } = await supabase
      .from('bids')
      .select('bid_amount')
      .eq('livestock_id', livestock_id)
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

  const handleAction = (actionType) => {
    if (isCreator) {
      if (actionType === "Edit") {
        if (!item?.livestock_id) {
          Alert.alert("Error", "Auction ID is missing.");
          return;
        }
        navigation.navigate('EditAuctionPage', { livestock_id: item.livestock_id });
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
      navigation.navigate('BidPage', {
        item: {
          ...item,
          id: item.livestock_id,
        },
        userId: userId,
        ownerId: item.owner_id,
      });
    }
  };

  const deleteAuction = async () => {
    try {
      const { error } = await supabase
        .from('livestock')
        .delete()
        .eq('livestock_id', livestock_id);

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

  const formattedStartTime = item?.auction_start
    ? new Date(item.auction_start).toLocaleString()
    : 'Not available';

  const formattedEndTime = item?.auction_end
    ? new Date(item.auction_end).toLocaleString()
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
            source={{ uri: item?.image_url || 'https://via.placeholder.com/300' }}
            onLoadEnd={() => setImageLoading(false)}
          />
        </View>

        {item && (
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
              <View style={styles.attribute}>
                <Text style={styles.label}>Gender:</Text>
                <Text>{item.gender}</Text>
              </View>
              <View style={styles.attribute}>
                <Text style={styles.label}>Age:</Text>
                <Text>{item.age} years</Text>
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

              <Text style={styles.label}>Auction Starts At</Text>
              <Text style={styles.dateText}>{formattedStartTime}</Text>

              <Text style={styles.label}>Auction Ends At</Text>
              <Text style={styles.dateText}>{formattedEndTime}</Text>

              <Text style={styles.label}>Status</Text>
              <Text style={styles.statusText}>{item.status}</Text>
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
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  contentWrapper: { padding: 16 },
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
  },
  categoryText: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#405e40', marginBottom: 10 },
  attributesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  attribute: {
    flex: 1,
    alignItems: 'center',
  },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LivestockAuctionDetailPage;
