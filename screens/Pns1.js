import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { supabase } from '../supabase'; // Import your Supabase client

const Pns1 = () => {
  const [data, setData] = useState([]);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: prices, error } = await supabase
          .from('pns1_prices') // Adjust to correct table name
          .select('*');

        if (error) {
          console.error('Error fetching data:', error);
        } else {
          // Organize data by livestock for easier mapping in the component
          const organizedData = prices.reduce((acc, item) => {
            const { livestock, weight_range, label, price_min, price_max } = item; // Now selecting both price_min and price_max
            const existingLivestock = acc.find((a) => a.livestock === livestock);

            if (existingLivestock) {
              existingLivestock.prices.push({ label, price_min, price_max }); // Store both price_min and price_max
            } else {
              acc.push({
                livestock,
                weightRange: weight_range,
                prices: [{ label, price_min, price_max }], // Store both price_min and price_max
              });
            }
            return acc;
          }, []);

          setData(organizedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs only once when the component mounts

  return (
    <ScrollView style={styles.scrollContainer}>
      {data.map((item, livestockIndex) => (
        <View key={livestockIndex} style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.livestockText}>{item.livestock}</Text>
            <Text style={styles.weightRangeText}>{item.weightRange}</Text>
          </View>
          <View style={styles.priceBox}>
            {item.prices.map((price, priceIndex) => (
              <View key={priceIndex} style={styles.priceRow}>
                <Text style={styles.priceLabel}>{price.label}</Text>
                <View style={styles.priceValueContainer}>
                  <Text style={styles.priceValue}>{price.price_min}</Text>
                  <Text style={styles.priceSeparator}> - </Text>
                  <Text style={styles.priceValue}>{price.price_max}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  livestockText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weightRangeText: {
    fontSize: 16,
    color: '#777',
  },
  priceBox: {
    marginTop: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  priceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  priceSeparator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default Pns1;
