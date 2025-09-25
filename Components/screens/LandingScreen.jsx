import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Vibration } from "react-native";

const { width } = Dimensions.get("window");

const LandingScreen = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef(null);

  const carouselData = [
    {
      id: 1,
      image: require("../../assets/At the office-rafiki.png"),
      text: "Keep track of your inventory in real-time and reduce material wastage.",
    },
    {
      id: 2,
      image: require("../../assets/Time management-pana.png"),
      text: "Manage employee attendance, daily logs, and salaries with ease.",
    },
    {
      id: 3,
      image: require("../../assets/Collab-pana.png"),
      text: "Oversee projects efficiently and collaborate seamlessly with your team.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % carouselData.length;
      setCurrentIndex(nextIndex);
      carouselRef.current.scrollToIndex({ index: nextIndex, animated: true });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleGetStarted = () => {
    Vibration.vibrate(100);
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Half - Carousel */}
      <View style={styles.carouselContainer}>
        <Animated.FlatList
          ref={carouselRef}
          data={carouselData}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(newIndex);
          }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Image
                source={item.image}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          )}
        />

        <View style={styles.dotsContainer}>
          {carouselData.map((_, index) => {
            const opacity = scrollX.interpolate({
              inputRange: [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index}
                style={[styles.dot, { opacity }, currentIndex === index && styles.activeDot]}
              />
            );
          })}
        </View>

        <Text style={styles.slideText}>{carouselData[currentIndex].text}</Text>
      </View>

      {/* Bottom Half - Get Started Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          Designed & Developed by Sparsh Saxena{'\n'}
          Email: sparshsaxena9654@gmail.com
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  carouselContainer: {
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
  },
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  image: {
    width: "80%",
    height: "80%",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#ff6700",
    width: 16,
  },
  slideText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 40,
    fontWeight: "500",
  },
  buttonContainer: {
    height: "50%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: "#ff9933",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -40,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonPressed: {
    transform: [{ translateY: 2 }],
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 1,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  footerContainer: {
    position: "absolute",
    bottom: 200,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default LandingScreen;
