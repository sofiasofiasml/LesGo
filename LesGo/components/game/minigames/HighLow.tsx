import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface HighLowProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

export default function HighLow({ visible, onClose, colors }: HighLowProps) {
    const [currentNumber, setCurrentNumber] = useState<number>(5);
    const [nextNumber, setNextNumber] = useState<number>(0); // Hidden
    const [streak, setStreak] = useState<number>(0);
    const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
    const [message, setMessage] = useState<string>('');
    const [scaleAnim] = useState(new Animated.Value(1));

    // Initialize game
    useEffect(() => {
        if (visible) {
            resetGame();
        }
    }, [visible]);

    const resetGame = () => {
        const start = Math.floor(Math.random() * 12) + 1;
        setCurrentNumber(start);
        prepareNext(start);
        setStreak(0);
        setGameState('playing');
        setMessage('Acierta 3 seguidas');
    };

    const prepareNext = (current: number) => {
        let next = Math.floor(Math.random() * 12) + 1;
        // Ensure no draws for simplicity/intensity
        while (next === current) {
            next = Math.floor(Math.random() * 12) + 1;
        }
        setNextNumber(next);
    };

    const handleGuess = (guess: 'higher' | 'lower') => {
        if (gameState !== 'playing') return;

        const isHigher = nextNumber > currentNumber;
        const isCorrect = (guess === 'higher' && isHigher) || (guess === 'lower' && !isHigher);

        // Animate flip/change
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
        ]).start();

        if (isCorrect) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            setCurrentNumber(nextNumber);

            if (newStreak >= 3) {
                setGameState('won');
                setMessage('¡VICTORIA!');
            } else {
                setMessage(`¡Bien! Llevas ${newStreak}/3`);
                prepareNext(nextNumber);
            }
        } else {
            setCurrentNumber(nextNumber); // Show the card that killed you
            setGameState('lost');
            setMessage(`¡FALLASTE! Era el ${nextNumber}`);
        }
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
                <View style={[styles.container, { backgroundColor: colors.modalBackground, borderColor: colors.pink }]}>
                    <Text style={[styles.title, { color: colors.text }]}>MAYOR O MENOR</Text>

                    <View style={styles.cardContainer}>
                        <Animated.View style={[
                            styles.card,
                            { backgroundColor: colors.cardBackground, transform: [{ scale: scaleAnim }] }
                        ]}>
                            <Text style={[styles.cardNumber, { color: colors.pink }]}>{currentNumber}</Text>
                        </Animated.View>
                    </View>

                    <Text style={[styles.message, { color: colors.text }]}>{message}</Text>

                    {gameState === 'playing' ? (
                        <View style={styles.buttonsRow}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.lightOrange }]}
                                onPress={() => handleGuess('lower')}
                            >
                                <MaterialCommunityIcons name="arrow-down-bold" size={32} color="white" />
                                <Text style={styles.buttonText}>MENOR</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.pink }]}
                                onPress={() => handleGuess('higher')}
                            >
                                <MaterialCommunityIcons name="arrow-up-bold" size={32} color="white" />
                                <Text style={styles.buttonText}>MAYOR</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.closeButton, {
                                backgroundColor: gameState === 'won' ? '#4CAF50' : '#F44336'
                            }]}
                            onPress={() => onClose(gameState === 'won')}
                        >
                            <Text style={styles.closeButtonText}>
                                {gameState === 'won' ? '¡COBRAR!' : 'BEBER'}
                            </Text>
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
        // backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '85%',
        padding: 20,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    cardContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    card: {
        width: 140,
        height: 200,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    cardNumber: {
        fontSize: 80,
        fontWeight: 'bold',
    },
    message: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        height: 25,
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 15,
        width: '45%',
        height: 100,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        marginTop: 5,
        fontSize: 16,
    },
    closeButton: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 25,
        marginTop: 10,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
    },
});
