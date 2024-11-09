import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { supabase } from '../supabase'; // Import your Supabase client

const Pns2 = () => {
  const [data, setData] = useState([]);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch animals and their weight ranges
        const { data: animals, error: animalError } = await supabase
          .from('pns2_animals')
          .select('*');

        if (animalError) throw new Error(animalError.message);

        // Fetch prices with animal_id references
        const { data: prices, error: priceError } = await supabase
          .from('pns2_prices')
          .select('*');

        if (priceError) throw new Error(priceError.message);

        // Combine animal and price data
        const organizedData = animals.map((animal) => {
          const animalPrices = prices
            .filter((price) => price.animal_id === animal.id)
            .map((price) => ({ label: price.label, value: price.price_value }));
          return {
            animal: animal.animal,
            weightRange: animal.weight_range,
            prices: animalPrices,
          };
        });

        setData(organizedData);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();
  }, []);

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

export default Pns2;
