import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// 12 Cards = 6 Pairs
const ICONS = ['beer', 'glass-cocktail', 'glass-wine', 'glass-mug-variant', 'bottle-wine', 'glass-tulip'];
// Duplicate to make pairs
const CARDS_DATA = [...ICONS, ...ICONS];

interface CardItem {
    id: number;
    icon: string;
    isFlipped: boolean;
    isMatched: boolean;
}

interface DrunkPairsProps {
    visible: boolean;
    onClose: (success: boolean) => void;
    colors: any;
}

export default function DrunkPairs({ visible, onClose, colors }: DrunkPairsProps) {
    const [cards, setCards] = useState<CardItem[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');
    const [timeLeft, setTimeLeft] = useState(30);
    const intervalRef = useRef<any>(null);

    useEffect(() => {
        if (visible) {
            resetGame();
        }
        return () => clearInterval(intervalRef.current);
    }, [visible]);

    const resetGame = () => {
        // Shuffle
        const shuffled = [...CARDS_DATA]
            .sort(() => Math.random() - 0.5)
            .map((icon, index) => ({
                id: index,
                icon,
                isFlipped: false,
                isMatched: false
            }));

        setCards(shuffled);
        setFlippedCards([]);
        setGameState('start');
        setTimeLeft(30);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const startGame = () => {
        setGameState('playing');
        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endGame(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleCardPress = (id: number) => {
        if (gameState !== 'playing') {
            if (gameState === 'start') startGame();
            else return;
        }

        // Prevent clicking match or already flipped or if 2 are already flipped
        const card = cards.find(c => c.id === id);
        if (!card || card.isMatched || card.isFlipped || flippedCards.length >= 2) return;

        // Flip card
        const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
        setCards(newCards);

        const newFlipped = [...flippedCards, id];
        setFlippedCards(newFlipped);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Check match
        if (newFlipped.length === 2) {
            const [firstId, secondId] = newFlipped;
            const firstCard = newCards.find(c => c.id === firstId);
            const secondCard = newCards.find(c => c.id === secondId);

            if (firstCard && secondCard && firstCard.icon === secondCard.icon) {
                // Match!
                setTimeout(() => {
                    handleMatch(firstId, secondId);
                }, 500);
            } else {
                // No match
                setTimeout(() => {
                    handleMismatch(firstId, secondId);
                }, 1000);
            }
        }
    };

    const handleMatch = (id1: number, id2: number) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCards(prev => {
            const updated = prev.map(c => (c.id === id1 || c.id === id2) ? { ...c, isMatched: true, isFlipped: true } : c);

            // Check win
            if (updated.every(c => c.isMatched)) {
                endGame(true);
            }
            return updated;
        });
        setFlippedCards([]);
    };

    const handleMismatch = (id1: number, id2: number) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setCards(prev => prev.map(c => (c.id === id1 || c.id === id2) ? { ...c, isFlipped: false } : c));
        setFlippedCards([]);
    };

    const endGame = (won: boolean) => {
        clearInterval(intervalRef.current);
        setGameState(won ? 'won' : 'lost');
    };

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.modalBackground }]}>

                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>PAREJAS BORRACHAS</Text>
                        <TouchableOpacity onPress={() => onClose(gameState === 'won')}>
                            <FontAwesome name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Timer */}
                    {gameState === 'playing' && (
                        <Text style={[styles.timer, { color: timeLeft < 10 ? '#FF3B30' : colors.text }]}>{timeLeft}s</Text>
                    )}

                    {/* Grid */}
                    <View style={styles.grid}>
                        {cards.map((card) => (
                            <Card
                                key={card.id}
                                card={card}
                                onPress={() => handleCardPress(card.id)}
                                color={colors.pink}
                            />
                        ))}
                    </View>

                    {/* Overlays */}
                    {gameState === 'start' && (
                        <View style={styles.statusOverlay}>
                            <Text style={[styles.desc, { color: colors.text }]}>Encuentra las parejas antes de que se acabe el tiempo.</Text>
                            <TouchableOpacity style={[styles.button, { backgroundColor: colors.purple }]} onPress={startGame}>
                                <Text style={styles.buttonText}>JUGAR</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {(gameState === 'won' || gameState === 'lost') && (
                        <View style={styles.statusOverlay}>
                            <Text style={[styles.resultTitle, { color: gameState === 'won' ? '#4CD964' : '#FF3B30' }]}>
                                {gameState === 'won' ? '¡VISTA DE AGUILA!' : '¡DEMASIADO LENTO!'}
                            </Text>
                            <Text style={[styles.resultDesc, { color: colors.text }]}>
                                {gameState === 'won' ? 'Repartes 3 tragos.' : 'Bebes 2 tragos.'}
                            </Text>
                            <TouchableOpacity style={[styles.button, { backgroundColor: colors.purple }]} onPress={() => onClose(gameState === 'won')}>
                                <Text style={styles.buttonText}>CONTINUAR</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </View>
            </View>
        </View>
    );
}

const Card = ({ card, onPress, color }: { card: CardItem, onPress: () => void, color: string }) => {
    // Determine card face
    // If matched, maybe invisible or dim? Kept visible for confirmation.

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: card.isFlipped || card.isMatched ? 'white' : color, opacity: card.isMatched ? 0.5 : 1 }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {(card.isFlipped || card.isMatched) ? (
                <MaterialCommunityIcons name={card.icon as any} size={32} color={color} />
            ) : (
                <FontAwesome name="question" size={32} color="rgba(255,255,255,0.5)" />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        minHeight: 500
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    timer: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20
    },
    card: {
        width: 70,
        height: 70,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5
    },
    statusOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        padding: 20,
        zIndex: 20
    },
    desc: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        color: 'white'
    },
    button: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 5
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18
    },
    resultTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    resultDesc: {
        fontSize: 16,
        marginBottom: 20,
        color: 'white',
        textAlign: 'center'
    }
});
