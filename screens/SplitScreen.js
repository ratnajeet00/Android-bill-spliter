import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import * as Contacts from 'expo-contacts';
import * as SMS from 'expo-sms';
import * as IntentLauncher from 'expo-intent-launcher'; // For launching WhatsApp
import { generateUPIIntent, openUPI } from '../utils/UPI';

const SplitScreen = ({ route }) => {
  const { expenses = [], numberOfPeople = 1 } = route.params || {};

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const participants = numberOfPeople || 1;
  const splitAmount = totalAmount / participants;

  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'You need to grant contacts permission to use this feature.');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      // Filter contacts with phone numbers
      const filtered = data.filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0);
      setContacts(filtered);
      setFilteredContacts(filtered);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      Alert.alert('Error', 'Failed to fetch contacts. Please try again.');
    }
  };

  const handleSearch = text => {
    if (text.trim() === '') {
      setFilteredContacts(contacts); // Display all contacts when search input is empty
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
    setSearchText(text);
  };

  const toggleContactSelection = index => {
    const selectedContact = filteredContacts[index];
    const isSelected = selectedContacts.some(contact => contact.id === selectedContact.id);

    if (isSelected) {
      const updatedSelection = selectedContacts.filter(contact => contact.id !== selectedContact.id);
      setSelectedContacts(updatedSelection);
    } else {
      setSelectedContacts([...selectedContacts, selectedContact]);
    }
  };

  const handleRequestPayment = async () => {
    if (selectedContacts.length !== participants - 1) {
      Alert.alert('Select Contacts', `Please select ${participants - 1} contacts.`);
      return;
    }

    Alert.alert(
      'Send Payment Request',
      'Do you want to send the payment request via SMS or WhatsApp?',
      [
        {
          text: 'SMS',
          onPress: () => sendSMS(),
        },
        {
          text: 'WhatsApp',
          onPress: () => sendWhatsApp(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const sendSMS = async () => {
    try {
      const message = `Please pay ₹${splitAmount.toFixed(2)}`;
      await Promise.all(selectedContacts.map(async contact => {
        if (contact.phoneNumbers.length > 0) {
          const { result } = await SMS.sendSMSAsync(contact.phoneNumbers[0].number, message);
          if (result === 'sent') {
            console.log(`SMS sent successfully to ${contact.name}`);
          } else {
            console.log(`Failed to send SMS to ${contact.name}`);
          }
        }
      }));

      Alert.alert('Payment requests sent successfully via SMS!');
    } catch (error) {
      console.error('Error sending SMS payment requests:', error);
      Alert.alert('Error', 'Failed to send payment requests via SMS. Please try again.');
    }
  };

  const sendWhatsApp = async () => {
    try {
      // Assuming splitAmount and generateUPIIntent are defined elsewhere
      const message = `Please pay ₹${splitAmount.toFixed(2)}`;
      const intent = generateUPIIntent(splitAmount, 'recipient@upi', 'Recipient Name');

      // Prepare data for WhatsApp message
      const whatsappMessage = `whatsapp://send?text=${encodeURIComponent(message)}`;

      // Launch WhatsApp
      await IntentLauncher.startActivityAsync(IntentLauncher.ACTION_VIEW, {
        data: whatsappMessage,
        flags: IntentLauncher.FLAG_ACTIVITY_NEW_TASK,
        package: 'com.whatsapp',
      });

      openUPI(intent);
      Alert.alert('Payment requests sent successfully via WhatsApp!');
    } catch (error) {
      console.error('Error sending WhatsApp payment requests:', error);
      Alert.alert('Error', 'Failed to send payment requests via WhatsApp. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Total: ₹{totalAmount.toFixed(2)}</Text>
      <Text>Number of People: {participants}</Text>
      <Text>Each pays: ₹{splitAmount.toFixed(2)}</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search Contacts"
        value={searchText}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredContacts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.contactItem, selectedContacts.some(contact => contact.id === item.id) && styles.selectedContactItem]}
            onPress={() => toggleContactSelection(index)}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <Button
        title="Request Payment"
        onPress={handleRequestPayment}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  contactItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedContactItem: {
    backgroundColor: '#3498db',
  },
});

export default SplitScreen;
