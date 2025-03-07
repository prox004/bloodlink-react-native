import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');

interface CarouselProps {
  autoplayInterval?: number;
}

const Carousel: React.FC<CarouselProps> = ({ autoplayInterval = 4000 }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);

  // Array of image URLs
  const images: string[] = [
    'https://www.shutterstock.com/image-vector/vector-banner-template-design-concept-600nw-2386954583.jpg',
    'https://static.vecteezy.com/system/resources/previews/024/099/889/non_2x/world-blood-donor-day-background-or-banner-design-template-typography-and-unique-shapes-illustration-blood-drop-design-vector.jpg',
    'https://www.shutterstock.com/image-vector/vector-banner-template-design-concept-600nw-2386954583.jpg',
  ];

  // Auto-play functionality with smooth scrolling
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex === images.length - 1 ? 0 : prevIndex + 1;
        scrollToIndex(nextIndex);
        return nextIndex;
      });
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, []);

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
        }
      }
    }
  );

  const getSlideStyle = (index: number) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: [width * 0.3, 0, -width * 0.3],
      extrapolate: 'clamp',
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    return {
      transform: [{ translateX }, { scale }],
    };
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        decelerationRate="fast"
      >
        {images.map((imageUrl, index) => (
          <View key={index} style={styles.slide}>
            <Animated.View style={[styles.slideInner, getSlideStyle(index)]}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            </Animated.View>
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.pagination}>
        {images.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setCurrentIndex(index);
              scrollToIndex(index);
            }}
          >
            <Animated.View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    currentIndex === index ? '#000' : 'rgba(0,0,0,0.3)',
                  transform: [{
                    scale: scrollX.interpolate({
                      inputRange: [
                        (index - 1) * width,
                        index * width,
                        (index + 1) * width,
                      ],
                      outputRange: [0.8, 1.2, 0.8],
                      extrapolate: 'clamp',
                    })
                  }]
                },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
  },
  slide: {
    width,
    height: '100%',
    padding: 10,
  },
  slideInner: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default Carousel;