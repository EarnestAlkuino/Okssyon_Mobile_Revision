import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



const ActionButtons = ({ isCreator, handleAsk, handleBid, handleEdit, handleDelete }) => {
  return (
    <View style={styles.buttonContainer}>
      {isCreator ? (
        <>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Icon name="pencil-outline" size={18} color="#FFF" />
            <Text style={styles.editButtonText}>Edit Auction</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Icon name="trash-can-outline" size={18} color="#FFF" />
            <Text style={styles.deleteButtonText}>Delete Auction</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.askButton} onPress={handleAsk}>
            <Icon name="forum-outline" size={18} color="#2C3E50" />
            <Text style={styles.askButtonText}>Ask a Question</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bidButton} onPress={handleBid}>
            <Text style={styles.bidButtonText}>Place a Bid</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#48BB78',
    borderRadius: 8,
    marginBottom: 16,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#E53E3E',
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CBD5E0',
  },
  askButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
  bidButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#1E7848',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  bidButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default ActionButtons;
