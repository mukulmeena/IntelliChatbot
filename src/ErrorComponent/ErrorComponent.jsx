import React from 'react';
import PropTypes from 'prop-types';

const ErrorComponent = ({ message }) => {
  return (
    <div style={styles.container}>
      <div style={styles.errorBox}>
        <span style={styles.errorMessage}>{message}</span>
      </div>
    </div>
  );
};

ErrorComponent.propTypes = {
  message: PropTypes.string.isRequired,
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',    
  },
  errorBox: {
    backgroundColor: '#ffcccc',
    border: '1px solid #ff6666',
    borderRadius: '5px',
    padding: '10px',
    maxWidth: '400px',
    textAlign: 'center',
    position: 'absolute',
    top:"10%",
    width:"60%"
  },
  errorMessage: {
    color: '#ff0000',
    fontWeight: 'bold',
  },
};

export default ErrorComponent;
