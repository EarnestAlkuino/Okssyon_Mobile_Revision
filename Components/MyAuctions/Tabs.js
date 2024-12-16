import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const Tabs = ({ tabs, currentTab, onTabChange }) => {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tabButton, currentTab === tab && styles.activeTab]}
          onPress={() => onTabChange(tab)}
        >
          <Text style={[styles.tabText, currentTab === tab && styles.activeTabText]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 5,
    marginHorizontal: 0,
  },
  activeTab: {
    backgroundColor: '#405e40',
  },
  tabText: {
    fontSize: 10,
    color: '#4A5568',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Tabs;
