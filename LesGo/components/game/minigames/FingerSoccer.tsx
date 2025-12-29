import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { saveScore, getHighScores, HighScoreEntry } from '@/utils/HighScoreManager';
import HighScoreModal from '@/components/game/HighScoreModal';

const { width, height } = Dimensions.get('window');

interface FingerSoccerProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
    currentPlayer?: string;
}

const GAME_ID = 'minigame_soccer_wins';

export default function FingerSoccer({ visible, onClose, colors, currentPlayer = 'Jugador' }: FingerSoccerProps) {
    const PADDLE_WIDTH = 100;
    const PADDLE_HEIGHT = 20;
    const BALL_SIZE = 20;
    const GAME_WIDTH = width * 0.9;
    const GAME_HEIGHT = height * 0.6;
    const WIN_SCORE = 3;

    // Game State
    const [scoreP1, setScoreP1] = useState(0); // Top Player
    const [scoreP2, setScoreP2] = useState(0); // Bottom Player (Current Player)
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'scored' | 'ended'>('intro');
    const [winner, setWinner] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(0);

    // High Scores
    const [isNewRecord, setIsNewRecord] = useState(false);
    const [showHighScores, setShowHighScores] = useState(false);
    const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
    const [scoreUnit, setScoreUnit] = useState('s');
    const [finalTime, setFinalTime] = useState(0);

    useEffect(() => {
        if (showHighScores) {
            loadHighScores();
        }
    }, [showHighScores]);

    const loadHighScores = async () => {
        const scores = await getHighScores(GAME_ID);
        setHighScores(scores);
    };

    // Mechanics Refs
    const ballPos = useRef({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
    const ballVel = useRef({ x: 0, y: 0 });
    const paddle1X = useRef(GAME_WIDTH / 2 - PADDLE_WIDTH / 2); // Top
    const paddle2X = useRef(GAME_WIDTH / 2 - PADDLE_WIDTH / 2); // Bottom

    // Visual State for rendering (using Force Update pattern for 60fps loop without React render overhead)
    const [ballRenderIds, setBallRenderIds] = useState(0);
    const pan1 = useRef(new Animated.Value(GAME_WIDTH / 2 - PADDLE_WIDTH / 2)).current;
    const pan2 = useRef(new Animated.Value(GAME_WIDTH / 2 - PADDLE_WIDTH / 2)).current;

    const requestRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (visible) {
            resetGame();
        } else {
            // Cleanup if closed externally
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
    }, [visible]);

    const resetGame = () => {
        setScoreP1(0);
        setScoreP2(0);
        setGameState('intro');
        setWinner(null);
        setIsNewRecord(false);
        setShowHighScores(false);
        resetBall();

        // Reset paddles
        paddle1X.current = GAME_WIDTH / 2 - PADDLE_WIDTH / 2;
        paddle2X.current = GAME_WIDTH / 2 - PADDLE_WIDTH / 2;
        pan1.setValue(paddle1X.current);
        pan2.setValue(paddle2X.current);
    };

    const resetBall = () => {
        ballPos.current = { x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT / 2 - BALL_SIZE / 2 };
        const dirY = Math.random() > 0.5 ? 1 : -1;
        const dirX = (Math.random() - 0.5) * 1.5;
        // Moderate speed
        ballVel.current = { x: dirX * 6, y: dirY * 5 };
        setBallRenderIds(prev => prev + 1);
    };

    const startGame = () => {
        setStartTime(Date.now());
        setGameState('playing');
        resetBall();
    };

    // GAME LOOP
    const update = () => {
        if (gameState !== 'playing') return;

        // Move Ball
        ballPos.current.x += ballVel.current.x;
        ballPos.current.y += ballVel.current.y;

        // Wall Collisions (Left/Right)
        if (ballPos.current.x <= 0) {
            ballPos.current.x = 0;
            ballVel.current.x *= -1;
        } else if (ballPos.current.x >= GAME_WIDTH - BALL_SIZE) {
            ballPos.current.x = GAME_WIDTH - BALL_SIZE;
            ballVel.current.x *= -1;
        }

        // Paddle 1 (Top) Collision
        const p1Y = 10;
        if (ballPos.current.y <= p1Y + PADDLE_HEIGHT && ballPos.current.y >= p1Y - BALL_SIZE) {
            if (ballPos.current.x + BALL_SIZE >= paddle1X.current && ballPos.current.x <= paddle1X.current + PADDLE_WIDTH) {
                ballVel.current.y = Math.abs(ballVel.current.y) * 1.05; // Force Down + Speed
                ballPos.current.y = p1Y + PADDLE_HEIGHT + 1;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
        }

        // Paddle 2 (Bottom) Collision
        const p2Y = GAME_HEIGHT - 10 - PADDLE_HEIGHT;
        if (ballPos.current.y + BALL_SIZE >= p2Y && ballPos.current.y <= p2Y + PADDLE_HEIGHT + BALL_SIZE) {
            if (ballPos.current.x + BALL_SIZE >= paddle2X.current && ballPos.current.x <= paddle2X.current + PADDLE_WIDTH) {
                ballVel.current.y = -Math.abs(ballVel.current.y) * 1.05; // Force Up + Speed
                ballPos.current.y = p2Y - BALL_SIZE - 1;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
        }

        // Goal Scoring
        if (ballPos.current.y < -50) {
            handleScore(2); // Bottom Scored
        } else if (ballPos.current.y > GAME_HEIGHT + 50) {
            handleScore(1); // Top Scored
        }

        setBallRenderIds(prev => prev + 1); // Trigger render
        requestRef.current = requestAnimationFrame(update);
    };

    useEffect(() => {
        if (gameState === 'playing') {
            requestRef.current = requestAnimationFrame(update);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [gameState]);

    const handleScore = (scorer: 1 | 2) => {
        if (scorer === 1) {
            const newScore = scoreP1 + 1;
            setScoreP1(newScore);
            if (newScore >= WIN_SCORE) endGame('P1');
            else promptNextRound();
        } else {
            const newScore = scoreP2 + 1;
            setScoreP2(newScore);
            if (newScore >= WIN_SCORE) endGame('P2');
            else promptNextRound();
        }
    };

    const promptNextRound = () => {
        setGameState('scored');
        cancelAnimationFrame(requestRef.current!);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
            resetBall();
            setGameState('playing');
        }, 1500);
    };

    const endGame = async (winnerId: string) => {
        setGameState('ended');
        cancelAnimationFrame(requestRef.current!);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const timeTaken = (Date.now() - startTime) / 1000;
        setFinalTime(timeTaken);

        if (winnerId === 'P2') {
            setWinner(currentPlayer);
            // Save Score ONLY if main player (Bottom) wins
            const isRecord = await saveScore(GAME_ID, {
                playerName: currentPlayer,
                score: parseFloat(timeTaken.toFixed(2)),
                date: new Date().toISOString()
            }, false); // Lower time is better
            if (isRecord) setIsNewRecord(true);
        } else {
            setWinner('Rival (Arriba)');
        }
    };

    // --- MULTI-TOUCH HANDLING ---
    const handleTouch = (event: any) => {
        if (gameState !== 'playing') return;

        const touches = event.nativeEvent.touches;
        const containerX = (width - GAME_WIDTH) / 2;

        // Iterate over all active touches
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const tX = touch.locationX; // Relative to view if on view? No, pageX usually easier.
            // Using pageX/pageY and calculating relative
            const pX = touch.pageX - containerX;
            const pY = touch.pageY - (height - GAME_HEIGHT) / 2; // Approximate centering Y

            // We can just use relative Y to Determine Top or Bottom control
            // But we need to be careful with coordinate space.
            // Let's rely on event.nativeEvent.touches.

            // Adjust X for paddle center
            let targetX = pX - PADDLE_WIDTH / 2;
            if (targetX < 0) targetX = 0;
            if (targetX > GAME_WIDTH - PADDLE_WIDTH) targetX = GAME_WIDTH - PADDLE_WIDTH;

            // Determine if Top or Bottom zone
            // Top Zone: Y < GAME_HEIGHT / 2
            // Bottom Zone: Y > GAME_HEIGHT / 2

            // Note: pY might need offset adjustment depending on Modal padding.
            // Let's use touch.locationY if the handler is on the Field container!

            // If handler is on the Field View:
            const locY = touch.locationY;

            if (locY < GAME_HEIGHT / 2) {
                // Control Top Paddle
                paddle1X.current = targetX;
                pan1.setValue(targetX);
            } else {
                // Control Bottom Paddle
                paddle2X.current = targetX;
                pan2.setValue(targetX);
            }
        }
    };


    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
                <View style={[styles.container, { width: GAME_WIDTH + 10, height: GAME_HEIGHT + 100, backgroundColor: colors.modalBackground }]}>

                    {/* Header P1 (Top) */}
                    <View style={[styles.playerHeader, { transform: [{ rotate: '180deg' }] }]}>
                        <Text style={[styles.scoreText, { color: colors.pink }]}>{scoreP1}</Text>
                        <Text style={[styles.playerText, { color: colors.text }]}>RIVAL</Text>
                    </View>

                    {/* Game Field - Touch Handler Root */}
                    <View
                        style={[styles.field, { width: GAME_WIDTH, height: GAME_HEIGHT, borderColor: colors.text }]}
                        onTouchStart={handleTouch}
                        onTouchMove={handleTouch}
                    // onTouchEnd isn't strictly needed for position updates, but maybe for cleanup? No need.
                    >
                        {/* Center Line */}
                        <View style={[styles.centerLine, { backgroundColor: colors.text, opacity: 0.2 }]} />
                        <View style={[styles.centerCircle, { borderColor: colors.text, opacity: 0.2 }]} />

                        {/* Paddle 1 (Top) */}
                        <Animated.View
                            style={[styles.paddle, {
                                width: PADDLE_WIDTH, height: PADDLE_HEIGHT,
                                backgroundColor: colors.pink,
                                top: 10,
                                transform: [{ translateX: pan1 }]
                            }]}
                        />

                        {/* Paddle 2 (Bottom) */}
                        <Animated.View
                            style={[styles.paddle, {
                                width: PADDLE_WIDTH, height: PADDLE_HEIGHT,
                                backgroundColor: colors.purple,
                                bottom: 10,
                                transform: [{ translateX: pan2 }]
                            }]}
                        />

                        {/* Ball */}
                        {gameState !== 'ended' && (
                            <View style={[styles.ball, {
                                width: BALL_SIZE, height: BALL_SIZE, borderRadius: BALL_SIZE / 2,
                                backgroundColor: colors.gold,
                                left: ballPos.current.x,
                                top: ballPos.current.y
                            }]} />
                        )}

                        {/* Overlay Messages (PointerEvents none to pass touches?) No, buttons need clicks. */}
                        {gameState === 'intro' && (
                            <View style={styles.centerMessage}>
                                <TouchableOpacity style={[styles.startButton, { backgroundColor: colors.pink }]} onPress={startGame}>
                                    <Text style={styles.startText}>JUGAR</Text>
                                    <Text style={styles.subStartText}>Gana quien meta 3 goles</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {gameState === 'scored' && (
                            <View style={styles.centerMessage} pointerEvents="none">
                                <Text style={[styles.scoredText, { color: colors.gold }]}>¡GOL!</Text>
                            </View>
                        )}

                        {gameState === 'ended' && (
                            <View style={[styles.centerMessage, { backgroundColor: 'rgba(0,0,0,0.85)', padding: 20, borderRadius: 10 }]}>
                                <Text style={[styles.winnerText, { color: colors.gold }]}>
                                    {winner === currentPlayer ? '¡VICTORIA!' : 'DERROTA'}
                                </Text>
                                <Text style={[styles.winnerDesc, { color: 'white' }]}>
                                    Ganador: {winner}
                                </Text>

                                {winner === currentPlayer && (
                                    <Text style={{ color: colors.gold, fontWeight: 'bold', marginTop: 10 }}>
                                        Tiempo: {finalTime.toFixed(2)}s
                                    </Text>
                                )}

                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                                    <TouchableOpacity style={[styles.startButton, { backgroundColor: colors.pink, paddingHorizontal: 20 }]} onPress={startGame}>
                                        <Text style={styles.startText}>REPETIR</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.startButton, { backgroundColor: colors.purple, paddingHorizontal: 20 }]} onPress={() => setShowHighScores(true)}>
                                        <FontAwesome name="trophy" size={20} color="white" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={{ marginTop: 15 }} onPress={() => onClose(true)}>
                                    <Text style={{ color: 'white', textDecorationLine: 'underline' }}>Salir</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                    </View>

                    {/* Header P2 (Bottom) */}
                    <View style={styles.playerHeader}>
                        <Text style={[styles.playerText, { color: colors.text }]}>{currentPlayer}</Text>
                        <Text style={[styles.scoreText, { color: colors.purple }]}>{scoreP2}</Text>
                    </View>

                    <TouchableOpacity onPress={() => onClose(false)} style={styles.closeBtn}>
                        <FontAwesome name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Records Modal */}
                <HighScoreModal
                    visible={showHighScores}
                    onClose={() => setShowHighScores(false)}
                    highScores={highScores}
                    gameName="Finger Soccer"
                    colors={colors}
                    unit="s"
                    isHigherBetter={false}
                />
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
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5
    },
    playerHeader: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    scoreText: {
        fontSize: 30,
        fontWeight: 'bold'
    },
    playerText: {
        fontSize: 12,
        fontWeight: 'bold',
        opacity: 0.7
    },
    field: {
        borderWidth: 2,
        position: 'relative',
        backgroundColor: 'rgba(0,0,0,0.1)',
        overflow: 'hidden',
        borderRadius: 5
    },
    centerLine: {
        position: 'absolute',
        top: '50%',
        width: '100%',
        height: 2,
    },
    centerCircle: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 100,
        height: 100,
        marginLeft: -50,
        marginTop: -50,
        borderWidth: 2,
        borderRadius: 50
    },
    paddle: {
        position: 'absolute',
        borderRadius: 10
    },
    ball: {
        position: 'absolute',
    },
    centerMessage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    startButton: {
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        elevation: 5,
        justifyContent: 'center'
    },
    startText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18
    },
    subStartText: {
        color: 'white',
        fontSize: 12,
        marginTop: 5
    },
    scoredText: {
        fontSize: 60,
        fontWeight: 'bold',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5
    },
    winnerText: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 5
    },
    winnerDesc: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center'
    },
    closeBtn: {
        position: 'absolute',
        top: 10,
        right: 10
    }
});
