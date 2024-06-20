// utils/Share.js
import { Share } from 'react-native';

export const shareRequest = async (message, upiIntent) => {
  try {
    await Share.share({
      message: `${message} - ${upiIntent}`,
    });
  } catch (error) {
    console.error('Error sharing', error);
  }
};
