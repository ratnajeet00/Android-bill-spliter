// components/HomeTabs.js
import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ExpenseScreen from '../screens/ExpenseScreen';
import SplitScreen from '../screens/SplitScreen';

const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Expense" component={ExpenseScreen} />
      <Tab.Screen name="Split" component={SplitScreen} />
    </Tab.Navigator>
  );
};

export default HomeTabs;
