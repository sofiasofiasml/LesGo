import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_HEIGHT = SCREEN_HEIGHT * 0.6;
const GAME_WIDTH = SCREEN_WIDTH - 40;
const BIRD_SIZE = 30;
const GRAVITY = 0.6;
const JUMP = -8; // slightly weaker jump for smoother feel
const PIPE_WIDTH = 50;
const PIPE_GAP = 160;
const PIPE_SPEED = 3.5;

interface FlappyDrinkProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

export default function FlappyDrink({ visible, onClose, colors }: FlappyDrinkProps) {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'won'>('start');
    const [score, setScore] = useState(0);
    const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
    const [pipes, setPipes] = useState<{ x: number; height: number; passed: boolean }[]>([]);

    const birdYRef = useRef(GAME_HEIGHT / 2);
    const velocityRef = useRef(0);
    const frameRef = useRef<number | null>(null);
    const pipesRef = useRef<{ x: number; height: number; passed: boolean }[]>([]);

    useEffect(() => {
        if (visible) {
            resetGame();
        }
    }, [visible]);

    const resetGame = () => {
        setBirdY(GAME_HEIGHT / 2);
        birdYRef.current = GAME_HEIGHT / 2;
        velocityRef.current = 0;
        setPipes([]);
        pipesRef.current = [];
        setScore(0);
        setGameState('start');
    };

    const startGame = () => {
        setGameState('playing');
        velocityRef.current = JUMP; // Initial jump
        // Add initial pipe
        addPipe(GAME_WIDTH + 100);
    };

    const jump = () => {
        if (gameState === 'start') {
            startGame();
            return;
        }
        if (gameState !== 'playing') return;
        velocityRef.current = JUMP;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const addPipe = (offsetX: number) => {
        const minHeight = 50;
        const maxHeight = GAME_HEIGHT - PIPE_GAP - minHeight;
        const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

        pipesRef.current.push({ x: offsetX, height, passed: false });
    };

    useEffect(() => {
        if (gameState !== 'playing') {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            return;
        }

        const loop = () => {
            updatePhysics();
            frameRef.current = requestAnimationFrame(loop);
        };
        loop();

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [gameState]);

    const updatePhysics = () => {
        // Bird Physics
        velocityRef.current += GRAVITY;
        birdYRef.current += velocityRef.current;

        // Floor/Ceiling Collision
        if (birdYRef.current >= GAME_HEIGHT - BIRD_SIZE || birdYRef.current <= 0) {
            endGame(false);
            return;
        }

        // Pipe Logic
        const newPipes = [];
        // Determine collision box for bird (centered horizontally at fixed position)
        const birdX = GAME_WIDTH / 3; // Fixed X position for bird

        // We iterate backwards to safely remove? No, standard filter or new array is better.
        // But we need to update positions first.

        for (let i = 0; i < pipesRef.current.length; i++) {
            let pipe = pipesRef.current[i];
            pipe.x -= PIPE_SPEED;

            // Remove if off screen
            if (pipe.x + PIPE_WIDTH < 0) {
                continue;
            }

            // Check Collision
            if (
                birdX + BIRD_SIZE > pipe.x + 5 && // +5 hitbox buffer
                birdX < pipe.x + PIPE_WIDTH - 5
            ) {
                // Horizontal overlap
                // Check Vertical
                // Top pipe: 0 to height
                // Bottom pipe: height + gap to GAME_HEIGHT
                if (
                    birdYRef.current + 5 < pipe.height || // Hit top pipe
                    birdYRef.current + BIRD_SIZE - 5 > pipe.height + PIPE_GAP // Hit bottom pipe
                ) {
                    endGame(false);
                    return;
                }
            }

            // Score update
            if (!pipe.passed && pipe.x + PIPE_WIDTH < birdX) {
                pipe.passed = true;
                setScore(prev => prev + 1);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                // Win Condition
                if (score + 1 >= 5) { // Target score 5
                    endGame(true);
                    return;
                }
            }

            newPipes.push(pipe);
        }

        // Add new pipe logic
        const lastPipe = newPipes[newPipes.length - 1];
        if (lastPipe && (GAME_WIDTH - lastPipe.x >= 220)) { // Spacing between pipes
            // Add to the temp array and ref logic handled via helper? 
            // Better to mutate ref directly or push to 'newPipes' and assign?
            // Actually 'addPipe' pushes to ref. Let's do it manually here.

            const minHeight = 50;
            const maxHeight = GAME_HEIGHT - PIPE_GAP - minHeight;
            const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

            newPipes.push({ x: GAME_WIDTH, height, passed: false });
        }

        pipesRef.current = newPipes;

        // Sync State for Render
        setBirdY(birdYRef.current);
        setPipes([...newPipes]); // spread to force re-render
    };

    const endGame = (won: boolean) => {
        setGameState(won ? 'won' : 'gameover');
        Haptics.notificationAsync(won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    };

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.overlay}>
                <View style={[styles.gameContainer, { backgroundColor: colors.modalBackground }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>Fly & Drink 🍺</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.orange }}>{score} / 5</Text>
                            <TouchableOpacity onPress={() => onClose(gameState === 'won')}>
                                <FontAwesome name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Game Area */}
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[styles.gameArea, { width: GAME_WIDTH, height: GAME_HEIGHT }]}
                        onPress={jump}
                    >
                        {/* Pipes */}
                        {pipes.map((pipe, index) => (
                            <React.Fragment key={index}>
                                {/* Top Pipe */}
                                <View
                                    style={{
                                        position: 'absolute',
                                        left: pipe.x,
                                        top: 0,
                                        width: PIPE_WIDTH,
                                        height: pipe.height,
                                        backgroundColor: '#4CAF50',
                                        borderBottomWidth: 3,
                                        borderBottomColor: '#2E7D32'
                                    }}
                                />
                                {/* Bottom Pipe */}
                                <View
                                    style={{
                                        position: 'absolute',
                                        left: pipe.x,
                                        top: pipe.height + PIPE_GAP,
                                        width: PIPE_WIDTH,
                                        height: GAME_HEIGHT - (pipe.height + PIPE_GAP),
                                        backgroundColor: '#4CAF50',
                                        borderTopWidth: 3,
                                        borderTopColor: '#2E7D32'
                                    }}
                                />
                            </React.Fragment>
                        ))}

                        {/* Bird */}
                        <View
                            style={{
                                position: 'absolute',
                                left: GAME_WIDTH / 3, // Fixed X
                                top: birdY,
                                width: BIRD_SIZE,
                                height: BIRD_SIZE,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Text style={{ fontSize: 24 }}>🍺</Text>
                        </View>

                        {/* Start Overlay */}
                        {gameState === 'start' && (
                            <View style={styles.centerOverlay}>
                                <Text style={styles.startText}>TOCA PARA VOLAR</Text>
                                <Text style={{ color: 'white', marginTop: 10 }}>Pasa 5 botellas para ganar</Text>
                            </View>
                        )}

                        {/* Result Overlay */}
                        {(gameState === 'gameover' || gameState === 'won') && (
                            <View style={[styles.centerOverlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
                                <Text style={[styles.resultText, { color: gameState === 'won' ? '#4CD964' : '#FF3B30' }]}>
                                    {gameState === 'won' ? '¡VICTORIA!' : '¡CRASH!'}
                                </Text>
                                <Text style={styles.subResultText}>
                                    {gameState === 'won' ? 'Mandas 3 tragos' : 'Te bebes un chupito'}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: colors.purple }]}
                                    onPress={() => onClose(gameState === 'won')}
                                >
                                    <Text style={styles.buttonText}>CONTINUAR</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: colors.orange, marginTop: 10 }]}
                                    onPress={resetGame}
                                >
                                    <Text style={styles.buttonText}>REINTENTAR</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </TouchableOpacity>
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
    gameContainer: {
        width: '95%',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    gameArea: {
        backgroundColor: '#87CEEB', // Sky blue
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.1)'
    },
    centerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    startText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    resultText: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subResultText: {
        fontSize: 18,
        color: 'white',
        marginBottom: 20,
    },
    button: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    }
});
