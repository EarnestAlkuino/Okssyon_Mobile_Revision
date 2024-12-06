import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { supabase } from '../supabase'; // Import your Supabase client

const Pns3 = () => {
  const [data, setData] = useState([]);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch prices directly from the pns3_prices table
        const { data: prices, error } = await supabase
          .from('pns3_prices') // Adjust to correct table name
          .select('*');

        if (error) {
          console.error('Error fetching data:', error);
          return;
        }

        // Organize data by animal for easier mapping in the component
        const organizedData = prices.reduce((acc, item) => {
          const { animal, weight_range, label, price } = item; // Use 'price' instead of 'price_value'
          const existingAnimal = acc.find((a) => a.animal === animal);

          if (existingAnimal) {
            existingAnimal.prices.push({ label, value: price }); // Use 'price' here
          } else {
            acc.push({
              animal,
              weightRange: weight_range,
              prices: [{ label, value: price }], // Use 'price' here
            });
          }
          return acc;
        }, []);

        setData(organizedData);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs only once when the component mounts

  return (
    <ScrollView style={styles.scrollContainer}>
      {data.map((item, animalIndex) => (
        <View key={animalIndex} style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.animalText}>{item.animal}</Text>
            <Text style={styles.weightRangeText}>{item.weightRange}</Text>
          </View>
          <View style={styles.priceBox}>
            {item.prices.map((price, priceIndex) => (
              <View key={priceIndex} style={styles.priceRow}>
                <Text style={styles.priceLabel}>{price.label}</Text>
                <Text style={styles.priceValue}>{price.value}</Text>
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
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  animalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weightRangeText: {
    fontSize: 16,
    color: '#777',
  },
  priceBox: {
    marginTop: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  priceLabel: {
    fontSize: 14,
    color: '#555',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Pns3;
