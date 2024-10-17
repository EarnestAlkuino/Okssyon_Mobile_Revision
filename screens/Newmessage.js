import React from 'react';

const MessageInput = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
      <Image source={require('../assets/logo1.png')} style={styles.logo} />
        <h2 style={styles.title}>Seller/Bidder Name</h2>
      </div>
      <div style={styles.messageBox}>
        <input 
          type="text" 
          placeholder="Type a message" 
          style={styles.input} 
        />
        <button style={styles.sendButton}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4l16 8-16 8V4z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100vh',
    padding: '20px',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  logo: {
    height: '50px',
    marginBottom: '10px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'normal',
    color: '#333',
  },
  messageBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'fixed',
    bottom: '0',
    width: '100%',
    padding: '10px 20px',
    backgroundColor: '#f8f8f8',
    borderTop: '1px solid #ddd',
  },
  input: {
    flex: '1',
    height: '40px',
    border: '1px solid #ccc',
    borderRadius: '20px',
    padding: '0 15px',
    fontSize: '16px',
  },
  sendButton: {
    marginLeft: '10px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  },
};

export default MessageInput;
