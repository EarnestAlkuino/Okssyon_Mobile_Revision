import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AuctionTimer = ({ auctionEnd, onAuctionEnd }) => {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const endTime = new Date(auctionEnd).getTime();

    const timer = setInterval(() => {
      const currentTime = Date.now();
      const remainingTime = endTime - currentTime;

      if (remainingTime <= 0) {
        clearInterval(timer);
        setTimeRemaining('Auction Ended');
        if (onAuctionEnd) onAuctionEnd();
      } else {
        const hrs = Math.floor(remainingTime / (1000 * 60 * 60));
        const mins = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((remainingTime % (1000 * 60)) / 1000);
        setTimeRemaining(`${hrs}h ${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [auctionEnd, onAuctionEnd]);

  return (
    <View>
      <Text style={styles.timerText}>{timeRemaining}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6347',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default AuctionTimer;
