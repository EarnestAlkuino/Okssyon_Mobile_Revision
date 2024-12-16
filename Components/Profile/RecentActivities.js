import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const RecentActivities = ({ recentActivities }) => {
  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <Text style={styles.activityTitle}>{item.title}</Text>
      <Text style={styles.activityTime}>{item.time}</Text>
    </View>
  );

  return (
    <View style={styles.recentActivities}>
      <Text style={styles.activitiesTitle}>Recent Activities</Text>
      <FlatList
        data={recentActivities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 10 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  recentActivities: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 2,
    width: '100%',
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  activityItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  activityTitle: {
    fontSize: 16,
    color: '#333',
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
  },
});

export default RecentActivities;
