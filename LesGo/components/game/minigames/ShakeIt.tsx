import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

interface ShakeItProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

export default function ShakeIt({ visible, onClose, colors }: ShakeItProps) {
    const [progress, setProgress] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'won' | 'lost'>('intro');
    const [subscription, setSubscription] = useState<any>(null);

    const shakeAnim = useRef(new Animated.Value(0)).current;

    const TARGET_PROGRESS = 100;
    const SHAKE_THRESHOLD = 1.3; // Sensitivity

    useEffect(() => {
        if (visible) {
            resetGame();
        } else {
            _unsubscribe();
        }
        return () => _unsubscribe();
    }, [visible]);

    useEffect(() => {
        let interval: any;
        if (gameState === 'playing') {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        endGame(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    const _subscribe = () => {
        setSubscription(
            Accelerometer.addListener(accelerometerData => {
                const { x, y, z } = accelerometerData;
                const magnitude = Math.sqrt(x * x + y * y + z * z);

                if (magnitude > SHAKE_THRESHOLD) {
                    const increment = Math.min((magnitude - 1) * 1.5, 3); // HARDER: Less progress per shake
                    setProgress((prev) => {
                        const next = prev + increment;
                        if (next >= TARGET_PROGRESS) {
                            endGame(true);
                            return TARGET_PROGRESS;
                        }
                        return next;
                    });

                    // Visual shake feedback
                    Animated.sequence([
                        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
                    ]).start();
                }
            })
        );
        Accelerometer.setUpdateInterval(100);
    };

    const _unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
    };

    const resetGame = () => {
        setGameState('intro');
        setProgress(0);
        setTimeLeft(10);
        _unsubscribe();
    };

    const startGame = () => {
        setGameState('playing');
        _subscribe();
    };

    const endGame = (won: boolean) => {
        _unsubscribe();
        setGameState(won ? 'won' : 'lost');
        if (won) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
                <View style={[styles.container, { backgroundColor: colors.modalBackground, borderColor: colors.pink }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>EL BATIDO</Text>
                        <TouchableOpacity onPress={() => onClose(false)} style={styles.closeBtn}>
                            <FontAwesome name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={{ color: colors.text, marginBottom: 20, textAlign: 'center', fontSize: 16 }}>
                        {gameState === 'intro' ? "Agita el móvil para llenar el vaso antes de que se acabe el tiempo." :
                            gameState === 'playing' ? "¡AGITA! ¡MÁS FUERTE!" :
                                gameState === 'won' ? "¡DELICIOSO!" : "¡SE CORTÓ!"}
                    </Text>

                    <View style={styles.gameArea}>
                        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                            <MaterialCommunityIcons
                                name="cup"
                                size={150}
                                color={colors.text}
                                style={{ opacity: 0.3, position: 'absolute' }}
                            />
                            {/* Filling Liquid */}
                            <View style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: `${Math.min(progress, 100)}%`,
                                backgroundColor: gameState === 'playing' ? colors.pink : (gameState === 'won' ? '#4CAF50' : '#8D6E63'),
                                borderRadius: 10, // Approximate shape fill
                                overflow: 'hidden',
                                width: 150,
                                alignSelf: 'center'
                            }} />
                            <MaterialCommunityIcons name="cup-outline" size={150} color={colors.text} />
                        </Animated.View>
                    </View>

                    {gameState === 'playing' && (
                        <Text style={[styles.timer, { color: timeLeft <= 3 ? '#F44336' : colors.text }]}>
                            {timeLeft}s
                        </Text>
                    )}

                    {gameState === 'intro' && (
                        <TouchableOpacity style={[styles.button, { backgroundColor: colors.pink }]} onPress={startGame}>
                            <Text style={styles.buttonText}>¡DALE CAÑA!</Text>
                        </TouchableOpacity>
                    )}

                    {(gameState === 'won' || gameState === 'lost') && (
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: gameState === 'won' ? '#4CAF50' : '#F44336' }]}
                            onPress={() => onClose(gameState === 'won')}
                        >
                            <Text style={styles.buttonText}>{gameState === 'won' ? 'REPARTIR TRAGOS' : 'BEBER'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        padding: 30,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        position: 'relative'
    },
    closeBtn: {
        position: 'absolute',
        right: 0,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    gameArea: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: 150,
        overflow: 'hidden', // Masking for cup fill strictly would clearer with SVG but View height works OK for fun
    },
    timer: {
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    }
});
