import React, { useState, useCallback } from 'react';
import { View, RefreshControl, StyleSheet, FlatList } from 'react-native';
import Header from '../Components/Home/Header';
import Carousel from '../Components/Home/Carousel';
import CheckUserPoints from '../Components/Home/CheckUserPoints';
import BloodPointsCard from '../Components/Home/Points';
import Category from '../Components/Home/Category';
import GetRequest from '../Components/Home/GetRequest';

const DashboardComponents = [
  { id: 'header', component: Header },
  { id: 'carousel', component: Carousel },
  { id: 'checkPoints', component: CheckUserPoints },
  { id: 'bloodPoints', component: BloodPointsCard },
  { id: 'category', component: Category },
  { id: 'requests', component: GetRequest },
];

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const renderItem = ({ item }: { item: { id: string; component: React.ComponentType } }) => {
    const Component = item.component;
    return <Component />;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={DashboardComponents}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['red']}
            tintColor="red"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  }
});