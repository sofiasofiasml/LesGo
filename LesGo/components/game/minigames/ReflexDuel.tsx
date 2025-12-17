import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface ReflexDuelProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

export default function ReflexDuel({ visible, onClose, colors }: ReflexDuelProps) {
    const [gameState, setGameState] = useState<'start' | 'waiting' | 'bang' | 'won' | 'lost' | 'early'>('start');
    const [reactionTime, setReactionTime] = useState(0);

    // Timer refs
    const waitTimerRef = useRef<any>(null);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        if (visible) {
            resetGame();
        }
    }, [visible]);

    const resetGame = () => {
        setGameState('start');
        setReactionTime(0);
        clearTimers();
    };

    const clearTimers = () => {
        if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
    };

    const startGame = () => {
        setGameState('waiting');
        const randomDelay = Math.random() * 3000 + 2000; // 2-5 seconds

        waitTimerRef.current = setTimeout(() => {
            setGameState('bang');
            startTimeRef.current = Date.now();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, randomDelay);
    };

    const handleTap = () => {
        if (gameState === 'start') {
            startGame();
            return;
        }

        if (gameState === 'waiting') {
            // FALSE START
            clearTimers();
            setGameState('early');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        if (gameState === 'bang') {
            // SUCCESS
            const endTime = Date.now();
            const time = endTime - startTimeRef.current;
            setReactionTime(time);

            // Threshold for winning (e.g. < 400ms is good, < 300ms is pro)
            // Let's say if they react at all, they win, but the time is the score.
            // But to make it a pass/fail game, let's set a threshold. 
            // Average human reaction is ~250ms visual.
            // Let's set 500ms as the limit to "Pass".
            if (time < 500) {
                setGameState('won');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                setGameState('lost'); // Too slow!
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
        }
    };

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.modalBackground }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>DUELO VAQUERO 🤠</Text>
                        <TouchableOpacity onPress={() => onClose(gameState === 'won')}>
                            <FontAwesome name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.gameArea,
                            {
                                backgroundColor:
                                    gameState === 'waiting' ? '#333' :
                                        gameState === 'bang' ? '#4CD964' :
                                            gameState === 'early' ? '#FF3B30' :
                                                gameState === 'lost' ? '#FF9500' :
                                                    colors.cardBackground
                            }
                        ]}
                        activeOpacity={1}
                        onPress={handleTap}
                    >
                        {gameState === 'start' && (
                            <Text style={styles.mainText}>TOCA PARA EMPEZAR</Text>
                        )}
                        {gameState === 'waiting' && (
                            <Text style={styles.mainText}>ESPERA... 🤫</Text>
                        )}
                        {gameState === 'bang' && (
                            <Text style={[styles.mainText, { fontSize: 60 }]}>¡BANG! 💥</Text>
                        )}

                        {/* RESULTS */}
                        {gameState === 'early' && (
                            <View style={styles.resultBox}>
                                <Text style={styles.resultTitle}>¡FALSA SALIDA!</Text>
                                <Text style={styles.resultDesc}>Demasiado ansioso, forastero. Bebe.</Text>
                                <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
                                    <Text style={styles.btnText}>REINTENTAR</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {gameState === 'won' && (
                            <View style={styles.resultBox}>
                                <Text style={styles.resultTitle}>¡RÁPIDO!</Text>
                                <Text style={styles.timeText}>{reactionTime}ms</Text>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={() => onClose(true)}
                                >
                                    <Text style={styles.btnText}>CONTINUAR</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {gameState === 'lost' && (
                            <View style={styles.resultBox}>
                                <Text style={styles.resultTitle}>¡LENTO!</Text>
                                <Text style={styles.timeText}>{reactionTime}ms</Text>
                                <Text style={styles.resultDesc}>Has sido una tortuga. Bebe.</Text>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={() => onClose(false)}
                                >
                                    <Text style={styles.btnText}>CONTINUAR</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </TouchableOpacity>

                    {gameState === 'start' && (
                        <Text style={{ marginTop: 20, color: colors.text, textAlign: 'center' }}>
                            Espera a ver la pantalla VERDE y toca lo más rápido posible.
                        </Text>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '95%',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        minHeight: 500,
        height: '70%'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    gameArea: {
        flex: 1,
        width: '100%',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    mainText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center'
    },
    resultBox: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        width: '80%'
    },
    resultTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10
    },
    timeText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10
    },
    resultDesc: {
        color: 'white',
        marginBottom: 20,
        textAlign: 'center'
    },
    retryButton: {
        backgroundColor: 'white',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25
    },
    btnText: {
        fontWeight: 'bold',
        color: 'black'
    }
});
