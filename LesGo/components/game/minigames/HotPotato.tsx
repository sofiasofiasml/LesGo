import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface HotPotatoProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

export default function HotPotato({ visible, onClose, colors }: HotPotatoProps) {
    const [gameState, setGameState] = useState<'idle' | 'ticking' | 'boom'>('idle');
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setGameState('idle');
            pulseAnim.setValue(1);
        }
    }, [visible]);

    // Timer Logic
    useEffect(() => {
        let interval: any;
        if (gameState === 'ticking') {
            const duration = Math.floor(Math.random() * (25 - 10 + 1)) + 10; // 10s to 25s
            let current = duration * 10; // 100ms ticks

            startAnimations();

            interval = setInterval(() => {
                current -= 1;
                setTimeLeft(current);

                // Increase intensity as time runs out (optional visual cues)

                if (current <= 0) {
                    clearInterval(interval);
                    explode();
                }
            }, 100);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    const startAnimations = () => {
        // Heartbeat Pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 400, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true })
            ])
        ).start();

        // Warning Shake (Starts gentle, ideally would ramp up but constant is fine for V1)
        Animated.loop(
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
            ])
        ).start();
    };

    const explode = () => {
        setGameState('boom');
        pulseAnim.stopAnimation();
        shakeAnim.stopAnimation();
        // Visual Explosion could be just a big red screen in V1
    };

    const startGame = () => {
        setGameState('ticking');
    };

    const handleClose = () => {
        // In Hot Potato, everyone survives BUT the loser.
        // We return 'true' (Success) generally to avoid generic penalty,
        // because the "Boom" screen already punished the loser.
        // Or 'false' if we want to confirm the Drink modal.
        // Let's go with 'true' and show the message IN-GAME.
        onClose(true);
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={[styles.overlay, { backgroundColor: gameState === 'boom' ? '#D32F2F' : 'rgba(0,0,0,0.95)' }]}>
                <View style={[
                    styles.container,
                    { backgroundColor: gameState === 'boom' ? '#FFCDD2' : colors.cardBackground, borderColor: colors.pink }
                ]}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {gameState === 'idle' ? 'LA BOMBA' : gameState === 'ticking' ? 'TIC... TAC...' : '¡BOOM!'}
                    </Text>

                    <View style={styles.iconContainer}>
                        {gameState === 'idle' && (
                            <MaterialCommunityIcons name="bomb" size={120} color={colors.text} />
                        )}
                        {gameState === 'ticking' && (
                            <Animated.View style={{ transform: [{ scale: pulseAnim }, { translateX: shakeAnim }] }}>
                                <MaterialCommunityIcons name="timer-sand" size={120} color={colors.pink} />
                            </Animated.View>
                        )}
                        {gameState === 'boom' && (
                            <MaterialCommunityIcons name="fire" size={120} color="#D32F2F" />
                        )}
                    </View>

                    <Text style={[styles.instruction, { color: colors.text }]}>
                        {gameState === 'idle' && "Pasa el móvil diciendo una palabra del tema que elijáis (ej. Marcas, Animales...). ¡Que no explote en tu mano!"}
                        {gameState === 'ticking' && "¡PÁSALO RÁPIDO!"}
                        {gameState === 'boom' && "¡TE HA EXPLOTADO!\nBEBE 3 TRAGOS"}
                    </Text>

                    {gameState === 'idle' && (
                        <TouchableOpacity style={[styles.button, { backgroundColor: colors.pink }]} onPress={startGame}>
                            <Text style={styles.buttonText}>ENCENDER MECHA</Text>
                        </TouchableOpacity>
                    )}

                    {gameState === 'boom' && (
                        <TouchableOpacity style={[styles.button, { backgroundColor: '#D32F2F' }]} onPress={handleClose}>
                            <Text style={styles.buttonText}>ACEPTAR DESTINO</Text>
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
        // backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '85%',
        padding: 25,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
        elevation: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    iconContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    instruction: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
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
    },
});
