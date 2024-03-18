import { StyleSheet, Text, View ,SafeAreaView,ImageBackground, Animated,FlatList} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import _layout from './_layout'
import ListItem from '../components/MainPageListItem'
import ButtonGroup from '../components/Main/BottomTabsBar/MainPageButton'
import { router } from "expo-router";


const MainScreen = ({ navigation }) => {
    const [dataIndex, setDataIndex] = useState(0);
    const slideUpAnim = useRef(new Animated.Value(400)).current;
    const slideAnim = useRef(new Animated.Value(-1000)).current;
    const [showPopup, setShowPopup] = useState(true);
  
    useEffect(() => {
        if (showPopup) {
          // Animation de transition du bas vers le haut pour la première page
          Animated.sequence([
            Animated.timing(slideUpAnim, {
              toValue: 500,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.spring(slideUpAnim, {
              toValue: -3,
              stiffness: 100,
              damping: 10,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          slideUpAnim.setValue(400); // Réinitialiser la valeur d'animation pour les autres pages
        }
    
        if (showPopup) {
          // Animation de transition de la droite vers la gauche
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        } else {
          // Animation de transition de la gauche vers la droite pour cacher le pop-up
          Animated.timing(slideAnim, {
            toValue: 1000,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }
      }, [showPopup, dataIndex]);
    
    
      // Flatlist pour garder les données et utiliser les index pour les animations
      const data = [
        {
          title: "À chaque situation compliquée, sa solution simple",
          description:
            "Nous savons qu'un accident n'est pas un évènement facile. C'est pour cette raison que l'application Impact vous aidera en vous guidant dans la démarche à suivre suite à un accident.",
          showButton: true,
        },
        {
          title: "Régler un accident tout aussi rapidement qu'il est arrivé",
          description:
            "Remplir un constat à l'amiable peut etre long et fastidieux. Nous vous proposons de rassembler l'ensemble ds informations nécéssaires au même endroit d'accélérer le processus ",
          showButton: true,
        },
        {
          title: "La sécurité des données est une valeur que nous prônons",
          description:
            "L'échange d'informations personnelles demande un haut niveau de cybersécurité. Votre confiance etant notre priorité , nous vous assurons donc une totale sécurité",
          showButton: false,
        },
      ];
    
    
      // Fonction pour aller au prochain élement du tableau dans le pop-up (suivant)
      const onNextPress = () => {
        if (dataIndex < data.length - 1) {
          // Animation de sortie vers la gauche
          Animated.timing(slideAnim, {
            toValue: -1000,
            duration: 100,
            useNativeDriver: true,
          }).start(() => {
            setDataIndex((prevIndex) => prevIndex + 1); // Changement d'index
    
            slideAnim.setValue(1000); // Positionnement à droite hors de l'écran
    
            // Animation d'entrée de droite à gauche
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          });
        }
      };
    
    // Fonction pour retourner en arriere dans le pop-up (passer)
      const onRegisterPress = () => {
        router.push('signup')
      };
  
    return (
      <View style={styles.container}>
        <ImageBackground
          source={require("../assets/fond.png")}
          resizeMode="cover"
          style={{ flex: 1, justifyContent: "center", width: "100%" }}
        >
          <Animated.View
            style={[
              styles.popupContainer,
              { transform: [{ translateY: dataIndex === 0 ? slideUpAnim : 0 }] },
            ]}
          >
            <View style={styles.popupContent}>
              <FlatList
                data={[data[dataIndex]]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <ListItem item={item} slideAnim={slideAnim} />
                )}
              />
              <ButtonGroup
                slideAnim={slideAnim}
                onNextPress={() => onNextPress(data, setDataIndex, slideAnim)}
                onRegisterPress={onRegisterPress}
                showRegisterButton={!data[dataIndex].showButton}
              />
            </View>
          </Animated.View>
        </ImageBackground>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    backgroundImage: {
      flex: 1,
      justifyContent: "center",
      width: "100%",
    },
    popupContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "white",
      padding: 25,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      borderWidth: 1,
      height: "40%",
      borderColor: "#ccc",
      alignItems: "center",
    },
    popupContent: {
      width: '100%',
      alignItems: 'center',
    },
  });
  
  export default MainScreen;