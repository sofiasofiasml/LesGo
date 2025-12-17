import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface RouletteModalProps {
    visible: boolean;
    players: string[];
    onClose: () => void;
    onWinner?: (winner: string) => void;
    colors: any;
}

export default function RouletteModal({ visible, players, onClose, onWinner, colors }: RouletteModalProps) {
    const [currentName, setCurrentName] = useState('...');
    const [isSpinning, setIsSpinning] = useState(false);
    const [finalWinner, setFinalWinner] = useState<string | null>(null);

    // Refs for animation control
    const speedRef = useRef(50); // Initial speed (ms)
    const timeoutRef = useRef<any>(null);

    useEffect(() => {
        if (visible) {
            startRoulette();
        } else {
            // Reset state on close
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setFinalWinner(null);
            setIsSpinning(false);
            setCurrentName('...');
        }
    }, [visible]);

    const startRoulette = () => {
        setIsSpinning(true);
        setFinalWinner(null);
        speedRef.current = 50; // Reset speed
        spin(0);
    };

    const spin = (count: number) => {
        // Haptic pulse on every tick
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Pick random player
        const randomIndex = Math.floor(Math.random() * players.length);
        setCurrentName(players[randomIndex]);

        // Stop condition: speed is very slow (>600ms) OR max safety count
        if (speedRef.current > 700) {
            finishSpin(players[randomIndex]);
            return;
        }

        // Calculate next speed (Decay)
        // Slower decay at first, then exponential
        speedRef.current = Math.floor(speedRef.current * 1.15);

        // Schedule next tick
        timeoutRef.current = setTimeout(() => spin(count + 1), speedRef.current);
    };

    const finishSpin = (winner: string) => {
        setIsSpinning(false);
        setFinalWinner(winner);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Notify parent if callback provided
        if (onWinner) {
            // Small delay to let the user register the visual result
            setTimeout(() => {
                onWinner(winner);
            }, 1500);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={() => { if (!isSpinning) onClose(); }}
        >
            <View style={styles.modalView}>
                <View style={[styles.modalContent, { backgroundColor: colors.modalBackground, borderColor: colors.purple, borderWidth: 2 }]}>

                    <Text style={[styles.title, { color: colors.text }]}>
                        {finalWinner ? '😈 LA CULPA ES DE 😈' : '🎲 Buscando Víctima...'}
                    </Text>

                    <View style={styles.nameContainer}>
                        <Text style={[
                            styles.nameText,
                            {
                                color: finalWinner ? colors.darkPink : colors.pink,
                                fontSize: finalWinner ? 48 : 36,
                                transform: [{ scale: finalWinner ? 1.2 : 1 }]
                            }
                        ]}>
                            {currentName}
                        </Text>
                    </View>

                    {finalWinner && (
                        <View style={{ width: '100%', marginTop: 20 }}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.pink }]}
                                onPress={onClose}
                            >
                                <Text style={styles.buttonText}>¡Castigada!</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: 'transparent', marginTop: 10 }]}
                                onPress={startRoulette}
                            >
                                <Text style={{ color: colors.text, textAlign: 'center' }}>Girar otra vez 🔄</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContent: {
        width: '90%',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minHeight: 300,
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 40,
        letterSpacing: 2,
        textAlign: 'center',
    },
    nameContainer: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameText: {
        fontWeight: '900',
        textAlign: 'center',
    },
    button: {
        borderRadius: 30,
        padding: 15,
        elevation: 2,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 18,
    },
});
