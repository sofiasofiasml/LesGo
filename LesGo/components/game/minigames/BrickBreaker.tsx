import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, PanResponder } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getHighScores, saveScore, HighScoreEntry } from '@/utils/HighScoreManager';
import HighScoreModal from '@/components/game/HighScoreModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_HEIGHT = SCREEN_HEIGHT * 0.6;
const GAME_WIDTH = SCREEN_WIDTH - 40;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 15;
const BALL_SIZE = 15;
const BRICK_ROWS = 4;
const BRICK_COLS = 6;
const BRICK_HEIGHT = 20;
const BRICK_GAP = 5;
const BRICK_WIDTH = (GAME_WIDTH - (BRICK_GAP * (BRICK_COLS + 1))) / BRICK_COLS;

interface BrickBreakerProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
    currentPlayer?: string;
}

export default function BrickBreaker({ visible, onClose, colors, currentPlayer = 'Jugador' }: BrickBreakerProps) {
    const GAME_ID = 'brick_breaker';
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'won'>('start');
    const [score, setScore] = useState(0);
    const [paddleX, setPaddleX] = useState((GAME_WIDTH - PADDLE_WIDTH) / 2);
    const [ball, setBall] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, dx: 3, dy: -3 });
    const [bricks, setBricks] = useState<{ id: string; x: number; y: number; active: boolean }[]>([]);

    // Timer and Score State
    const [startTime, setStartTime] = useState<number>(0);
    const [finishTime, setFinishTime] = useState<number>(0);

    // High Score State
    const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
    const [showHighScores, setShowHighScores] = useState(false);
    const [isNewRecord, setIsNewRecord] = useState(false);

    const frameRef = useRef<number | null>(null);
    const ballRef = useRef(ball);
    const paddleRef = useRef(paddleX);

    // Initialize Bricks
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
        const newBricks = [];
        for (let r = 0; r < BRICK_ROWS; r++) {
            for (let c = 0; c < BRICK_COLS; c++) {
                newBricks.push({
                    id: `${r}-${c}`,
                    x: BRICK_GAP + c * (BRICK_WIDTH + BRICK_GAP),
                    y: BRICK_GAP + r * (BRICK_HEIGHT + BRICK_GAP) + 40,
                    active: true,
                });
            }
        }
        setBricks(newBricks);
        setBall({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, dx: 3, dy: -3 });
        ballRef.current = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, dx: 3, dy: -3 };
        setPaddleX((GAME_WIDTH - PADDLE_WIDTH) / 2);
        paddleRef.current = (GAME_WIDTH - PADDLE_WIDTH) / 2;
        setScore(0);
        setGameState('start');
        setIsNewRecord(false);
        setFinishTime(0);
    };

    const startGame = () => {
        setGameState('playing');
        setStartTime(Date.now());
    };

    // Game Loop
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
        let { x, y, dx, dy } = ballRef.current;

        // Move Ball
        x += dx;
        y += dy;

        // Wall Collisions
        if (x <= 0 || x >= GAME_WIDTH - BALL_SIZE) {
            dx = -dx;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        if (y <= 0) {
            dy = -dy;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Paddle Collision
        if (
            y + BALL_SIZE >= GAME_HEIGHT - PADDLE_HEIGHT - 10 && // Check height
            y + BALL_SIZE <= GAME_HEIGHT - 10 && // Prevent going through
            x + BALL_SIZE >= paddleRef.current &&
            x <= paddleRef.current + PADDLE_WIDTH
        ) {
            dy = -Math.abs(dy); // Always bounce up
            // Add some English based on where it hit
            const hitPoint = (x + BALL_SIZE / 2) - (paddleRef.current + PADDLE_WIDTH / 2);
            dx = dx + hitPoint * 0.1;
            // Cap speed
            dx = Math.max(Math.min(dx, 6), -6);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Floor Collision (Game Over)
        if (y > GAME_HEIGHT) {
            setGameState('gameover');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        // Brick Collision
        // Simple optimization: check only if ball is in upper half
        if (y < GAME_HEIGHT / 2) {
            // We need to update state, so we work with current bricks from ref implementation or state?
            // Accessing state inside loop is stale. Need ref for bricks or functional update pattern.
            // For simplicity, we'll check collision against current state but update via setBricks
            // Use functional update to get fresh bricks
            setBricks(prevBricks => {
                let collisionFound = false;
                let brickHit = false;
                const nextBricks = prevBricks.map(brick => {
                    if (!brick.active || collisionFound) return brick;

                    if (
                        x + BALL_SIZE > brick.x &&
                        x < brick.x + BRICK_WIDTH &&
                        y + BALL_SIZE > brick.y &&
                        y < brick.y + BRICK_HEIGHT
                    ) {
                        collisionFound = true;
                        brickHit = true;
                        return { ...brick, active: false };
                    }
                    return brick;
                });

                if (collisionFound) {
                    ballRef.current.dy = -ballRef.current.dy; // Bounce
                    // Update local dy too for next loop
                    dy = ballRef.current.dy;

                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // Check win condition
                    if (nextBricks.every(b => !b.active)) {
                        // We can't call handleWin directly here comfortably inside setState
                        // We can set a flag or use useEffect on bricks?
                        // Better: use setTimeout to break out of render cycle or just check outside.
                        // Or simple:
                        setGameState('won');
                        // We need to capture time here.
                        // handleWin logic inline:
                        const endTime = Date.now();
                        const duration = (endTime - startTime) / 1000;

                        // We can't await here easily.
                        // Tricky. Let's set a state 'winTriggered' or just call helper
                        // But helper uses state variables which might be stale?
                        // No, params are passed.
                        // Just calling function is fine IF it doesn't depend on stale state.

                        // Actually, we should finish the loop first.
                    }
                }
                return nextBricks;
            });

            // Re-check win condition outside setBricks? 
            // The setBricks is async. 
            // Let's use an Effect for win condition on bricks change.
        }

        // Update Ball state
        ballRef.current = { x, y, dx, dy };
        setBall({ x, y, dx, dy });
    };

    // Effect to check win
    useEffect(() => {
        if (gameState === 'playing' && bricks.length > 0 && bricks.every(b => !b.active)) {
            handleWin();
        }
    }, [bricks, gameState]);

    const handleWin = async () => {
        const endTime = Date.now();
        // Prevent double trigger if Effect runs multiple times?
        if (finishTime > 0) return;

        const duration = (endTime - startTime) / 1000;
        setFinishTime(parseFloat(duration.toFixed(2)));
        setGameState('won');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Save High Score (Time taken, lower is better)
        const isRecord = await saveScore(GAME_ID, {
            playerName: currentPlayer,
            score: parseFloat(duration.toFixed(2)),
            date: new Date().toISOString()
        }, false); // False = Lower is better

        if (isRecord) {
            setIsNewRecord(true);
            loadScores();
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                const newX = Math.min(Math.max(gestureState.moveX - 40 - PADDLE_WIDTH / 2, 0), GAME_WIDTH - PADDLE_WIDTH);
                setPaddleX(newX);
                paddleRef.current = newX;
            },
        })
    ).current;

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

                        <Text style={[styles.title, { color: colors.text }]}>Rompe-Ladrillos</Text>
                        <TouchableOpacity onPress={() => onClose(gameState === 'won')}>
                            <FontAwesome name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Game Area */}
                    <View
                        style={[styles.gameArea, { width: GAME_WIDTH, height: GAME_HEIGHT }]}
                        {...panResponder.panHandlers}
                    >
                        {/* Bricks */}
                        {bricks.map(brick => (
                            brick.active && (
                                <View
                                    key={brick.id}
                                    style={{
                                        position: 'absolute',
                                        left: brick.x,
                                        top: brick.y,
                                        width: BRICK_WIDTH,
                                        height: BRICK_HEIGHT,
                                        backgroundColor: colors.pink,
                                        borderRadius: 4,
                                        borderWidth: 1,
                                        borderColor: 'rgba(255,255,255,0.3)'
                                    }}
                                />
                            )
                        ))}

                        {/* Paddle */}
                        <View
                            style={{
                                position: 'absolute',
                                left: paddleX,
                                top: GAME_HEIGHT - PADDLE_HEIGHT - 10,
                                width: PADDLE_WIDTH,
                                height: PADDLE_HEIGHT,
                                backgroundColor: colors.purple,
                                borderRadius: 10,
                            }}
                        />

                        {/* Ball */}
                        <View
                            style={{
                                position: 'absolute',
                                left: ball.x,
                                top: ball.y,
                                width: BALL_SIZE,
                                height: BALL_SIZE,
                                borderRadius: BALL_SIZE / 2,
                                backgroundColor: colors.orange,
                            }}
                        />

                        {/* Start Overlay */}
                        {gameState === 'start' && (
                            <TouchableOpacity
                                style={styles.centerOverlay}
                                onPress={startGame}
                            >
                                <Text style={styles.startText}>TOCA PARA EMPEZAR</Text>
                            </TouchableOpacity>
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
                                    {gameState === 'won' ? '¡VICTORIA!' : '¡HAS PERDIDO!'}
                                </Text>
                                <Text style={styles.subResultText}>
                                    {gameState === 'won'
                                        ? `Tiempo: ${finishTime}s\nRepartes 5 tragos`
                                        : '¡Te toca BEBER!'}
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
                    </View>

                    <Text style={{ color: colors.text, marginTop: 10, opacity: 0.6 }}>Desliza para mover la barra</Text>
                </View>

                {/* HIGH SCORE MODAL */}
                <HighScoreModal
                    visible={showHighScores}
                    onClose={() => setShowHighScores(false)}
                    highScores={highScores}
                    gameName="Brick Breaker"
                    colors={colors}
                    isHigherBetter={false} // Lower time is better
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
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
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
