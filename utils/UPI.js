// utils/UPI.js
import { Linking } from 'react-native';

export const generateUPIIntent = (amount, upiId, name) => {
  const uri = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;
  return uri;
};

export const openUPI = (uri) => {
  Linking.openURL(uri).catch(err => console.error('Failed to open UPI app', err));
};
