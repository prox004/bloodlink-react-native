import { View, Text, FlatList, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, getDocs, DocumentData } from 'firebase/firestore'
import { db } from '../../Auth/config/firebase'
import { MaterialIcons } from '@expo/vector-icons'

export default function Category() {
    const [categoryList, setCategoryList] = useState<DocumentData[]>([]) 
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    useEffect(() => {
        GetCategories()
    }, [])

    const GetCategories = async () => {
        const snapshot = await getDocs(collection(db, 'category'))
        const categories = snapshot.docs.map(doc => doc.data())
        setCategoryList(categories)
    }

    return (
        <View style={{marginTop: 10}}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Active Blood Requests</Text>
                <MaterialIcons name="keyboard-arrow-right" size={30} color="grey" />
            </View>

            <FlatList
                data={categoryList}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({item, index}) => (
                    <View 
                        style={[
                            styles.container, 
                            selectedCategory === index 
                                ? styles.selectedContainer 
                                : styles.unselectedContainer
                        ]}
                        onTouchEnd={() => setSelectedCategory(index)}
                    >
                        <View>
                            <Image 
                                source={{uri:item?.imageUrl}}
                                style={styles.image}
                            />
                        </View>
                        
                    </View>
                )}
            />   
        </View>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 15,
        paddingLeft: 15,
        marginBottom: 15,
        marginTop: 10,
    },
    container: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        marginHorizontal: 3,
        marginLeft: 10,
        //marginRight: 15,
    },
    selectedContainer: {
        borderColor: 'red',
        borderWidth: 2,
        borderRadius: 10,
    },
    unselectedContainer: {
        borderColor: 'grey',
        borderWidth: 1.5,
        borderRadius: 10,
    },
    image: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'semibold',
    },
    bloodTypeText: {
        marginTop: 5,
        fontSize: 16,
        fontWeight: '500',
    }
})

