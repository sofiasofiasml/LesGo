import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const GAME_DURATION = 10;

interface HungryHipposProps {
    visible: boolean;
    allPlayers: string[];
    onClose: (results: { winner: string | null; losers: string[] }) => void;
    colors: any;
}

interface PlayerState {
    name: string;
    score: number;
    color: string;
}

export default function HungryHippos({ visible, allPlayers, onClose, colors }: HungryHipposProps) {
    const insets = useSafeAreaInsets();

    const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [activePlayers, setActivePlayers] = useState<PlayerState[]>([]);
    const [canContinue, setCanContinue] = useState(false);

    const screenHeight = Dimensions.get('screen').height;
    const windowHeight = Dimensions.get('window').height;
    const bottomSystemArea = Math.max(0, screenHeight - windowHeight);
    const continueBottomOffset = Math.max(18, insets.bottom + 10, bottomSystemArea + 10);

    // Player Colors for differentiation
    const PLAYER_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C'];

    useEffect(() => {
        if (visible) {
            setupGame();
        }
    }, [visible]);

    const setupGame = () => {
        setGameState('start');
        setTimeLeft(GAME_DURATION);
        setCanContinue(false);

        let selected = [...allPlayers];
        // Limit to 4
        if (selected.length > 4) {
            selected = selected.sort(() => 0.5 - Math.random()).slice(0, 4);
        } else if (selected.length < 2) {
            selected = [...selected, 'CPU'];
        }

        setActivePlayers(selected.map((name, index) => ({
            name,
            score: 0,
            color: PLAYER_COLORS[index % PLAYER_COLORS.length]
        })));
    };

    const startGame = () => {
        setGameState('playing');

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleTap = (index: number) => {
        if (gameState !== 'playing') return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setActivePlayers(prev => {
            const next = [...prev];
            next[index].score += 1;
            return next;
        });
    };

    const endGame = () => {
        setGameState('finished');
        setCanContinue(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Evita que el ultimo toque de juego pulse "continuar" por accidente.
        setTimeout(() => {
            setCanContinue(true);
        }, 700);
    };

    const finalize = () => {
        const sorted = [...activePlayers].sort((a, b) => b.score - a.score);
        const winner = sorted[0];
        const losers = activePlayers.filter(p => p.name !== winner.name).map(p => p.name);
        onClose({ winner: winner.name, losers });
    };

    // Layout Logic
    const getZoneStyle = (index: number, total: number) => {
        // 2 Players: Split Top/Bottom
        if (total === 2) {
            return {
                width: '100%',
                height: '50%',
                transform: index === 0 ? [{ rotate: '180deg' }] : []
            };
        }
        // 3 Players: T-Shape?
        // Player 0: Top Left, Player 1: Top Right, Player 2: Bottom Full
        if (total === 3) {
            if (index === 0) return { width: '50%', height: '50%', transform: [{ rotate: '180deg' }] };
            if (index === 1) return { width: '50%', height: '50%', transform: [{ rotate: '180deg' }] };
            if (index === 2) return { width: '100%', height: '50%' };
        }
        // 4 Players: Quadrants
        if (total === 4) {
            const style: any = { width: '50%', height: '50%' };
            // Rotate top ones
            if (index < 2) style.transform = [{ rotate: '180deg' }];
            return style;
        }
        return { flex: 1 };
    };

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.container}>

                {/* Game Zones */}
                <View style={styles.playArea}>
                    {activePlayers.map((player, index) => (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.8}
                            onPress={() => handleTap(index)}
                            style={[
                                styles.playerZone,
                                { backgroundColor: player.color },
                                getZoneStyle(index, activePlayers.length)
                            ]}
                        >
                            <View style={styles.playerContent}>
                                <Text style={styles.scoreText}>{player.score}</Text>
                                <Text style={styles.nameText}>{player.name}</Text>
                                {gameState === 'playing' && (
                                    <Text style={styles.tapInstruction}>¡DALE!</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Central Timer/Status Overlay */}
                    <View style={styles.centerHub} pointerEvents="none">
                        {gameState === 'playing' ? (
                            <Text style={styles.timerLarge}>{timeLeft}</Text>
                        ) : (
                            <Text style={styles.hubIcon}>{gameState === 'start' ? '🏁' : '🏆'}</Text>
                        )}
                    </View>
                </View>


                {/* Overlays */}
                {gameState === 'start' && (
                    <View style={styles.overlay}>
                        <Text style={styles.title}>¡APORREA!</Text>
                        <Text style={styles.subtitle}>Pulsa tu zona lo mas rápido posible.</Text>
                        <Text style={[styles.subtitle, { fontSize: 40, marginTop: 10 }]}>10 seg</Text>

                        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.purple }]} onPress={startGame}>
                            <Text style={styles.btnText}>¡LISTOS!</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {gameState === 'finished' && (
                    <View style={styles.overlay}>
                        <Text style={styles.title}>¡FIN!</Text>
                        <View style={styles.resultsBox}>
                            {activePlayers.sort((a, b) => b.score - a.score).map((p, i) => (
                                <Text key={p.name} style={[styles.resultRow, i === 0 && { color: '#FFD700', fontSize: 24 }]}>
                                    {i === 0 ? '👑 ' : ''}{p.name}: {p.score}
                                </Text>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.floatingContinueBtn,
                                { bottom: continueBottomOffset },
                                { backgroundColor: canContinue ? colors.purple : 'rgba(255,255,255,0.2)' }
                            ]}
                            onPress={finalize}
                            disabled={!canContinue}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.floatingContinueText}>Continuar</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    playArea: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    playerZone: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.1)'
    },
    playerContent: {
        alignItems: 'center'
    },
    nameText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        opacity: 0.9
    },
    scoreText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 60,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4
    },
    tapInstruction: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 24,
        marginTop: 10,
        opacity: 0.8
    },
    centerHub: {
        position: 'absolute',
        top: height / 2 - 50,
        left: width / 2 - 50,
        width: 100,
        height: 100,
        backgroundColor: 'white',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        borderWidth: 5,
        borderColor: '#eee'
    },
    timerLarge: {
        fontSize: 50,
        fontWeight: 'bold',
        color: '#333'
    },
    hubIcon: {
        fontSize: 40
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20
    },
    title: {
        color: 'white',
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 10
    },
    subtitle: {
        color: '#ccc',
        fontSize: 18,
        textAlign: 'center'
    },
    btn: {
        paddingVertical: 20,
        paddingHorizontal: 60,
        borderRadius: 40,
        marginTop: 40,
        elevation: 5
    },
    btnText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold'
    },
    resultsBox: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        width: '80%',
        alignItems: 'center',
        marginVertical: 20
    },
    resultRow: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5
    },
    floatingContinueBtn: {
        position: 'absolute',
        right: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 18,
        elevation: 4
    },
    floatingContinueText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700'
    }
});
