import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const Pns1 = () => {
  const data = [
    {
      animal: 'Cattle',
      weightRange: '500-600 kg',
      prices: [
        { label: 'Fattener', value: '138.66 - 154.28 per kg' },
        { label: 'Estmtd Dressed weight', value: '300.00-320.00 per kg' },
        { label: 'Liveweight', value: '200.00-205.00 per kg' },
      ],
    },
    {
      animal: 'Carabao',
      weightRange: '220-330 kg',
      prices: [
        { label: 'Fattener', value: '138.66 - 154.28 per kg' },
        { label: 'Estmtd Dressed weight', value: '300.00-320.00 per kg' },
        { label: 'Liveweight', value: '200.00-205.00 per kg' },
      ],
    },
    {
      animal: 'Horse',
      weightRange: '500-600 kg',
      prices: [
        { label: 'Fattener', value: '138.66 - 154.28 per kg' },
        { label: 'Estmtd Dressed weight', value: '300.00-320.00 per kg' },
        { label: 'Liveweight', value: '200.00-205.00 per kg' },
      ],
    },
    {
      animal: 'Pig',
      weightRange: '90-110 kg',
      prices: [
        { label: 'Fattener', value: '180.00-200.00 per kg' },
        { label: 'Estmtd Dressed weight', value: '360.00-380.00 per kg' },
        { label: 'Liveweight', value: '240.00-260.00 per kg' },
      ],
    },
    {
      animal: 'Sheep',
      weightRange: '40-60 kg',
      prices: [
        { label: 'Fattener', value: '140.00-160.00 per kg' },
        { label: 'Estmtd Dressed weight', value: '280.00-300.00 per kg' },
        { label: 'Liveweight', value: '180.00-200.00 per kg' },
      ],
    },
    {
      animal: 'Goat',
      weightRange: '500-600 kg',
      prices: [
        { label: 'Estmtd Dressed weight', value: '300.00-320.00 per kg' },
        { label: 'Liveweight', value: '200.00-205.00 per kg' },
      ],
    },
  ];

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

export default Pns1;
