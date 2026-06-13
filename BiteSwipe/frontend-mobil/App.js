import Swiper from 'react-native-deck-swiper';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, Alert, TouchableOpacity, ScrollView, Modal, TextInput, Platform, Animated } from 'react-native';

export default function App() {
  // --- STATE-URI PENTRU AUTENTIFICARE ---
  const [utilizatorLogat, setUtilizatorLogat] = useState(null); 
  const [esteEcranLogin, setEsteEcranLogin] = useState(true); 
  const [emailAuth, setEmailAuth] = useState('');
  const [parolaAuth, setParolaAuth] = useState(''); 

  const [categorieSelectata, setCategorieSelectata] = useState('All');
  const listaCategorii = ['All', 'Asian', 'Traditional', 'Italian', 'Drinks', 'Dessert', 'International'];

  // --- STATE-URI APLICAȚIE (RESTAURANTE) ---
  const [restaurante, setRestaurante] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabCurent, setTabCurent] = useState('swipe');
  const [favorite, setFavorite] = useState([]);
  const [istoric, setIstoric] = useState([]); 

  // --- NOU: Memorie ascunsă pentru favorite și pachetul de carduri ---
  const favoriteRef = useRef([]);
  useEffect(() => {
    favoriteRef.current = favorite;
  }, [favorite]);

  const [pachetCarduri, setPachetCarduri] = useState([]);

  useEffect(() => {
    // Scoatem din listă ce ai dat deja Favorite
    const listaCurata = restaurante.filter(res => !favoriteRef.current.some(fav => fav.id === res.id));
    
    // Filtrăm pe categorii
    const listaFinala = listaCurata.filter(restaurant => {
      if (categorieSelectata === 'All') return true;
      return restaurant.categorie === categorieSelectata;
    });

    setPachetCarduri(listaFinala);
  }, [restaurante, categorieSelectata]);

  // --- STATE-URI FORMULAR REZERVARE ---
  const [modalVizibil, setModalVizibil] = useState(false);
  const [restaurantSelectat, setRestaurantSelectat] = useState(null);
  const [numeClient, setNumeClient] = useState('');
  const [numarPersoane, setNumarPersoane] = useState('2');
  
  const [dataReala, setDataReala] = useState(new Date());
  const [oraReala, setOraReala] = useState(new Date());
  const [arataCalendar, setArataCalendar] = useState(false);
  const [arataCeas, setArataCeas] = useState(false);
  const [textZi, setTextZi] = useState('');
  const [textOra, setTextOra] = useState('');
  
  // --- ANIMAȚII ---
  const animatieCuloare = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatieCuloare, { toValue: 1, duration: 5000, useNativeDriver: false }),
        Animated.timing(animatieCuloare, { toValue: 2, duration: 5000, useNativeDriver: false }),
        Animated.timing(animatieCuloare, { toValue: 0, duration: 5000, useNativeDriver: false })
      ])
    ).start();
  }, []);

  const animatiePuls = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatiePuls, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(animatiePuls, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const fundalAnimat = animatieCuloare.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['#ffcccc', '#FF5A5F', '#ffe5e5'] 
  });

  const animatieRamaRGB = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatieRamaRGB, { toValue: 1, duration: 3000, useNativeDriver: false }),
        Animated.timing(animatieRamaRGB, { toValue: 2, duration: 3000, useNativeDriver: false }),
        Animated.timing(animatieRamaRGB, { toValue: 3, duration: 3000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const fundalRamaRGB = animatieRamaRGB.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['#FF0000', '#FF1493', '#FFC0CB', '#FF0000'] 
  });

  // --- PRELUARE RESTAURANTE (EFECTE) ---
  useEffect(() => {
    if (utilizatorLogat) {
      fetch('http://172.20.10.2:8000/restaurante')
        .then(response => response.json())
        .then(data => {
          setRestaurante(data);
          setLoading(false);
        })
        .catch(error => {
          console.error("Eroare:", error);
          setLoading(false);
        });
    }
  }, [utilizatorLogat]);

  // --- FUNCȚII DE AUTENTIFICARE ---
  const proceseazaAuth = () => {
    if (!emailAuth || !parolaAuth) {
      Alert.alert("Atenție", "Te rog introdu emailul și parola.");
      return;
    }

    const rutaEndopint = esteEcranLogin ? '/login' : '/register';

    fetch(`http://172.20.10.2:8000${rutaEndopint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailAuth.trim(), password: parolaAuth })
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        if (esteEcranLogin) {
          setUtilizatorLogat(data.email);
          Alert.alert("Bine ai venit! 👋", `Te-ai logat ca ${data.email}`);
        } else {
          Alert.alert("Cont Creat! 🎉", "Acum te poți loga cu noile tale date.");
          setEsteEcranLogin(true); 
        }
      } else {
        Alert.alert("Eroare", data.message);
      }
    })
    .catch(error => {
      console.error(error);
      Alert.alert("Eroare", "Verifică dacă serverul Python rulează.");
    });
  };

  // --- FUNCȚII CALENDAR ȘI LOGICĂ APLICAȚIE ---
  const schimbaZiua = (event, dataSelectata) => {
    if (Platform.OS === 'android') setArataCalendar(false);
    if (event.type === 'set' && dataSelectata) {
      setDataReala(dataSelectata);
      const zile = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
      setTextZi(`${zile[dataSelectata.getDay()]}, ${dataSelectata.getDate()}/${dataSelectata.getMonth() + 1}`);
    }
  };

  const schimbaOra = (event, oraSelectata) => {
    if (Platform.OS === 'android') setArataCeas(false);
    if (event.type === 'set' && oraSelectata) {
      setOraReala(oraSelectata);
      setTextOra(`${oraSelectata.getHours().toString().padStart(2, '0')}:${oraSelectata.getMinutes().toString().padStart(2, '0')}`);
    }
  };

  const onSwipeRight = (cardIndex) => {
    const restaurantAles = pachetCarduri[cardIndex]; 
    if (restaurantAles) {
      setFavorite(listaVeche => {
        // Nu îl adăugăm dacă există deja
        if (listaVeche.some(r => r.id === restaurantAles.id)) return listaVeche;
        return [...listaVeche, restaurantAles];
      });
    }
  };

  const deschideFormular = (restaurant) => {
    setRestaurantSelectat(restaurant);
    setModalVizibil(true);
  };

  const trimiteRezervareReala = () => {
    if (!numeClient || !textZi || !textOra) {
      Alert.alert("Atenție", "Te rugăm să completezi tot.");
      return;
    }
    const dataOraCombinata = `${textZi} la ora ${textOra}`;
    fetch('http://172.20.10.2:8000/rezerva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: restaurantSelectat.id,
        nume_client: numeClient,
        numar_persoane: parseInt(numarPersoane) || 2,
        data_ora: dataOraCombinata,
        email_client: utilizatorLogat
      }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        Alert.alert("Succes! 🎉", "Rezervarea a fost trimisă!");
        setModalVizibil(false); 
        setNumeClient(''); 
        setTextZi(''); 
        setTextOra('');
        setIstoric(listaVeche => [...listaVeche, restaurantSelectat]);
        setFavorite(favoriteVechi => favoriteVechi.filter(r => r.id !== restaurantSelectat.id));
      } else {
        Alert.alert("Eroare", data.message);
      }
    })
    .catch(error => {
      console.error(error);
      Alert.alert("Eroare", "Eroare la trimiterea rezervării.");
    });
  };

  // --- ECRANUL DE LOGARE ---
  if (!utilizatorLogat) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authBox}>
          <Text style={styles.authTitle}>BiteSwipe 🍽️</Text>
          <Text style={styles.authSubtitle}>
            {esteEcranLogin ? "Bine ai revenit! Loghează-te pentru a continua." : "Creează un cont nou pentru a explora."}
          </Text>

          <TextInput 
            style={styles.authInput} 
            placeholder="Adresa de Email" 
            autoCapitalize="none"
            keyboardType="email-address"
            value={emailAuth} 
            onChangeText={setEmailAuth} 
          />
          <TextInput 
            style={styles.authInput} 
            placeholder="Parola (min. 6 caractere)" 
            secureTextEntry={true} 
            value={parolaAuth} 
            onChangeText={setParolaAuth} 
          />

          <TouchableOpacity style={styles.authMainBtn} onPress={proceseazaAuth}>
            <Text style={styles.authMainBtnText}>{esteEcranLogin ? "Intră în cont" : "Creează Contul"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setEsteEcranLogin(!esteEcranLogin)}>
            <Text style={styles.authSwitchText}>
              {esteEcranLogin ? "Nu ai cont? Apasă aici să te înregistrezi." : "Ai deja cont? Apasă aici să te loghezi."}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- COMPONENTELE VIZUALE PENTRU RESTUL APLICAȚIEI ---
  const renderSwipeScreen = () => {
    if (loading) return <ActivityIndicator size="large" color="#FF5A5F" style={{flex: 1}} />;

    if (pachetCarduri.length === 0) {
      return (
        <View style={[styles.centered, { flex: 1, paddingBottom: 80 }]}>
          <Text style={styles.noFavoritesText}>That's all ✨</Text>
          <View style={styles.categoriiContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {listaCategorii.map((cat, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.butonCategorie, categorieSelectata === cat && styles.butonCategorieActiv]}
                  onPress={() => setCategorieSelectata(cat)}
                >
                  <Text style={[styles.textCategorie, categorieSelectata === cat && styles.textCategorieActiv]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.swiperContainer, { flex: 1, paddingBottom: 80 }]}>
        
        {/* Partea de sus: Cardurile */}
        <View style={{ flex: 1 }}>
          <Swiper
            key={categorieSelectata}
            cards={pachetCarduri}
            renderCard={(card) => {
              if (!card) return null;
              return (
                <View style={styles.card}>
                  <Image 
                    source={{ uri: card.imagine_url ? card.imagine_url.trim() : 'https://picsum.photos/400/500' }} 
                    style={styles.image} 
                    resizeMode="cover" 
                  />
                  <View style={styles.cardTextContainer}>
                    <Animated.Text style={[styles.numeCardAnimat, { transform: [{ scale: animatiePuls }] }]}>
                      {card.nume}
                    </Animated.Text>
                    <Text style={styles.locatieCard}>📍 {card.locatie ? card.locatie : "Locație nedefinită"}</Text>
                    <Text style={styles.descriptionText}>{card.descriere}</Text>
                  </View>
                </View>
              );
            }}
            onSwipedRight={onSwipeRight}
            backgroundColor={'transparent'}
            stackSize={2}
            verticalSwipe={false}
            animateCardOpacity
            marginBottom={0} 
            overlayLabels={{
              left: { title: 'PAS 👎', style: { label: { borderColor: '#FF5A5F', color: '#FF5A5F', borderWidth: 5, fontSize: 32, fontWeight: 'bold' }, wrapper: { alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 40, marginLeft: -40 } } },
              right: { title: 'YUM ❤️', style: { label: { borderColor: '#4CAF50', color: '#4CAF50', borderWidth: 5, fontSize: 32, fontWeight: 'bold' }, wrapper: { alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 40, marginLeft: 40 } } }
            }}
          />
        </View>

        {/* Partea de jos: Filtrele */}
        <View style={{ height: 60, marginTop: 40, zIndex: 100, elevation: 100 }}>
          <View style={styles.categoriiContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {listaCategorii.map((cat, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.butonCategorie, categorieSelectata === cat && styles.butonCategorieActiv]}
                  onPress={() => setCategorieSelectata(cat)}
                >
                  <Text style={[styles.textCategorie, categorieSelectata === cat && styles.textCategorieActiv]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

      </View>
    );
  };

  const renderFavoriteScreen = () => {
    if (favorite.length === 0) return <View style={styles.centered}><Text style={styles.noFavoritesText}>You don't have any favorites yet.</Text></View>;
    return (
      <ScrollView style={styles.favoriteList} contentContainerStyle={{ paddingBottom: 110 }}>
         <Text style={styles.headerTitle}>Favorites</Text>
        
        {favorite.map((rest, index) => (
          <TouchableOpacity key={index} style={styles.favoriteItem} onPress={() => deschideFormular(rest)}>
            <Image source={{uri: rest.imagine_url}} style={styles.favoriteImage} />
            <View style={styles.favoriteTextContainer}>
              <Text style={styles.favoriteTitle}>{rest.nume}</Text>
              <Text style={styles.rezervaBtnText}>Reserve now ➔</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderHistoryScreen = () => {
    if (istoric.length === 0) return <View style={styles.centered}><Text style={styles.noFavoritesText}>No reservations yet.</Text></View>;
    return (
      <ScrollView style={styles.favoriteList}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Reservation History</Text>
        </View>
        
        {istoric.map((rest, index) => (
          <TouchableOpacity key={index} style={styles.favoriteItem} onPress={() => deschideFormular(rest)}>
            <Image source={{uri: rest.imagine_url}} style={styles.favoriteImage} />
            <View style={styles.favoriteTextContainer}>
              <Text style={styles.favoriteTitle}>{rest.nume}</Text>
              <Text style={styles.rezervaBtnText}>Book again ➔</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <Animated.View style={[styles.ramaRGBContainer, { backgroundColor: fundalRamaRGB }]}>
      <Animated.View style={[styles.continutAplicatie, { backgroundColor: tabCurent === 'swipe' ? fundalAnimat : '#ffffff' }]}>
        
        {tabCurent === 'swipe' && (
          <TouchableOpacity style={styles.logoutBtnSwipe} onPress={() => setUtilizatorLogat(null)}>
            <Text style={styles.logoutTextSwipe}>🚪 Logout</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.content}>
          {tabCurent === 'swipe' ? renderSwipeScreen() : tabCurent === 'favorite' ? renderFavoriteScreen() : renderHistoryScreen()}
        </View>
        
        <View style={styles.bottomNav}>
          <TouchableOpacity style={[styles.navButton, tabCurent === 'swipe' && styles.navButtonActive]} onPress={() => setTabCurent('swipe')}>
            <Text style={[styles.navText, tabCurent === 'swipe' && styles.navTextActive]}>🔥 Swipe</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.navButton, tabCurent === 'favorite' && styles.navButtonActive]} onPress={() => setTabCurent('favorite')}>
            <Text style={[styles.navText, tabCurent === 'favorite' && styles.navTextActive]}>❤️ Liked</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.navButton, tabCurent === 'history' && styles.navButtonActive]} onPress={() => setTabCurent('history')}>
            <Text style={[styles.navText, tabCurent === 'history' && styles.navTextActive]}>📜 History</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={modalVizibil} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Rezervare la {restaurantSelectat?.nume}</Text>
              <Text style={styles.label}>Numele tău:</Text>
              <TextInput style={styles.input} placeholder="Ex: Vlad" value={numeClient} onChangeText={setNumeClient} />
              <Text style={styles.label}>Număr persoane:</Text>
              <TextInput style={styles.input} placeholder="Ex: 2" keyboardType="numeric" value={numarPersoane} onChangeText={setNumarPersoane} />
              <Text style={styles.label}>Când dorești să vii?</Text>
              <View style={styles.datePickerContainer}>
                <TouchableOpacity style={styles.dateButton} onPress={() => setArataCalendar(true)}>
                  <Text style={textZi ? styles.dateTextFilled : styles.dateTextEmpty}>{textZi ? `📅 ${textZi}` : "📅 Alege Ziua"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dateButton} onPress={() => setArataCeas(true)}>
                  <Text style={textOra ? styles.dateTextFilled : styles.dateTextEmpty}>{textOra ? `⏰ ${textOra}` : "⏰ Alege Ora"}</Text>
                </TouchableOpacity>
              </View>
              {arataCalendar && <DateTimePicker value={dataReala} mode="date" display="default" onChange={schimbaZiua} />}
              {arataCeas && <DateTimePicker value={oraReala} mode="time" is24Hour={true} display="default" onChange={schimbaOra} />}
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVizibil(false)}><Text>Anulează</Text></TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={trimiteRezervareReala}><Text style={{color:'white', fontWeight:'bold'}}>Trimite</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ramaRGBContainer: {
    flex: 1,
    padding: 4, 
    paddingTop: Platform.OS === 'ios' ? 50 : 4, 
    paddingBottom: Platform.OS === 'ios' ? 30 : 4, 
    borderRadius: 35,
  },
  continutAplicatie: {
    flex: 1,
    borderRadius: 30,
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30,
    overflow: 'hidden', 
  },
  content: { flex: 1, paddingTop: 50 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  swiperContainer: { flex: 1, marginTop: -40 ,zIndex: 1},
  
  card: { 
    height: '75%', 
    borderRadius: 30, 
    backgroundColor: '#fffbfb', 
    elevation: 8, 
    shadowColor: '#FF5A5F', 
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 15,
    borderWidth: 2, 
    borderColor: '#ffe5e5', 
    overflow: 'hidden' 
  },
  image: { 
    width: '100%', 
    height: '65%' ,
    borderWidth: 4,               
    borderColor: '#FF5A5F',       
    borderStyle: 'dashed',        
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
  },
  textContainer: { 
    padding: 20,
    backgroundColor: '#fffbfb',
    alignItems: 'center', 
    justifyContent: 'center',
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8
  },
  description: { 
    fontSize: 16 , 
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic', 
    lineHeight: 22 
  },
  logoutBtnSwipe: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 15 : 5, 
    right: 10, 
    zIndex: 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 5,
  },
  logoutTextSwipe: {
    color: '#FF5A5F',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardTextContainer: {
    position: 'absolute',
    bottom: 20, 
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  numeCardAnimat: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  locatieCard: {
    color: '#FF5A5F',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', margin: 20 },
  logoutText: { color: '#FF5A5F', fontWeight: 'bold' },
  
  favoriteList: { flex: 1, paddingHorizontal: 15 },
  favoriteItem: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 15, padding: 10, marginBottom: 15, elevation: 3 },
  favoriteImage: { width: 70, height: 70, borderRadius: 10 },
  favoriteTextContainer: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  favoriteTitle: { fontSize: 18, fontWeight: 'bold' },
  rezervaBtnText: { color: '#FF5A5F', fontWeight: 'bold', marginTop: 5 },
  bottomNav: { 
    flexDirection: 'row', 
    backgroundColor: '#ffffff', 
    paddingVertical: 15, 
    paddingHorizontal: 6,
    justifyContent: 'space-around', 
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 10 : 5, 
    alignSelf: 'center',
    width: '85%', 
    borderRadius: 30, 
    elevation: 10, 
    shadowColor: '#FF5A5F', 
    shadowOpacity: 0.2, 
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    zIndex: 10 
  },
  navButton: { 
    paddingVertical: 12, 
    paddingHorizontal: 15, 
    borderRadius: 25, 
  },
  descriptionText: {
    color: '#e0e0e0', 
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  navButtonActive: { 
    backgroundColor: '#FF5A5F', 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  navText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#888' 
  },
  categoriiContainer: {
    height: 60,
    paddingVertical: 10,
    marginBottom: 10,
  },
  butonCategorie: {
    backgroundColor: '#333333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  butonCategorieActiv: {
    backgroundColor: '#FF5A5F', 
  },
  textCategorie: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  textCategorieActiv: {
    color: '#ffffff', 
  },
  navTextActive: { 
    color: '#ffffff' 
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', marginTop: 10, color: '#333', marginBottom: 5 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  datePickerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  dateButton: { flex: 0.48, backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  dateTextEmpty: { color: '#888', fontSize: 14, fontWeight: 'bold' },
  dateTextFilled: { color: '#FF5A5F', fontSize: 15, fontWeight: 'bold' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  cancelBtn: { padding: 15, borderRadius: 10, backgroundColor: '#eee', width: '45%', alignItems: 'center' },
  submitBtn: { padding: 15, borderRadius: 10, backgroundColor: '#FF5A5F', width: '45%', alignItems: 'center' },
  noFavoritesText: { fontSize: 18, fontWeight: 'bold', color: '#555' },

  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF5A5F' },
  authBox: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 30, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: {width: 0, height: 4} },
  authTitle: { fontSize: 32, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
  authSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  authInput: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  authMainBtn: { backgroundColor: '#FF5A5F', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  authMainBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  authSwitchText: { color: '#FF5A5F', textAlign: 'center', marginTop: 20, fontWeight: 'bold' }
});