// components/ExpenseScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Title, Paragraph } from 'react-native-paper';

const ExpenseScreen = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('');
  const [expenses, setExpenses] = useState([]);
  const navigation = useNavigation();

  const addExpense = () => {
    const newExpense = { id: Date.now(), description, amount: parseFloat(amount) };
    setExpenses([...expenses, newExpense]);
    setDescription('');
    setAmount('');
  };

  const deleteExpense = (id) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Number of People"
        value={numberOfPeople}
        onChangeText={setNumberOfPeople}
        keyboardType="numeric"
        style={styles.input}
      />
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="Add Expense" onPress={addExpense} />
        </View>
        <View style={styles.button}>
          <Button 
            title="Go to Split" 
            onPress={() => navigation.navigate('Split', { expenses, numberOfPeople: parseInt(numberOfPeople, 10) || 1 })} 
          />
        </View>
      </View>
      <FlatList
        data={expenses}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => deleteExpense(item.id)}>
            <Card style={styles.card}>
              <Card.Content>
                <Title>{item.description}</Title>
                <Paragraph>₹{item.amount.toFixed(2)}</Paragraph>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 8,
    padding: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    width: '48%', // Adjust width as needed or use flex for dynamic sizing
  },
  card: {
    marginVertical: 8,
  },
});

export default ExpenseScreen;
