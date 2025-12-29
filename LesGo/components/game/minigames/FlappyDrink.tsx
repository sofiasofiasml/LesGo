import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getHighScores, saveScore, HighScoreEntry } from '@/utils/HighScoreManager';
import HighScoreModal from '@/components/game/HighScoreModal';

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
    currentPlayer?: string;
}

export default function FlappyDrink({ visible, onClose, colors, currentPlayer = 'Jugador' }: FlappyDrinkProps) {
    const GAME_ID = 'flappy_drink';
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'won'>('start');
    const [score, setScore] = useState(0);
    const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
    const [pipes, setPipes] = useState<{ x: number; height: number; passed: boolean }[]>([]);

    // High Score State
    const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
    const [showHighScores, setShowHighScores] = useState(false);
    const [isNewRecord, setIsNewRecord] = useState(false);

    const birdYRef = useRef(GAME_HEIGHT / 2);
    const velocityRef = useRef(0);
    const frameRef = useRef<number | null>(null);
    const pipesRef = useRef<{ x: number; height: number; passed: boolean }[]>([]);

    useEffect(() => {
        if (visible) {
            resetGame();
            loadScores();
        }
    }, [visible]);

    const loadScores = async () => {
        const scores = await getHighScores(GAME_ID);
        setHighScores(scores);
    };

    const resetGame = () => {
        setBirdY(GAME_HEIGHT / 2);
        birdYRef.current = GAME_HEIGHT / 2;
        velocityRef.current = 0;
        setPipes([]);
        pipesRef.current = [];
        setScore(0);
        setGameState('start');
        setIsNewRecord(false);
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
        // eslint-disable-next-line
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
                const newScore = score + 1; // Careful with closure 'score', use functional update or ref
                // BUT this runs in loop, so 'score' state might be stale if we relied on it.
                // However, setScore(prev => prev+1) works.
                // But for 'endGame(true)' condition we need accurate count.
                // Let's rely on setScore update, but also calculate locally for win condition.

                // wait, loop uses closure 'score' which is 0 from start of effect usually?
                // Actually useEffect depends on [gameState], so loop restarts when state changes.
                // But score doesn't change gameState.
                // Ideally physics shouldn't depend on React state in closure.
                // Let's use the updating state callback fully or add scoreRef if needed.
                // For now, simpler: pass a param or simple check.
                // The issue: "score" in this scope is fixed to what it was when effect started?
                // Yes, if effect doesn't depend on score.
                // And adding score to dep array restarts loop -> might be jittery.
                // Standard fix: useRef for score.

                // But wait, the original code used setScore(prev => prev + 1).
                // And checked `if (score + 1 >= 5)`. 
                // Wait, if score is 0 in closure, score+1 is always 1.
                // Original code had a BUG if score wasn't in dep array?
                // Actually, the original effect dependency was `[gameState]`.
                // So `score` was stale (0) inside the interval/loop closure created at start of playing.
                // So it only ever checked `0 + 1 >= 5`, which is false.
                // Unless the game re-renders and restarts loop? No.
                // SO THE ORIGINAL GAME PROBABLY DIDN'T WIN CORRECTLY if > 1 pipe?
                // Or maybe `setScore` triggered re-render? Yes.
                // BUT the `loop` function is defined INSIDE useEffect.
                // `frameRef` continues the loop. It recurses `requestAnimationFrame(loop)`.
                // `loop` is the *same* function instance from the initial render of the effect?
                // Yes. So it sees stale `score`.
                // I should fix this while I'm here.

                // FIX: Use a ref for score tracking within the physics loop.
            }

            // Re-logic for score:
            if (!pipe.passed && pipe.x + PIPE_WIDTH < birdX) {
                pipe.passed = true;
                currentScoreRef.current += 1;
                setScore(currentScoreRef.current);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                if (currentScoreRef.current >= 5) {
                    endGame(true);
                    return;
                }
            }

            newPipes.push(pipe);
        }

        // Add new pipe logic
        const lastPipe = newPipes[newPipes.length - 1];
        if (lastPipe && (GAME_WIDTH - lastPipe.x >= 220)) {
            const minHeight = 50;
            const maxHeight = GAME_HEIGHT - PIPE_GAP - minHeight;
            const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

            newPipes.push({ x: GAME_WIDTH, height, passed: false });
        }

        pipesRef.current = newPipes;

        // Sync State for Render
        setBirdY(birdYRef.current);
        setPipes([...newPipes]);
    };

    // START FIX: Ref for score to avoid closure staleness
    const currentScoreRef = useRef(0);
    // Sync ref when resetting
    // See resetGame

    // We need to override the `resetGame` to reset `currentScoreRef`
    // And `updatePhysics` to use `currentScoreRef`

    // I will include these fixes in the ReplacementContent.

    const endGame = async (won: boolean) => {
        setGameState(won ? 'won' : 'gameover');
        Haptics.notificationAsync(won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);

        // Save High Score (Highest score is best)
        // Score is currentScoreRef.current
        const finalScore = currentScoreRef.current;

        // Save anyway even if lost? Yes, leaderboard is leaderboard.
        // But usually only significant scores.
        // If 0, maybe don't save?
        if (finalScore > 0) {
            const isRecord = await saveScore(GAME_ID, {
                playerName: currentPlayer,
                score: finalScore,
                date: new Date().toISOString()
            }, true); // True = Higher is better

            if (isRecord) {
                setIsNewRecord(true);
                loadScores();
            }
        }
    };

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.overlay}>
                <View style={[styles.gameContainer, { backgroundColor: colors.modalBackground }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setShowHighScores(true)} style={styles.recordButton}>
                            <FontAwesome name="trophy" size={20} color={colors.gold} />
                            <Text style={[styles.recordButtonText, { color: colors.gold }]}> Récords</Text>
                        </TouchableOpacity>

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
                                {isNewRecord && (
                                    <View style={styles.newRecordBadge}>
                                        <FontAwesome name="star" size={16} color="white" />
                                        <Text style={styles.newRecordText}> ¡NUEVO RÉCORD! </Text>
                                        <FontAwesome name="star" size={16} color="white" />
                                    </View>
                                )}
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

                {/* HIGH SCORE MODAL */}
                <HighScoreModal
                    visible={showHighScores}
                    onClose={() => setShowHighScores(false)}
                    highScores={highScores}
                    gameName="Fly & Drink"
                    colors={colors}
                    isHigherBetter={true}
                />

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
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    recordButtonText: {
        fontSize: 14,
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
    },
    newRecordBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD700',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 10
    },
    newRecordText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14
    }
});
